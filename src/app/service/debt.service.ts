import { Injectable } from '@angular/core';
import { Participant } from '../api/settlement';
import { CurrencyService } from './currency.service';
import * as currency from 'currency.js';

@Injectable({
  providedIn: 'root',
})
export class DebtService {
  constructor(private currencyService: CurrencyService) {}

  getDebts(participants: Participant[], currencyCode) {
    const creditors = participants
      .filter((participant) => {
        return (
          this.currencyService.calculateTotalSpend(
            participant.balances,
            currencyCode
          ) > 0
        );
      })
      .map((participant) => {
        return {
          totalValue: this.currencyService.calculateTotalSpend(
            participant.balances,
            currencyCode
          ),
          participant: participant,
        };
      });
    const debtors = participants
      .filter((participant) => {
        return (
          this.currencyService.calculateTotalSpend(
            participant.balances,
            currencyCode
          ) < 0
        );
      })
      .map((participant) => {
        return {
          totalValue: currency(-1).multiply(
            this.currencyService.calculateTotalSpend(
              participant.balances,
              currencyCode
            )
          ).value,
          participant: participant,
        };
      });
    return this.calculateDebts(creditors, debtors);
  }

  private calculateDebts(creditors, debtors) {
    const debts = [];
    if (creditors.length > 0 && debtors.length > 0) {
      let creditorIndex = 0;
      let debtorIndex = 0;

      while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
        if (
          creditors[creditorIndex].totalValue < debtors[debtorIndex].totalValue
        ) {
          debts.push({
            creditor: creditors[creditorIndex].participant.name,
            debtor: debtors[debtorIndex].participant.name,
            value: creditors[creditorIndex].totalValue,
          });
          debtors[debtorIndex].totalValue = currency(
            debtors[debtorIndex].totalValue
          ).subtract(creditors[creditorIndex].totalValue).value;
          ++creditorIndex;
        } else {
          debts.push({
            creditor: creditors[creditorIndex].participant.name,
            debtor: debtors[debtorIndex].participant.name,
            value: debtors[debtorIndex].totalValue,
          });
          creditors[creditorIndex].totalValue = currency(
            creditors[creditorIndex].totalValue
          ).subtract(debtors[debtorIndex].totalValue).value;
          ++debtorIndex;
        }
      }
    }
    return debts;
  }
}
