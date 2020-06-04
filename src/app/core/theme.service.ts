import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ThemeModel } from './models/theme.model';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private darkThemeSubject = new Subject<ThemeModel>()
  isDarkTheme$ = this.darkThemeSubject.asObservable()

  setDarkTheme(isDarkTheme: boolean): void{
    this.darkThemeSubject.next(isDarkTheme ? 'dark' : 'mandaditos')
  }
}
