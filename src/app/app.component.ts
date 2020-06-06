import { Component, Renderer2, ViewChild, ElementRef } from '@angular/core';
import { ThemeService } from './core/theme.service';
import { Observable, combineLatest } from 'rxjs';
import { ThemeModel, ThemeModelSelect } from './core/models/theme.model';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { tap, startWith, map, pairwise } from 'rxjs/operators'
import {MaterialCssVarsService} from 'angular-material-css-vars';
 
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  @ViewChild('bigDaddyContainer', {static: false}) bigDaddyContainer: ElementRef

  title = 'meraki-delivery-app';

  theme$: Observable<string>;

  themeModelSelect = Object.keys(ThemeModelSelect);

  themeFormGroup: FormGroup;
  themeFormGroup$: Observable<[ThemeModel, ThemeModel]>

  constructor(
    private themeService: ThemeService,
    private fb: FormBuilder,
    private renderer: Renderer2,
    public materialCssVarsService: MaterialCssVarsService
    ){
      const hex = 'green';
      this.materialCssVarsService.setDarkTheme(false);
      this.materialCssVarsService.setPrimaryColor(hex);
      this.materialCssVarsService.setAccentColor('red');
    }

  cssUrl: string;

  ngOnInit(){

    this.themeFormGroup = this.fb.group({
      primary: [ThemeModelSelect.mandaditosPalette],
      accent: [ThemeModelSelect.mandaditosAccentPalette],
      primaryCode: [""],
      accentCode: [""]
    })

    this.themeFormGroup$ = combineLatest(
      this.themeFormGroup.get('primary').valueChanges.pipe(startWith(this.themeFormGroup.get('primary').value)),
      this.themeFormGroup.get('accent').valueChanges.pipe(startWith(this.themeFormGroup.get('accent').value))
    ).pipe(
      tap((res: [ThemeModel, ThemeModel]) => {
        this.themeService.setTheme(res)
      })
    )

    this.theme$ = this.themeService.theme$.pipe(map(res => {
      console.log(res);
      console.log(res[0]+'-'+res[1])
      return res[0]+'-'+res[1]
    }));
  }

  onSubmit(){
    this.materialCssVarsService.setPrimaryColor(
      this.themeFormGroup.get('primaryCode').value
    );
    this.materialCssVarsService.setAccentColor(
      this.themeFormGroup.get('accentCode').value
    );
  }
  
}

