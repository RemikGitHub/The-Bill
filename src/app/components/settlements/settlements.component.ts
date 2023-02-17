import { Component, OnDestroy, OnInit } from '@angular/core';
import { SettlementService } from '../../service/settlement.service';
import { combineLatest, map, Subscription } from 'rxjs';
import { Expense, Participant, Settlement } from '../../api/settlement';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../service/auth.service';
import { jsPDF } from 'jspdf';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { CurrencyService } from '../../service/currency.service';
import autoTable from 'jspdf-autotable';
import '../../../assets/layout/fonts/arial-bold';
import '../../../assets/layout/fonts/arial-normal';
import { DebtService } from '../../service/debt.service';
import { User } from '../../api/user';

@Component({
  selector: 'app-settlements',
  templateUrl: './settlements.component.html',
  styleUrls: ['./settlements.component.scss'],
  providers: [MessageService, ConfirmationService],
})
export class SettlementsComponent implements OnInit, OnDestroy {
  selectedSettlement: Settlement;
  editedSettlement: Settlement;
  settlements: Settlement[] = [];
  sharedSettlements: Settlement[] = [];
  subscriptions: Subscription[] = [];
  isAddSettlementDialogVisible: boolean = false;
  isEditSettlementDialogVisible: boolean = false;
  isProfileDialogVisible: boolean = false;
  isAddSharedSettlementDialogVisible: boolean = false;
  settlementOwnerMenuItems: MenuItem[];
  settlementEditorMenuItems: MenuItem[];
  settlementViewerMenuItems: MenuItem[];
  isBlocked: boolean = false;
  user: User;

  constructor(
    private settlementService: SettlementService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private translate: TranslateService,
    private authService: AuthService,
    private firestore: AngularFirestore,
    private currencyService: CurrencyService,
    private debtService: DebtService
  ) {}

