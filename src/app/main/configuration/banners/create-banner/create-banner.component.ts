import { WindowRefService } from './../../../../core/window-ref.service';
import { Banner } from './../../../../core/models/banners.model';
import { AngularFirestore, DocumentReference } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { startWith, map, take, takeLast, switchMap, filter, ignoreElements } from 'rxjs/operators';
import { Ng2ImgMaxService } from 'ng2-img-max';
import { DatabaseService } from './../../../../core/database.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable, BehaviorSubject, combineLatest, concat, interval, of, forkJoin } from 'rxjs';
import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatChipInputEvent } from '@angular/material/chips';

@Component({
  selector: 'app-create-banner',
  templateUrl: './create-banner.component.html',
  styleUrls: ['./create-banner.component.css']
})
export class CreateBannerComponent implements OnInit {
  category$: Observable<string[]>
  products$: Observable<any>
  validImage$: Observable<boolean>

  loading = new BehaviorSubject<boolean>(false)
  loading$ = this.loading.asObservable()

  imageSize = new BehaviorSubject<boolean>(false)
  imageSize$ = this.imageSize.asObservable()

  imagemovilSize = new BehaviorSubject<boolean>(false)
  imagemovilSize$ = this.imagemovilSize.asObservable()

  subcategories: Array<any> = []
  products: Array<any> = []
  listCategories: Array<string>

  separatorKeysCodes: number[] = [ENTER, COMMA];
  @ViewChild('fruitInput', { static: false }) fruitInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto', { static: false }) matAutocomplete: MatAutocomplete;

  createForm: FormGroup
  //variables
  noImage = '../../../../assets/images/no-image.png';
  photos: {
    resizing$: {
      photoURL: Observable<boolean>,
      photomovilURL: Observable<boolean>
    },
    data: {
      photoURL: File,
      photomovilURL: File,
    }
  } = {
      resizing$: {
        photoURL: new BehaviorSubject<boolean>(false),
        photomovilURL: new BehaviorSubject<boolean>(false),
      },
      data: {
        photoURL: null,
        photomovilURL: null
      }
    }
  constructor(
    private fb: FormBuilder,
    private dbs: DatabaseService,
    private snackBar: MatSnackBar,
    private ng2ImgMax: Ng2ImgMaxService,
    @Inject(MAT_DIALOG_DATA) public data: { type: string, edit: boolean, index?: number, data?: Banner },
    private dialogRef: MatDialogRef<CreateBannerComponent>,
    private afs: AngularFirestore,
    private storage: AngularFireStorage,
    private window: WindowRefService
  ) { }

  ngOnInit() {
    if (this.data.type == 'category') {
      this.createForm = this.fb.group({
        description: [this.data.edit ? this.data.data.category : null, Validators.required],
        category: [null],
        photoURL: [this.data.edit ? this.data.data.photoURL : null, Validators.required],
      })

      this.category$ = combineLatest(
        this.createForm.get('category').valueChanges
          .pipe(startWith('')),
        this.dbs.getCategories()).pipe(
          map(([formValue, categories]) => {
            this.listCategories = categories
            if (this.data.edit) {
              if (this.subcategories.length == 0) {
                this.subcategories = categories.filter(el => this.data.data.subCategories.includes(el))
              }

            }
            let filter = categories.filter(el => el.includes(formValue));
            if (!(filter.length == 1 && filter[0] === formValue) && formValue.length) {
              this.createForm.get('category').setErrors({ invalid: true });
            }
            return filter;
          }))

    } else {
      this.createForm = this.fb.group({
        description: [this.data.edit ? this.data.data.category : null, Validators.required],
        photoURL: [this.data.edit ? this.data.data.photoURL : null, Validators.required],
        photomovilURL: [this.data.edit ? this.data.data.photomovilURL : null, Validators.required],
        product: [null]
      })

      this.products$ = combineLatest(
        this.dbs.getProducts(),
        this.createForm.get('product').valueChanges.pipe(
          filter(input => input !== null),
          startWith<any>(''))
        //map(value => typeof value === 'string' ? value.toLowerCase() : value.description.toLowerCase()))
      ).pipe(
        map(([products, name]) => {
          if (this.data.edit) {
            if (this.products.length == 0) {
              this.products = products.filter(el => this.data.data.products.includes(el.id))
            }

          }
          return name ? products.filter(option => option.description.toLowerCase().includes(name)) : products;
        })
      );
    }

    this.validImage$ = combineLatest(
      this.imageSize$,
      this.imagemovilSize$
    ).pipe(
      map(([phot, movil]) => {
        return phot || movil
      })
    )

  }

  showSelected(staff): string | undefined {
    return staff ? staff['description'] : undefined;
  }

  add(event: MatChipInputEvent): void {
    if (!this.matAutocomplete.isOpen) {
      const value = event.value;

      if ((value || '').trim()) {
        if (!this.listCategories.includes(value)) {
          this.snackBar.open("Dato inválido", "Cerrar", {
            duration: 4000
          })
          this.fruitInput.nativeElement.value = '';
        }
      }

    }
  }

