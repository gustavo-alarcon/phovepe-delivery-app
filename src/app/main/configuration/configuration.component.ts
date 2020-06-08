import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html'
})
export class ConfigurationComponent implements OnInit {

  links = [
    { name: 'Configuración', route: 'admin' },
    { name: 'Banners', route: 'banners' },
    { name: 'Marca', route: 'marca' }
  ];

  activeLink = this.links[0];

  loadingRouteConfig: boolean;
  constructor() { }

  ngOnInit() {
  }


}
