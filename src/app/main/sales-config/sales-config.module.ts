import { MatCardModule } from '@angular/material/card';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SalesConfigComponent } from './sales-config.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SalesConfigRoutingModule } from './sales-config-routing.module';
import { SatDatepickerModule, SatNativeDateModule } from 'saturn-datepicker';
import { SaleDetailComponent } from './sale-detail/sale-detail.component';
import { SaleMasterComponent } from './sale-master/sale-master.component';
import { Ng2ImgMaxModule } from 'ng2-img-max';
import {LazyLoadImageModule,  intersectionObserverPreset } from 'ng-lazyload-image';
import { SaleAdressDialogComponent } from './sale-adress-dialog/sale-adress-dialog.component';
import { AgmCoreModule } from '@agm/core';
import { SaleConfirmedDetailComponent } from './sale-detail/sale-confirmed-detail.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatRippleModule} from '@angular/material/core';



@NgModule({
  declarations: [
    SalesConfigComponent,
    SaleDetailComponent,
    SaleMasterComponent,
    SaleAdressDialogComponent,
    SaleConfirmedDetailComponent
  ],
  imports: [
    SalesConfigRoutingModule,
    CommonModule,
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
    MatCardModule,
    FormsModule,
    ReactiveFormsModule,
    SatDatepickerModule, 
    SatNativeDateModule,
    LazyLoadImageModule.forRoot({
      preset: intersectionObserverPreset
    }),
    MatRippleModule,
    NgxPaginationModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyA2tVXwzAQc5Ppj8-oTEuYBCFyJp39Hz7s'
    })
  ],
  entryComponents: [
    SaleAdressDialogComponent
  ]
})
export class SalesConfigModule { }
