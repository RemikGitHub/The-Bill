import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { SettlementService } from './settlement.service';
import { Expense, Participant, Spend } from '../api/settlement';
import {
  combineLatest,
  distinctUntilChanged,
  map,
  of,
  ReplaySubject,
  shareReplay,
  switchMap,
} from 'rxjs';
import firebase from 'firebase/compat/app';
import * as currency from 'currency.js';
import { CurrencyService } from './currency.service';
import ArrayUtil from '../utils/ArrayUtil';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import FieldValue = firebase.firestore.FieldValue;

@Injectable({
  providedIn: 'root',
})
export class ExpenseService {
  private expensesUpdate: ReplaySubject<Expense[]> = new ReplaySubject<
    Expense[]
  >(1);

  constructor(
    private firestore: AngularFirestore,
    private settlementService: SettlementService,
    private currencyService: CurrencyService,
    private storage: AngularFireStorage
  ) {
    combineLatest([
      this.settlementService.getSelectedSettlement(),
      this.currencyService.getCurrencies(),
    ])
      .pipe(
        switchMap(([selectedSettlement, currencies]) => {
          if (selectedSettlement && currencies) {
            return this.firestore
              .collection('/settlements')
              .doc(selectedSettlement.id)
              .collection('/expenses', (ref) =>
                ref.orderBy('name').orderBy('amount')
              )
              .snapshotChanges()
              .pipe(
                map((collection) => {
                  return collection.map(
                    (el) =>
                      ({
                        id: el.payload.doc.id,
                        ...el.payload.doc.data(),
                      } as Expense)
                  );
                }),
                distinctUntilChanged((previous, current) =>
                  ArrayUtil.objectsEqual(previous, current)
                ),
                shareReplay(1)
              );
          }
          return of(null);
        })
      )
      .subscribe(this.expensesUpdate);
  }

  getExpenses(): ReplaySubject<Expense[]> {
    return this.expensesUpdate;
  }

  addExpense(
    settlementId: string,
    expense: Expense,
    participant: Participant,
    debtors: Participant[]
  ) {
    this.addSpend(participant.spends, {
      value: expense.amount,
      currencyCode: expense.currencyCode,
    });
    this.addSpend(participant.balances, {
      value: expense.amount,
      currencyCode: expense.currencyCode,
    });
    const balance = currency(expense.amount)
      .divide(debtors.length)
      .multiply(-1).value;
    debtors.map((debtor) =>
      this.addSpend(debtor.balances, {
        value: balance,
        currencyCode: expense.currencyCode,
      })
    );

    const batch = this.firestore.firestore.batch();

    const expenseRef = this.firestore
      .collection('/settlements')
      .doc(settlementId)
      .collection('/expenses')
      .doc().ref;

    const participantRef = this.firestore
      .collection('/settlements')
      .doc(settlementId)
      .collection('/participants')
      .doc(participant.id).ref;

    const settlementRef = this.firestore
      .collection('/settlements')
      .doc(settlementId).ref;

    batch.set(expenseRef, expense);

    debtors.forEach((debtor) => {
      const insert = this.firestore
        .collection('/settlements')
        .doc(settlementId)
        .collection('/participants')
        .doc(debtor.id).ref;
      batch.update(insert, debtor);
    });
    batch.update(participantRef, participant);
    batch.update(settlementRef, { expenses: FieldValue.increment(1) });

    return batch.commit();
  }

  uploadImage(path, file) {
    return this.storage.upload(path, file);
  }

  deleteExpense(
    settlementId: string,
    expense: Expense,
    participant: Participant,
    debtors: Participant[]
  ) {
    this.addSpend(participant.spends, {
      value: -expense.amount,
      currencyCode: expense.currencyCode,
    });
    this.addSpend(participant.balances, {
      value: -expense.amount,
      currencyCode: expense.currencyCode,
    });
    const balance = currency(expense.amount).divide(debtors.length).value;
    debtors.map((debtor) =>
      this.addSpend(debtor.balances, {
        value: balance,
        currencyCode: expense.currencyCode,
      })
    );

    const batch = this.firestore.firestore.batch();

    const expenseRef = this.firestore
      .collection('/settlements')
      .doc(settlementId)
      .collection('/expenses')
      .doc(expense.id).ref;

    const settlementRef = this.firestore
      .collection('/settlements')
      .doc(settlementId).ref;

    const participantRef = this.firestore
      .collection('/settlements')
      .doc(settlementId)
      .collection('/participants')
      .doc(expense.participantId).ref;

    debtors.forEach((debtor) => {
      const insert = this.firestore
        .collection('/settlements')
        .doc(settlementId)
        .collection('/participants')
        .doc(debtor.id).ref;
      batch.update(insert, debtor);
    });

    batch.delete(expenseRef);
    batch.update(participantRef, participant);
    batch.update(settlementRef, { expenses: FieldValue.increment(-1) });

    return batch.commit();
  }

  editExpense(
    settlementId: string,
    editedExpense: Expense,
    oldExpense: Expense,
    participants: Participant[]
  ) {
    const oldDebtors = participants.filter((participant) =>
      oldExpense.debtorsId.find((debtorId) => debtorId === participant.id)
    );
    const oldParticipant = participants.find(
      (participant) => participant.id === oldExpense.participantId
    );
    const oldBalance = currency(oldExpense.amount).divide(
      oldDebtors.length
    ).value;

    this.addSpend(oldParticipant.spends, {
      value: -oldExpense.amount,
      currencyCode: oldExpense.currencyCode,
    });
    this.addSpend(oldParticipant.balances, {
      value: -oldExpense.amount,
      currencyCode: oldExpense.currencyCode,
    });
    oldDebtors.map((debtor) =>
      this.addSpend(debtor.balances, {
        value: oldBalance,
        currencyCode: oldExpense.currencyCode,
      })
    );

    const editedDebtors = participants.filter((participant) =>
      editedExpense.debtorsId.find((debtorId) => debtorId === participant.id)
    );
    const editedParticipant = participants.find(
      (participant) => participant.id === editedExpense.participantId
    );
    const editedBalance = currency(editedExpense.amount)
      .divide(editedDebtors.length)
      .multiply(-1).value;

    this.addSpend(editedParticipant.spends, {
      value: editedExpense.amount,
      currencyCode: editedExpense.currencyCode,
    });
    this.addSpend(editedParticipant.balances, {
      value: editedExpense.amount,
      currencyCode: editedExpense.currencyCode,
    });
    editedDebtors.map((debtor) =>
      this.addSpend(debtor.balances, {
        value: editedBalance,
        currencyCode: editedExpense.currencyCode,
      })
    );

    const batch = this.firestore.firestore.batch();

    const expenseRef = this.firestore
      .collection('/settlements')
      .doc(settlementId)
      .collection('/expenses')
      .doc(editedExpense.id).ref;

    const oldParticipantRef = this.firestore
      .collection('/settlements')
      .doc(settlementId)
      .collection('/participants')
      .doc(oldParticipant.id).ref;

    const editedParticipantRef = this.firestore
      .collection('/settlements')
      .doc(settlementId)
      .collection('/participants')
      .doc(editedParticipant.id).ref;

    oldDebtors.forEach((debtor) => {
      const insert = this.firestore
        .collection('/settlements')
        .doc(settlementId)
        .collection('/participants')
        .doc(debtor.id).ref;
      batch.update(insert, debtor);
    });

    editedDebtors.forEach((debtor) => {
      const insert = this.firestore
        .collection('/settlements')
        .doc(settlementId)
        .collection('/participants')
        .doc(debtor.id).ref;
      batch.update(insert, debtor);
    });

    batch.update(expenseRef, editedExpense);

    batch.update(oldParticipantRef, oldParticipant);
    batch.update(editedParticipantRef, editedParticipant);

    return batch.commit();
  }

  deleteImage(path: string) {
    return this.storage.refFromURL(path).delete();
  }

  private addSpend(spendsArray: Spend[], spend: Spend) {
    const spendToUpdate = spendsArray.find(
      (arraySpend) => arraySpend.currencyCode === spend.currencyCode
    );

    if (spendToUpdate) {
      const spendToUpdateIndex = spendsArray.indexOf(spendToUpdate);
      spendsArray[spendToUpdateIndex].value = currency(
        spendsArray[spendToUpdateIndex].value
      ).add(spend.value).value;
      if (spendsArray[spendToUpdateIndex].value === 0) {
        spendsArray.splice(spendToUpdateIndex, 1);
      }
    } else {
      spendsArray.push(spend);
    }
  }
}
