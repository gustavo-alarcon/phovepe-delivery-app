import { Router } from '@angular/router';
import { tap, map } from 'rxjs/operators';
import { DatabaseService } from 'src/app/core/database.service';
import { Observable, combineLatest } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { Banner } from 'src/app/core/models/banners.model';
import { GalleryItem, ImageItem } from '@ngx-gallery/core';
import { Gallery, GalleryRef } from '@ngx-gallery/core';
@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.css']
})
export class CarouselComponent implements OnInit {
  imagesArray: Array<string> = ["../../../assets/images/Frame64.png", "../../../assets/images/Frame64.png", "../../../assets/images/Frame64.png"]
  currentImage: string
  inx: number = 0;

  defaultImage = null;

  carousel$: Observable<Banner[]>
  promo$: Observable<Banner[]>
  categories$: Observable<Banner[]>

  carousel: Array<Banner>

  constructor(
    public dbs: DatabaseService,
    private router: Router,
    private gallery: Gallery
  ) { }

  ngOnInit() {
    this.carousel$ = combineLatest(
      this.dbs.getBanners('carousel'),
      this.dbs.defaultImage$
    ).pipe(
      map(([items, image]) => {
        this.defaultImage = image
        return items.sort((a, b) => a['position'] - b['position'])
      }),
      tap(res => {
        const galleryRef: GalleryRef = this.gallery.ref('mini');
        const gallerymovilRef: GalleryRef = this.gallery.ref('movil');
        this.carousel = res
        galleryRef.reset()
        gallerymovilRef.reset()
        res.forEach(el => {

          galleryRef.addImage({
            src: el.photoURL,
            title: 'promo'
          });

          gallerymovilRef.addImage({
            src: el.photomovilURL,
            title: 'promo'
          });

        })

      })
    )
    this.promo$ = this.dbs.getBanners('promo').pipe(
      map(items => {
        return items.sort((a, b) => a['position'] - b['position'])
      })
    )

    this.categories$ = this.dbs.getBanners('category').pipe(
      map(items => {
        return items.sort((a, b) => a['position'] - b['position'])
      })
    )


  }

  routerLink(inx) {
    const name = this.carousel[inx].category

    this.router.navigate(['/main/productos'], { fragment: name });
  }

  navigate(name) {

    this.router.navigate(['/main/productos'], { fragment: name });
  }

}
