import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { DatabaseService } from 'src/app/core/database.service';
import { Product } from 'src/app/core/models/product.model';
import { of, Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map, startWith, tap, debounceTime, distinctUntilChanged, filter, take } from 'rxjs/operators';
import { Ng2ImgMaxService } from 'ng2-img-max';
import { ProductConfigCategoriesComponent } from '../product-config-categories/product-config-categories.component';
import { ProductConfigUnitsComponent } from '../product-config-units/product-config-units.component';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import {MatSlideToggleModule, MatSlideToggleChange} from '@angular/material/slide-toggle';



@Component({
  selector: 'app-product-config-create-edit',
  templateUrl: './product-config-create-edit.component.html'
})
export class ProductConfigCreateEditComponent implements OnInit {
  productForm: FormGroup

  descriptionFormatting$: Observable<string>
  refState$: Observable<boolean>
  category$: Observable<string[]>
  unit$: Observable<string[]>
  unitRef$: Observable<string[]>

  //variables
  noImage = '../../../../assets/images/no-image.png';
  photos: {
    resizing$: {
      photoURL: Observable<boolean>,
    },
    data: {
      photoURL: File,
    }
  } = {
      resizing$: {
        photoURL: new BehaviorSubject<boolean>(false),
      },
      data: {
        photoURL: null,
      }
    }


  constructor(
    private dialogRef: MatDialogRef<ProductConfigCreateEditComponent>,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private dbs: DatabaseService,
    private snackBar: MatSnackBar,
    private ng2ImgMax: Ng2ImgMaxService,
    @Inject(MAT_DIALOG_DATA) public data: { data: Product, edit: boolean }
  ) { }

  ngOnInit() {
    this.initForm();
    this.initObservables();
  }

  initForm() {
    if (this.data.edit) {
      this.productForm = this.fb.group({
        description: this.fb.control(this.data.data.description, {
          validators: [Validators.required],
          asyncValidators: this.descriptionRepeatedValidator(this.dbs, this.data),
          updateOn: 'blur'
        }),
        category: [this.data.data.category, Validators.required],
        price: [this.data.data.price, Validators.required],
        unit: [this.data.data.unit, Validators.required],
        ref: [this.data.data.ref, Validators.required],
        refPrice: [{
          value: this.data.data.ref ? this.data.data.refPrice : null,
          disabled: !this.data.data.ref
        }, Validators.required],
        refUnit: [{
          value: this.data.data.ref ? this.data.data.refUnit : null,
          disabled: !this.data.data.ref
        }, Validators.required],
        photoURL: [this.data.data.photoURL, Validators.required],
      })
    }
    else {
      this.productForm = this.fb.group({
        description: this.fb.control("", {
          validators: Validators.required,
          asyncValidators: this.descriptionRepeatedValidator(this.dbs, this.data),
          updateOn: 'blur'
        }),
        category: [null, Validators.required],
        price: [null, Validators.required],
        unit: [null, Validators.required],
        ref: [false, Validators.required],
        refPrice: [{
          value: null,
          disabled: true
        }, Validators.required],
        refUnit: [{
          value: null,
          disabled: true
        }, Validators.required],
        photoURL: [null, Validators.required],
      })
    }
  }

  initObservables() {
    this.descriptionFormatting$ = this.productForm.get('description').valueChanges.pipe(
      distinctUntilChanged(),
      filter((desc: string) => {
        return /(\S*\s)\s+/g.test(desc);
      }),
      tap((desc: string) => {
        this.productForm.get('description').setValue(
          desc.trim().replace(/(\S*\s)\s+/g, '$1')
        )
      }))

    this.refState$ = this.productForm.get('ref').valueChanges.pipe(
      startWith(this.data.edit ? this.data.data.ref : false),
      tap((res: boolean) => {
        if (res) {
          this.productForm.get('refPrice').enable()
          this.productForm.get('refUnit').enable()
        }
        else {
          this.productForm.get('refPrice').disable()
          this.productForm.get('refUnit').disable()
        }
      }),
    )

    this.category$ = combineLatest(this.productForm.get('category').valueChanges
      .pipe(startWith('')), this.dbs.getCategories()).pipe(map(([formValue, categories]) => {
        let filter = categories.filter(el => el.includes(formValue));
        if (!(filter.length == 1 && filter[0] === formValue) && formValue.length) {
          this.productForm.get('category').setErrors({ invalid: true });
        }
        return filter;
      }))

    this.unit$ = combineLatest(this.productForm.get('unit').valueChanges
      .pipe(startWith('')), this.dbs.getUnits()).pipe(map(([formValue, units]) => {
        let filter = units.filter(el => el.includes(formValue));
        if (!(filter.length == 1 && filter[0] === formValue) && formValue.length) {
          this.productForm.get('unit').setErrors({ invalid: true });
        }
        return filter;
      }))
    this.unitRef$ = combineLatest(this.productForm.get('refUnit').valueChanges
      .pipe(startWith('')), this.dbs.getUnits()).pipe(map(([formValue, units]) => {
        let filter = units.filter(el => el.includes(formValue));
        if (!(filter.length == 1 && filter[0] === formValue) && formValue.length) {
          this.productForm.get('refUnit').setErrors({ invalid: true });
        }
        return filter;
      }))


  }

