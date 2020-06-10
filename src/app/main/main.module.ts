import { NgModule } from '@angular/core';
import { MainRoutingModule } from './main-routing.module';


import { MatSnackBarModule, MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MainComponent } from './main.component';
import { LazyLoadImageModule, intersectionObserverPreset } from 'ng-lazyload-image';
import { MAT_DATE_LOCALE as MAT_DATE_LOCALESAT }  from 'saturn-datepicker';
import { RateDialogComponent } from './rate-dialog/rate-dialog.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ContactDialogComponent } from './contact-dialog/contact-dialog.component';
import { LoginDialogComponent } from './login-dialog/login-dialog.component';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatDividerModule} from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatExpansionModule} from '@angular/material/expansion';
// import { CreateInputDialogComponent } from './create-input-dialog/create-input-dialog.component';

@NgModule({
  declarations: [
    MainComponent,
    RateDialogComponent,
    ContactDialogComponent,
    LoginDialogComponent
  ],
  imports: [
    CommonModule,
    MainRoutingModule,
    MatIconModule,
    MatSnackBarModule,
    MatToolbarModule,
    MatMenuModule,
    MatSidenavModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    FormsModule,
    MatProgressBarModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    MatDividerModule,
    MatSlideToggleModule,
    MatSelectModule,
    MatExpansionModule,
    LazyLoadImageModule.forRoot({
      preset: intersectionObserverPreset
    })
  ],
  providers: [
    { provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: { duration: 5000 } },
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB'},
    { provide: MAT_DATE_LOCALESAT, useValue: 'en-GB'}
  ],
  entryComponents: [
    RateDialogComponent,
    ContactDialogComponent,
    LoginDialogComponent
  ]
})
export class MainModule { }
