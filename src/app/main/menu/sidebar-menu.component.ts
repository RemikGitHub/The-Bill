import { Component, OnInit } from '@angular/core';
import { Link } from '../../api/link';
import { SettlementService } from '../../service/settlement.service';

@Component({
  selector: 'app-menu',
  templateUrl: './sidebar-menu.component.html',
  styleUrls: ['./sidebar-menu.component.scss'],
})
export class SidebarMenuComponent implements OnInit {
  menuOptions: Link[];
  operations: Link;

  constructor(private settlementService: SettlementService) {}

  ngOnInit() {
    this.menuOptions = [
      {
        label: 'Home',
        items: [
          {
            label: 'Settlements',
            icon: 'pi pi-wallet',
            routerLink: ['/settlements'],
          },
        ],
      },
      {
        label: 'Utils',
        items: [
          {
            label: 'Currency converter',
            icon: 'pi pi-calculator',
            routerLink: ['/currency-converter'],
          },
        ],
      },
    ];

    this.operations = {
      label: 'Operations',
      items: [
        {
          label: 'Participants',
          icon: 'pi pi-users',
          routerLink: ['/participants'],
        },
        {
          label: 'Expenses',
          icon: 'pi pi-money-bill',
          routerLink: ['/expenses'],
        },
        { label: 'Debts', icon: 'pi pi-credit-card', routerLink: ['/debts'] },
      ],
    };

    this.settlementService.getSettlements().subscribe((settlements) => {
      settlements && settlements.length > 0
        ? this.showOperations()
        : this.hideOperations();
    });
  }

  showOperations() {
    if (!this.menuOptionsHasOperations())
      this.menuOptions.splice(1, 0, this.operations);
  }

  hideOperations() {
    if (this.menuOptionsHasOperations()) this.menuOptions.splice(1, 1);
  }

  private menuOptionsHasOperations() {
    return this.menuOptions.includes(this.operations);
  }
}
