export type ScaleType = 12 | 13 | 14 | 15 | 16;

export type LanguageName = 'English' | 'Polski';
export type LanguageCode = 'en' | 'pl';

export interface Language {
  name: LanguageName;
  code: LanguageCode;
}

export interface AppConfig {
  isDarkTheme: boolean;
  scale: ScaleType;
  language: Language;
}

export interface MenuConfig {
  isTopMenuActive: boolean;
  isMobileSidebarMenuActive: boolean;
  isDesktopSidebarMenuActive: boolean;
  isConfigMenuActive: boolean;
}
