import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { FormControl, AbstractControl, Validators } from '@angular/forms';
import { DatabaseService } from 'src/app/core/database.service';
import { take, tap } from 'rxjs/operators';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-product-config-units',
  templateUrl: './product-config-units.component.html',
  styleUrls: ['./product-config-units.component.css']
})
export class ProductConfigUnitsComponent implements OnInit {
  units$: Observable<string[]>
  units: string[] = [];

  unitForm: FormControl;

  constructor(
    private dialogRef: MatDialogRef<ProductConfigUnitsComponent>,
    private dbs: DatabaseService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.units$ = this.dbs.getUnits()
      .pipe(take(1),tap(cat => {this.units = cat}))
    this.unitForm = new FormControl('', 
          [Validators.required, Validators.maxLength(3), this.repeatedCat()]);
  }



  addUnit(){
    this.units.unshift(this.unitForm.value.toUpperCase());
    this.unitForm.reset();
  }

  deleteUnit(unit: string){
    this.units = this.units.filter(cat => cat != unit);
  }
  
  onSubmitForm(){
    this.dbs.editUnits(this.units).commit().then(
      res => {
        this.snackBar.open('Las unidades se editaron con éxito', 'Aceptar');
        this.dialogRef.close()
      },
      res => {
        this.snackBar.open('Ocurrió un error. Vuelva a Intentarlo', 'Aceptar')
      }
    )
  }

  repeatedCat(){
    return (control: AbstractControl): {[s: string]: boolean} => {
      if(control.value){
        let value = control.value.toUpperCase();
        let valid = !this.units.includes(value);
        return valid ? null : {repeated: true}
      }
      else{
        return null
      }
    }
  }

}
