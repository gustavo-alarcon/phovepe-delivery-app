import { AddressDialogComponent } from './address-dialog/address-dialog.component';
import { Product } from 'src/app/core/models/product.model';
import { switchMap, startWith, tap, map } from 'rxjs/operators';
import { AuthService } from './../../core/auth.service';
import { Observable, combineLatest, BehaviorSubject } from 'rxjs';
import { DatabaseService } from 'src/app/core/database.service';
import { FormControl } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { Sale } from 'src/app/core/models/sale.model';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.css']
})
export class SalesComponent implements OnInit {
  listview: boolean = true
  date = new FormControl(null);

  p: number = 1;
  p1: number = 1;
  p2: number = 1;
  p3: number = 1;

  choose: {
    product: Product,
    quantity: number
  }[] = []

  total: number
  delivery: number
  correlative: number
  confirm: boolean = false

  filter = new BehaviorSubject('Todos');
  filter$ = this.filter.asObservable();

  allSales: number = 0

  entry: Array<Sale>
  progress: Array<Sale>

  sales$: Observable<Sale[]>
  
  //noResult
  noResult$: Observable<string>;
  noResultImage: string = ''

  constructor(
    public dbs: DatabaseService,
    public auth: AuthService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    const view = this.getCurrentMonthOfViewDate();
    this.date.setValue({ begin: view.from, end: new Date() })

    this.noResult$ = this.dbs.noDataImage$.pipe(
      tap(res=>{
        this.noResultImage = '../../../../assets/images/no_data/no_data_' + res + '.svg'
      })
    )
    
    this.sales$ =
      combineLatest(
        this.auth.user$,
        this.date.valueChanges.pipe(
          startWith<any>({ begin: view.from, end: new Date() })
        )
      ).pipe(
        switchMap(([user, date]) => {
          let endDate = date.end;
          endDate.setHours(23, 59, 59);
          return combineLatest(
            this.dbs.getSalesUser(user.uid, date.begin, endDate),
            this.filter$
          ).pipe(
            map(([sales, status]) => {

              return sales.sort((a, b) => b['correlative'] - a['correlative']).map(el => {
                return {
                  ...el,
                  progress: status != 'Todos' ? status == el['status'] : true
                }
              })
            })
          )
        }),
        tap(res => {
          this.allSales = res.filter(el => el['status'] != 'Entregado').length
          this.entry = res.filter(el => el['status'] == 'Entregado')
          this.progress = res.filter(el => el['status'] != 'Entregado').filter(el => el['progress'])
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

  round(number) {
    return Number(parseFloat(number).toFixed(1));
  }

  currentSale(item) {
    if (item['status'] == 'Solicitado' || item['status'] == 'Cancelado') {
      this.confirm = false
      this.choose = item['productList']
      this.total = item['total']
      this.delivery = item['deliveryPrice']
      this.correlative = item['correlative']
    } else {
      this.confirm = true
      this.choose = item['confirmedProductList']
      this.total = item['totalConfirmedPrice']
      this.delivery = item['deliveryConfirmedPrice']
      this.correlative = item['correlative']
    }

  }

  roundNumber(number) {
    return Math.floor(number)
  }

  getBorderColor(sale: Sale) {
    switch (sale.status) {
      case 'Confirmado':
        return 'list-container border--fourth'
        break;
      case 'Solicitado':
        return 'list-container border--third'
        break;
      case 'En reparto':
        return 'list-container border--secondary'
        break;
      case 'Cancelado':
        return 'list-container list-container--black '
      
        break;
    }

  }

  filterSaleData(type: string) {
    this.filter.next(type)
  }

  getNumber(sales: Sale[], state: string): number {
    return sales.filter(sale => sale.status == state).length;
  }

  openMap(sale) {
    this.dialog.open(AddressDialogComponent, {
      data: sale,
      width: '80%'
    })
  }

}
