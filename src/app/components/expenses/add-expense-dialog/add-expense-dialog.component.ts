import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ParticipantService } from '../../../service/participant.service';
import { TranslateService } from '@ngx-translate/core';
import { ExpenseService } from '../../../service/expense.service';
import { Expense, Participant, Settlement } from '../../../api/settlement';
import { finalize, Subscription } from 'rxjs';
import { Currency } from '../../../api/currency';
import { CurrencyService } from '../../../service/currency.service';
import { SettlementService } from '../../../service/settlement.service';
import firebase from 'firebase/compat/app';
import ScreenUtil from '../../../utils/ScreenUtil';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { v4 as uuidv4 } from 'uuid';
import Timestamp = firebase.firestore.Timestamp;

@Component({
  selector: 'app-add-expense-dialog',
  templateUrl: './add-expense-dialog.component.html',
  styleUrls: ['./add-expense-dialog.component.scss'],
  providers: [MessageService],
})
export class AddExpenseDialogComponent implements OnInit, OnDestroy {
  @Input()
  isVisible: boolean;
  @Output()
  isVisibleChange = new EventEmitter<boolean>();
  newBillPhoto: any;
  participants: Participant[] = [];
  selectedParticipant: Participant;
  currencies: Currency[] = [];
  isDialogBlocked: boolean = false;
  isTablet: boolean;
  photoIsUploading: boolean = false;
  uploadPercentage: number = 0;
  selectedCurrency: Currency;
  selectedSettlement: Settlement;
  subscriptions: Subscription[] = [];
  newExpenseForm = new FormGroup({
    participant: new FormControl<Participant | null>(null, Validators.required),
    name: new FormControl<string | null>('', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(30),
    ]),
    currency: new FormControl<Currency | null>(null, Validators.required),
    amount: new FormControl<number | null>(null, [
      Validators.required,
      Validators.min(0),
    ]),
    date: new FormControl<Date | null>(null),
    debtors: new FormControl<Participant[] | null>(null, Validators.required),
  });

  constructor(
    private expenseService: ExpenseService,
    private messageService: MessageService,
    private translate: TranslateService,
    private participantsService: ParticipantService,
    private currencyService: CurrencyService,
    private settlementService: SettlementService,
    private storage: AngularFireStorage
  ) {}

  ngOnInit(): void {
    this.onResize();
    this.subscriptions.push(
      this.currencyService
        .getCurrencies()
        .subscribe((currencies) => (this.currencies = currencies)),
      this.participantsService
        .getParticipants()
        .subscribe((participants) => (this.participants = participants)),
      this.settlementService
        .getSelectedSettlement()
        .subscribe(
          (selectedSettlement) => (this.selectedSettlement = selectedSettlement)
        )
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

  onChangeParticipant(participant: Participant) {
    if (!participant && !this.newExpenseForm.get('participant').touched)
      this.newExpenseForm.get('participant').markAsPristine();
    this.selectedParticipant = participant;
  }

  onSubmitAddExpenseForm() {
    this.isDialogBlocked = true;
    if (this.newBillPhoto) {
      const fileExtension = this.newBillPhoto.name.split('.').pop();
      const filePath = `${
        this.selectedSettlement.id
      }/${uuidv4()}.${fileExtension}`;
      this.uploadPercentage = 0;
      this.photoIsUploading = true;

      const task = this.expenseService.uploadImage(filePath, this.newBillPhoto);
      const storageRef = this.storage.ref(filePath);
      let fileUrl;
      let failed = false;

      task
        .snapshotChanges()
        .pipe(
          finalize(() => {
            if (!failed) {
              storageRef.getDownloadURL().subscribe((downloadURL) => {
                fileUrl = downloadURL;
                this.addExpense(fileUrl);
              });
            }
          })
        )
        .subscribe({
          error: (err) => {
            failed = true;
            this.isDialogBlocked = false;
            this.photoIsUploading = false;
            this.uploadPercentage = 0;
            this.messageService.add({
              severity: 'error',
              summary: this.translate.instant('Add error'),
              detail: err.message,
            });
          },
        });

      task.percentageChanges().subscribe((percentage) => {
        this.uploadPercentage = Math.round(percentage ? percentage : 0);
      });
    } else {
      this.addExpense();
    }
  }

  onChangeCurrency(currency: Currency) {
    if (!currency && !this.newExpenseForm.get('currency').touched)
      this.newExpenseForm.get('currency').markAsPristine();
    this.selectedCurrency = currency;
  }

  updateForm() {
    this.photoIsUploading = false;
    this.uploadPercentage = 0;
    this.newBillPhoto = null;

    this.newExpenseForm
      .get('currency')
      .setValue(
        this.currencies.find(
          (currency) =>
            currency.code === this.selectedSettlement.mainCurrencyCode
        )
      );
    this.newExpenseForm.get('debtors').setValue(this.participants);
  }

  onSelectImage(event) {
    this.newBillPhoto = event.files[0];
  }

  deleteImage() {
    this.newBillPhoto = null;
  }

  private addExpense(photoUrl: string = null) {
    const name: string = this.newExpenseForm.get('name').value;
    const currency: Currency = this.newExpenseForm.get('currency').value;
    const participant: Participant =
      this.newExpenseForm.get('participant').value;
    const amount: number = this.newExpenseForm.get('amount').value;
    const debtors: Participant[] = this.newExpenseForm.get('debtors').value;
    const date: Timestamp = this.newExpenseForm.get('date').value
      ? Timestamp.fromDate(this.newExpenseForm.get('date').value)
      : null;

    const newExpense = {
      name: name,
      amount: amount,
      currencyCode: currency.code,
      participantId: participant.id,
      debtorsId: debtors.map((debtor) => debtor.id),
      date: date,
      photoUrl: photoUrl,
    } as Expense;

    if (newExpense) {
      this.expenseService
        .addExpense(
          this.selectedSettlement.id,
          newExpense,
          participant,
          debtors
        )
        .then(() => {
          this.isDialogBlocked = false;
          this.closeDialog();
          this.newExpenseForm.reset();
        })
        .catch((error) => {
          this.isDialogBlocked = false;
          this.messageService.add({
            severity: 'error',
            summary: this.translate.instant('Add error'),
            detail: error.message,
          });
        });
    }
  }
}
