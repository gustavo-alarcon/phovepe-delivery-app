<<<<<<< Updated upstream
import { DatabaseService } from 'src/app/core/database.service';
import { Component, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

=======
import { Component, Renderer2, ViewChild, ElementRef, Inject } from '@angular/core';
import { Observable, combineLatest } from 'rxjs';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { tap, startWith, map, pairwise } from 'rxjs/operators'
import { MaterialCssVarsService } from 'angular-material-css-vars';
import { DOCUMENT } from '@angular/common';
import { DatabaseService } from './core/database.service';
>>>>>>> Stashed changes
 
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  title = 'meraki-delivery-app';
<<<<<<< Updated upstream
  constructor(
    @Inject(DOCUMENT) private _document: HTMLDocument,
    private dbs: DatabaseService,
  ) {
    this.dbs.document = this._document
    
=======

  constructor(
    @Inject(DOCUMENT) private _document: HTMLDocument,
    private dbs: DatabaseService,
    )
    {
      this.dbs.document = this._document
    }


  ngOnInit(){
>>>>>>> Stashed changes

  }

}

