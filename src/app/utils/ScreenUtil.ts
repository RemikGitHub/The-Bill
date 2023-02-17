export default class ScreenUtil {
  static isDesktop(): boolean {
    return window.innerWidth >= 992;
  }

  static isTablet(): boolean {
    return window.innerWidth < 992;
  }

  static isMobile(): boolean {
    return window.innerWidth < 768;
  }
}
