import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainContainerComponent } from './main-container.component';
import { ConfigService } from '../../service/app.config.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MenuService } from '../../service/app.menu.service';

describe('MainContainerComponent', () => {
  let component: MainContainerComponent;
  let fixture: ComponentFixture<MainContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MainContainerComponent],
      imports: [TranslateModule.forRoot()],
      providers: [ConfigService, TranslateService, MenuService],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MainContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
