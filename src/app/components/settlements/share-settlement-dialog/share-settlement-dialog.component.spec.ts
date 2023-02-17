import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareSettlementDialogComponent } from './share-settlement-dialog.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import {
  AngularFirestore,
  AngularFirestoreModule,
} from '@angular/fire/compat/firestore';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { AngularFireModule } from '@angular/fire/compat';
import { environment } from '../../../../environments/environment';
import { ConfigService } from '../../../service/app.config.service';

describe('ShareSettlementDialogComponent', () => {
  let component: ShareSettlementDialogComponent;
  let fixture: ComponentFixture<ShareSettlementDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        TranslateModule.forRoot(),
        AngularFireAuthModule,
        AngularFirestoreModule,
        AngularFireStorageModule,
        AngularFireModule.initializeApp(environment.firebaseConfig),
      ],
      providers: [AngularFirestore, ConfigService],
      declarations: [ShareSettlementDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ShareSettlementDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
