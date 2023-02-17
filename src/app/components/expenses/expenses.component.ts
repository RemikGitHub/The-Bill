import { Component, OnDestroy, OnInit } from '@angular/core';
import { Expense, Participant, Settlement } from '../../api/settlement';
import { ExpenseService } from '../../service/expense.service';
import { finalize, Subscription } from 'rxjs';
import { ParticipantService } from '../../service/participant.service';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { SettlementService } from '../../service/settlement.service';
import { AuthService } from '../../service/auth.service';
import { User } from '../../api/user';

@Component({
  selector: 'app-expenses',
  templateUrl: './expenses.component.html',
  styleUrls: ['./expenses.component.scss'],
  providers: [MessageService, ConfirmationService],
})
export class ExpensesComponent implements OnInit, OnDestroy {
  expenses: Expense[] = [];
  editedExpense: Expense;
  participants: Participant[] = [];
  isAddExpenseDialogVisible: boolean = false;
  isEditExpenseDialogVisible: boolean = false;
  selectedSettlement: Settlement;
  subscriptions: Subscription[] = [];
  expenseMenuItems: MenuItem[];
  isBlocked: boolean = false;
  user: User;
  isUserViewer: boolean = true;
  isExpensesHasDate: boolean;
  isExpensesHasPhoto: boolean;

  constructor(
    private expenseService: ExpenseService,
    private participantService: ParticipantService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private translate: TranslateService,
    private settlementService: SettlementService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.authService.getUser().subscribe((user) => (this.user = user)),
      this.settlementService
        .getSelectedSettlement()
        .subscribe((selectedSettlement) => {
          this.selectedSettlement = selectedSettlement;
          this.isUserViewer = this.settlementService.isUserViewer(
            this.user.uid,
            selectedSettlement
          );
        }),
      this.expenseService.getExpenses().subscribe((expenses) => {
        this.expenses = expenses;
        this.isExpensesHasDate = !!this.expenses.find(
          (expense) => expense.date
        );
        this.isExpensesHasPhoto = !!this.expenses.find(
          (expense) => expense.photoUrl
        );
      }),
      this.participantService
        .getParticipants()
        .subscribe((participants) => (this.participants = participants))
    );

    this.expenseMenuItems = [
      {
        label: this.translate.instant('Options'),
        items: [
          {
            label: this.translate.instant('Edit'),
            icon: 'pi pi-pencil',
            command: () => {
              this.editExpense();
            },
          },
          {
            label: this.translate.instant('Delete'),
            icon: 'pi pi-times',
            command: () => {
              this.showDeleteExpenseDialog();
            },
          },
        ],
      },
    ];

    this.subscriptions.push(
      this.translate.onLangChange.subscribe((translate: LangChangeEvent) => {
        this.expenseMenuItems[0].label = translate.translations['Options'];
        this.expenseMenuItems[0].items[0].label =
          translate.translations['Edit'];
        this.expenseMenuItems[0].items[1].label =
          translate.translations['Delete'];
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  getExpenseParticipant(expense: Expense): Participant {
    if (expense) {
      return this.participants.find(
        (participant) => participant.id === expense.participantId
      );
    }
    return null;
  }

  getExpenseDebtors(expense: Expense): Participant[] {
    if (expense) {
      return this.participants.filter((participant) =>
        expense.debtorsId.find((debtorId) => debtorId === participant.id)
      );
    }
    return [];
  }

  showAddExpenseDialog() {
    this.isAddExpenseDialogVisible = true;
  }

  setEditedExpense(expense: Expense) {
    this.editedExpense = expense;
  }

  editExpense() {
    this.isEditExpenseDialogVisible = true;
  }

  deleteExpense() {
    const participant: Participant = this.getExpenseParticipant(
      this.editedExpense
    );
    const debtors: Participant[] = this.getExpenseDebtors(this.editedExpense);
    this.expenseService
      .deleteExpense(
        this.selectedSettlement.id,
        this.editedExpense,
        participant,
        debtors
      )
      .then(() => {
        this.isBlocked = false;
        this.messageService.add({
          severity: 'info',
          summary: this.translate.instant('Confirmed'),
          detail: this.translate.instant('Expense deleted'),
        });
      })
      .catch((error) => {
        this.isBlocked = false;
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('Delete error'),
          detail: error.message,
        });
      });
  }

  showDeleteExpenseDialog() {
    this.confirmationService.confirm({
      message: this.translate.instant(
        'Are you sure you want to delete this expense?'
      ),
      header: this.translate.instant('Delete expense'),
      icon: 'pi pi-info-circle',
      accept: () => {
        if (this.editedExpense) {
          this.isBlocked = true;
          if (this.editedExpense.photoUrl) {
            this.expenseService
              .deleteImage(this.editedExpense.photoUrl)
              .pipe(
                finalize(() => {
                  this.editedExpense.photoUrl = null;
                  this.deleteExpense();
                })
              )
              .subscribe();
          } else {
            this.deleteExpense();
          }
        }
      },
      reject: () => {},
    });
  }
}
