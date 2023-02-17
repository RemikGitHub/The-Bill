import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { User } from '../../../api/user';
import { Subscription } from 'rxjs';
import { CurrencyService } from '../../../service/currency.service';
import { SettlementService } from '../../../service/settlement.service';
import { MenuItem, MessageService } from 'primeng/api';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../service/auth.service';
import ScreenUtil from '../../../utils/ScreenUtil';
import { Settlement } from '../../../api/settlement';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-share-settlement-dialog',
  templateUrl: './share-settlement-dialog.component.html',
  styleUrls: ['./share-settlement-dialog.component.scss'],
  providers: [MessageService],
})
export class ShareSettlementDialogComponent implements OnInit {
  @Input()
  isVisible: boolean;
  @Output()
  isVisibleChange = new EventEmitter<boolean>();
  @Input()
  shareSettlement: Settlement;
  isTablet: boolean;
  editedUserId: string;
  user: User;
  subscriptions: Subscription[] = [];

  shareSettlementForm = new FormGroup({
    userId: new FormControl<string | null>('', [
      Validators.required,
      Validators.minLength(1),
      Validators.maxLength(128),
    ]),
    isEditor: new FormControl<boolean | null>(false, Validators.required),
  });
  permissionsMenuItems: MenuItem[];
  permissions: any[];
  owner;
  settlementUsers: User[];
  isUserViewer: boolean;

  constructor(
    private currencyService: CurrencyService,
    private settlementService: SettlementService,
    private messageService: MessageService,
    private translate: TranslateService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.onResize();
    this.subscriptions.push(
      this.authService.getUser().subscribe((user) => (this.user = user))
    );

    this.permissionsMenuItems = [
      {
        label: this.translate.instant('Options'),
        items: [
          {
            label: this.translate.instant('Delete'),
            icon: 'pi pi-times',
            command: () => {
              this.deletePermission();
            },
          },
        ],
      },
    ];

    this.subscriptions.push(
      this.translate.onLangChange.subscribe((translate: LangChangeEvent) => {
        this.permissionsMenuItems[0].label = translate.translations['Options'];
        this.permissionsMenuItems[0].items[0].label =
          translate.translations['Delete'];
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.isTablet = ScreenUtil.isTablet();
  }

  closeDialog() {
    this.permissions = [];
    this.owner = [];
    this.isVisibleChange.emit(false);
    this.shareSettlementForm.reset();
  }

  setPermissions() {
    const allPermissionsArray = Object.entries(
      this.shareSettlement.permissions
    ).map((permission) => {
      const user = this.settlementUsers.find(
        (settlementUser) => settlementUser.uid === permission[0]
      );
      return {
        displayName: user.displayName,
        email: user.email,
        photoUrl: user.photoURL,
        uid: permission[0],
        permission: permission[1],
      };
    });
    this.permissions = allPermissionsArray
      .filter((permission) => permission.permission !== 'owner')
      .sort((a, b) => a.displayName.localeCompare(b.displayName));
    this.owner = allPermissionsArray.find(
      (permission) => permission.permission === 'owner'
    );
  }

  updateShareDialog() {
    if (this.shareSettlement) {
      this.isUserViewer = this.settlementService.isUserViewer(
        this.user.uid,
        this.shareSettlement
      );
      this.getSettlementUsers();
    }
    this.shareSettlementForm.get('isEditor').setValue(false);
  }

  getSettlementUsers() {
    this.authService
      .getsSettlementUsers(this.shareSettlement)
      .subscribe((settlementUsers) => {
        this.settlementUsers = settlementUsers;
        this.setPermissions();
      });
  }

  addPermissions() {
    const userId = this.shareSettlementForm.get('userId').value;
    if (userId === this.user.uid) {
      this.messageService.add({
        severity: 'error',
        detail: this.translate.instant("You can't add yourself"),
      });
      return;
    }

    if (this.shareSettlement.permissions[userId]) {
      this.messageService.add({
        severity: 'error',
        detail: this.translate.instant('This user has already been added'),
      });
      return;
    }

    this.authService.getsUserById(userId).subscribe((userDoc) => {
      if (userDoc.exists) {
        if (this.shareSettlementForm.get('isEditor').value) {
          this.shareSettlement.permissions = {
            [userId]: 'editor',
            ...this.shareSettlement.permissions,
          };
        } else {
          this.shareSettlement.permissions = {
            [userId]: 'viewer',
            ...this.shareSettlement.permissions,
          };
        }
        this.settlementService.editSettlement(this.shareSettlement).then(() => {
          this.settlementUsers.push(userDoc.data() as User);
          this.setPermissions();
          this.shareSettlementForm.reset();
          this.shareSettlementForm.get('isEditor').setValue(false);
        });
      } else {
        this.messageService.add({
          severity: 'error',
          detail: this.translate.instant('The specified user does not exist'),
        });
      }
    });
  }

  setEditedUserId(userId: string) {
    this.editedUserId = userId;
  }

  deletePermission() {
    if (this.editedUserId) {
      delete this.shareSettlement.permissions[this.editedUserId];
      this.settlementService.editSettlement(this.shareSettlement).then(() => {
        this.setPermissions();
      });
    }
  }

  updatePermissions(permission) {
    this.shareSettlement.permissions[permission.uid] = permission.permission;
    this.settlementService.editSettlement(this.shareSettlement);
  }
}
