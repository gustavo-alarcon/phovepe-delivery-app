import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { DatabaseService } from 'src/app/core/database.service';
import { take, tap } from 'rxjs/operators';
import { FormBuilder, FormControl, Validators, AbstractControl } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-product-config-categories',
  templateUrl: './product-config-categories.component.html'
})
export class ProductConfigCategoriesComponent implements OnInit {
  categories$: Observable<string[]>
  categories: string[] = [];

  categoryForm: FormControl;

  constructor(
    private dialogRef: MatDialogRef<ProductConfigCategoriesComponent>,
    private dbs: DatabaseService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.categories$ = this.dbs.getCategories()
      .pipe(take(1),tap(cat => {this.categories = cat}))
    this.categoryForm = new FormControl('', [Validators.required, this.repeatedCat()]);
  }



  addCategory(){
    this.categories.unshift(this.categoryForm.value.toLowerCase());
    this.categoryForm.reset();
  }

  deleteCategory(category: string){
    this.categories = this.categories.filter(cat => cat != category);
  }
  
  onSubmitForm(){
    this.dbs.editCategories(this.categories).commit().then(
      res => {
        this.snackBar.open('Las categorias se editaron con éxito', 'Aceptar');
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
        let valid = !this.categories.includes(value);
        return valid ? null : {repeated: true}
      }
      else{
        return null
      }
    }
  }

}
