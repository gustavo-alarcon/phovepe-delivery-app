import { MatCardModule } from '@angular/material/card';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatChipsModule} from '@angular/material/chips';
import {DragDropModule} from '@angular/cdk/drag-drop';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { BannersRoutingModule } from './banners-routing.module';
import { BannersComponent } from './banners.component';
import { CreateBannerComponent } from './create-banner/create-banner.component';
import { Ng2ImgMaxModule } from 'ng2-img-max';
import { LazyLoadImageModule, intersectionObserverPreset } from 'ng-lazyload-image';
import { GalleryModule } from  '@ngx-gallery/core';
import { DeleteBannerComponent } from './delete-banner/delete-banner.component';
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
import { MatProgressBarModule } from '@angular/material/progress-bar';

export class AppModule { }
@NgModule({
  declarations: [BannersComponent, CreateBannerComponent, DeleteBannerComponent],
  imports: [
    CommonModule,
    BannersRoutingModule,
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
    MatProgressBarModule,
    ReactiveFormsModule,
    FormsModule,
    MatChipsModule,
    MatCardModule,
    LazyLoadImageModule.forRoot({
      preset: intersectionObserverPreset
    }),
    Ng2ImgMaxModule,
    GalleryModule,
    DragDropModule
  ],
  entryComponents: [
    CreateBannerComponent,
    DeleteBannerComponent
  ]
})
export class BannersModule { }
