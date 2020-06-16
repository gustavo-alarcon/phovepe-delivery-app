import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './core/auth.guard';


const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'main',
    loadChildren: () => import('./main/main.module').then(mod => mod.MainModule),
  },
   { path: '',   redirectTo: '/main', pathMatch: 'full' },
    { path: '**', redirectTo: '/main', pathMatch: 'full'},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
