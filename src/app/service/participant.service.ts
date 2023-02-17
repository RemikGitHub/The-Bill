import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import {
  combineLatest,
  distinctUntilChanged,
  map,
  of,
  ReplaySubject,
  shareReplay,
  switchMap,
} from 'rxjs';
import { Participant } from '../api/settlement';
import { SettlementService } from './settlement.service';
import firebase from 'firebase/compat/app';
import { CurrencyService } from './currency.service';
import ArrayUtil from '../utils/ArrayUtil';
import FieldValue = firebase.firestore.FieldValue;

@Injectable({
  providedIn: 'root',
})
export class ParticipantService {
  private participantsUpdate: ReplaySubject<Participant[]> = new ReplaySubject<
    Participant[]
  >(1);

  constructor(
    private firestore: AngularFirestore,
    private settlementService: SettlementService,
    private currencyService: CurrencyService
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
              .collection('/participants', (ref) => ref.orderBy('name'))
              .snapshotChanges()
              .pipe(
                map((collection) => {
                  return collection.map(
                    (el) =>
                      ({
                        id: el.payload.doc.id,
                        ...el.payload.doc.data(),
                      } as Participant)
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
      .subscribe(this.participantsUpdate);
  }

  getParticipants(): ReplaySubject<Participant[]> {
    return this.participantsUpdate;
  }

  addParticipant(settlementId: string, participant: Participant) {
    const batch = this.firestore.firestore.batch();

    const participantRef = this.firestore
      .collection('/settlements')
      .doc(settlementId)
      .collection('/participants')
      .doc().ref;

    const settlementRef = this.firestore
      .collection('/settlements')
      .doc(settlementId).ref;

    batch.set(participantRef, participant);
    batch.update(settlementRef, { participants: FieldValue.increment(1) });

    return batch.commit();
  }

  editParticipant(settlementId: string, participant: Participant) {
    return this.firestore
      .collection('/settlements')
      .doc(settlementId)
      .collection('/participants')
      .doc(participant.id)
      .update(participant);
  }

  deleteParticipant(settlementId: string, participant: Participant) {
    const batch = this.firestore.firestore.batch();

    const participantRef = this.firestore
      .collection('/settlements')
      .doc(settlementId)
      .collection('/participants')
      .doc(participant.id).ref;

    const settlementRef = this.firestore
      .collection('/settlements')
      .doc(settlementId).ref;

    batch.delete(participantRef);
    batch.update(settlementRef, { participants: FieldValue.increment(-1) });

    return batch.commit();
  }
}
