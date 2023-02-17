import {
  ActivatedRouteSnapshot,
  RouterModule,
  RouterStateSnapshot,
} from '@angular/router';
import { NgModule } from '@angular/core';
import { MainContainerComponent } from './main/main-container/main-container.component';
import { LoginComponent } from './main/login/login.component';
import {
  AngularFireAuthGuard,
  AuthPipeGenerator,
  redirectLoggedInTo,
  redirectUnauthorizedTo,
} from '@angular/fire/compat/auth-guard';
import { map, of, switchMap } from 'rxjs';
import { CurrencyConverterComponent } from './components/currency-converter/currency-converter.component';
import { SettlementsComponent } from './components/settlements/settlements.component';
import { ParticipantsComponent } from './components/participants/participants.component';
import { SelectedSettlementGuard } from './guards/selected-settlement.guard';
import { ExpensesComponent } from './components/expenses/expenses.component';
import { DebtsComponent } from './components/debts/debts.component';

const redirectToEmailConfirm: AuthPipeGenerator = (
  next: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) =>
  switchMap((user) => {
    return of(user).pipe(
      redirectUnauthorizedTo(['login']),
      map((result) => {
        if (result === true) {
          if (
            !user.emailVerified &&
            !!user.providerData.find(
              (provider) => provider.providerId === 'password'
            )
          ) {
            return ['login'];
          } else {
            return true;
          }
        } else {
          return result;
        }
      })
    );
  });
const redirectToHomePage = () => redirectLoggedInTo(['settlements']);

@NgModule({
  imports: [
    RouterModule.forRoot(
      [
        {
          path: '',
          component: MainContainerComponent,
          canActivate: [AngularFireAuthGuard],
          data: { authGuardPipe: redirectToEmailConfirm },
          children: [
            { path: '', redirectTo: 'settlements', pathMatch: 'full' },
            { path: 'settlements', component: SettlementsComponent },
            {
              path: 'participants',
              component: ParticipantsComponent,
              canActivate: [SelectedSettlementGuard],
            },
            {
              path: 'expenses',
              component: ExpensesComponent,
              canActivate: [SelectedSettlementGuard],
            },
            {
              path: 'debts',
              component: DebtsComponent,
              canActivate: [SelectedSettlementGuard],
            },
            {
              path: 'currency-converter',
              component: CurrencyConverterComponent,
            },
          ],
        },
        {
          path: 'login',
          component: LoginComponent,
          canActivate: [AngularFireAuthGuard],
          data: { authGuardPipe: redirectToHomePage },
        },
        { path: '**', redirectTo: '' },
      ],
      { scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' }
    ),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
