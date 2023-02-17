import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ParticipantService } from '../../../service/participant.service';
import { TranslateService } from '@ngx-translate/core';
import { Participant, Settlement } from '../../../api/settlement';
import { Subscription } from 'rxjs';
import { SettlementService } from '../../../service/settlement.service';
import ScreenUtil from '../../../utils/ScreenUtil';

@Component({
  selector: 'app-add-participant-dialog',
  templateUrl: './add-participant-dialog.component.html',
  styleUrls: ['./add-participant-dialog.component.scss'],
  providers: [MessageService],
})
export class AddParticipantDialogComponent implements OnInit, OnDestroy {
  @Input()
  isVisible: boolean;
  @Output()
  isVisibleChange = new EventEmitter<boolean>();
  isTablet: boolean;
  newParticipantForm = new FormGroup({
    participantName: new FormControl<string | null>('', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(30),
    ]),
  });
  selectedSettlement: Settlement;
  subscriptions: Subscription[] = [];
  isBlocked: boolean = false;

  constructor(
    private participantService: ParticipantService,
    private messageService: MessageService,
    private translate: TranslateService,
    private settlementService: SettlementService
  ) {}

  ngOnInit(): void {
    this.onResize();
    this.subscriptions.push(
      this.settlementService
        .getSelectedSettlement()
        .subscribe(
          (selectedSettlement) => (this.selectedSettlement = selectedSettlement)
        )
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
    this.isVisibleChange.emit(false);
  }

  onSubmitAddParticipantForm() {
    this.isBlocked = true;
    const name = this.newParticipantForm.get('participantName').value;

    const participant: Participant = {
      name: name,
      balances: [],
      spends: [],
    } as Participant;

    if (participant) {
      this.participantService
        .addParticipant(this.selectedSettlement.id, participant)
        .then(() => {
          this.isBlocked = false;
          this.closeDialog();
          this.newParticipantForm.reset();
        })
        .catch((error) => {
          this.isBlocked = false;
          this.messageService.add({
            severity: 'error',
            summary: this.translate.instant('Add error'),
            detail: error.message,
          });
        });
    }
  }
}
