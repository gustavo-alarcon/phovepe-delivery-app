import { Component } from '@angular/core';
import { ThemeService } from './core/theme.service';
import { Observable, combineLatest } from 'rxjs';
import { ThemeModel, ThemeModelSelect } from './core/models/theme.model';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { tap, startWith, map } from 'rxjs/operators'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'meraki-delivery-app';

  theme$: Observable<string[]>;

  themeModelSelect = Object.keys(ThemeModelSelect);

  themeFormGroup: FormGroup;
  themeFormGroup$: Observable<[ThemeModel, ThemeModel]>

  constructor(
    private themeService: ThemeService,
    private fb: FormBuilder
    ){}

  ngOnInit(){
    this.themeFormGroup = this.fb.group({
      primary: [ThemeModelSelect.mandaditos],
      accent: [ThemeModelSelect.mandaditos]
    })

    this.themeFormGroup$ = combineLatest(
      this.themeFormGroup.get('primary').valueChanges.pipe(startWith('mandaditos')),
      this.themeFormGroup.get('accent').valueChanges.pipe(startWith('mandaditos'))
    ).pipe(
      tap((res: [ThemeModel, ThemeModel]) => {
        this.themeService.setTheme(res)
      })
    )
    this.theme$ = this.themeService.theme$.pipe(tap(res => {
      console.log([res[0]+'-primary', res[1]+'-accent']);
      return [res[0], res[1]+'-accent']
    }));
  }

}
