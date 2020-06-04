import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';
import { ThemeModel } from './models/theme.model';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private themeSubject = new BehaviorSubject<[ThemeModel, ThemeModel]>(['mandaditos', 'mandaditos'])
  theme$ = this.themeSubject.asObservable()

  setTheme(themeGroup: [ThemeModel, ThemeModel]): void{
    this.themeSubject.next(themeGroup)
  }
}
