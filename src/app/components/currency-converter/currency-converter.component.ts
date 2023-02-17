import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { CurrencyService } from '../../service/currency.service';
import ScreenUtil from '../../utils/ScreenUtil';
import { Currency } from '../../api/currency';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-currency-converter',
  templateUrl: './currency-converter.component.html',
  styleUrls: ['./currency-converter.component.scss'],
})
export class CurrencyConverterComponent implements OnInit, OnDestroy {
  selectedFirstCurrency: Currency;
  selectedSecondCurrency: Currency;
  currencies: Currency[] = [];
  amount: number = 0.0;
  calculatedValue: number = 0.0;
  isMobile: boolean;
  subscription: Subscription;

  constructor(private currencyService: CurrencyService) {}

  ngOnInit(): void {
    this.onResize();
    this.subscription = this.currencyService
      .getCurrencies()
      .subscribe((currencies) => (this.currencies = currencies));
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.isMobile = ScreenUtil.isMobile();
  }

  swapCurrencies() {
    if (this.selectedFirstCurrency && this.selectedSecondCurrency) {
      const tmpCurrency: Currency = this.selectedFirstCurrency;
      this.selectedFirstCurrency = this.selectedSecondCurrency;
      this.selectedSecondCurrency = tmpCurrency;
      this.calculate();
    }
  }

  calculate() {
    if (!this.selectedFirstCurrency || !this.selectedSecondCurrency) {
      this.clear();
      return;
    }

    this.calculatedValue = this.currencyService.convertCurrency(
      this.amount,
      this.selectedFirstCurrency,
      this.selectedSecondCurrency
    );
  }

  clear() {
    this.calculatedValue = 0.0;
  }
}
