import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { take, map, tap } from 'rxjs/operators';
import { AuthService } from "./auth.service";
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private router: Router,
    private auth: AuthService,
    private snackbar: MatSnackBar
  ) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.auth.user$.pipe(
      take(1),
      map(user => {
        let childComponent = state.url.split('/')[2];
        if(childComponent.startsWith('productos')){
          childComponent = 'productos';
        }
        switch(childComponent){
          case 'product-configuration': 
            return user ? !!user.admin : false;
          case 'ventas': 
            return user ? !!user.admin : false;
          case 'compras': 
            return  user ? true : false;
          case 'productos': 
            return true
          case 'despacho': 
            return user ? (!!user.driver || !!user.admin) : false;
          case 'configuracion': 
            return user ? !!user.admin : false;
          case 'contacto': 
            return true
          case 'clientes': 
            return user ? !!user.admin : false;
        }
      }),
      tap(res => {
        if(!res){
          this.snackbar.open('Acceso denegado', 'Aceptar');
          this.router.navigate(['/main']);
        }
      })
    )
  }

}
