import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

//Angular fire
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFireAuthModule } from '@angular/fire/auth';

import { environment } from 'src/environments/environment';

//Material
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatSliderModule} from '@angular/material/slider';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';

  
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

//module
import {MaterialCssVarsModule} from 'angular-material-css-vars';
import { ColorPickerModule } from 'ngx-color-picker';
import { AppRoutingModule } from './app-routing.module';
import { LazyLoadImageModule, 
          intersectionObserverPreset } from 'ng-lazyload-image';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from './core/auth.service';
import { DatabaseService } from './core/database.service';
import { LoginComponent } from './login/login.component';
import { ServiceWorkerModule } from '@angular/service-worker';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
  ],
  imports: [
    AppRoutingModule,
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    BrowserAnimationsModule,
    AngularFireModule.initializeApp(environment.firebaseConfig, "phovepe-delivery-app"),
    AngularFirestoreModule,
    AngularFireAuthModule, 
    AngularFireStorageModule,
    FormsModule,
    ReactiveFormsModule,
    MatSliderModule,
    MatToolbarModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    ColorPickerModule,
    MatSnackBarModule,
    MatIconModule,
    MatCheckboxModule,
    MaterialCssVarsModule.forRoot({
      // all optional
      isAutoContrast: true,
      darkThemeClass: 'isDarkTheme',
      lightThemeClass: 'isLightTheme',
      // ...
    }),
    LazyLoadImageModule.forRoot({
      preset: intersectionObserverPreset
    }),
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
  ],
  providers: [
    AuthService,
    DatabaseService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
