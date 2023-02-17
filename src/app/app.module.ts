import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { AppRoutingModule } from './app-routing.module';
import { ButtonModule } from 'primeng/button';
import { RadioButtonModule } from 'primeng/radiobutton';
import { AppComponent } from './app.component';
import { MenuService } from './service/app.menu.service';
import { ConfigService } from './service/app.config.service';
import { TopbarComponent } from './main/topbar/topbar.component';
import { FooterComponent } from './main/footer/footer.component';
import { SidebarMenuComponent } from './main/menu/sidebar-menu.component';
import { MenuItemComponent } from './components/menu-item/menu-item.component';
import { MainContainerComponent } from './main/main-container/main-container.component';
import { SettingsComponent } from './components/settings/settings.component';
import { RippleModule } from 'primeng/ripple';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ListboxModule } from 'primeng/listbox';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { environment } from '../environments/environment';
import { LoginComponent } from './main/login/login.component';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { ToastModule } from 'primeng/toast';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AuthService } from './service/auth.service';
import { ChipModule } from 'primeng/chip';
import { CurrencyConverterComponent } from './components/currency-converter/currency-converter.component';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { SettlementsComponent } from './components/settlements/settlements.component';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { AddSettlementDialogComponent } from './components/settlements/add-settlement-dialog/add-settlement-dialog.component';
import { MessageModule } from 'primeng/message';
import { MenuModule } from 'primeng/menu';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { EditSettlementDialogComponent } from './components/settlements/edit-settlement-dialog/edit-settlement-dialog.component';
import { ParticipantsComponent } from './components/participants/participants.component';
import { TableModule } from 'primeng/table';
import { ChartModule } from 'primeng/chart';
import { AddParticipantDialogComponent } from './components/participants/add-participant-dialog/add-participant-dialog.component';
import { EditParticipantDialogComponent } from './components/participants/edit-participant-dialog/edit-participant-dialog.component';
import { ExpensesComponent } from './components/expenses/expenses.component';
import { AddExpenseDialogComponent } from './components/expenses/add-expense-dialog/add-expense-dialog.component';
import { CalendarModule } from 'primeng/calendar';
import { MultiSelectModule } from 'primeng/multiselect';
import { SpendPipe } from './pipes/spend.pipe';
import { EditExpenseDialogComponent } from './components/expenses/edit-expense-dialog/edit-expense-dialog.component';
import { DebtsComponent } from './components/debts/debts.component';
import { SidebarModule } from 'primeng/sidebar';
import { FileUploadModule } from 'primeng/fileupload';
import { ImageModule } from 'primeng/image';
import { GalleriaModule } from 'primeng/galleria';
import { BlockUIModule } from 'primeng/blockui';
import { ShareSettlementDialogComponent } from './components/settlements/share-settlement-dialog/share-settlement-dialog.component';
import { ProfileDialogComponent } from './components/settlements/profile-dialog/profile-dialog.component';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DividerModule } from 'primeng/divider';
import { BadgeModule } from 'primeng/badge';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

@NgModule({
  imports: [
    BrowserModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    FormsModule,
    AppRoutingModule,
    ButtonModule,
    RadioButtonModule,
    RippleModule,
    BrowserAnimationsModule,
    ListboxModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireAuthModule,
    AngularFirestoreModule,
    PasswordModule,
    CheckboxModule,
    InputTextModule,
    ToastModule,
    ChipModule,
    DropdownModule,
    InputNumberModule,
    CardModule,
    DialogModule,
    InputTextareaModule,
    MessageModule,
    ReactiveFormsModule,
    MenuModule,
    ConfirmDialogModule,
    TableModule,
    ChartModule,
    CalendarModule,
    MultiSelectModule,
    SidebarModule,
    FileUploadModule,
    ImageModule,
    GalleriaModule,
    BlockUIModule,
    ProgressSpinnerModule,
    DividerModule,
    BadgeModule,
  ],
  declarations: [
    AppComponent,
    TopbarComponent,
    FooterComponent,
    SidebarMenuComponent,
    MenuItemComponent,
    MainContainerComponent,
    SettingsComponent,
    SettlementsComponent,
    LoginComponent,
    CurrencyConverterComponent,
    AddSettlementDialogComponent,
    EditSettlementDialogComponent,
    ParticipantsComponent,
    AddParticipantDialogComponent,
    EditParticipantDialogComponent,
    ExpensesComponent,
    AddExpenseDialogComponent,
    SpendPipe,
    EditExpenseDialogComponent,
    DebtsComponent,
    ShareSettlementDialogComponent,
    ProfileDialogComponent,
  ],
  providers: [
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    MenuService,
    ConfigService,
    AuthService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
