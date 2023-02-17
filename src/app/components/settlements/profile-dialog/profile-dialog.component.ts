import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import ScreenUtil from '../../../utils/ScreenUtil';
import { MessageService } from 'primeng/api';
import { SettlementService } from '../../../service/settlement.service';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../service/auth.service';
import { User } from '../../../api/user';
import { TranslateService } from '@ngx-translate/core';
import { ClipboardService } from 'ngx-clipboard';

@Component({
  selector: 'app-profile-dialog',
  templateUrl: './profile-dialog.component.html',
  styleUrls: ['./profile-dialog.component.scss'],
  providers: [MessageService],
})
export class ProfileDialogComponent implements OnInit, OnDestroy {
  @Input()
  isVisible: boolean;
  @Output()
  isVisibleChange = new EventEmitter<boolean>();
  isTablet: boolean;
  user: User;
  subscription: Subscription;

  constructor(
    private settlementService: SettlementService,
    private authService: AuthService,
    private messageService: MessageService,
    private translate: TranslateService,
    private clipboardService: ClipboardService
  ) {}

  ngOnInit(): void {
    this.onResize();
    this.subscription = this.authService
      .getUser()
      .subscribe((user) => (this.user = user));
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.isTablet = ScreenUtil.isTablet();
  }

  closeDialog() {
    this.isVisibleChange.emit(false);
  }

  copyUserId() {
    this.clipboardService.copy(this.user.uid);
    this.messageService.add({
      severity: 'success',
      detail: this.translate.instant('Copied'),
    });
  }
}
