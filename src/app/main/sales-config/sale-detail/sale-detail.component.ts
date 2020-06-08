import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { Sale } from 'src/app/core/models/sale.model';
import { FormArray, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { combineLatest, Observable, merge, BehaviorSubject} from 'rxjs';
import { tap, startWith, share, map } from 'rxjs/operators';
import { DatabaseService } from 'src/app/core/database.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-sale-detail',
  templateUrl: './sale-detail.component.html',
  styleUrls: ['./sale-detail.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SaleDetailComponent implements OnInit {
  productForm: FormGroup;
  totalPrice$: Observable<number[]>
  individualPrice$: Observable<any>

  @Input() sale: Sale
  @Input() detailSubject: BehaviorSubject<Sale>

  
  constructor(
    private fb: FormBuilder,
    private dbs: DatabaseService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    
    this.initForm()
    this.initObservables()
  }

  initForm(){
    this.productForm = this.fb.group({
      deliveryPrice: [this.sale.totalConfirmedPrice?this.sale.deliveryConfirmedPrice:this.sale.deliveryPrice, Validators.required],
      totalPrice: [this.sale.confirmedProductList?this.sale.totalConfirmedPrice:this.sale.total, Validators.required],
      productList: this.fb.array([])
    });

    if(this.sale.totalConfirmedPrice){
      this.sale.confirmedProductList.forEach((product, index) => {
        (<FormArray>this.productForm.get('productList')).insert(index, 
          this.fb.group({
            product: [product.product, Validators.required],
            quantity: [product.quantity, Validators.required],
            price: [product.price, Validators.required],
  
            //When we have ref
            refPrice: [product.product.ref ? product.product.refPrice : null],
            refUnit: [product.product.ref ? product.product.refUnit : null],
            //noRefQuantity used when using ref. Designates the quantity corresponding to the default unit (no ref Unit)
            noRefQuantity: [product.product.ref ?  product.noRefQuantity: null, 
                            product.product.ref ? Validators.required : null],
  
            //When we have promo
            promoQuantity: [product.product.promo ? product.product.promoData.quantity : null],
            promoPrice: [product.product.promo ? product.product.promoData.promoPrice : null]
          })
          )
      })
    }else{
      this.sale.productList.forEach((product, index) => {
        (<FormArray>this.productForm.get('productList')).insert(index, 
          this.fb.group({
            product: [product.product, Validators.required],
            quantity: [product.quantity, Validators.required],
            price: [this.giveProductPrice(product), Validators.required],
  
            //When we have ref
            refPrice: [product.product.ref ? product.product.refPrice : null],
            refUnit: [product.product.ref ? product.product.refUnit : null],
            //noRefQuantity used when using ref. Designates the quantity corresponding to the default unit (no ref Unit)
            noRefQuantity: [product.product.ref ?  this.getNoRefQuantity(product): null, 
                            product.product.ref ? Validators.required : null],
  
            //When we have promo
            promoQuantity: [product.product.promo ? product.product.promoData.quantity : null],
            promoPrice: [product.product.promo ? product.product.promoData.promoPrice : null]
          })
          )
      })
    }
    

  }

  initObservables(){
    //Changing individual price when changing quantities
    this.individualPrice$ = merge(...(<FormArray>this.productForm.get('productList')).controls
      .map((control, index) => {
        //with ref
        if(this.sale.productList[index].product.ref){
          //with ref and prom
          if(this.sale.productList[index].product.promo){
            return combineLatest(
              (<FormGroup>control).get('quantity').valueChanges.pipe(startWith(
                (<FormGroup>control).get('quantity').value)), 
              (<FormGroup>control).get('noRefQuantity').valueChanges.pipe(startWith(
                (<FormGroup>control).get('noRefQuantity').value)))
              .pipe(
                map(([quantity, noRefQuantity])=>{
                  return {
                    product: this.sale.productList[index],
                    quantity, 
                    noRefQuantity, 
                    promo: true,
                    ref: true,
                    index
                  }})
              )
          }
          //with ref no prom
          else{
            return combineLatest(
              (<FormGroup>control).get('quantity').valueChanges.pipe(startWith(
                (<FormGroup>control).get('quantity').value)), 
              (<FormGroup>control).get('noRefQuantity').valueChanges.pipe(startWith(
                (<FormGroup>control).get('noRefQuantity').value)))
              .pipe(
                map(([quantity, noRefQuantity])=>{
                  return {
                    product: this.sale.productList[index],
                    quantity, 
                    noRefQuantity, 
                    promo: false,
                    ref: true,
                    index
                  }})
              )
          }
        }
        //no ref
        else{
          //no ref with prom
          if(this.sale.productList[index].product.promo){
            return (<FormGroup>control).get('quantity').valueChanges.pipe(
              map(quantity => {
                return {
                  product: this.sale.productList[index],
                  quantity,
                  noRefQuantity: null,
                  promo: true,
                  ref: false,
                  index
                }})
            )
          }
          //no ref no prom
          else{
            return (<FormGroup>control).get('quantity').valueChanges.pipe(
              map(quantity => {
                return {
                  product: this.sale.productList[index],
                  quantity,
                  noRefQuantity: null,
                  promo: false,
                  ref: false,
                  index
                }})
            )
          }
        }
        }))
      .pipe(
        tap((res: {product: Sale['productList'][0], quantity: number, noRefQuantity: number, 
                    promo: boolean, ref: boolean, index: number}) => {
          if(res.ref){
            //ref and promo
            if(res.promo){
              let promRefTotalQuantity = Math.floor(res.quantity/res.product.product.promoData.quantity);
              let promRefTotalPrice = promRefTotalQuantity * res.product.product.promoData.promoPrice;
              let noPromNoRefTotalQuantity = res.quantity % res.product.product.promoData.quantity ? 
                                              res.noRefQuantity : 0;
              let noPromNoRefTotalPrice = noPromNoRefTotalQuantity * res.product.product.price;
              
              //updating Price
              (<FormArray>this.productForm.get('productList')).controls[res.index].get('price')
              .setValue(promRefTotalPrice + noPromNoRefTotalPrice)
            }
            //ref no promo
            else{
              (<FormArray>this.productForm.get('productList')).controls[res.index].get('price')
              .setValue(res.quantity ?  res.noRefQuantity * res.product.product.price : 0)
            }
          }
          else{
            //no ref, promo
            if(res.promo){
              let promTotalQuantity = Math.floor(res.quantity/res.product.product.promoData.quantity);
              let promTotalPrice = promTotalQuantity * res.product.product.promoData.promoPrice;
              let noPromTotalQuantity = res.quantity % res.product.product.promoData.quantity;
              let noPromTotalPrice = noPromTotalQuantity * res.product.product.price;
              
              //updating Price
              (<FormArray>this.productForm.get('productList')).controls[res.index].get('price')
              .setValue(promTotalPrice + noPromTotalPrice)
            }
            //no ref no promo
            else{
              (<FormArray>this.productForm.get('productList')).controls[res.index].get('price')
              .setValue(res.quantity * res.product.product.price)
            }
          }
        })
      );

    //Calculating total Price
    this.totalPrice$ = combineLatest(...(<FormArray>this.productForm.get('productList')).controls
      .map((control, index) => (
        (<FormGroup>control).get('price').valueChanges.pipe(startWith(
          this.sale.totalConfirmedPrice?this.sale.confirmedProductList[index]['price']:this.giveProductPrice(this.sale.productList[index])
          )))))
      .pipe(
        tap((priceList: number[]) => {
          let totalPrice = priceList.reduce((acc, curr)=>{
            return curr ? (curr + acc) : (0 + acc)
          },0)
          this.productForm.get('totalPrice').setValue(totalPrice);
        })
      );
  }

  ngOnDetroy(){
  }

  onSubmitForm(){
    this.productForm.markAsPending();
    let sale: Sale = {...this.sale}
    sale.deliveryConfirmedPrice = this.productForm.get('deliveryPrice').value;
    sale.totalConfirmedPrice = this.productForm.get('totalPrice').value;
    sale.confirmedProductList = [];
    (<FormArray>this.productForm.get('productList')).controls.forEach(formGroup => {
      sale.confirmedProductList.push({
        noRefQuantity: formGroup.get('noRefQuantity').value,
        price: formGroup.get('price').value,
        quantity: formGroup.get('quantity').value,
        product: formGroup.get('product').value
      });
    });

    this.dbs.onSaveSale(sale, 'Confirmar').subscribe(
      batch => {
        batch.commit().then(
          res => {
            this.snackBar.open('El pedido fue confirmado satisfactoriamente', 'Aceptar');
            this.detailSubject.next(null);
          },
          err=> {
            this.snackBar.open('Ocurrió un error. Vuelva a intentarlo', 'Aceptar');
            this.productForm.updateValueAndValidity()
          }
        )},
      err => {
            this.snackBar.open('Ocurrió un error. Vuelva a intentarlo', 'Aceptar');
            this.productForm.updateValueAndValidity()
      }
    )

  }

  getNoRefQuantity(item: Sale['productList'][0]): number{
    //only ref, no promo
    if(!item.product.promo){
      return Math.floor(this.giveProductPrice(item)/Number(item.product.price)*100.0)/100.0
    }
    //ref with promo
    else{
      let noPromRefTotalQuantity = item.quantity % item.product.promoData.quantity;
      let noPromRefTotalPrice = noPromRefTotalQuantity * item.product.refPrice;
      let noPromNoRefTotalPrice = Math.floor(noPromRefTotalPrice / item.product.price*100.0)/100.0;
      return noPromNoRefTotalPrice;
    }
  }

  giveProductPrice(item: Sale['productList'][0]){
    if(item.product.ref){
      if(!item.product.promo){
        return item.quantity*item.product.refPrice
      }
      else{
        let promRefTotalQuantity = Math.floor(item.quantity/item.product.promoData.quantity);
        let promRefTotalPrice = promRefTotalQuantity * item.product.promoData.promoPrice;
        let noPromRefTotalQuantity = item.quantity % item.product.promoData.quantity;
        let noPromRefTotalPrice = noPromRefTotalQuantity * item.product.refPrice;
        let noPromNoRefTotalPrice = noPromRefTotalPrice / item.product.price;
        return promRefTotalPrice + noPromRefTotalPrice;
      }
    }
    else{
      if(item.product.promo){
        let promTotalQuantity = Math.floor(item.quantity/item.product.promoData.quantity);
        let promTotalPrice = promTotalQuantity * item.product.promoData.promoPrice;
        let noPromTotalQuantity = item.quantity % item.product.promoData.quantity;
        let noPromTotalPrice = noPromTotalQuantity * item.product.price;
        return promTotalPrice + noPromTotalPrice;
      }
      else{
        return item.quantity*item.product.price
      }
    }
  }

  onCancelSale(){
    this.productForm.markAsPending();
    let sale: Sale = {...this.sale}

    this.dbs.onSaveSale(sale, 'Cancelar').subscribe(
      batch => {
        batch.commit().then(
          res => {
            this.snackBar.open('El pedido fue cancelado satisfactoriamente', 'Aceptar');
            this.detailSubject.next(null);
          },
          err=> {
            this.snackBar.open('Ocurrió un error. Vuelva a intentarlo', 'Aceptar');
            this.productForm.updateValueAndValidity()
          }
        )},
      err => {
            this.snackBar.open('Ocurrió un error. Vuelva a intentarlo', 'Aceptar');
            this.productForm.updateValueAndValidity()
      }
    )
  }

  givePromoPrice(item: Sale['productList'][0]): number {
    let amount = item['quantity']
    let promo = item['product']['promoData']['quantity']
    let pricePromo = item['product']['promoData']['promoPrice']
    let price = item['product']['price']

    if (amount >= promo) {
      let wp = amount % promo
      let op = Math.floor(amount / promo)
      return wp * price + op * pricePromo
    } else {
      return amount * price
    }
  }
  onFloor(el: number, el2: number): number{
    return Math.floor(el/el2);
  }

}
