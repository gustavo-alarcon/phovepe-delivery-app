import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ConfigurationComponent } from './configuration.component';


const routes: Routes = [
  {
    path: '',
    component: ConfigurationComponent,
    children: [
      {
        path: 'admin',
        loadChildren: () => import('./admins/admins.module').then(mod => mod.AdminsModule)
      },
      {
        path: 'banners',
        loadChildren: () => import('./banners/banners.module').then(mod => mod.BannersModule)
      },
      {
        path: 'marca',
        loadChildren: () => import('./design/design.module').then(mod => mod.DesignModule)
      },
      {
        path: '', redirectTo:'admin'
      }
    ]
  },
  
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConfigurationRoutingModule { }
