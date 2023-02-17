import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ConfigService } from '../../service/app.config.service';
import { MenuService } from '../../service/app.menu.service';
import { AppConfig, Language } from '../../api/config';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit, OnDestroy {
  readonly scales: number[] = [12, 13, 14, 15, 16];
  config: AppConfig;
  isConfigMenuActive: boolean;
  subscriptions: Subscription[] = [];
  languages: Language[];

  constructor(
    private configService: ConfigService,
    private menuService: MenuService
  ) {
    this.languages = [
      { name: 'English', code: 'en' },
      { name: 'Polski', code: 'pl' },
    ];
  }

  ngOnInit() {
    this.subscriptions.push(
      this.configService
        .getConfig()
        .subscribe((config) => (this.config = config)),
      this.menuService
        .getMenuConfigUpdate()
        .subscribe(
          (appMenuConfig) =>
            (this.isConfigMenuActive = appMenuConfig.isConfigMenuActive)
        )
    );
  }

  onExitConfigButtonClick() {
    this.menuService.closeConfigMenu();
  }

  incrementScale() {
    this.configService.incrementScale();
  }

  decrementScale() {
    this.configService.decrementScale();
  }

  changeTheme(dark: boolean) {
    this.configService.switchTheme(dark);
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  changeLanguage() {
    this.configService.changeLanguage(this.config.language.code);
  }
}
