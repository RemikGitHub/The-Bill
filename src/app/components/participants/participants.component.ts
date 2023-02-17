import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ParticipantService } from '../../service/participant.service';
import { Subscription } from 'rxjs';
import { Participant, Settlement, Spend } from '../../api/settlement';
import { SettlementService } from '../../service/settlement.service';
import { ConfigService } from '../../service/app.config.service';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { UIChart } from 'primeng/chart';
import { CurrencyService } from '../../service/currency.service';
import { AuthService } from '../../service/auth.service';
import { User } from '../../api/user';

@Component({
  selector: 'app-participants',
  templateUrl: './participants.component.html',
  styleUrls: ['./participants.component.scss'],
  providers: [MessageService, ConfirmationService],
})
export class ParticipantsComponent implements OnInit, OnDestroy {
  @ViewChild('balanceChart') balanceChart: UIChart;
  @ViewChild('spendChart') spendChart: UIChart;
  participants: Participant[] = [];
  participantBalanceChartData;
  participantSpendChartData;
  participantBalanceChartOptions = {
    indexAxis: 'y',
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#ffffff',
        },
        grid: {
          color: '#3f4b5b',
        },
      },
      y: {
        ticks: {
          color: '#ffffff',
          autoSkip: false,
        },
        grid: {
          color: '#3f4b5b',
        },
      },
    },
  };
  participantSpendChartOptions = {
    hoverOffset: 10,
    borderColor: '#ffffff',
    borderWidth: 1,
    plugins: {
      legend: {
        labels: {
          color: '#212529',
        },
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (context) => {
            const label = context.label ?? 'Unknown';
            const value = parseFloat(context.formattedValue.replace(/,/g, '.'));

            let sum = 0;
            const dataArr = context.chart.data.datasets[0].data;
            dataArr.map((data) => {
              sum += Number(data);
            });

            const percentage = ((value * 100) / sum).toFixed(2) + '%';

            return label + ': ' + percentage;
          },
        },
      },
    },
  };
  balanceChartHeight: string = '200px';
  selectedSettlement: Settlement;
  editedParticipant: Participant;
  isAddParticipantDialogVisible: boolean = false;
  isEditParticipantDialogVisible: boolean = false;
  isBlocked: boolean = false;
  user: User;
  isUserViewer: boolean = true;
  subscriptions: Subscription[] = [];
  participantMenuItems: MenuItem[];

  private CHART_COLORS = [
    '#e60049',
    '#0bb4ff',
    '#50e991',
    '#e6d800',
    '#9b19f5',
    '#ffa300',
    '#dc0ab4',
    '#b3d4ff',
    '#00bfa0',
  ];
  private CHART_HOVER_COLORS = [
    '#f9337c',
    '#3ee7ff',
    '#83fcc4',
    '#f9fb33',
    '#ce4cf8',
    '#ffd633',
    '#ff3de7',
    '#e6f7ff',
    '#33efd3',
  ];

  constructor(
    private participantsService: ParticipantService,
    private settlementService: SettlementService,
    private configService: ConfigService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private translate: TranslateService,
    private currencyService: CurrencyService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.participantMenuItems = [
      {
        label: this.translate.instant('Options'),
        items: [
          {
            label: this.translate.instant('Edit'),
            icon: 'pi pi-pencil',
            command: () => {
              this.editParticipant();
            },
          },
          {
            label: this.translate.instant('Delete'),
            icon: 'pi pi-times',
            command: () => {
              this.deleteParticipant();
            },
          },
        ],
      },
    ];

    this.subscriptions.push(
      this.translate.onLangChange.subscribe((translate: LangChangeEvent) => {
        this.participantMenuItems[0].label = translate.translations['Options'];
        this.participantMenuItems[0].items[0].label =
          translate.translations['Edit'];
        this.participantMenuItems[0].items[1].label =
          translate.translations['Delete'];
      }),
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
      this.participantsService.getParticipants().subscribe((participants) => {
        this.participants = participants;
        this.updateParticipantBalanceChartData(participants);
        this.updateParticipantSpendChartData(participants);
      }),
      this.configService
        .getConfig()
        .subscribe((config) => this.updateChartsOptions(config.isDarkTheme))
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  showAddParticipantDialog() {
    this.isAddParticipantDialogVisible = true;
  }

  updateParticipantBalanceChartData(participants: Participant[]) {
    this.balanceChartHeight = 50 + 20 * participants.length + 'px';
    this.participantBalanceChartData = {
      labels: participants.map((participant) => participant.name),
      datasets: [
        {
          backgroundColor: participants.map((participant) =>
            this.calculateTotalSpend(participant.balances) < 0
              ? '#ff0000'
              : '#008000'
          ),
          data: participants.map((participant) =>
            this.calculateTotalSpend(participant.balances)
          ),
        },
      ],
    };
  }

  updateParticipantSpendChartData(participants: Participant[]) {
    if (
      participants.every(
        (participant) => this.calculateTotalSpend(participant.spends) === 0
      )
    ) {
      this.participantSpendChartData = { datasets: [{ data: [100] }] };
      this.participantSpendChartOptions.plugins.tooltip.enabled = false;
    } else {
      this.participantSpendChartData = {
        labels: participants
          .filter(
            (participant) => this.calculateTotalSpend(participant.spends) !== 0
          )
          .map((participant) => participant.name),
        datasets: [
          {
            data: participants
              .filter(
                (participant) =>
                  this.calculateTotalSpend(participant.spends) !== 0
              )
              .map((participant) =>
                this.calculateTotalSpend(participant.spends)
              ),
            backgroundColor: this.CHART_COLORS,
            hoverBackgroundColor: this.CHART_HOVER_COLORS,
          },
        ],
      };
      this.participantSpendChartOptions.plugins.tooltip.enabled = true;
    }
  }

  updateChartsOptions(isDarkTheme: boolean) {
    this.participantSpendChartOptions.plugins.legend.labels.color = isDarkTheme
      ? '#ffffff'
      : '#212529';
    this.participantSpendChartOptions.borderColor = isDarkTheme
      ? '#2a323d'
      : '#ffffff';

    this.participantBalanceChartOptions.scales.x.ticks.color = isDarkTheme
      ? '#ffffff'
      : '#212529';
    this.participantBalanceChartOptions.scales.y.ticks.color = isDarkTheme
      ? '#ffffff'
      : '#212529';

    this.participantBalanceChartOptions.scales.x.grid.color = isDarkTheme
      ? '#3f4b5b'
      : '#dadcde';
    this.participantBalanceChartOptions.scales.y.grid.color = isDarkTheme
      ? '#3f4b5b'
      : '#dadcde';

    if (this.spendChart) {
      this.spendChart.refresh();
    }

    if (this.balanceChart) {
      this.balanceChart.refresh();
    }
  }

  setEditedParticipant(participant: Participant) {
    this.editedParticipant = participant;
  }

  editParticipant() {
    this.isEditParticipantDialogVisible = true;
  }

  deleteParticipant() {
    if (
      this.editedParticipant.spends.length > 0 ||
      this.editedParticipant.balances.length > 0
    ) {
      this.messageService.add({
        severity: 'warn',
        summary: this.translate.instant("Can't delete"),
        life: 5000,
        detail: this.translate.instant(
          'The user has been involved in certain payments and cannot be removed.'
        ),
      });
      return;
    }

    this.confirmationService.confirm({
      message: this.translate.instant(
        'Are you sure you want to delete this participant?'
      ),
      header: this.translate.instant('Delete participant'),
      icon: 'pi pi-info-circle',
      accept: () => {
        if (this.editedParticipant) {
          this.isBlocked = true;
          this.participantsService
            .deleteParticipant(
              this.selectedSettlement.id,
              this.editedParticipant
            )
            .then(() => {
              this.isBlocked = false;
              this.messageService.add({
                severity: 'info',
                summary: this.translate.instant('Confirmed'),
                detail: this.translate.instant('Participant deleted'),
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
  }

  calculateTotalSpend(spends: Spend[]): number {
    return this.currencyService.calculateTotalSpend(
      spends,
      this.selectedSettlement.mainCurrencyCode
    );
  }
}
