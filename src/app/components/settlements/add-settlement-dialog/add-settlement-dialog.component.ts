import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { CurrencyService } from '../../../service/currency.service';
import { Subscription } from 'rxjs';
import { Currency } from '../../../api/currency';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SettlementService } from '../../../service/settlement.service';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { Settlement } from '../../../api/settlement';
import { AuthService } from '../../../service/auth.service';
import { User } from '../../../api/user';
import ScreenUtil from '../../../utils/ScreenUtil';

@Component({
  selector: 'app-add-settlement-dialog',
  templateUrl: './add-settlement-dialog.component.html',
  styleUrls: ['./add-settlement-dialog.component.scss'],
  providers: [MessageService],
})
export class AddSettlementDialogComponent implements OnInit, OnDestroy {
  @Input()
  isVisible: boolean;
  @Output()
  isVisibleChange = new EventEmitter<boolean>();
  isTablet: boolean;
  currencies: Currency[] = [];
  selectedCurrency: Currency;
  isBlocked: boolean = false;
  newSettlementForm = new FormGroup({
    settlementName: new FormControl<string | null>('', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(50),
    ]),
    settlementCurrency: new FormControl<Currency | null>(
      null,
      Validators.required
    ),
    settlementDescription: new FormControl<string | null>(''),
  });
  user: User;
  subscriptions: Subscription[] = [];

  constructor(
    private currencyService: CurrencyService,
    private settlementService: SettlementService,
    private messageService: MessageService,
    private translate: TranslateService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.onResize();
    this.subscriptions.push(
      this.currencyService
        .getCurrencies()
        .subscribe((currencies) => (this.currencies = currencies)),
      this.authService.getUser().subscribe((user) => (this.user = user))
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.isTablet = ScreenUtil.isTablet();
  }

  closeDialog() {
    this.isVisibleChange.emit(false);
  }

  onChangeCurrency(currency: Currency) {
    if (!currency && !this.newSettlementForm.get('settlementCurrency').touched)
      this.newSettlementForm.get('settlementCurrency').markAsPristine();
    this.selectedCurrency = currency;
  }

  onSubmitAddSettlementForm() {
    const name = this.newSettlementForm.get('settlementName').value;
    const currency = this.newSettlementForm.get('settlementCurrency').value;
    const description = this.newSettlementForm.get(
      'settlementDescription'
    ).value;

    const settlement: Settlement = {
      name: name,
      mainCurrencyCode: currency.code,
      description: description,
      expenses: 0,
      participants: 0,
      permissions: { [this.user.uid]: 'owner' },
    } as Settlement;

    if (settlement) {
      this.isBlocked = true;
      this.settlementService
        .addSettlement(settlement)
        .then(() => {
          this.isBlocked = false;
          this.closeDialog();
          this.newSettlementForm.reset();
        })
        .catch((error) => {
          this.isBlocked = false;
          this.messageService.add({
            severity: 'error',
            summary: this.translate.instant('Add error'),
            detail: error.message,
          });
        });
    }
  }
}
