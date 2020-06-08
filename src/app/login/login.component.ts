import { Component, OnInit } from '@angular/core';
import { AuthService } from '../core/auth.service';
import { FormControl } from '@angular/forms';
import { tap, mapTo, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { User } from '../core/models/user.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  persistenceControl: boolean = false;
  loginImage: string = "../assets/images/login-image.jpg";

  auth$: Observable<boolean>;

  constructor(
    public auth: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    
  }

}
