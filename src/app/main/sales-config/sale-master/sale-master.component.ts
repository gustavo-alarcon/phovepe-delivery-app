import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { DatabaseService } from 'src/app/core/database.service';
import { FormControl } from '@angular/forms';
import { Sale } from 'src/app/core/models/sale.model';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { switchMap, tap, startWith, map, shareReplay } from 'rxjs/operators';
import { SaleAdressDialogComponent } from '../sale-adress-dialog/sale-adress-dialog.component';
import { DataSource } from '@angular/cdk/table';
import { User } from 'src/app/core/models/user.model';
import * as XLSX from 'xlsx';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-sale-master',
  templateUrl: './sale-master.component.html',
  styleUrls: ['./sale-master.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SaleMasterComponent implements OnInit {
  @Input() detailSubject: BehaviorSubject<Sale>

  defaultImage = '../../../../assets/images/no-image.png'

  p: number = 1;

  saleStateSubject: BehaviorSubject<string> = new BehaviorSubject('Total');
  saleState$: Observable<string> = this.saleStateSubject.asObservable().pipe(shareReplay(1));
  salesFiltered$: Observable<Sale[]>;

  date: FormControl;
  driverForm: FormControl;
  driverForm$: Observable<boolean>;

  sales$: Observable<Sale[]>
  drivers$: Observable<User[]>

  constructor(
    private dbs: DatabaseService,
    private dialog: MatDialog
  ) { }


  ngOnInit() {
    this.initForms();
    this.initObservables();
  }

  initForms() {
    this.date = new FormControl({
      begin: this.getCurrentMonthOfViewDate().from,
      end: this.getCurrentMonthOfViewDate().to
    });

    this.driverForm = new FormControl('Todos')
  }

  initObservables() {
    this.sales$ = this.date.valueChanges.pipe(
      startWith(this.date.value),
      switchMap((date: { begin: Date, end: Date }) => {
        let endDate = date.end;
        endDate.setHours(23, 59, 59);
        return this.dbs.getSales(date.begin, endDate)/*.pipe(map(sales =>
          sales.filter(sale => sale.status != 'Cancelado')))*/
      })
      );

    this.drivers$ = this.dbs.getDriverList();

    this.driverForm$ = this.saleState$.pipe(
      map(res => {
        this.driverForm.setValue('Todos');
        if (res == 'En reparto' || res == 'Total') {
          return true
        }
        else {
          return false
        }
      })
    )


    this.salesFiltered$ = combineLatest(this.sales$, this.saleState$,
      (<Observable<string | User>>this.driverForm.valueChanges.pipe(startWith('Todos'))))
      .pipe(
        map(([sales, saleState, driver]) => {
          let order = sales.sort((a, b) => b['correlative'] - a['correlative'])
          switch (saleState) {
            case 'Solicitado':
            case 'Confirmado':
              return order.filter(sale => sale.status == saleState)
            case 'En reparto':
              if (driver == 'Todos') {
                return order.filter(sale => sale.status == saleState)
              }
              else {
                return order.filter(sale => (
                  (sale.status == saleState) && (sale.driver ? (sale.driver.uid == (<User>driver).uid) : false)
                ))
              }
            case 'Total':
              if (driver == 'Todos') {
                return order
              }
              else {
                return order.filter(sale => sale.driver ? (sale.driver.uid == (<User>driver).uid) : false)
              }
          }
        }),
        shareReplay(1)
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

  onSelectDetail(data: Sale) {
    this.detailSubject.next(undefined);
    setTimeout(() => {
      this.detailSubject.next(data);
    }, 4);
  }

  onCheckDirection(el: Sale, event) {
    event.stopPropagation()
    this.dialog.open(SaleAdressDialogComponent, {
      data: el,
      width: '80%'
    })
  }

  filterSaleData(type: string) {
    this.saleStateSubject.next(type);
    this.detailSubject.next(undefined);
  }

  getName(displayName: string): string {
    let name = displayName.split(" ");
    switch (name.length) {
      case 1:
      case 2:
        return displayName;
      default:
        return name[0] + " " + name[2];
    }
  }

  getNumber(sales: Sale[], state: string): number {
    return sales.filter(sale => sale.status == state).length;
  }

  getTotalPrice(sales: Sale[]): number {
    if (sales) {
      return sales.filter(sale => sale.status == 'Confirmado' || sale.status == 'En reparto')
        .reduce((acc, curr) => {
          return curr.totalConfirmedPrice + curr.deliveryConfirmedPrice + acc
        }, 0)
    }
    else {
      return 0;
    }
  }

  getBorderColor(sale: Sale, totalSales: Sale[], filteredSales: Sale[]) {
    if (totalSales.length == filteredSales.length) {
      switch (sale.status) {
        case 'Confirmado':
          return 'list-container border--fourth'
        case 'Solicitado':
          return 'list-container border--third'
        case 'En reparto':
          return 'list-container border--secondary'
        case 'Entregado':
          return 'list-container list-container--black'
        case 'Cancelado':
          return 'list-container list-container--red'
      }
    }
    else {
      return 'list-container list-container--gray'
    }

  }

  downloadXlsUsers(sales: Sale[]): void {
    let table_xlsx: any[] = [];
    let headersXlsx = [
      'Correlativo', 'Usuario', 'Estado', 'Teléfono', 'Dirección', 
      'Distrito', 'Referencia', 'Sub-Total', 'Delivery', 'Total', 'Tipo de pago',
      'Fecha de Solicitud', 'Fecha de Envio Deseada', 'Fecha de Confirmación/Cancelación', 'Fecha de Despacho', 
      'Fecha de Entrega']

    table_xlsx.push(headersXlsx);

    sales.forEach(sale => {
      const temp = [
        sale.correlative.toString().padStart(6, "0"),
        sale.createdBy.displayName,
        sale.status,
        sale.location.number,
        sale.location.address,
        sale.location.district,
        sale.location.reference,
        (sale.status == 'Solicitado' || sale.status == 'Cancelado') ? sale.total : sale.totalConfirmedPrice,
        (sale.status == 'Solicitado' || sale.status == 'Cancelado') ? sale.deliveryPrice : sale.deliveryConfirmedPrice,
        (sale.status == 'Solicitado' || sale.status == 'Cancelado') ? (sale.deliveryPrice + sale.total) : (sale.deliveryConfirmedPrice + sale.totalConfirmedPrice),
        sale.payType,
        sale.createdAt,
        sale.deliveryDate,
        (sale.status == 'Solicitado') ? "N.A." : (sale.status == 'Cancelado') ? sale.cancelledAt : sale.confirmedAt,
        (sale.status == 'Solicitado' || sale.status == 'Cancelado' || sale.status == 'Confirmado') ? "N.A." : sale.dispatchedAt,
        (sale.status == 'Solicitado' || sale.status == 'Cancelado' || sale.status == 'Confirmado' || sale.status == 'En reparto') ? "N.A." : sale.deliveryFinishedDate,
      ];

      table_xlsx.push(temp);
    })

    /* generate worksheet */
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(table_xlsx);

    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Relacion_de_Ventas');

    /* save to file */
    const name = 'Relacion_de_Ventas' + '.xlsx';
    XLSX.writeFile(wb, name);
  }

}
