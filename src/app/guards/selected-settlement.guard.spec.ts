import { TestBed } from '@angular/core/testing';

import { SelectedSettlementGuard } from './selected-settlement.guard';
import { SidebarMenuComponent } from '../main/menu/sidebar-menu.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import {
  AngularFirestore,
  AngularFirestoreModule,
} from '@angular/fire/compat/firestore';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { AngularFireModule } from '@angular/fire/compat';
import { environment } from '../../environments/environment';
import { ConfigService } from '../service/app.config.service';

describe('SelectedSettlementGuard', () => {
  let guard: SelectedSettlementGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SidebarMenuComponent],
      imports: [
        HttpClientTestingModule,
        TranslateModule.forRoot(),
        AngularFireAuthModule,
        AngularFirestoreModule,
        AngularFireStorageModule,
        AngularFireModule.initializeApp(environment.firebaseConfig),
      ],
      providers: [AngularFirestore, ConfigService],
    }).compileComponents();

    guard = TestBed.inject(SelectedSettlementGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
