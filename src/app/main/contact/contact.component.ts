import { Observable } from 'rxjs';
import { DatabaseService } from 'src/app/core/database.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent implements OnInit {

  contact$: Observable<any>

  constructor(
    public dbs: DatabaseService
  ) { }

  ngOnInit() {
    this.contact$ = this.dbs.getContact()
  }

}
