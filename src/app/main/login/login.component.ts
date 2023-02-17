import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  Renderer2,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { ConfigService } from '../../service/app.config.service';
import * as firebaseui from 'firebaseui';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import firebase from 'firebase/compat/app';
import { MessageService } from 'primeng/api';
import { MenuService } from '../../service/app.menu.service';
import { MenuConfig } from '../../api/config';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [MessageService],
})
export class LoginComponent implements OnInit, AfterViewInit, OnDestroy {
  documentClickListener: () => void;
  menuConfig: MenuConfig;
  ui: firebaseui.auth.AuthUI;
  isDarkTheme: boolean;
  subscriptions: Subscription[] = [];

  private readonly firebaseUiContainer: string = '#firebaseui-auth-container';
  private readonly firebaseUiConfig: firebaseui.auth.Config = {
    signInFlow: 'popup',
    signInOptions: [
      {
        provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        fullLabel: this.translate.instant('Sign in with') + ' Google',
      },
      {
        provider: firebase.auth.FacebookAuthProvider.PROVIDER_ID,
        fullLabel: this.translate.instant('Sign in with') + ' Facebook',
      },
      {
        provider: firebase.auth.TwitterAuthProvider.PROVIDER_ID,
        fullLabel: this.translate.instant('Sign in with') + ' Twitter',
      },
      {
        provider: firebase.auth.GithubAuthProvider.PROVIDER_ID,
        fullLabel: this.translate.instant('Sign in with') + ' GitHub',
      },
      {
        requireDisplayName: true,
        provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
        signInMethod:
          firebase.auth.EmailAuthProvider.EMAIL_PASSWORD_SIGN_IN_METHOD,
        fullLabel: this.translate.instant('Sign in with email'),
      },
    ],
    tosUrl: '#/login',
    privacyPolicyUrl: '#/login',
    credentialHelper: firebaseui.auth.CredentialHelper.GOOGLE_YOLO,
    callbacks: {
      signInSuccessWithAuthResult: this.onLoginSuccessful.bind(this),
      signInFailure: this.onLoginFailed.bind(this),
    },
  };

  constructor(
    private renderer: Renderer2,
    private afAuth: AngularFireAuth,
    private configService: ConfigService,
    private router: Router,
    private messageService: MessageService,
    private menuService: MenuService,
    private translate: TranslateService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.afAuth.app.then((app) => {
      this.ui = new firebaseui.auth.AuthUI(app.auth());
      this.ui.start(this.firebaseUiContainer, this.firebaseUiConfig);
    });

    this.subscriptions.push(
      this.configService
        .getConfig()
        .subscribe((config) => (this.isDarkTheme = config.isDarkTheme)),
      this.menuService
        .getMenuConfigUpdate()
        .subscribe((menuConfig) => (this.menuConfig = menuConfig)),
      this.translate.onLangChange.subscribe((translate: LangChangeEvent) => {
        this.firebaseUiConfig.signInOptions = [
          {
            provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
            fullLabel: translate.translations['Sign in with'] + ' Google',
          },
          {
            provider: firebase.auth.FacebookAuthProvider.PROVIDER_ID,
            fullLabel: translate.translations['Sign in with'] + ' Facebook',
          },
          {
            provider: firebase.auth.TwitterAuthProvider.PROVIDER_ID,
            fullLabel: translate.translations['Sign in with'] + ' Twitter',
          },
          {
            provider: firebase.auth.GithubAuthProvider.PROVIDER_ID,
            fullLabel: translate.translations['Sign in with'] + ' GitHub',
          },
          {
            requireDisplayName: true,
            provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
            signInMethod:
              firebase.auth.EmailAuthProvider.EMAIL_PASSWORD_SIGN_IN_METHOD,
            fullLabel: translate.translations['Sign in with email'],
          },
        ];
        this.ui.reset();
        this.ui.start(this.firebaseUiContainer, this.firebaseUiConfig);
      })
    );
  }

  ngAfterViewInit() {
    this.documentClickListener = this.renderer.listen(
      'body',
      'click',
      (event) => {
        const path = event.composedPath();

        const clickOnConfigMenu: boolean = path.some(
          (element) =>
            element.localName === 'app-settings' ||
            element.id === 'configButton'
        );
        if (this.menuConfig.isConfigMenuActive && !clickOnConfigMenu) {
          this.menuService.closeConfigMenu();
        }
      }
    );
  }

  ngOnDestroy(): void {
    this.ui.delete();
    if (this.subscriptions) {
      this.subscriptions.forEach((subscribtion) => subscribtion.unsubscribe());
    }
  }

  onLoginSuccessful(result) {
    const user = result.user;
    if (!user) {
      return;
    }

    if (result.additionalUserInfo.isNewUser) {
      this.authService.addUserToFirestore(user);
    }

    if (
      !user.emailVerified &&
      result.additionalUserInfo.providerId === 'password'
    ) {
      this.afAuth.signOut().then(() => {
        this.ui.start(this.firebaseUiContainer, this.firebaseUiConfig);

        if (result.additionalUserInfo.isNewUser) user.sendEmailVerification();
        this.messageService.add({
          key: 'confirmEmail',
          severity: 'info',
          summary: this.translate.instant('You have created an account'),
          detail:
            this.translate.instant('Confirm your email address') +
            `: ${user.email}`,
          sticky: true,
        });
      });
    } else {
      this.router.navigate(['']);
    }
  }

  onLoginFailed(error) {
    this.messageService.add({
      key: 'loginError',
      severity: 'error',
      summary: this.translate.instant('Login failed'),
      detail: error,
    });
  }

  onConfigButtonClick() {
    this.menuService.openConfigMenu();
  }
}
