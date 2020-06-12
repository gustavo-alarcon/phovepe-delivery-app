import { DatabaseService } from 'src/app/core/database.service';
import { DialogComponent } from './dialog/dialog.component';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from './../../../core/auth.service';
import { take } from 'rxjs/operators';
import { Component, OnInit, Input, Inject } from '@angular/core';
import * as firebase from 'firebase/app';
import { BehaviorSubject } from 'rxjs';
import { Sale } from 'src/app/core/models/sale.model';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
@Component({
  selector: 'app-confirm-sale',
  templateUrl: './confirm-sale.component.html'
})
export class ConfirmSaleComponent implements OnInit {

  loading = new BehaviorSubject<number>(1);
  loading$ = this.loading.asObservable();

  constructor(
    private dialogref: MatDialogRef<ConfirmSaleComponent>,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: Sale,
    private af: AngularFirestore,
    public auth: AuthService,
    public dbs: DatabaseService
  ) { }

  ngOnInit() {

  }

  save() {
    this.loading.next(2)
    
    const sale = this.af.firestore.collection(`/db`).doc('mandaditos');
    const saleRef = this.af.firestore.collection(`/db/mandaditos/sales`).doc();

    this.auth.user$.pipe(
      take(1)).subscribe(user => {
        let userCorrelative = 1
        const userRef = this.af.firestore.collection(`/users/${user.uid}/sales`).doc(saleRef.id);
        const ref = this.af.firestore.collection(`/users`).doc(user.uid);
        this.data['createdBy'] = user
        this.data['id'] = saleRef.id

        if (user.salesCount) {
          userCorrelative = user.salesCount + 1
        }

        let specificSale = {...this.data}
        let newSale = {...this.data}
 
        return this.af.firestore.runTransaction((transaction) => {
          // This code may get re-run multiple times if there are conflicts.
          return transaction.get(sale).then((sfDoc) => {
            if (!sfDoc.exists) {
              transaction.set(sale, { salesCounter: 0 });
            }

            //sales
            ////generalCounter
            let newCorr = 1
            if(sfDoc.data().salesCounter){
              newCorr = sfDoc.data().salesCounter + 1;
            }
          
            transaction.update(sale, { salesCounter: newCorr });

            ////specificSale
            specificSale.correlative = newCorr;
            transaction.set(saleRef, specificSale);

            //user
            newSale.correlative = userCorrelative
            transaction.set(userRef, newSale)

            transaction.update(ref, {
              contact: this.data['location'],
              salesCount: userCorrelative
            })
          });
        }).then(() => {
          this.dialog.open(DialogComponent)
          this.dialogref.close(true)
          this.loading.next(3)
        }).catch(function (error) {
          console.log("Transaction failed: ", error);
        });


      })

  }


}
