import { MatExpansionModule } from '@angular/material/expansion';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Ng2ImgMaxModule } from 'ng2-img-max';
import { LazyLoadImageModule, intersectionObserverPreset } from 'ng-lazyload-image';
import { DesignRoutingModule } from './design-routing.module';
import { DesignComponent } from './design.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';


@NgModule({
  declarations: [DesignComponent],
  imports: [
    CommonModule,
    DesignRoutingModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatDialogModule,
    MatDividerModule,
    MatSnackBarModule,
    MatSelectModule,
    MatProgressBarModule,
    MatExpansionModule,
    ReactiveFormsModule,
    FormsModule,
    Ng2ImgMaxModule,
    LazyLoadImageModule.forRoot({
      preset: intersectionObserverPreset
    }),
  ]
})
export class DesignModule { }
