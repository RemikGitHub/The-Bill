import { Component, OnDestroy, OnInit } from '@angular/core';
import { ConfigService } from '../../service/app.config.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit, OnDestroy {
  isDarkTheme: boolean;
  subscription: Subscription;

  constructor(private configService: ConfigService) {}

  ngOnInit(): void {
    this.subscription = this.configService
      .getConfig()
      .subscribe((config) => (this.isDarkTheme = config.isDarkTheme));
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
