import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { MenuService } from '../../service/app.menu.service';
import { LinkItem } from '../../api/link';

@Component({
  selector: '[app-menu-item]',
  templateUrl: './menu-item.component.html',
  styleUrls: ['./menu-item.component.scss'],
  animations: [
    trigger('children', [
      state(
        'void',
        style({
          height: '0px',
        })
      ),
      state(
        'hiddenAnimated',
        style({
          height: '0px',
        })
      ),
      state(
        'visibleAnimated',
        style({
          height: '*',
        })
      ),
      transition(
        'visibleAnimated => hiddenAnimated',
        animate('400ms cubic-bezier(0.86, 0, 0.07, 1)')
      ),
      transition(
        'hiddenAnimated => visibleAnimated',
        animate('400ms cubic-bezier(0.86, 0, 0.07, 1)')
      ),
      transition(
        'void => visibleAnimated, visibleAnimated => void',
        animate('400ms cubic-bezier(0.86, 0, 0.07, 1)')
      ),
    ]),
  ],
})
export class MenuItemComponent implements OnInit, OnDestroy {
  @Input() item: LinkItem;

  constructor(private menuService: MenuService) {}

  ngOnInit() {}

  itemClick() {
    this.menuService.closeMobileSidebarMenu();
  }

  ngOnDestroy() {}
}
