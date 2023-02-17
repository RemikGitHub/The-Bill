import { Pipe, PipeTransform } from '@angular/core';
import { Spend } from '../api/settlement';
import { CurrencyService } from '../service/currency.service';
import * as currency from 'currency.js';

@Pipe({
  name: 'spend',
})
export class SpendPipe implements PipeTransform {
  constructor(private currencyService: CurrencyService) {}

  transform(spends: Spend[], currencyCode: string): number {
    return spends.reduce((totalValue, spend) => {
      return currency(totalValue).add(
        this.currencyService.convertCurrency(
          spend.value,
          spend.currencyCode,
          currencyCode
        )
      ).value;
    }, 0);
  }
}
