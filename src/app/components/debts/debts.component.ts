import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { ParticipantService } from '../../service/participant.service';
import { Settlement } from '../../api/settlement';
import { Subscription } from 'rxjs';
import { CurrencyService } from '../../service/currency.service';
import { SettlementService } from '../../service/settlement.service';
import { DebtService } from '../../service/debt.service';

@Component({
  selector: 'app-debts',
  templateUrl: './debts.component.html',
  styleUrls: ['./debts.component.scss'],
})
export class DebtsComponent implements OnInit, OnDestroy {
  debts: {
    creditor: string;
    debtor: string;
    value: number;
  }[] = [];
  selectedSettlement: Settlement;
  subscriptions: Subscription[] = [];
  isTablet: boolean = false;

  constructor(
    private participantService: ParticipantService,
    private currencyService: CurrencyService,
    private settlementService: SettlementService,
    private debtService: DebtService
  ) {}

  ngOnInit(): void {
    this.onResize();
    this.subscriptions.push(
      this.settlementService
        .getSelectedSettlement()
        .subscribe(
          (selectedSettlement) => (this.selectedSettlement = selectedSettlement)
        ),
      this.participantService
        .getParticipants()
        .subscribe(
          (participants) =>
            (this.debts = this.debtService.getDebts(
              participants,
              this.selectedSettlement.mainCurrencyCode
            ))
        )
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.isTablet = window.innerWidth <= 960;
  }
}
