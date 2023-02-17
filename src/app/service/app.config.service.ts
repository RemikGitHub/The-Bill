import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import {
  AppConfig,
  Language,
  LanguageCode,
  LanguageName,
  ScaleType,
} from '../api/config';

@Injectable()
export class ConfigService {
  private readonly lightTheme = 'bootstrap4-light-blue';
  private readonly darkTheme = 'bootstrap4-dark-blue';

  private themeLink: HTMLLinkElement = this.document.getElementById(
    'app-theme'
  ) as HTMLLinkElement;
  private config: AppConfig = {
    isDarkTheme: false,
    scale: 14,
    language: {
      name: 'English' as LanguageName,
      code: 'en' as LanguageCode,
    },
  };
  private configUpdate = new BehaviorSubject<AppConfig>(this.config);

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private translate: TranslateService
  ) {
    this.initConfig();
  }

  getConfig(): BehaviorSubject<AppConfig> {
    return this.configUpdate;
  }

  switchTheme(isDarkTheme: boolean) {
    if (this.themeLink) {
      let theme: string;
      isDarkTheme ? (theme = this.darkTheme) : (theme = this.lightTheme);
      this.themeLink.href = theme + '.css';

      this.updateConfig(isDarkTheme);
    }
  }

  changeLanguage(languageCode: LanguageCode) {
    this.translate.use(languageCode);
    const languageName: LanguageName = this.getLanguageName(languageCode);

    this.updateConfig(undefined, undefined, {
      name: languageName,
      code: languageCode,
    });
  }

  getLanguageName(languageCode: LanguageCode): LanguageName {
    if (languageCode === 'en') {
      return 'English' as LanguageName;
    } else if (languageCode === 'pl') {
      return 'Polski' as LanguageName;
    }
    return undefined;
  }

  incrementScale() {
    let newScale: any = this.config.scale + 1;
    if (this.isCorrectScale(newScale)) {
      this.applyScale(newScale);
    }
  }

  decrementScale() {
    let newScale: any = this.config.scale - 1;
    if (this.isCorrectScale(newScale)) {
      this.applyScale(newScale);
    }
  }

  isCorrectScale(scale: number): boolean {
    switch (scale) {
      case 12:
      case 13:
      case 14:
      case 15:
      case 16:
        return true;
      default:
        return false;
    }
  }

  private initConfig() {
    const isDarkTheme = JSON.parse(localStorage.getItem('isDarkTheme'));
    const scale = JSON.parse(localStorage.getItem('scale'));
    const languageCode = localStorage.getItem('language') as LanguageCode;

    if (isDarkTheme) this.switchTheme(isDarkTheme);
    if (scale) this.applyScale(scale);
    if (languageCode) this.changeLanguage(languageCode);
  }

  private applyScale(scale: ScaleType) {
    document.documentElement.style.fontSize = scale + 'px';
    this.updateConfig(undefined, scale);
  }

  private updateConfig(
    isDarkTheme?: boolean,
    scale?: ScaleType,
    language?: Language
  ) {
    if (typeof isDarkTheme !== 'undefined') {
      this.config.isDarkTheme = isDarkTheme;
      localStorage.setItem(
        'isDarkTheme',
        JSON.stringify(this.config.isDarkTheme)
      );
    }

    if (typeof scale !== 'undefined') {
      this.config.scale = scale;
      localStorage.setItem('scale', JSON.stringify(this.config.scale));
    }

    if (typeof language !== 'undefined') {
      this.config.language = language;
      localStorage.setItem('language', this.config.language.code);
    }

    this.configUpdate.next(this.config);
  }
}
