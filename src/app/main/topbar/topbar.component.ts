import { Component, OnDestroy, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Subscription } from 'rxjs';
import { ConfigService } from '../../service/app.config.service';
import { MenuService } from '../../service/app.menu.service';
import { AuthService } from '../../service/auth.service';
import { User } from '../../api/user';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss'],
})
export class TopbarComponent implements OnInit, OnDestroy {
  isDarkTheme: boolean;
  isTopMenuActive: boolean;
  subscriptions: Subscription[] = [];
  items: MenuItem[];
  user: User;

  constructor(
    private configService: ConfigService,
    private menuService: MenuService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.configService
        .getConfig()
        .subscribe((config) => (this.isDarkTheme = config.isDarkTheme)),
      this.menuService
        .getMenuConfigUpdate()
        .subscribe(
          (menuConfig) => (this.isTopMenuActive = menuConfig.isTopMenuActive)
        ),
      this.authService.getUser().subscribe((user) => {
        this.user = user;
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  onConfigButtonClick() {
    this.menuService.openConfigMenu();
  }

  toggleSidebarMenu() {
    this.menuService.toggleSidebarMenu();
  }

  toggleTopMenu() {
    this.menuService.toggleTopMenu();
  }

  logout() {
    this.authService.logout();
  }
}
