import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Sale } from 'src/app/core/models/sale.model';
import { DatabaseService } from 'src/app/core/database.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { AuthService } from 'src/app/core/auth.service';

@Component({
  selector: 'app-sales-config',
  templateUrl: './sales-config.component.html',
  styleUrls: ['./sales-config.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SalesConfigComponent implements OnInit {
  detailSubject: BehaviorSubject<Sale> = new BehaviorSubject(null)
  detail$: Observable<Sale> = this.detailSubject.asObservable();

  constructor(
    public auth: AuthService
  ) { }

  ngOnInit() {

  }

  back(){
    this.detailSubject.next(null);
  }

}
