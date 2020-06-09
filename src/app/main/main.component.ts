import { SeoService } from './../core/seo.service';
import { ContactDialogComponent } from './contact-dialog/contact-dialog.component';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { Observable, of, combineLatest } from 'rxjs';
import { User } from '../core/models/user.model';
import { switchMap, shareReplay, tap, startWith } from 'rxjs/operators';
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
  openedMenu: boolean = false;

  logo: string
  defaultImage = '../../../../assets/images/no-image.png'

  themeFormGroup: FormGroup;
  themeFormGroup$: Observable<any>

  defaultThemes = new defaultThemes()
  themesSelection: Theme[] = [];

  isDark:boolean = false
  
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

    this.init$ = this.dbs.getConfi().pipe(
      tap(res => {
        if (res['meta']) {
          this.seo.updateDescription(res['meta']['description'])
          this.seo.updateTitle(res['meta']['title'])
          this.seo.updateOgTitle(res['meta']['title'])
          this.seo.updateOgUrl(res['meta']['url'])
          this.seo.updateOgImage(res['meta']['photoURL'])
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

    this.themeFormGroup$ = combineLatest(
      <Observable<Theme>>this.themeFormGroup.get('primary').valueChanges.pipe(
        startWith<Theme>(this.defaultThemes.blueGray)
      ),
      <Observable<Theme>>this.themeFormGroup.get('accent').valueChanges.pipe(
        startWith<Theme>(this.defaultThemes.gray)
      )
    ).pipe(
      tap(([primary, accent]) => {
        this.dbs.setTheme(primary, accent)
      })
    )
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
