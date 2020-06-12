import { DatabaseService } from 'src/app/core/database.service';
import { AngularFirestore, DocumentReference } from '@angular/fire/firestore';
import { Component, OnInit, Input, Inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-delete-banner',
  templateUrl: './delete-banner.component.html',
  styleUrls: ['./delete-banner.component.css']
})
export class DeleteBannerComponent implements OnInit {
  loading = new BehaviorSubject<number>(1);
  loading$ = this.loading.asObservable();

  constructor(
    private dialogref: MatDialogRef<DeleteBannerComponent>,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data,
    private af: AngularFirestore,
    public dbs: DatabaseService
  ) { }

  ngOnInit() {
  }

  save(){
    this.loading.next(2)
    let ref: DocumentReference = this.af.firestore.collection(`/db/mandaditos/banners`).doc(this.data);
    let batch = this.af.firestore.batch();

    batch.delete(ref)

    batch.commit().then(() => {
      this.dialogref.close(true);
      this.loading.next(1)
    })
  }

}
