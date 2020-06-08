import { DatabaseService } from 'src/app/core/database.service';
import { Observable } from 'rxjs';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-contact-dialog',
  templateUrl: './contact-dialog.component.html',
  styleUrls: ['./contact-dialog.component.css']
})
export class ContactDialogComponent implements OnInit {

  contact$: Observable<any>

  constructor(
    public dbs: DatabaseService
  ) { }

  ngOnInit() {
    this.contact$ = this.dbs.getContact()
  }

}
