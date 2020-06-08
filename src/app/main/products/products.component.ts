import { LoginDialogComponent } from './login-dialog/login-dialog.component';
import { AuthService } from './../../core/auth.service';
import { ConfirmSaleComponent } from './confirm-sale/confirm-sale.component';
import { Sale } from 'src/app/core/models/sale.model';
import { Product } from './../../core/models/product.model';
import { startWith, distinctUntilChanged, debounceTime, map, tap, take, switchMap, filter } from 'rxjs/operators';
import { Observable, combineLatest, BehaviorSubject } from 'rxjs';
import { DatabaseService } from 'src/app/core/database.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WindowRefService } from '../../core/window-ref.service';
import { ScrollDispatcher, CdkScrollable } from '@angular/cdk/overlay';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {

  defaultImage = null;

  listview: boolean = true
  confirmView: boolean = false
  mapsView: boolean = false

  p: number = 1;
  p1: number = 1;

  categories: Array<any> = []
  onlycategories: Array<any> = []

  products: {
    product: Product,
    quantity: number
  }[] = []

  correlative: number

  order: {
    product: Product,
    quantity: number
  }[] = this.dbs.order

  search: FormGroup
  formGroup: FormGroup

  init$: Observable<boolean>
  info$: Observable<any>
  search$: Observable<any>
  districts$: Observable<object[]>
  scroll$: Observable<any>

  total: number = this.giveTotal()
  delivery: number = 4

  latitud: number = -16.3988900
  longitud: number = -71.5350000

  now: Date

  payType: Array<string> = ['Efectivo', 'VISA', 'Mastercard', 'Transferencia', 'Yape']

  firstFilter = new BehaviorSubject('Todos');
  firstFilter$ = this.firstFilter.asObservable();

  filter1: string = 'Todos'

  @ViewChild("movilForm", { static: false }) searchbar: ElementRef;
  @ViewChild("slogan", { static: false }) slogan: ElementRef;

  constructor(
    private fb: FormBuilder,
    public dbs: DatabaseService,
    private dialog: MatDialog,
    public auth: AuthService,
    private route: ActivatedRoute,
    private window: WindowRefService,
    private renderer: Renderer2,
    public scroll: ScrollDispatcher
  ) { }

  ngOnInit() {

    let date = new Date()
    this.now = new Date(date.getTime() + 86400000)
    this.search = this.fb.group({
      category: [''],
      input: ['']
    })

    this.formGroup = this.fb.group({
      destiny: ['', [Validators.required]],
      date: [null, [Validators.required]],
      number: [null, [Validators.required, Validators.minLength(6), Validators.maxLength(9)]],
      district: ['', [Validators.required]],
      pay: ['', [Validators.required]],
      ref: ['']
    });



    this.info$ = this.auth.user$.pipe(
      map(user => {
        if (user) {
          if (user['contact']) {
            this.formGroup.setValue({
              destiny: user['contact']['address'],
              date: null,
              number: user['contact']['number'],
              pay: null,
              district: user['contact']['district'] ? user['contact']['district'] : '',
              ref: user['contact']['reference']
            })

            this.latitud = user['contact']['coord']['lat']
            this.longitud = user['contact']['coord']['lng']

            if (user['contact']['district']) {
              if (user['contact']['district']['delivery']) {
                this.delivery = user['contact']['district']['delivery']
              }
            }
          }
        }

        return user
      })
    )

    this.init$ = combineLatest(
      this.dbs.getBanners('category'),
      this.dbs.getBanners('carousel'),
      this.dbs.getBanners('promo'),
      this.dbs.getProducts().pipe(map(res => res.filter(el => !!el.published))),
      this.dbs.defaultImage$,
      this.route.fragment
    ).pipe(
      map(([categories, promo, ofers, products, image, route]) => {
        this.defaultImage = image

        this.onlycategories = [...categories.filter(el => el.subCategories.length == 1 && el.subCategories[0].toLowerCase() == el.category.toLowerCase()).map(el => {
          return { name: el.category, type: 'all', products: el.subCategories, category: el.category, value: el.category }
        })]

        this.categories = [...categories.filter(el => !(el.subCategories.length == 1 && el.subCategories[0].toLowerCase() == el.category.toLowerCase())).map(el => {
          return {
            name: el.category,
            categories: [...el.subCategories.map(sub => {
              return { name: sub, type: 'category', category: el.category }
            }), { name: 'Todo', type: 'all', products: el.subCategories, category: el.category, value: el.category }]
          }
        }), {
          name: 'Ofertas',
          categories: [...ofers.map(el => {
            return { name: el.category, type: 'promo', products: el.products, category: 'Ofertas', value: el.category }
          })]
        }, {
          name: 'Descuentos',
          categories: [...promo.map(el => {
            return { name: el.category, type: 'promo', products: el.products, category: 'Descuentos', value: el.category }
          })]
        }]
        let view = products.map(el => {
          return {
            product: el,
            quantity: 0
          }
        })
        this.products = view
        let search = [...this.categories.map(el => el['categories']).reduce((a, b) => a.concat(b), []).filter(a => a['value'])].concat([...this.onlycategories])
        let choose = search.filter(a => a['value'] == route)[0]

        if (choose) {
          this.search.get('category').setValue(choose)
          this.firstFilter.next(choose)
        }
        return view.length >= 0
      })
    )

    this.search$ = combineLatest(
      this.search.get('input').valueChanges.pipe(
        startWith(''),
        distinctUntilChanged(),
        debounceTime(800),
        map(res => {
          return res.trim().replace(/\s+/g, " ");
        }),
      ),
      this.firstFilter$.pipe(
        switchMap(res => {
          return this.search.get('category').valueChanges.pipe(
            startWith(res)
          )
        })
      )
    ).pipe(
      map(([search, choose]) => {
        console.log(choose);
        
        this.filter1 = choose ? choose != 'Todos' ? choose['category'] : 'Todos' : 'Todos'
        return this.products.filter(el => search ? el['product']['description'].toLowerCase().includes(search.toLowerCase()) : true)
          .filter(el => choose ? choose != 'Todos' ? this.filterCategory(el['product'], choose) : true : true)

      }),
      tap(res => {
        this.p = 1
        this.p1 = 1
      })
    )

    this.districts$ = this.dbs.getDistricts()
    this.scroll$ = this.scroll.scrolled().pipe(
      tap(data => {

        const scrollTop = data.getElementRef().nativeElement.scrollTop || 0;

        if (scrollTop >= 135) {
          this.renderer.addClass(this.searchbar.nativeElement, 'shadow')
          this.renderer.setStyle(this.slogan.nativeElement, 'margin-top', '95px')
        } else {
          this.renderer.removeClass(this.searchbar.nativeElement, 'shadow')
          this.renderer.removeStyle(this.slogan.nativeElement, 'margin-top')
        }
      })
    )

  }

  filterCategory(product, category) {
    
    switch (category['type']) {
      case 'category':
        return product['category'] == category['name']
        break;
      case 'all':
        return category['products'].includes(product['category'])
        break;
      case 'promo':
        return category['products'].includes(product['id'])
        break;

      default:
        break;
    }
  }

  giveProductPrice(item: Sale['productList'][0]) {
    if (item.product.ref) {
      if (!item.product.promo) {
        return this.roundNumber(item.quantity * item.product.refPrice)
      }
      else {
        let promRefTotalQuantity = Math.floor(item.quantity / item.product.promoData.quantity);
        let promRefTotalPrice = promRefTotalQuantity * item.product.promoData.promoPrice;
        let noPromRefTotalQuantity = item.quantity % item.product.promoData.quantity;
        let noPromRefTotalPrice = noPromRefTotalQuantity * item.product.refPrice;
        let noPromNoRefTotalPrice = noPromRefTotalPrice / item.product.price;
        return this.roundNumber(promRefTotalPrice + noPromRefTotalPrice);
      }
    }
    else {
      if (item.product.promo) {
        let promTotalQuantity = Math.floor(item.quantity / item.product.promoData.quantity);
        let promTotalPrice = promTotalQuantity * item.product.promoData.promoPrice;
        let noPromTotalQuantity = item.quantity % item.product.promoData.quantity;
        let noPromTotalPrice = noPromTotalQuantity * item.product.price;
        return this.roundNumber(promTotalPrice + noPromTotalPrice);
      }
      else {
        return this.roundNumber(item.quantity * item.product.price)
      }
    }
  }

  login() {
    this.dialog.open(LoginDialogComponent)
  }

  clean() {
    this.search.reset({
      category: '',
      input: ''
    })
  }

  getStrikePrice(price: number) {
    let percent = price * 1.15
    return this.roundNumber(percent) - 0.01

  }

  compareObjects(o1: any, o2: any): boolean {
    return o1.name === o2.name && o1.delivery === o2.delivery;
  }

  roundNumber(number) {
    return Number(parseFloat(number).toFixed(1));
  }

  giveTotal(): number {
    return this.dbs.order.map(el => {
      return this.giveProductPrice(el)
    }).reduce((a, b) => a + b, 0)
  }

  increse(item) {

    if (item['quantity'] >= 0) {
      item['quantity']++
      let index = this.dbs.order.findIndex(el => el['product']['description'] == item['product']['description'])
      if (index == -1) {
        this.dbs.order.push(item)
      }
      this.total = this.giveTotal()
    }

  }

  decrease(item) {
    if (item['quantity'] > 0) {
      item['quantity']--
    }

    let index = this.dbs.order.findIndex(el => el['product']['description'] == item['product']['description'])

    if (index != -1) {
      if (this.dbs.order[index]['quantity'] == 0) {
        this.dbs.order.splice(index, 1)
      }
    }
    this.total = this.giveTotal()
  }

  delete(ind, item) {
    let index = this.products.findIndex(el => el['product']['description'] == item['product']['description'])
    this.products[index]['quantity'] = 0
    this.dbs.order.splice(ind, 1)
    this.total = this.giveTotal()
  }

  view(item) {
    if (item['product']['unit'].toLowerCase() != 'kg') {
      item['quantity'] = Math.round(item['quantity'])
    }
    let index = this.dbs.order.findIndex(el => el['product']['description'] == item['product']['description'])
    if (index == -1) {
      this.dbs.order.push(item)
    } else {
      this.dbs.order[index]['quantity'] = item['quantity']
    }
    this.total = this.giveTotal()

  }

  round(number) {
    return Math.floor(number)
  }

  changeDelivery(district) {
    this.delivery = district['delivery']
  }

  maps() {
    this.confirmView = true;
    this.mapsView = true
  }

  findMe() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((posicion) => {
        this.latitud = posicion.coords.latitude;
        this.longitud = posicion.coords.longitude;

      }, function (error) {
        alert("Tenemos un problema para encontrar tu ubicación");
      });
    }
  }

  mapClicked($event: MouseEvent) {
    this.latitud = $event['coords']['lat'];
    this.longitud = $event['coords']['lng'];
  }

  save() {

    let newSale: Sale = {
      id: '',
      correlative: 0,
      payType: this.formGroup.get('pay').value,
      location: {
        address: this.formGroup.get('destiny').value,
        district: this.formGroup.get('district').value,
        reference: this.formGroup.get('ref').value,
        coord: {
          lat: this.latitud,
          lng: this.longitud
        },
        number: this.formGroup.get('number').value
      },
      deliveryDate: this.formGroup.get('date').value,
      createdAt: new Date(),
      createdBy: null,
      productList: this.dbs.order,
      status: 'Solicitado',
      total: this.total,
      deliveryPrice: this.delivery
    }


    this.dialog.open(ConfirmSaleComponent, {
      data: newSale
    }).afterClosed().pipe(
      take(1)
    ).subscribe((res) => {
      if (res) {
        this.search.reset()
        this.confirmView = false
        this.listview = true
        this.total = 0
        this.p = 1
        this.p1 = 1
        this.dbs.order = []
      }
    })

  }

}
