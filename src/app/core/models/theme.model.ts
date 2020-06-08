export interface Theme {
  name: string;
  color: string;
}

export class defaultThemes {
  red: Theme = {
    name: 'Rojo',
    color: '#F44336'
  }
  pink : Theme = {
    name: 'Rosado',
    color: '#E91E63'
  }
  purple : Theme = {
    name: 'Morado',
    color: '#9C27B0'
  }
  deepPurple: Theme = {
    name: 'Morado Profundo',
    color: '#673AB7'
  }
  indigo: Theme = {
    name: 'Indigo',
    color: '#3F51B5'
  }
  blue : Theme = {
    name: 'Azul',
    color: '#1E88E5'
  }
  lightBlue: Theme = {
    name: 'Azul claro',
    color: '#03A9F4'
  }
  cyan: Theme = {
    name: 'Cian',
    color: '#00BCD4'
  }
  teal: Theme = {
    name: 'Verde azulado',
    color: '#009688'
  }
  green: Theme = {
    name: 'Verde',
    color: '#43A047'
  }
  lightGreen: Theme = {
    name: 'Verde claro',
    color: '#8BC34A'
  }
  lime: Theme = {
    name: 'Lima',
    color: '#CDDC39'
  }
  yellow: Theme = {
    name: 'Amarillo',
    color: '#FFEB3B'
  }
  amber: Theme = {
    name: 'Ámbar',
    color: '#FFC107'
  }
  orange: Theme = {
    name: 'Naranja',
    color: '#FF9800'
  }
  deepOrange: Theme = {
    name: 'Naranja Oscuro',
    color: '#F4511E'
  }
  brown: Theme = {
    name: 'Cafe',
    color: '#795548'
  }
  gray: Theme = {
    name: 'Plomo',
    color: '#757575'
  }
  blueGray: Theme = {
    name: 'Plomo azulado',
    color: '#607D8B'
  }
}