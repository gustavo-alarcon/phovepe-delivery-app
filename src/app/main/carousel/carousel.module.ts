import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarouselRoutingModule } from './carousel-routing.module';
import { CarouselComponent } from './carousel.component';
import { GalleryModule } from  '@ngx-gallery/core';
import { LazyLoadImageModule, intersectionObserverPreset } from 'ng-lazyload-image';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@NgModule({
  declarations: [CarouselComponent],
  imports: [
    CommonModule,
    CarouselRoutingModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatDialogModule,
    MatDividerModule,
    MatProgressBarModule,
    GalleryModule,
    LazyLoadImageModule.forRoot({
      preset: intersectionObserverPreset
    })
  ]
})
export class CarouselModule { }