  remove(index): void {

    if (index >= 0) {
      this.subcategories.splice(index, 1);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    if (this.subcategories.includes(event.option.value)) {
      this.snackBar.open("Categoría Repetida", "Cerrar", {
        duration: 6000
      })

    } else {
      this.subcategories.push(event.option.value);
    }
    this.fruitInput.nativeElement.value = '';
  }

  showEmail(user): string | null {
    return user ? user.displayname : null;
  }

  addProduct() {
    if (this.createForm.value['product']['id']) {
      this.products.push(this.createForm.value['product']);
      this.createForm.get('product').setValue('');
    } else {
      this.snackBar.open("Debe seleccionar un producto", "Cerrar", {
        duration: 6000
      })
    }
  }

  removeProduct(item): void {
    let index = this.products.indexOf(item);
    this.products.splice(index, 1);
  }

  addNewPhoto(formControlName: string, image: File[]) {
    this.createForm.get(formControlName).setValue(null);
    if (image.length === 0)
      return;
    //this.tempImage = image[0];
    let reader = new FileReader();
    const URL = this.window.nativeWindow.URL;
    this.photos.resizing$[formControlName].next(true);

    this.ng2ImgMax.resizeImage(image[0], 10000, 426)
      .pipe(
        take(1)
      ).subscribe(result => {
        this.photos.data[formControlName] = new File([result], formControlName + result.name.match(/\..*$/));
        reader.readAsDataURL(image[0]);
        reader.onload = (_event) => {
          const Img = new Image();

          Img.src = URL.createObjectURL(this.photos.data[formControlName]);

          Img.onload = (e: any) => {
            const height = e.path[0].height;
            const width = e.path[0].width;
            this.verifiedSize(width, height, formControlName);
          }

          this.createForm.get(formControlName).setValue(reader.result);
          this.photos.resizing$[formControlName].next(false);
        }
      },
        error => {
          this.photos.resizing$[formControlName].next(false);
          this.snackBar.open('Por favor, elija una imagen en formato JPG, o PNG', 'Aceptar');
          this.createForm.get(formControlName).setValue(null);

        }
      );
  }

  verifiedSize(width, height, movil) {
    let number = width / height
    let size = Number(parseFloat(number.toString()).toFixed(1))

    switch (this.data.type) {
      case 'carousel': {
        if (movil == 'photomovilURL') {
          if (size != 1.4) {
            this.imagemovilSize.next(true)
          } else {
            this.imagemovilSize.next(false)
          }
        } else {
          if (size != 3.6) {
            this.imageSize.next(true)
          } else {
            this.imageSize.next(false)
          }
        }

        break;
      }
      case 'category': {
        if (size != 2.3) {
          this.imageSize.next(true)
        }
        break;
      }
      case 'promo': {
        if (movil == 'photomovilURL') {
          if (size != 1.9) {
            this.imagemovilSize.next(true)
          } else {
            this.imagemovilSize.next(false)
          }
        } else {
          if (size != 4.8) {
            this.imageSize.next(true)
          } else {
            this.imageSize.next(false)
          }
        }

        break;
      }
      default: {
        //statements; 
        break;
      }
    }
  }

  uploadPhoto(id: string, file: File): Observable<string | number> {
    const path = `/banners/pictures/${id}-${file.name}`;

    // Reference to storage bucket
    const ref = this.storage.ref(path);

    // The main task
    let uploadingTask = this.storage.upload(path, file);

    let snapshot$ = uploadingTask.percentageChanges()
    let url$ = of('url!').pipe(
      switchMap((res) => {
        return <Observable<string>>ref.getDownloadURL();
      }))

    let upload$ = concat(
      snapshot$,
      url$)

    return upload$;
  }

  createBanner(product: Banner, photo?: File, photomovil?: File) {
    let productRef: DocumentReference = this.afs.firestore.collection(`/db/mandaditos/banners`).doc();
    let productData: Banner = product;
    let batch = this.afs.firestore.batch();

    productData.id = productRef.id;
    productData.photoURL = null;

    if (this.data.type != 'category') {
      forkJoin(
        this.uploadPhoto(productRef.id, photo),
        this.uploadPhoto(productRef.id, photomovil),
      ).pipe(
        takeLast(1),
      ).subscribe(([photoUrl, movilUrl]) => {
        productData.photoURL = <string>photoUrl
        productData.photoPath = `/products/pictures/${productRef.id}-${photo.name}`;
        productData.photomovilURL = <string>movilUrl
        productData.photomovilPath = `/products/pictures/${productRef.id}-${photomovil.name}`;
        batch.set(productRef, productData);

        batch.commit().then(() => {
          this.dialogRef.close(true);
          this.loading.next(false)
        })
      })

    } else {
      this.uploadPhoto(productRef.id, photo).pipe(
        takeLast(1),
      ).subscribe((res: string) => {
        productData.photoURL = res;
        productData.photoPath = `/products/pictures/${productRef.id}-${photo.name}`;
        batch.set(productRef, productData);

        batch.commit().then(() => {
          this.dialogRef.close(true);
          this.loading.next(false)
        })
      })
    }


  }

  editBanner(product: any, type: string, photo?: File, photomovil?: File) {
    let productRef: DocumentReference = this.afs.firestore.collection(`/db/mandaditos/banners`).doc(product.id);
    let productData = product;
    let batch = this.afs.firestore.batch();

    if (photomovil && photo) {
      forkJoin(
        this.uploadPhoto(productRef.id, photo),
        this.uploadPhoto(productRef.id, photomovil),
      ).pipe(
        takeLast(1),
      ).subscribe(([photoUrl, movilUrl]) => {
        productData.photoURL = <string>photoUrl
        productData.photoPath = `/products/pictures/${productRef.id}-${photo.name}`;
        productData.photomovilURL = <string>movilUrl
        productData.photomovilPath = `/products/pictures/${productRef.id}-${photomovil.name}`;
        batch.update(productRef, productData);

        batch.commit().then(() => {
          this.dialogRef.close(true);
          this.loading.next(false)
        })
      })

    } else if (photo) {

      this.uploadPhoto(productRef.id, photo).pipe(
        takeLast(1),
      ).subscribe((res: string) => {
        if (type == 'photo') {
          productData.photoURL = res;
          productData.photoPath = `/products/pictures/${productRef.id}-${photo.name}`;
        } else {
          productData.photomovilURL = res;
          productData.photomovilPath = `/products/pictures/${productRef.id}-${photo.name}`;
        }
        batch.update(productRef, productData);

        batch.commit().then(() => {
          this.dialogRef.close(true);
          this.loading.next(false)
        })
      })
    } else {
      batch.update(productRef, productData);

      batch.commit().then(() => {
        this.dialogRef.close(true);
        this.loading.next(false)
      })
    }


  }

  onSubmitForm() {
    this.createForm.markAsPending();
    this.createForm.disable()
    this.loading.next(true)

    let newBanner: Banner
    if (this.data.type == 'category') {
      newBanner = {
        id: '',
        type: this.data.type,
        category: this.createForm.get('description').value,
        subCategories: this.subcategories,
        photoURL: '',
        photoPath: '',
        published: true,
        position: this.data.index
      }
      this.createBanner(newBanner, this.photos.data.photoURL)
    } else {
      newBanner = {
        id: '',
        category: this.createForm.get('description').value,
        type: this.data.type,
        photoURL: '',
        photoPath: '',
        photomovilURL: '',
        photomovilPath: '',
        published: true,
        products: this.products.map(el => el['id']),
        position: this.data.index
      }
      this.createBanner(newBanner, this.photos.data.photoURL, this.photos.data.photomovilURL)
    }
  }

  editSubmit() {
    this.createForm.markAsPending();
    this.createForm.disable()
    this.loading.next(true)

    let update: object = {}
    update['id'] = this.data.data.id
    let movil: boolean = false
    let photo: boolean = false

    if (this.createForm.get('photoURL').value != this.data.data.photoURL) {
      update['photoURL'] = ''
      update['photoPath'] = ''
      photo = true
    }

    if (this.createForm.get('description').value != this.data.data.category) {
      update['category'] = this.createForm.get('description').value
    }

    if (this.data.type == 'category') {

      let preData = [...this.data.data.subCategories]

      let change = false

      let newS = this.subcategories.filter(che => !preData.includes(che))
      let oldS = preData.filter(che => this.subcategories.includes(che))

      change = newS.length > 0 || oldS.length > 0

      if (change) {
        update['subCategories'] = this.subcategories
      }
    } else {
      if (this.createForm.get('photomovilURL').value != this.data.data.photomovilURL) {
        update['photomovilURL'] = ''
        update['photomovilPath'] = ''
        movil = true
      }

      let preData = [...this.data.data.products]

      let change = false

      let newP = this.products.filter(che => preData.findIndex(pre => pre == che['id']) < 0).map(el => el['id'])
      let old = preData.filter(che => this.products.findIndex(pre => pre['id'] == che) < 0).map(el => el['id'])

      change = newP.length > 0 || old.length > 0

      if (change) {
        update['products'] = this.products.map(el => el['id'])
      }
    }

    if (photo && movil) {
      this.editBanner(update, 'edit', this.photos.data.photoURL, this.photos.data.photomovilURL)
    } else if (photo || movil) {
      if (photo) {
        this.editBanner(update, 'photo', this.photos.data.photoURL)
      }

      if (movil) {
        this.editBanner(update, 'movil', this.photos.data.photomovilURL)
      }
    } else {
      this.editBanner(update, 'any')
    }


  }

}
