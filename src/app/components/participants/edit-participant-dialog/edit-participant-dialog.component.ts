import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { Participant, Settlement } from '../../../api/settlement';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ParticipantService } from '../../../service/participant.service';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { SettlementService } from '../../../service/settlement.service';
import ScreenUtil from '../../../utils/ScreenUtil';

@Component({
  selector: 'app-edit-participant-dialog',
  templateUrl: './edit-participant-dialog.component.html',
  styleUrls: ['./edit-participant-dialog.component.scss'],
  providers: [MessageService],
})
export class EditParticipantDialogComponent implements OnInit, OnDestroy {
  @Input()
  isVisible: boolean;
  @Output()
  isVisibleChange = new EventEmitter<boolean>();
  @Input()
  editedParticipant: Participant;
  isTablet: boolean;
  selectedSettlement: Settlement;
  subscriptions: Subscription[] = [];

  editParticipantForm = new FormGroup({
    participantName: new FormControl<string | null>('', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(30),
    ]),
  });
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
    this.editParticipantForm.reset();
  }

  onSubmitEditParticipantForm() {
    if (this.editedParticipant) {
      this.isBlocked = true;
      this.editedParticipant.name =
        this.editParticipantForm.get('participantName').value;

      this.participantService
        .editParticipant(this.selectedSettlement.id, this.editedParticipant)
        .then(() => {
          this.isBlocked = false;
          this.closeDialog();
        })
        .catch((error) => {
          this.isBlocked = false;
          this.messageService.add({
            severity: 'error',
            summary: this.translate.instant('Edit error'),
            detail: error.message,
          });
        });
    }
  }

  updateFormValues() {
    this.editParticipantForm.setValue({
      participantName: this.editedParticipant.name,
    });
  }
}
