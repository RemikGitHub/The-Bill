import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { MessageService } from 'primeng/api';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Expense, Participant, Settlement } from '../../../api/settlement';
import { Currency } from '../../../api/currency';
import { finalize, Subscription } from 'rxjs';
import { ExpenseService } from '../../../service/expense.service';
import { TranslateService } from '@ngx-translate/core';
import { ParticipantService } from '../../../service/participant.service';
import { CurrencyService } from '../../../service/currency.service';
import { SettlementService } from '../../../service/settlement.service';
import firebase from 'firebase/compat/app';
import { User } from '../../../api/user';
import ScreenUtil from '../../../utils/ScreenUtil';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { v4 as uuidv4 } from 'uuid';
import Timestamp = firebase.firestore.Timestamp;

@Component({
  selector: 'app-edit-expense-dialog',
  templateUrl: './edit-expense-dialog.component.html',
  styleUrls: ['./edit-expense-dialog.component.scss'],
  providers: [MessageService],
})
export class EditExpenseDialogComponent implements OnInit, OnDestroy {
  @Input()
  isVisible: boolean;
  @Output()
  isVisibleChange = new EventEmitter<boolean>();
  @Input()
  editedExpense: Expense;
  newBillPhoto: any;
  photoUrl: string;
  photoIsUploading: boolean = false;
  uploadPercentage: number = 0;
  isTablet: boolean;
  participants: Participant[] = [];
  selectedParticipant: Participant;
  user: User;
  currencies: Currency[] = [];
  selectedCurrency: Currency;
  selectedSettlement: Settlement;
  subscriptions: Subscription[] = [];
  editExpenseForm = new FormGroup({
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
  isDialogBlocked: boolean = false;

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
      this.participantsService
        .getParticipants()
        .subscribe((participants) => (this.participants = participants)),
      this.currencyService
        .getCurrencies()
        .subscribe((currencies) => (this.currencies = currencies)),
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
    this.photoUrl = null;
    this.isVisibleChange.emit(false);
    this.editExpenseForm.reset();
  }

  onChangeParticipant(participant: Participant) {
    if (!participant && !this.editExpenseForm.get('participant').touched)
      this.editExpenseForm.get('participant').markAsPristine();
    this.selectedParticipant = participant;
  }

  onSubmitAddExpenseForm() {
    this.isDialogBlocked = true;
    if (!this.editedExpense.photoUrl && this.photoUrl) {
      this.editExpenseAddPhoto();
    } else if (this.editedExpense.photoUrl && !this.photoUrl) {
      this.editExpenseDeletePhoto();
    } else if (
      this.editedExpense.photoUrl &&
      this.photoUrl &&
      this.editedExpense.photoUrl !== this.photoUrl
    ) {
      this.editExpenseChangePhoto();
    } else {
      this.editExpense();
    }
  }

  editExpense() {
    const name: string = this.editExpenseForm.get('name').value;
    const currency: Currency = this.editExpenseForm.get('currency').value;
    const participant: Participant =
      this.editExpenseForm.get('participant').value;
    const amount: number = this.editExpenseForm.get('amount').value;
    const debtors: Participant[] = this.editExpenseForm.get('debtors').value;
    const date: Timestamp = this.editExpenseForm.get('date').value
      ? Timestamp.fromDate(this.editExpenseForm.get('date').value)
      : null;
    const photoUrl: string = this.editedExpense.photoUrl;

    const editExpense = {
      id: this.editedExpense.id,
      name: name,
      amount: amount,
      currencyCode: currency.code,
      participantId: participant.id,
      debtorsId: debtors.map((debtor) => debtor.id),
      date: date,
      photoUrl: photoUrl,
    } as Expense;

    if (editExpense) {
      this.expenseService
        .editExpense(
          this.selectedSettlement.id,
          editExpense,
          this.editedExpense,
          this.participants
        )
        .then(() => {
          this.isDialogBlocked = false;
          this.closeDialog();
        })
        .catch((error) => {
          this.isDialogBlocked = false;
          this.messageService.add({
            severity: 'error',
            summary: this.translate.instant('Edit error'),
            detail: error.message,
          });
        });
    }
  }

  onChangeCurrency(currency: Currency) {
    if (!currency && !this.editExpenseForm.get('currency').touched)
      this.editExpenseForm.get('currency').markAsPristine();
    this.selectedCurrency = currency;
  }

  updateForm() {
    this.photoUrl = this.editedExpense.photoUrl ?? null;
    this.photoIsUploading = false;
    this.uploadPercentage = 0;
    this.newBillPhoto = null;

    this.editExpenseForm
      .get('participant')
      .setValue(
        this.participants.find(
          (participant) => participant.id === this.editedExpense.participantId
        )
      );
    this.editExpenseForm.get('name').setValue(this.editedExpense.name);
    this.editExpenseForm
      .get('currency')
      .setValue(
        this.currencies.find(
          (currency) => currency.code === this.editedExpense.currencyCode
        )
      );
    this.editExpenseForm.get('amount').setValue(this.editedExpense.amount);
    this.editExpenseForm.get('amount').setValue(this.editedExpense.amount);
    this.editExpenseForm
      .get('debtors')
      .setValue(
        this.participants.filter((participant) =>
          this.editedExpense.debtorsId.find((id) => id === participant.id)
        )
      );

    if (this.editedExpense.date) {
      this.editExpenseForm
        .get('date')
        .setValue(this.editedExpense.date.toDate());
    }
  }

  onSelectImage(event) {
    this.newBillPhoto = event.files[0];
    this.photoUrl = this.newBillPhoto.objectURL;
  }

  deleteImage() {
    this.newBillPhoto = null;
    this.photoUrl = null;
  }

  private editExpenseAddPhoto() {
    const fileExtension = this.newBillPhoto.name.split('.').pop();
    const filePath = `${
      this.selectedSettlement.id
    }/${uuidv4()}.${fileExtension}`;
    this.uploadPercentage = 0;
    this.photoIsUploading = true;

    const task = this.expenseService.uploadImage(filePath, this.newBillPhoto);
    const storageRef = this.storage.ref(filePath);
    let failed = false;

    task
      .snapshotChanges()
      .pipe(
        finalize(() => {
          if (!failed) {
            storageRef.getDownloadURL().subscribe((downloadURL) => {
              this.editedExpense.photoUrl = downloadURL;
              this.editExpense();
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
            summary: this.translate.instant('Edit error'),
            detail: err.message,
          });
        },
      });

    task.percentageChanges().subscribe((percentage) => {
      this.uploadPercentage = Math.round(percentage ? percentage : 0);
    });
  }

  private editExpenseDeletePhoto() {
    let failed = false;
    this.expenseService
      .deleteImage(this.editedExpense.photoUrl)
      .pipe(
        finalize(() => {
          if (!failed) {
            this.editedExpense.photoUrl = null;
            this.editExpense();
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
            summary: this.translate.instant('Edit error'),
            detail: err.message,
          });
        },
      });
  }

  private editExpenseChangePhoto() {
    this.photoIsUploading = true;
    this.uploadPercentage = 0;
    let failed = false;
    this.expenseService
      .deleteImage(this.editedExpense.photoUrl)
      .pipe(
        finalize(() => {
          if (!failed) {
            this.editedExpense.photoUrl = null;
            this.editExpenseAddPhoto();
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
            summary: this.translate.instant('Edit error'),
            detail: err.message,
          });
        },
      });
  }
}
