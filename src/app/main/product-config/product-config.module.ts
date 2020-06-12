import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Ng2ImgMaxModule } from 'ng2-img-max';
import { LazyLoadImageModule, intersectionObserverPreset } from 'ng-lazyload-image';

// ANGULAR MATERIAL
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {MatAutocompleteModule} from '@angular/material/autocomplete';


import { MatSnackBarModule, MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
// import { MAT_DATE_LOCALE as MAT_DATE_LOCALESAT }  from 'saturn-datepicker';
// import { CreateInputDialogComponent } from './create-input-dialog/create-input-dialog.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ProductConfigRoutingModule } from './product-config-routing.module';
import { ProductConfigComponent } from './product-config.component';
import { ProductConfigCreateEditComponent } from './product-config-create-edit/product-config-create-edit.component';
import { ProductConfigCategoriesComponent } from './product-config-categories/product-config-categories.component';
import { ProductConfigPromoComponent } from './product-config-promo/product-config-promo.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { ProductConfigUnitsComponent } from './product-config-units/product-config-units.component';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@NgModule({
  declarations: [
    ProductConfigComponent,
    ProductConfigCreateEditComponent,
    ProductConfigCategoriesComponent,
    ProductConfigPromoComponent,
    ProductConfigUnitsComponent,
  ],
  imports: [
    CommonModule,
    ProductConfigRoutingModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatDividerModule,
    MatDialogModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatOptionModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatTableModule,
    MatPaginatorModule,
    MatMenuModule,
    LazyLoadImageModule.forRoot({
      preset: intersectionObserverPreset
    }),
    Ng2ImgMaxModule,
    MatSlideToggleModule,
    NgxPaginationModule
  ],
  providers:[
  ],
  entryComponents: [
    ProductConfigCreateEditComponent,
    ProductConfigCategoriesComponent,
    ProductConfigPromoComponent,
    ProductConfigUnitsComponent
  ]
})
export class ProductConfigModule { }
