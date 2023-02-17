import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import ScreenUtil from '../utils/ScreenUtil';
import { MenuConfig } from '../api/config';

@Injectable()
export class MenuService {
  private menuConfig: MenuConfig = {
    isDesktopSidebarMenuActive: true,
    isTopMenuActive: false,
    isMobileSidebarMenuActive: false,
    isConfigMenuActive: false,
  };

  private menuConfigUpdate = new BehaviorSubject<MenuConfig>(this.menuConfig);

  getMenuConfigUpdate(): BehaviorSubject<MenuConfig> {
    return this.menuConfigUpdate;
  }

  openConfigMenu() {
    this.menuConfig.isConfigMenuActive = true;
    this.menuConfigUpdate.next(this.menuConfig);
  }

  closeConfigMenu() {
    this.menuConfig.isConfigMenuActive = false;
    this.menuConfigUpdate.next(this.menuConfig);
  }

  closeMobileSidebarMenu() {
    this.menuConfig.isMobileSidebarMenuActive = false;
    this.menuConfigUpdate.next(this.menuConfig);
  }

  openTopMenu() {
    this.menuConfig.isTopMenuActive = true;
    this.menuConfigUpdate.next(this.menuConfig);
  }

  closeTopMenu() {
    this.menuConfig.isTopMenuActive = false;
    this.menuConfigUpdate.next(this.menuConfig);
  }

  toggleSidebarMenu() {
    if (ScreenUtil.isDesktop()) {
      this.menuConfig.isDesktopSidebarMenuActive =
        !this.menuConfig.isDesktopSidebarMenuActive;
    } else {
      this.menuConfig.isMobileSidebarMenuActive =
        !this.menuConfig.isMobileSidebarMenuActive;
      this.closeTopMenu();
    }
    this.menuConfigUpdate.next(this.menuConfig);
  }

  toggleTopMenu() {
    if (this.menuConfig.isTopMenuActive) {
      this.hideTopMenu();
    } else {
      this.openTopMenu();
    }
  }

  hideTopMenu() {
    setTimeout(() => {
      this.closeTopMenu();
    }, 1);
  }
}
