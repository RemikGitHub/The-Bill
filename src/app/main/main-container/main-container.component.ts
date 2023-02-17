import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  Renderer2,
} from '@angular/core';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { Subscription } from 'rxjs';
import { ConfigService } from '../../service/app.config.service';
import { MenuService } from '../../service/app.menu.service';
import ScreenUtil from '../../utils/ScreenUtil';
import { AppConfig, MenuConfig } from '../../api/config';

@Component({
  selector: 'app-main-container',
  templateUrl: './main-container.component.html',
  styleUrls: ['./main-container.component.scss'],
  animations: [
    trigger('submenu', [
      state(
        'hidden',
        style({
          height: '0px',
        })
      ),
      state(
        'visible',
        style({
          height: '*',
        })
      ),
      transition(
        'visible => hidden',
        animate('400ms cubic-bezier(0.86, 0, 0.07, 1)')
      ),
      transition(
        'hidden => visible',
        animate('400ms cubic-bezier(0.86, 0, 0.07, 1)')
      ),
    ]),
  ],
})
export class MainContainerComponent
  implements AfterViewInit, OnDestroy, OnInit
{
  documentClickListener: () => void;
  menuConfig: MenuConfig;
  config: AppConfig;
  subscriptions: Subscription[] = [];

  constructor(
    private renderer: Renderer2,
    private configService: ConfigService,
    private menuService: MenuService
  ) {}

  ngOnInit() {
    this.subscriptions.push(
      this.configService
        .getConfig()
        .subscribe((config) => (this.config = config)),
      this.menuService
        .getMenuConfigUpdate()
        .subscribe((menuConfig) => (this.menuConfig = menuConfig))
    );
  }

  ngAfterViewInit() {
    this.documentClickListener = this.renderer.listen(
      'body',
      'click',
      (event) => {
        const path = event.composedPath();

        if (!ScreenUtil.isDesktop()) {
          const clickOnSidebarMenu: boolean = path.some(
            (element) =>
              element.className === 'layout-sidebar' ||
              element.id === 'sidebarMenuButton'
          );
          if (!clickOnSidebarMenu) {
            this.menuService.closeMobileSidebarMenu();
          }

          const clickOnTopMenuButton: boolean = path.some(
            (element) => element.id === 'topMenuButton'
          );
          if (!clickOnTopMenuButton) {
            this.menuService.hideTopMenu();
          }
        }

        const clickOnConfigMenu: boolean = path.some(
          (element) =>
            element.localName === 'app-settings' ||
            element.id === 'configButton'
        );
        if (this.menuConfig.isConfigMenuActive && !clickOnConfigMenu) {
          this.menuService.closeConfigMenu();
        }
      }
    );
  }

  ngOnDestroy() {
    if (this.documentClickListener) {
      this.documentClickListener();
    }

    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
