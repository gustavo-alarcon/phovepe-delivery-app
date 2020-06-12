import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/core/auth.service';
import { take, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-login-dialog',
  templateUrl: './login-dialog.component.html',
  styleUrls: ['./login-dialog.component.css']
})
export class LoginDialogComponent implements OnInit {

  auth$: Observable<any>

  constructor(
    public auth: AuthService,
    private dialogref: MatDialogRef<LoginDialogComponent>,
  ) { }

  ngOnInit() {
    this.auth$ = this.auth.user$.pipe(
      map(user=>{
        if(user){
          this.dialogref.close(true)
          return true
        }else{
          return false
        }
      })
    )
  }

}
