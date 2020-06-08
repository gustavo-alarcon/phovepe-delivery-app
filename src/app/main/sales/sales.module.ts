import { SalesComponent } from './sales.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SalesRoutingModule } from './sales-routing.module';
import { SatDatepickerModule, SatNativeDateModule } from 'saturn-datepicker';
import { NgxPaginationModule } from 'ngx-pagination';
import { AddressDialogComponent } from './address-dialog/address-dialog.component';
import { AgmCoreModule } from '@agm/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';

@NgModule({
  declarations: [
    SalesComponent,
    AddressDialogComponent
  ],
  imports: [
    CommonModule,
    SalesRoutingModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatDialogModule,
    MatDividerModule,
    MatAutocompleteModule,
    MatSnackBarModule,
    MatCheckboxModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    SatDatepickerModule, 
    SatNativeDateModule,
    NgxPaginationModule,
    MatTabsModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyA2tVXwzAQc5Ppj8-oTEuYBCFyJp39Hz7s'
    })
  ],
  entryComponents:[
    AddressDialogComponent
  ]
})
export class SalesModule { }
