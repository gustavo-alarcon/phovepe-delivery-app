import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProductConfigComponent } from './product-config.component';


const routes: Routes = [
  {
    path: '',
    component: ProductConfigComponent,
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductConfigRoutingModule { }
