import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  CollectionReference,
} from '@angular/fire/compat/firestore';
import { AuthService } from './auth.service';
import {
  combineLatest,
  distinctUntilChanged,
  map,
  of,
  ReplaySubject,
  shareReplay,
  switchMap,
} from 'rxjs';
import { Settlement } from '../api/settlement';
import ArrayUtil from '../utils/ArrayUtil';
import { CurrencyService } from './currency.service';

@Injectable({
  providedIn: 'root',
})
export class SettlementService {
  private settlementsUpdate: ReplaySubject<Settlement[]> = new ReplaySubject<
    Settlement[]
  >(1);
  private selectedSettlementUpdate: ReplaySubject<Settlement> =
    new ReplaySubject<Settlement>(1);

  constructor(
    private firestore: AngularFirestore,
    private authService: AuthService,
    private currencyService: CurrencyService
  ) {
    combineLatest([
      this.authService.getUser(),
      this.currencyService.getCurrencies(),
    ])
      .pipe(
        switchMap(([user, currencies]) => {
          const query = (ref: CollectionReference) => {
            return ref.where(`permissions.${user.uid}`, 'in', [
              'owner',
              'editor',
              'viewer',
            ]);
          };
          if (user && currencies) {
            return this.firestore
              .collection<Settlement>('/settlements', query)
              .snapshotChanges()
              .pipe(
                map((collection) => {
                  return collection
                    .map((el) => ({
                      id: el.payload.doc.id,
                      ...(el.payload.doc.data() as Settlement),
                    }))
                    .sort((a, b) => a.name.localeCompare(b.name));
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
      .subscribe((settlements) => {
        this.settlementsUpdate.next(settlements);
        if (settlements && settlements.length > 0) {
          this.restoreSelectedSettlement(settlements);
        } else {
          this.selectedSettlementUpdate.next(null);
        }
      });
  }

  getSettlements(): ReplaySubject<Settlement[]> {
    return this.settlementsUpdate;
  }

  setSelectedSettlement(settlement: Settlement) {
    localStorage.setItem('selectedSettlementId', settlement.id);
    this.selectedSettlementUpdate.next(settlement);
  }

  getSelectedSettlement(): ReplaySubject<Settlement> {
    return this.selectedSettlementUpdate;
  }

  addSettlement(settlement: Settlement) {
    return this.firestore.collection('/settlements').add(settlement);
  }

  editSettlement(settlement: Settlement) {
    return this.firestore
      .collection('/settlements')
      .doc(settlement.id)
      .update(settlement);
  }

  deleteSettlement(settlement: Settlement) {
    return this.firestore
      .collection('/settlements')
      .doc(settlement.id)
      .delete();
  }

  isUserOwner(uid: string, settlement: Settlement) {
    return settlement.permissions[uid] === 'owner';
  }

  isUserEditor(uid: string, settlement: Settlement) {
    return settlement.permissions[uid] === 'editor';
  }

  isUserViewer(uid: string, settlement: Settlement) {
    return settlement.permissions[uid] === 'viewer';
  }

  isSettlementShared(uid: string, settlement) {
    return !this.isUserOwner(uid, settlement);
  }

  private restoreSelectedSettlement(settlements: Settlement[]) {
    const selectedSettlementIdFromStorage = localStorage.getItem(
      'selectedSettlementId'
    );
    if (
      selectedSettlementIdFromStorage &&
      settlements.some((e) => e.id === selectedSettlementIdFromStorage)
    ) {
      this.selectedSettlementUpdate.next(
        settlements.find((e) => e.id === selectedSettlementIdFromStorage)
      );
    } else {
      this.selectedSettlementUpdate.next(settlements[0]);
      localStorage.setItem('selectedSettlementId', settlements[0].id);
    }
  }
}
