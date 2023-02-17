import { SpendPipe } from './spend.pipe';
import { CurrencyService } from '../service/currency.service';
import { getTestBed, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('SpendPipe', () => {
  let injector: TestBed;
  let spendPipe: SpendPipe;
  let currencyService: CurrencyService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CurrencyService],
    });
    injector = getTestBed();
    currencyService = TestBed.inject(CurrencyService);
    spendPipe = new SpendPipe(currencyService);
  });

  it('create an instance', () => {
    expect(spendPipe).toBeTruthy();
  });
});
