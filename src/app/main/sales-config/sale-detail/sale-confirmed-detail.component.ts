import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { Sale } from 'src/app/core/models/sale.model';
import { FormArray, FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
import { combineLatest, Observable, merge, BehaviorSubject} from 'rxjs';
import { tap, startWith, share, map } from 'rxjs/operators';
import { DatabaseService } from 'src/app/core/database.service';
import { User } from 'src/app/core/models/user.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-sale-confirmed-detail',
  templateUrl: './sale-confirmed-detail.component.html',
  styleUrls: ['./sale-detail.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SaleConfirmedDetailComponent implements OnInit {
  dispatchForm: FormControl;
  driver$: Observable<User[]>;

  @Input() sale: Sale
  @Input() detailSubject: BehaviorSubject<Sale>

  
  constructor(
    private fb: FormBuilder,
    private dbs: DatabaseService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.initForm();
    this.initObservables();
  }

  initForm(){
    this.dispatchForm = this.fb.control(null, Validators.required);
  }

  initObservables(){
    this.driver$ = this.dbs.getDriverList();
  }

  //operation could be despachar, confirmar
  onSubmitForm(operation: string){
    this.dispatchForm.markAsPending();
    let sale = {...this.sale}
    sale.driver = this.dispatchForm.value;

    this.dbs.onSaveSale(sale, 'Despachar').subscribe(
      batch => {
        batch.commit().then(
          res => {
            this.snackBar.open('El pedido fue despachado satisfactoriamente', 'Aceptar');
            this.detailSubject.next(null);
          },
          err=> {
            this.snackBar.open('Ocurrió un error. Vuelva a intentarlo', 'Aceptar');
            this.dispatchForm.updateValueAndValidity()
          }
        )},
      err => {
            this.snackBar.open('Ocurrió un error. Vuelva a intentarlo', 'Aceptar');
            this.dispatchForm.updateValueAndValidity()
      }
    )
  }

  onEditStatus(type: string){
    let sale = {...this.sale};
    
    switch(type){
      case 'Solicitar':
        sale.status = 'Solicitado';
        this.detailSubject.next(sale);
        break;
      case 'Confirmar':
        sale.status = 'Confirmado';
        this.detailSubject.next(sale);
        break;
    }
  }

  onPrintSale(){
    this.dbs.printTicket(this.sale);
  }

  onFloor(el: number, el2: number): number{
    return Math.floor(el/el2);
  }

}