  onAddCategory() {
    this.dialog.open(ProductConfigCategoriesComponent);
  }

  onAddUnit() {
    this.dialog.open(ProductConfigUnitsComponent);
  }

  onRefToggleChange(event: MatSlideToggleChange) {
    this.productForm.get('ref').setValue(event.checked);
  }

  //Photo
  addNewPhoto(formControlName: string, image: File[]) {
    this.productForm.get(formControlName).setValue(null);
    if (image.length === 0)
      return;
    //this.tempImage = image[0];
    let reader = new FileReader();

    this.photos.resizing$[formControlName].next(true);

    //this.photos.data[formControlName] = new File([image[0]], formControlName + image[0].name.match(/\..*$/) );

    // reader.readAsDataURL(image[0]);
    // reader.onload = (_event) => {
    //   this.productForm.get(formControlName).setValue(reader.result);
    //   this.photos.resizing$[formControlName].next(false);
    // }
    
    this.ng2ImgMax.resizeImage(image[0], 10000, 426)
      .pipe(
        take(1)
      ).subscribe(
        result => {
          this.photos.data[formControlName] = new File([result], formControlName + result.name.match(/\..*$/));

          reader.readAsDataURL(image[0]);
          reader.onload = (_event) => {
            this.productForm.get(formControlName).setValue(reader.result);
            this.photos.resizing$[formControlName].next(false);
          }
        },
        error => {
          this.photos.resizing$[formControlName].next(false);
          this.snackBar.open('Por favor, elija una imagen en formato JPG, o PNG', 'Aceptar');
          this.productForm.get(formControlName).setValue(null);

        }
      );
  }

  onSubmitForm() {
    this.productForm.markAsPending();

    let product: Product = {
      id: null,
      description: this.productForm.get('description').value,
      category: this.productForm.get('category').value,
      price: this.productForm.get('price').value,
      unit: this.productForm.get('unit').value,
      ref: this.productForm.get('ref').value,
      refPrice: this.productForm.get('ref').value ? this.productForm.get('refPrice').value : null,
      refUnit: this.productForm.get('ref').value ? this.productForm.get('refUnit').value : null,
      photoURL: this.productForm.get('photoURL').value,
      photoPath: this.data.edit ? this.data.data.photoPath : null,
      promo: this.data.edit ? this.data.data.promo : false,
    }

    this.dbs.createEditProduct(this.data.edit, product, this.data.data, this.photos.data.photoURL)
      .subscribe(batch => {
        batch.commit().then(res => {      
          this.dialogRef.close(true);
        },
          err => {
            this.dialogRef.close(false);
          })
      },
        err => {
          this.dialogRef.close(false);
        });
  }

  descriptionRepeatedValidator(dbs: DatabaseService, data: {data: Product, edit: boolean}){
    return (control: AbstractControl) => {
      const value = control.value.toUpperCase();
      if(data.edit){
        if(data.data.description.toUpperCase() == value){
          return of(null)
        }
        else{
          return dbs.getProducts().pipe(
            map(res => !!res.find(el => el.description.toUpperCase() == value)  ? {descriptionRepeatedValidator: true} : null),)
          }
        }
      else{
        return dbs.getProducts().pipe(
          map(res => !!res.find(el => el.description.toUpperCase() == value)  ? {descriptionRepeatedValidator: true} : null),)
        }
    }
  }

}
