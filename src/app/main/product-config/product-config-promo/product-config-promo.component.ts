import { Component, OnInit, Inject } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { Product } from 'src/app/core/models/product.model';
import { DatabaseService } from 'src/app/core/database.service';
import { Observable, combineLatest } from 'rxjs';
import { startWith, tap, take } from 'rxjs/operators';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-product-config-promo',
  templateUrl: './product-config-promo.component.html'
})
export class ProductConfigPromoComponent implements OnInit {
  productForm: FormGroup

  promoState$: Observable<boolean>;
  discountsCalc$: Observable<number[]>;

  constructor(
    private dialogRef: MatDialogRef<ProductConfigPromoComponent>,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private dbs: DatabaseService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { data: Product }
  ) { }

  ngOnInit() {
    this.initForm();
    this.initObservables();
  }

  initForm() {
    this.productForm = this.fb.group({
      promo: [this.data.data.promo, Validators.required],
      quantity: [this.data.data.promo ? this.data.data.promoData.quantity : 0, Validators.required],
      promoPrice: [this.data.data.promo ? this.data.data.promoData.promoPrice : 0, Validators.required],
      percentageDisccount: [0, Validators.required],
      moneyDisccount: [0, Validators.required],
    })
  }

  initObservables() {
    this.promoState$ = this.productForm.get('promo').valueChanges.pipe(
      startWith(this.data.data.promo ? this.data.data.promo : null),
      tap((res: boolean) => {
        if (res) {
          this.productForm.get('quantity').enable()
          this.productForm.get('percentageDisccount').enable()
          this.productForm.get('moneyDisccount').enable()
          this.productForm.get('promoPrice').enable()
        }
        else {
          this.productForm.get('quantity').disable()
          this.productForm.get('percentageDisccount').disable()
          this.productForm.get('moneyDisccount').disable()
          this.productForm.get('promoPrice').disable()
        }
      }),
    )

    this.discountsCalc$ = combineLatest(
      this.productForm.get('promoPrice').valueChanges.pipe(
        startWith(this.data.data.promoData ? this.data.data.promoData.promoPrice : null)),
      this.productForm.get('quantity').valueChanges.pipe(
        startWith(this.data.data.promoData ? this.data.data.promoData.quantity : null))
    ).pipe(
      tap(([promoPrice, quantity]: [number, number]) => {
        if (promoPrice && quantity) {
          let moneyDisccount: number = 0
          let percentageDisccount: number = 0
          if (this.data.data.ref) {
            moneyDisccount = (this.data.data.refPrice * quantity - promoPrice);
            percentageDisccount = (moneyDisccount / (this.data.data.refPrice * quantity)) * 100.0;
          } else {
            moneyDisccount = (this.data.data.price * quantity - promoPrice);
            percentageDisccount = (moneyDisccount / (this.data.data.price * quantity)) * 100.0;
          }


          this.productForm.get('percentageDisccount').setValue(percentageDisccount.toFixed(2) + " %");
          this.productForm.get('moneyDisccount').setValue("S/. " + moneyDisccount.toFixed(2));
        }
        else {
          this.productForm.get('percentageDisccount').setValue(0);
          this.productForm.get('moneyDisccount').setValue(0);
        }
      })
    )
  }

  onSubmitForm() {
    this.productForm.markAsPending();
    let promoData: Product['promoData'] = this.productForm.get('promo').value ? {
      promoPrice: Number(this.productForm.get('promoPrice').value),
      quantity: Number(this.productForm.get('quantity').value)
    } : {
        promoPrice: 0,
        quantity: 0
      };


    this.dbs.editPromo(this.data.data.id, this.productForm.get('promo').value, promoData)
      .commit().then(
        res => {
          this.dialogRef.close(true);
        },
        err => {
          this.dialogRef.close(false);
        })
      ;
  }
}
