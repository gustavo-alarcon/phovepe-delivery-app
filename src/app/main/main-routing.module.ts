import { MainComponent } from './main.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../core/auth.guard';


const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./carousel/carousel.module').then(mod => mod.CarouselModule)
      },
      {
        path: 'product-configuration',
        loadChildren: () => import('./product-config/product-config.module').then(mod => mod.ProductConfigModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'ventas',
        loadChildren: () => import('./sales-config/sales-config.module').then(mod => mod.SalesConfigModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'compras',
        loadChildren: () => import('./sales/sales.module').then(mod => mod.SalesModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'productos',
        loadChildren: () => import('./products/products.module').then(mod => mod.ProductsModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'despacho',
        loadChildren: () => import('./dispatch/dispatch.module').then(mod => mod.DispatchModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'configuracion',
        loadChildren: () => import('./configuration/configuration.module').then(mod => mod.ConfigurationModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'contacto',
        loadChildren: () => import('./contact/contact.module').then(mod => mod.ContactModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'clientes',
        loadChildren: () => import('./customer/customer.module').then(mod => mod.CustomerModule),
        canActivate: [AuthGuard]
      }
    ]
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MainRoutingModule { }
