import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddExpenseDialogComponent } from './add-expense-dialog.component';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import {
  AngularFirestore,
  AngularFirestoreModule,
} from '@angular/fire/compat/firestore';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { AngularFireModule } from '@angular/fire/compat';
import { environment } from '../../../../environments/environment';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';

describe('AddExpenseComponent', () => {
  let component: AddExpenseDialogComponent;
  let fixture: ComponentFixture<AddExpenseDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddExpenseDialogComponent],
      imports: [
        HttpClientTestingModule,
        TranslateModule.forRoot(),
        AngularFireAuthModule,
        AngularFirestoreModule,
        AngularFireStorageModule,
        AngularFireModule.initializeApp(environment.firebaseConfig),
      ],
      providers: [AngularFirestore],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddExpenseDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
