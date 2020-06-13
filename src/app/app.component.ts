import { Component, Inject } from '@angular/core';
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

  constructor(
    @Inject(DOCUMENT) private _document: HTMLDocument,
    private dbs: DatabaseService,
    private tit: Title, 
    private meta: Meta
  ) {
    this.dbs.document = this._document
  }


}




