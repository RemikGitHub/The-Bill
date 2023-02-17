import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopbarComponent } from './topbar.component';
import { ConfigService } from '../../service/app.config.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MenuService } from '../../service/app.menu.service';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFireModule } from '@angular/fire/compat';
import { environment } from '../../../environments/environment';

describe('TopbarComponent', () => {
  let component: TopbarComponent;
  let fixture: ComponentFixture<TopbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TopbarComponent],
      imports: [
        TranslateModule.forRoot(),
        AngularFireAuthModule,
        AngularFireModule.initializeApp(environment.firebaseConfig),
      ],
      providers: [ConfigService, TranslateService, MenuService],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TopbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
