import { Component, Renderer2, ViewChild, ElementRef, Inject } from '@angular/core';
import { Observable, combineLatest } from 'rxjs';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { tap, startWith, map, pairwise } from 'rxjs/operators'
import { MaterialCssVarsService } from 'angular-material-css-vars';
import { DOCUMENT } from '@angular/common';
import { DatabaseService } from './core/database.service';
import { Title, Meta } from '@angular/platform-browser';

 
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  title = 'phovepe-delivery-app';

  data = {
    name: 'Michael Jordan',
    bio: 'Former baseball player',
    image: 'avatar.png'
  };


  constructor(
    @Inject(DOCUMENT) private _document: HTMLDocument,
    private dbs: DatabaseService,
    private tit: Title, 
    private meta: Meta
  ) {
    this.dbs.document = this._document
  }

  ngOnInit() {
    this.tit.setTitle(this.data.name);
    this.meta.addTags([
      { name: 'twitter:card', content: 'summary' },
      { name: 'og:url', content: '/about' },
      { name: 'og:title', content: this.data.name },
      { name: 'og:description', content: this.data.bio },
      { name: 'og:image', content: this.data.image }
    ]);
  }
}




