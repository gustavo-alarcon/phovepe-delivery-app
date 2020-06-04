import { Component } from '@angular/core';
import { ThemeService } from './core/theme.service';
import { Observable } from 'rxjs';
import { ThemeModel } from './core/models/theme.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'meraki-delivery-app';

  isDarkTheme$: Observable<ThemeModel>;

  constructor(private themeService: ThemeService){}

  ngOnInit(){
    this.isDarkTheme$ = this.themeService.isDarkTheme$;
  }

  toggleDarkTheme(checked: boolean){
    this.themeService.setDarkTheme(checked)
  }

  darkThemeSelected : boolean = false;

  onSliderChange()
  {
    this.darkThemeSelected = !this.darkThemeSelected
  }
}
