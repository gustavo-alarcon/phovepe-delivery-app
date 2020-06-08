import { AngularFirestore, DocumentReference } from '@angular/fire/firestore';
import { tap, map } from 'rxjs/operators';
import { DeleteBannerComponent } from './delete-banner/delete-banner.component';
import { DatabaseService } from './../../../core/database.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { CreateBannerComponent } from './create-banner/create-banner.component';
import { Component, OnInit } from '@angular/core';
import { Banner } from 'src/app/core/models/banners.model';
import { GalleryItem, ImageItem } from '@ngx-gallery/core';
import { Gallery, GalleryRef } from '@ngx-gallery/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-banners',
  templateUrl: './banners.component.html',
  styleUrls: ['./banners.component.css']
})
export class BannersComponent implements OnInit {
  loading = new BehaviorSubject<number>(1)
  loading$ = this.loading.asObservable()

  carousel$: Observable<Banner[]>
  promo$: Observable<Banner[]>
  categories$: Observable<Banner[]>

  carousel: Array<Banner>
  promo: Array<Banner>
  categories: Array<Banner>

  indCarousel: number = 1
  indPromo: number = 1
  indCategory: number = 1

  defaultImage = "../../../assets/images/default-image.png";

  images: GalleryItem[] = [];

  constructor(
    private dialog: MatDialog,
    public dbs: DatabaseService,
    private afs: AngularFirestore,
    private snackBar: MatSnackBar,
    private gallery: Gallery
  ) { }

  ngOnInit() {

    const galleryRef: GalleryRef = this.gallery.ref('mini');
    const gallerymovilRef: GalleryRef = this.gallery.ref('movil');

    this.carousel$ = this.dbs.getBanners('carousel').pipe(
      map(items => {
        return items.sort((a, b) => a['position'] - b['position'])
      }),
      tap(res => {
        this.carousel = [...res]
        this.indCarousel = res.length + 1
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
      }),
      tap(res => {
        this.promo = [...res]
        this.indPromo = res.length + 1
      })
    )

    this.categories$ = this.dbs.getBanners('category').pipe(
      map(items => {
        return items.sort((a, b) => a['position'] - b['position'])
      }),
      tap(res => {
        this.categories = [...res]
        this.indCategory = res.length + 1
      })
    )


  }

  drop(array, event: CdkDragDrop<string[]>) {
    moveItemInArray(array, event.previousIndex, event.currentIndex);
  }

  savePosition(array,number) {
    this.loading.next(number)
    let batch = this.afs.firestore.batch();

    array.forEach((el, i) => {
      const ref: DocumentReference = this.afs.firestore.collection(`/db/mandaditos/banners`).doc(el['id']);
      batch.update(ref, {
        position: i
      })
    })

    batch.commit().then(()=>{
      this.loading.next(1)
      this.snackBar.open("Cambios Guardados", "Cerrar", {
        duration: 6000
      })
      console.log('done');
      
    })
  }

  openDialog(type: string, movil: boolean) {
    let ind = 0
    switch (type) {
      case 'carousel':
        ind = this.indCarousel
        break;
      case 'promo':
        ind = this.indPromo
        break;
      case 'category':
        ind = this.indCategory
        break;

      default:
        break;
    }
    this.dialog.open(CreateBannerComponent, {
      data: {
        type: type,
        edit: movil,
        index: ind
      }
    })
  }

  editDialog(type: string, movil: boolean, item: Banner) {
    this.dialog.open(CreateBannerComponent, {
      data: {
        type: type,
        edit: movil,
        data: item
      }
    })
  }

  deleteDialog(id: string) {
    this.dialog.open(DeleteBannerComponent, {
      data: id
    })
  }
}
