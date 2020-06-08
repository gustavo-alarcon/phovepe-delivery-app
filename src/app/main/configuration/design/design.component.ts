import { MatSnackBar } from '@angular/material/snack-bar';
import { SeoService } from './../../../core/seo.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { take, switchMap, takeLast, tap, map } from 'rxjs/operators';
import { Observable, BehaviorSubject, of, concat, combineLatest } from 'rxjs';
import { AngularFireStorage } from '@angular/fire/storage';
import { AngularFirestore, DocumentReference } from '@angular/fire/firestore';
import { Ng2ImgMaxService } from 'ng2-img-max';
import { DatabaseService } from './../../../core/database.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-design',
  templateUrl: './design.component.html',
  styleUrls: ['./design.component.css']
})
export class DesignComponent implements OnInit {
  noImage = '../../../assets/images/no-image.png';
  logo: any = null
  logomovil: any = null
  default: any = null

  loading = new BehaviorSubject<number>(1)
  loading$ = this.loading.asObservable()

  init$: Observable<any>
  editForm$: Observable<boolean>

  pageForm: FormGroup

  photos: {
    resizing$: {
      logoURL: Observable<boolean>,
      logomovilURL: Observable<boolean>,
      defaultURL: Observable<boolean>,
      photoURL: Observable<boolean>
    },
    data: {
      logoURL: File,
      logomovilURL: File,
      defaultURL: File,
      photoURL: File
    }
  } = {
      resizing$: {
        logoURL: new BehaviorSubject<boolean>(false),
        logomovilURL: new BehaviorSubject<boolean>(false),
        defaultURL: new BehaviorSubject<boolean>(false),
        photoURL: new BehaviorSubject<boolean>(false)
      },
      data: {
        logoURL: null,
        logomovilURL: null,
        defaultURL: null,
        photoURL: null
      }
    }

  constructor(
    private fb: FormBuilder,
    private dbs: DatabaseService,
    private seo: SeoService,
    private snackBar: MatSnackBar,
    private ng2ImgMax: Ng2ImgMaxService,
    private afs: AngularFirestore,
    private storage: AngularFireStorage
  ) { }

  ngOnInit() {

    this.pageForm = this.fb.group({
      title: [null, Validators.required],
      description: [null, Validators.required],
      url: [null, Validators.required],
      photoURL: [null, Validators.required]
    })

    this.init$ = this.dbs.getConfi().pipe(
      tap(res => {
        this.loading.next(5)
        this.logo = res['logoURL'] ? res['logoURL'] : null
        this.logomovil = res['logomovilURL'] ? res['logomovilURL'] : null
        this.default = res['defaultURL']
        if (res['meta']) {
          this.pageForm.setValue(res['meta'])
        }
      })
    )

    this.editForm$ = combineLatest(
      this.pageForm.valueChanges,
      this.init$
    ).pipe(
      map(([form, values]) => {
        let change = []
        for (let i in form) {
          change.push(form[i] === values['meta'][i])
        }
        console.log(!change.reduce((a, b) => a && b, true));

        return change.reduce((a, b) => a && b, true)

      })
    )
  }

  uploadPhoto(id: string, file: File): Observable<string | number> {
    const path = `/brand/pictures/${id}-${file.name}`;

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

  addNewPhoto(name: string, image: File[]) {
    if (image.length === 0)
      return;
    //this.tempImage = image[0];
    let reader = new FileReader();
    const URL = window.URL;
    this.photos.resizing$[name].next(true);

    this.ng2ImgMax.resizeImage(image[0], 10000, 426)
      .pipe(
        take(1)
      ).subscribe(result => {
        this.photos.data[name] = new File([result], name + result.name.match(/\..*$/));
        reader.readAsDataURL(image[0]);
        reader.onload = (_event) => {
          const Img = new Image();

          Img.src = URL.createObjectURL(this.photos.data[name]);

          Img.onload = (e: any) => {
            const height = e.path[0].height;
            const width = e.path[0].width;
            this.verifiedSize(width, height, name);
          }
          switch (name) {
            case 'logoURL':
              this.logo = reader.result
              break;
            case 'logomovilURL':
              this.logomovil = reader.result
              break;
            case 'defaultURL':
              this.default = reader.result
              break;
            case 'photoURL':
              this.pageForm.get('photoURL').setValue(reader.result)
              break;
            default:
              break;
          }

          this.photos.resizing$[name].next(false);
        }
      },
        error => {
          this.photos.resizing$[name].next(false);
          this.snackBar.open('Por favor, elija una imagen en formato JPG, o PNG', 'Aceptar');

        }
      );
  }

  verifiedSize(width, height, movil) {
    let number = width / height
    let size = Number(parseFloat(number.toString()).toFixed(1))

  }

  save(name, inx) {
    this.loading.next(inx)
    let data: object = {}
    let batch = this.afs.firestore.batch();
    let ref: DocumentReference = this.afs.firestore.collection(`/db`).doc('mandaditos');
    this.uploadPhoto(name, this.photos.data[name]).pipe(
      takeLast(1),
    ).subscribe((res: string) => {
      data[name] = res
      batch.update(ref, data);

      batch.commit().then(() => {
        this.loading.next(5)
      })
    })
  }

  saveMeta(name, inx) {

    this.loading.next(inx)
    this.pageForm.markAsPending()
    let data: object = this.pageForm.value
    let batch = this.afs.firestore.batch();
    let ref: DocumentReference = this.afs.firestore.collection(`/db`).doc('mandaditos');
    this.seo.updateDescription(this.pageForm.get('description').value)
    this.seo.updateTitle(this.pageForm.get('title').value)
    this.seo.updateOgTitle(this.pageForm.get('title').value)
    this.seo.updateOgUrl(this.pageForm.get('url').value)
    if (this.photos.data[name]) {
      this.uploadPhoto(name, this.photos.data[name]).pipe(
        takeLast(1),
      ).subscribe((res: string) => {
        data[name] = res
        batch.update(ref, {
          meta: data
        });

        batch.commit().then(() => {
          this.loading.next(5)
        })
      })
    } else {
      batch.update(ref, {
        meta: data
      });

      batch.commit().then(() => {
        this.loading.next(5)
      })
    }


  }
}
