import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, ReplaySubject } from 'rxjs';
import { Currency } from '../api/currency';
import * as currency from 'currency.js';
import { Spend } from '../api/settlement';

interface CurrencyApiTable {
  table: string;
  no: string;
  effectiveDate: string;
  rates: Currency[];
}

@Injectable({
  providedIn: 'root',
})
export class CurrencyService {
  private readonly NBP_API_ALL_CURRENCIES_URL: string =
    'https://api.nbp.pl/api/exchangerates/tables/a?format=json';
  private currenciesUpdate: ReplaySubject<Currency[]>;
  private currencies: Currency[];

  constructor(private http: HttpClient) {}

  getCurrencies(): ReplaySubject<Currency[]> {
    if (!this.currenciesUpdate) {
      this.currenciesUpdate = new ReplaySubject(1);
      this.http
        .get<CurrencyApiTable>(this.NBP_API_ALL_CURRENCIES_URL)
        .pipe(
          map((result: CurrencyApiTable) => {
            return [
              {
                currency: 'złoty',
                code: 'PLN',
              } as Currency,
              ...result[0].rates,
            ].sort((a, b) => a.code.localeCompare(b.code));
          })
        )
        .subscribe((currencies: Currency[]) => {
          this.currencies = currencies;
          this.currenciesUpdate.next(currencies);
        });
    }

    return this.currenciesUpdate;
  }

  convertCurrency(
    amount: number,
    from: string | Currency,
    to: string | Currency
  ): number {
    if (typeof from === 'string') {
      from = this.currencies.find((currency) => currency.code === from);
    }

    if (typeof to === 'string') {
      to = this.currencies.find((currency) => currency.code === to);
    }

    if (from.code === to.code) {
      return amount;
    }

    if (from.code === 'PLN') {
      const plnValue = currency(1).divide(to.mid);
      return currency(amount).multiply(plnValue).value;
    }

    if (to.code === 'PLN') {
      return currency(amount).multiply(from.mid).value;
    }

    const currencyValue = from.mid / to.mid;
    return currency(amount).multiply(currencyValue).value;
  }

  calculateTotalSpend(spends: Spend[], currencyCode: string): number {
    return spends.reduce((totalValue, spend) => {
      return currency(totalValue).add(
        this.convertCurrency(spend.value, spend.currencyCode, currencyCode)
      ).value;
    }, 0);
  }
}
