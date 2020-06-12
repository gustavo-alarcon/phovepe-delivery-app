import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SalesConfigComponent } from './sales-config.component';


const routes: Routes = [
  {
    path: '',
    component: SalesConfigComponent,
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SalesConfigRoutingModule { }
