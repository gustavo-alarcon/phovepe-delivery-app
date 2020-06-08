import { DatabaseService } from 'src/app/core/database.service';
import { Component, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

 
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  title = 'meraki-delivery-app';
  constructor(
    @Inject(DOCUMENT) private _document: HTMLDocument,
    private dbs: DatabaseService,
  ) {
    this.dbs.document = this._document
    

  }

}

