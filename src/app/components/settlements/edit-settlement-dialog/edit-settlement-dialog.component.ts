import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { Currency } from '../../../api/currency';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CurrencyService } from '../../../service/currency.service';
import { SettlementService } from '../../../service/settlement.service';
import { MessageService } from 'primeng/api';
import { Settlement } from '../../../api/settlement';
import { TranslateService } from '@ngx-translate/core';
import { User } from '../../../api/user';
import ScreenUtil from '../../../utils/ScreenUtil';

@Component({
  selector: 'app-edit-settlement-dialog',
  templateUrl: './edit-settlement-dialog.component.html',
  styleUrls: ['./edit-settlement-dialog.component.scss'],
  providers: [MessageService],
})
export class EditSettlementDialogComponent implements OnInit {
  @Input()
  isVisible: boolean;
  @Output()
  isVisibleChange = new EventEmitter<boolean>();
  @Input()
  editedSettlement: Settlement;
  isTablet: boolean;
  currencies: Currency[] = [];
  selectedCurrency: Currency;
  isBlocked: boolean = false;
  editSettlementForm = new FormGroup({
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
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.onResize();
    this.subscriptions.push(
      this.currencyService
        .getCurrencies()
        .subscribe((currencies) => (this.currencies = currencies))
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
    this.editSettlementForm.reset();
  }

  onChangeCurrency(currency: Currency) {
    if (!currency && !this.editSettlementForm.get('settlementCurrency').touched)
      this.editSettlementForm.get('settlementCurrency').markAsPristine();
    this.selectedCurrency = currency;
  }

  onSubmitEditSettlementForm() {
    if (this.editedSettlement) {
      this.isBlocked = true;
      this.editedSettlement.name =
        this.editSettlementForm.get('settlementName').value;
      this.editedSettlement.mainCurrencyCode =
        this.editSettlementForm.get('settlementCurrency').value.code;
      this.editedSettlement.description = this.editSettlementForm.get(
        'settlementDescription'
      ).value;

      this.settlementService
        .editSettlement(this.editedSettlement)
        .then(() => {
          this.isBlocked = false;
          this.closeDialog();
        })
        .catch((error) => {
          this.isBlocked = false;
          this.messageService.add({
            severity: 'error',
            summary: this.translate.instant('Edit error'),
            detail: error.message,
          });
        });
    }
  }

  updateFormValues() {
    this.editSettlementForm.setValue({
      settlementName: this.editedSettlement.name,
      settlementCurrency: this.currencies.find(
        (currency) => currency.code === this.editedSettlement.mainCurrencyCode
      ),
      settlementDescription: this.editedSettlement.description ?? '',
    });
  }
}
