import { Component, OnInit, Input, Inject } from '@angular/core';
import { Sale } from 'src/app/core/models/sale.model';
import { FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-sale-adress-dialog',
  templateUrl: './sale-adress-dialog.component.html'
})
export class SaleAdressDialogComponent implements OnInit {

  adress: FormControl;
  reference: FormControl;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Sale
  ) { }

  ngOnInit() {
    this.initForms();
  }

  initForms(){
    this.adress = new FormControl(this.data.location.address);
    this.reference = new FormControl(this.data.location.reference);
  }

}
