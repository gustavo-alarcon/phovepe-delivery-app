import { User } from 'src/app/core/models/user.model';
import { DocumentReference, AngularFirestore } from '@angular/fire/firestore';
import { startWith, switchMap, filter, map, tap } from 'rxjs/operators';
import { AuthService } from './../../core/auth.service';
import { DatabaseService } from './../../core/database.service';
import { Observable, combineLatest, of } from 'rxjs';
import { Product } from './../../core/models/product.model';
import { FormControl } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { Sale } from 'src/app/core/models/sale.model';

@Component({
  selector: 'app-dispatch',
  templateUrl: './dispatch.component.html',
  styleUrls: ['./dispatch.component.css']
})
export class DispatchComponent implements OnInit {

  listview: boolean = true
  date = new FormControl(null);
  dispatchForm: FormControl = new FormControl(null);

  p: number = 1;
  p1: number = 1;


  admin: boolean = false
  choose: {
    product: Product,
    quantity: number
  }[] = []

  total: number
  delivery: number
  correlative: number

  sales$: Observable<Sale[]>
  driver$: Observable<User[]>;

  //noResult
  noResult$: Observable<string>;
  noResultImage: string = ''

  constructor(
    public dbs: DatabaseService,
    public auth: AuthService,
    private af: AngularFirestore
  ) { }

  ngOnInit() {
    const view = this.getCurrentMonthOfViewDate();
    this.date.setValue({ begin: view.from, end: new Date() })
    this.driver$ = this.dbs.getDriverList();

    this.noResult$ = this.dbs.noDataImage$.pipe(
      tap(res=>{
        this.noResultImage = '../../../../assets/images/no_data/no_data_' + res + '.svg'
      })
    )

    this.sales$ =
      combineLatest(
        this.date.valueChanges.pipe(
          startWith<any>({ begin: view.from, end: new Date() })
        ),
        this.dispatchForm.valueChanges.pipe(
          startWith('')
        ),
        this.auth.user$
      )
        .pipe(
          switchMap(([date, driver, user]) => {
            let endDate = date.end;
            endDate.setHours(23, 59, 59);
            if(!user){
              return of(null);
            }
            this.admin = user['admin']
            return this.dbs.getSales(date.begin, endDate).pipe(
              map(sales => {
                return sales.filter(el => el['status'] == 'En reparto' || el['status'] == 'Entregado')
                  .filter(el => user['admin'] ? true : user['driver'] ? el['driver']['uid'] == user['uid'] : false)
                  .filter(el => driver ? driver != 'Todos' ? el['driver']['displayName'] == driver['displayName'] : true : true)
              })
            )
          })
        )
  }

  getCurrentMonthOfViewDate(): { from: Date, to: Date } {
    const date = new Date();
    const fromMonth = date.getMonth();
    const fromYear = date.getFullYear();

    const actualFromDate = new Date(fromYear, fromMonth, 1);

    const toMonth = (fromMonth + 1) % 12;
    let toYear = fromYear;

    if (fromMonth + 1 >= 12) {
      toYear++;
    }

    const toDate = new Date(toYear, toMonth, 1);

    return { from: actualFromDate, to: toDate };
  }

  deliver(sale) {
    const batch = this.af.firestore.batch();
    let saleRef: DocumentReference = this.af.firestore.collection(`/db/mandaditos/sales`).doc(sale.id);
    let userRef: DocumentReference = this.af.firestore.collection(`/users/${sale.createdBy.uid}/sales`).doc(sale.id);

    batch.update(saleRef, {
      deliveryFinishedDate: new Date(),
      status: 'Entregado'
    })

    batch.update(userRef, {
      deliveryFinishedDate: new Date(),
      status: 'Entregado'
    })

    batch.commit()
  }

  giveProductPrice(item: Sale['productList'][0]) {
    if (item.product.ref) {
      if (!item.product.promo) {
        return this.round(item.quantity * item.product.refPrice)
      }
      else {
        let promRefTotalQuantity = Math.floor(item.quantity / item.product.promoData.quantity);
        let promRefTotalPrice = promRefTotalQuantity * item.product.promoData.promoPrice;
        let noPromRefTotalQuantity = item.quantity % item.product.promoData.quantity;
        let noPromRefTotalPrice = noPromRefTotalQuantity * item.product.refPrice;
        let noPromNoRefTotalPrice = noPromRefTotalPrice / item.product.price;
        return this.round(promRefTotalPrice + noPromRefTotalPrice);
      }
    }
    else {
      if (item.product.promo) {
        let promTotalQuantity = Math.floor(item.quantity / item.product.promoData.quantity);
        let promTotalPrice = promTotalQuantity * item.product.promoData.promoPrice;
        let noPromTotalQuantity = item.quantity % item.product.promoData.quantity;
        let noPromTotalPrice = noPromTotalQuantity * item.product.price;
        return this.round(promTotalPrice + noPromTotalPrice);
      }
      else {
        return this.round(item.quantity * item.product.price)
      }
    }
  }

  round(number){
    return Number(parseFloat(number).toFixed(1));
  }


  currentSale(item) {
    this.choose = item['confirmedProductList']
    this.total = item['totalConfirmedPrice']
    this.delivery = item['deliveryConfirmedPrice']
    this.correlative = item['correlative']
  }

  roundNumber(number) {
    return Math.floor(number)
  }


}
