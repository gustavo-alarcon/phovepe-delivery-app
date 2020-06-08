import { FormControl } from '@angular/forms';
import { Component, OnInit, Inject } from '@angular/core';
import { Sale } from 'src/app/core/models/sale.model';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-address-dialog',
  templateUrl: './address-dialog.component.html',
  styleUrls: ['./address-dialog.component.css']
})
export class AddressDialogComponent implements OnInit {

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
