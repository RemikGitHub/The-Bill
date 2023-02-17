import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettlementsComponent } from './settlements.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import {
  AngularFirestore,
  AngularFirestoreModule,
} from '@angular/fire/compat/firestore';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { AngularFireModule } from '@angular/fire/compat';
import { environment } from '../../../environments/environment';
import { ConfigService } from '../../service/app.config.service';

describe('SettlementsComponent', () => {
  let component: SettlementsComponent;
  let fixture: ComponentFixture<SettlementsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SettlementsComponent],
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
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SettlementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
