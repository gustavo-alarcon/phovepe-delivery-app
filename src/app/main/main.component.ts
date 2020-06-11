import { SeoService } from './../core/seo.service';
import { ContactDialogComponent } from './contact-dialog/contact-dialog.component';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { Observable, of, combineLatest } from 'rxjs';
import { User } from '../core/models/user.model';
import { switchMap, shareReplay, tap, startWith, map } from 'rxjs/operators';
import { DatabaseService } from '../core/database.service';
import { RateDialogComponent } from './rate-dialog/rate-dialog.component';
import { Sale } from '../core/models/sale.model';
import { LoginDialogComponent } from './login-dialog/login-dialog.component';
import * as AOS from 'aos';
import { MatDialog } from '@angular/material/dialog';
import { defaultThemes, Theme } from '../core/models/theme.model';
import { FormGroup, FormBuilder } from '@angular/forms';


@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
  user$: Observable<User>
  init$: Observable<any>
  colors$: Observable<any>
  openedMenu: boolean = false;

  logo: string
  defaultImage = '../../../../assets/images/no-image.png'

  themeFormGroup: FormGroup;
  themeFormGroup$: Observable<any>

  defaultThemes = new defaultThemes()
  themesSelection: Theme[] = [];

  isDark: boolean = false

  constructor(
    public router: Router,
    public auth: AuthService,
    public dbs: DatabaseService,
    public dialog: MatDialog,
    private fb: FormBuilder,
    private seo: SeoService
  ) {
  }

  ngOnInit() {
    AOS.init();

    this.initThemes();

    this.colors$ = this.dbs.getColors().pipe(
      tap(res => {
        if (res) {
          this.dbs.setTheme(res['primary'], res['accent'])
          this.themeFormGroup.setValue(res)
        }
      })
    )

    this.init$ = combineLatest(
      this.dbs.getLogos(),
      this.dbs.getMetaTag()
    ).pipe(
      map(([logos, meta]) => {
        return meta
      }),
      tap(res => {
        if (res) {
          this.seo.updateDescription(res['description'])
          this.seo.updateTitle(res['title'])
          this.seo.updateOgTitle(res['title'])
          this.seo.updateOgUrl(res['url'])
          this.seo.updateOgImage(res['photoURL'])
        }
      })
    )

    this.user$ = this.auth.user$.pipe(
      switchMap(
        res => {
          return res ? this.dbs.getUserFinishedSales(res) : of([]);
        },
        (user, sales) => {
          if (sales.length) {
            let dialogRef = this.dialog.open(RateDialogComponent, {
              width: '307px',
              closeOnNavigation: false,
              disableClose: true,
              data: {
                sale: sales[0],
              }
            });
            dialogRef.afterClosed().pipe(
              switchMap((sale: Sale) => this.dbs.onSaveSale(sale, 'Rate')))
              .subscribe(batch => {
                batch.commit().then(
                  res => { }, console.log
                )
              }, console.log)
          }
          return user
        }
      ),
      shareReplay(1)
    )

  }

  initThemes() {
    this.themesSelection = Object.values(this.defaultThemes);
    
    this.themeFormGroup = this.fb.group({
      primary: [this.defaultThemes.blueGray],
      accent: [this.defaultThemes.gray]
    })

    this.themeFormGroup$ = this.dbs.getColors().pipe(
      switchMap(colors=>{
        return combineLatest(
          <Observable<Theme>>this.themeFormGroup.get('primary').valueChanges.pipe(
            startWith<Theme>(colors['primary'] ? colors['primary'] : this.defaultThemes.blueGray)
          ),
          <Observable<Theme>>this.themeFormGroup.get('accent').valueChanges.pipe(
            startWith<Theme>(colors['accent'] ? colors['accent'] : this.defaultThemes.gray)
          )
        ).pipe(
          tap(([primary, accent]) => {
            this.dbs.setTheme(primary, accent)
          })
        )
      })
    )
  }

  compareObjects(o1: any, o2: any): boolean {
    return o1.color === o2.color && o1.name === o2.name;
  }


  toggleSideMenu(): void {
    this.openedMenu = !this.openedMenu;
  }

  openContact() {
    this.dialog.open(ContactDialogComponent)
  }

  login() {
    this.dialog.open(LoginDialogComponent)
  }

}