  ngOnInit() {
    this.subscriptions.push(
      this.authService.getUser().subscribe((user) => (this.user = user)),
      this.settlementService.getSettlements().subscribe((settlements) => {
        if (settlements) {
          this.settlements = settlements.filter(
            (settlement) => !this.isSettlementShared(settlement)
          );
          this.sharedSettlements = settlements.filter((settlement) =>
            this.isSettlementShared(settlement)
          );
        }
      }),
      this.settlementService
        .getSelectedSettlement()
        .subscribe(
          (selectedSettlement) => (this.selectedSettlement = selectedSettlement)
        )
    );

    this.settlementOwnerMenuItems = [
      {
        label: this.translate.instant('Options'),
        items: [
          {
            label: this.translate.instant('Edit'),
            icon: 'pi pi-pencil',
            command: () => {
              this.isEditSettlementDialogVisible = true;
            },
          },
          {
            label: this.translate.instant('Download PDF'),
            icon: 'pi pi-file-pdf',
            command: () => {
              this.downloadPdf();
            },
          },
          {
            label: this.translate.instant('Share'),
            icon: 'pi pi-share-alt',
            command: () => {
              this.isProfileDialogVisible = true;
            },
          },
          {
            label: this.translate.instant('Delete'),
            icon: 'pi pi-times',
            command: () => {
              this.confirmationService.confirm({
                message: this.translate.instant(
                  'Are you sure you want to delete this settlement?'
                ),
                header: this.translate.instant('Delete settlement'),
                icon: 'pi pi-info-circle',
                accept: () => {
                  if (this.editedSettlement) {
                    this.isBlocked = true;
                    this.settlementService
                      .deleteSettlement(this.editedSettlement)
                      .then(() => {
                        this.isBlocked = false;
                        this.messageService.add({
                          severity: 'info',
                          summary: this.translate.instant('Confirmed'),
                          detail: this.translate.instant('Settlement deleted'),
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
                },
                reject: () => {},
              });
            },
          },
        ],
      },
    ];

    this.updateSharedSettlementsMenu();

    this.subscriptions.push(
      this.translate.onLangChange.subscribe((translate: LangChangeEvent) => {
        this.settlementOwnerMenuItems[0].label =
          translate.translations['Options'];
        this.settlementOwnerMenuItems[0].items[0].label =
          translate.translations['Edit'];
        this.settlementOwnerMenuItems[0].items[1].label =
          translate.translations['Download PDF'];
        this.settlementOwnerMenuItems[0].items[2].label =
          translate.translations['Share'];
        this.settlementOwnerMenuItems[0].items[3].label =
          translate.translations['Delete'];

        this.updateSharedSettlementsMenu();
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  showAddSettlementDialog() {
    this.isAddSettlementDialogVisible = true;
  }

  showAddSharedSettlementDialog() {
    this.isAddSharedSettlementDialogVisible = true;
  }

  setEditingSettlement(settlement: Settlement) {
    this.editedSettlement = settlement;
  }

  setSelectedSettlement() {
    this.settlementService.setSelectedSettlement(this.selectedSettlement);
  }

  updateSharedSettlementsMenu() {
    this.settlementEditorMenuItems = [
      { label: this.settlementOwnerMenuItems[0].label },
    ];
    this.settlementViewerMenuItems = [
      { label: this.settlementOwnerMenuItems[0].label },
    ];

    this.settlementEditorMenuItems[0].items =
      this.settlementOwnerMenuItems[0].items.slice(0, 3);
    this.settlementViewerMenuItems[0].items = [
      this.settlementOwnerMenuItems[0].items[1],
      this.settlementOwnerMenuItems[0].items[2],
    ];
  }

  isUserOwner(settlement: Settlement) {
    return this.settlementService.isUserOwner(this.user.uid, settlement);
  }

  isUserEditor(settlement: Settlement) {
    return this.settlementService.isUserEditor(this.user.uid, settlement);
  }

  isUserViewer(settlement: Settlement) {
    return this.settlementService.isUserViewer(this.user.uid, settlement);
  }

  isSettlementShared(settlement: Settlement) {
    return this.settlementService.isSettlementShared(this.user.uid, settlement);
  }

  getSettlementShares(settlement: Settlement) {
    return Object.keys(settlement.permissions).length - 1;
  }

  private downloadPdf() {
    this.getEditedSettlementParticipantsAndExpenses().subscribe(
      (participantsAndExpenses) => {
        const billReport = new jsPDF();
        const billReportName = this.editedSettlement.name + '.pdf';
        const participants = participantsAndExpenses[0];
        const expenses = participantsAndExpenses[1];

        billReport.setFontSize(20);
        billReport.setFont('arial', 'bold');
        const titleXPos =
          billReport.internal.pageSize.getWidth() / 2 -
          billReport.getTextWidth(this.editedSettlement.name) / 2;
        billReport.text(this.editedSettlement.name, titleXPos, 20);

        billReport.setFont('arial', 'normal');
        billReport.setFontSize(11);
        billReport.text(
          this.translate.instant('Currency') +
            ': ' +
            this.editedSettlement.mainCurrencyCode,
          14,
          30
        );
        billReport.text(
          this.translate.instant('Participants') +
            ': ' +
            this.editedSettlement.participants,
          14,
          35
        );
        billReport.text(
          this.translate.instant('Expenses') +
            ': ' +
            this.editedSettlement.expenses,
          14,
          40
        );

        this.addParticipantsTableToDoc(billReport, participants);
        this.addExpensesTableToDoc(billReport, expenses, participants);
        this.addDebtsTableToDoc(billReport, participants);

        billReport.save(billReportName);
      }
    );
  }

  private getEditedSettlementParticipantsAndExpenses() {
    const participants = this.firestore
      .collection('/settlements')
      .doc(this.editedSettlement.id)
      .collection('/participants')
      .get()
      .pipe(
        map((doc) =>
          (
            doc.docs.map(
              (participant) => participant.data() as Participant
            ) as Participant[]
          ).sort((a, b) => a.name.localeCompare(b.name))
        )
      );

    const expenses = this.firestore
      .collection('/settlements')
      .doc(this.editedSettlement.id)
      .collection('/expenses')
      .get()
      .pipe(
        map((doc) =>
          (
            doc.docs.map((expense) => expense.data() as Expense) as Expense[]
          ).sort((a, b) => a.name.localeCompare(b.name))
        )
      );

    return combineLatest([participants, expenses]);
  }

  private addParticipantsTableToDoc(doc: jsPDF, participants: Participant[]) {
    autoTable(doc, {
      head: [
        [
          this.translate.instant('Participant'),
          this.translate.instant('Spent'),
          this.translate.instant('Balance'),
        ],
      ],
      body: participants.map((participant) => [
        participant.name,
        this.currencyService.calculateTotalSpend(
          participant.spends,
          this.editedSettlement.mainCurrencyCode
        ),
        this.currencyService.calculateTotalSpend(
          participant.balances,
          this.editedSettlement.mainCurrencyCode
        ),
      ]),
      startY: 50,
      styles: {
        font: 'arial',
        fontStyle: 'normal',
      },
    });
  }

  private addExpensesTableToDoc(
    doc: jsPDF,
    expenses: Expense[],
    participants: Participant[]
  ) {
    autoTable(doc, {
      head: [
        [
          this.translate.instant('Expense name'),
          this.translate.instant('Currency'),
          this.translate.instant('Amount'),
          this.translate.instant('Who paid'),
          this.translate.instant('For who'),
        ],
      ],
      body: expenses.map((expense) => [
        expense.name,
        expense.currencyCode,
        expense.amount,
        participants.find(
          (participant) => participant.id === expense.participantId
        ).name,
        participants
          .filter((participant) =>
            expense.debtorsId.find((debtorId) => debtorId === participant.id)
          )
          .map((participant) => participant.name),
      ]),
      styles: {
        font: 'arial',
        fontStyle: 'normal',
      },
    });
  }

  private addDebtsTableToDoc(doc: jsPDF, participants: Participant[]) {
    const debts = this.debtService.getDebts(
      participants,
      this.editedSettlement.mainCurrencyCode
    );
    autoTable(doc, {
      head: [
        [
          this.translate.instant('Participant'),
          this.translate.instant('Should return'),
          this.translate.instant('For'),
          this.translate.instant('Sum'),
        ],
      ],
      body: debts.map((debt) => [
        debt.debtor,
        '→',
        debt.creditor,
        debt.value + ' ' + this.editedSettlement.mainCurrencyCode,
      ]),
      styles: {
        font: 'arial',
        fontStyle: 'normal',
      },
    });
  }
}
