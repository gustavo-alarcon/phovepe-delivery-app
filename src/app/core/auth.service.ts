import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
// import { auth } from "firebase/app";
import { User } from "./models/user.model";
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { MatSnackBar } from '@angular/material/snack-bar';
import { switchMap, tap, shareReplay, map } from 'rxjs/operators';
import { Router } from '@angular/router';

import * as firebase from 'firebase/app';
import 'firebase/auth';
import { Platform } from '@angular/cdk/platform';

export const googleProvider = new firebase.auth.GoogleAuthProvider();
export const facebookProvider = new firebase.auth.FacebookAuthProvider();

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  user$: Observable<User>;

  authLoader: boolean = false;

  constructor(
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private router: Router,
    public snackbar: MatSnackBar,
    private platform: Platform
  ) {

    this.afAuth.setPersistence('local');

    // observe user authentication
    this.user$ =
      this.afAuth.authState.pipe(
        switchMap(user => {
          console.log(user)
          if (user) {
            this.updateUserData(user);
            return this.afs.collection('users').doc<User>(user.uid)
              .get().pipe(
                map((res)=>res.data())
                );
          } else {
            return of(null);
          }
        }),
        shareReplay(1)
      )
  }

  signIn(type: string): Promise<void | firebase.auth.UserCredential> {
    let provider = null;

    switch(type){
      case 'facebook':
        provider = facebookProvider;
        break;
      case 'google':
        provider= googleProvider
        break;
    }

    if(this.platform.ANDROID || this.platform.IOS){
      return this.afAuth.signInWithRedirect(provider)
        .catch(error => {
          this.handleError(error)
        });
    } else{
      return this.afAuth.signInWithPopup(provider)
        .catch(error => {
          this.handleError(error)
        })
    }
  }

  private updateUserData(user: firebase.User): Promise<void> {
    const userRef: AngularFirestoreDocument<User> = this.afs.doc(`users/${user.uid}`);

    let key = Object.keys(this.platform).filter(key => this.platform[key] == true && key != 'isBrowser');

    const data = {
      uid: user.uid,
      email: user.email,
      // phone: user.phone,
      displayName: user.displayName,
      photoURL: user.photoURL,
      lastLogin: new Date(),
      lastBrowser: [key.length ? key.join(", ") : "empty", navigator.userAgent]
    }
    //this.router.navigateByUrl("/main/productos");
    return userRef.set(data, { merge: true });
  }
 
  public logout(): void {
    this.afAuth.signOut().finally(()=> {
      this.router.navigateByUrl('/main');
    });
  }

  //ERROR HANDLING
  private handleError(error) {

    console.log(error)

    this.snackbar.open(
      'Ocurrió un error. Por favor, vuelva a intentarlo.', 
      'Cerrar', 
      { duration: 6000,}
    );

  }
}
