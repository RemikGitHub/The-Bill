import {
  ComponentFixture,
  getTestBed,
  inject,
  TestBed,
} from '@angular/core/testing';

import { CurrencyConverterComponent } from './currency-converter.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CurrencyService } from '../../service/currency.service';
import { SpendPipe } from '../../pipes/spend.pipe';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Currency } from '../../api/currency';

describe('CurrencyConverterComponent', () => {
  let component: CurrencyConverterComponent;
  let fixture: ComponentFixture<CurrencyConverterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        TranslateModule,
        TranslateModule.forRoot(),
      ],
      declarations: [CurrencyConverterComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CurrencyConverterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('calculatedValue on start should be 0.0', () => {
    expect(component.calculatedValue).toBe(0.0);
  });

  it('CurrencyService should be injected', inject(
    [CurrencyService],
    (service: CurrencyService) => {
      expect(service).toBeTruthy();
    }
  ));

  it('CurrencyService should convert 3 EUR to PLN', inject(
    [CurrencyService],
    (service: CurrencyService) => {
      const eurCurrency: Currency = {
        currency: 'Euro',
        code: 'EUR',
        mid: 4.68,
      };

      const plnCurrency: Currency = {
        currency: 'Polish zloty',
        code: 'PLN',
        mid: 1,
      };

      expect(service.convertCurrency(3, eurCurrency, plnCurrency)).toBe(14.04);
    }
  ));

  it('CurrencyService should convert 6.58 PLN to USD', inject(
    [CurrencyService],
    (service: CurrencyService) => {
      const usdCurrency: Currency = {
        currency: 'United States dollar',
        code: 'USD',
        mid: 4.44,
      };

      const plnCurrency: Currency = {
        currency: 'Polish zloty',
        code: 'PLN',
        mid: 1,
      };

      expect(service.convertCurrency(6.59, plnCurrency, usdCurrency)).toBe(
        1.52
      );
    }
  ));

  it('CurrencyService should convert 6.58 PLN to PLN', inject(
    [CurrencyService],
    (service: CurrencyService) => {
      const firstPlnCurrency: Currency = {
        currency: 'Polish zloty',
        code: 'PLN',
        mid: 1,
      };

      const secondPlnCurrency: Currency = {
        currency: 'Polish zloty',
        code: 'PLN',
        mid: 1,
      };

      expect(
        service.convertCurrency(11.11, firstPlnCurrency, secondPlnCurrency)
      ).toBe(11.11);
    }
  ));
});
