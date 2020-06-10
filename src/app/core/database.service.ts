import { Injectable } from '@angular/core';
import { AngularFirestoreCollection, AngularFirestore, DocumentReference } from '@angular/fire/firestore';
import * as firebase from 'firebase/app';
import { Observable, of, concat, interval, BehaviorSubject } from 'rxjs';
import { Product } from './models/product.model';
import { map, tap, finalize, switchMap, take, takeLast, shareReplay, mapTo, startWith } from 'rxjs/operators';
import { AngularFireStorage } from '@angular/fire/storage';
import { Sale } from './models/sale.model';
import { AuthService } from './auth.service';
import { User } from './models/user.model';
import * as jsPDF from 'jspdf';
import { saveAs } from 'file-saver';
import { Banner } from './models/banners.model';
import { MaterialCssVarsService } from 'angular-material-css-vars';
import { Theme } from './models/theme.model';

interface theme {
  'primary-color': string,
  'secundary-color': string,
  'third-color': string,
  'forth-color': string
}

@Injectable({
  providedIn: 'root'
})

export class DatabaseService {
  public document: any = null

  public order: {
    product: Product,
    quantity: number
  }[] = []

  public logoURL: string = ''
  public logomovilURL: string = ''
  public defaultImage$: Observable<any>

  public noDataImage = new BehaviorSubject('');
  public noDataImage$ = this.noDataImage.asObservable();

  constructor(
    private afs: AngularFirestore,
    private storage: AngularFireStorage,
    private auth: AuthService,
    private materialCssVarsService: MaterialCssVarsService
  ) {
    this.getDefault();
    this.materialCssVarsService.setAutoContrastEnabled(true);
  }

  toggleDark(isDark: boolean) {
    this.materialCssVarsService.setDarkTheme(isDark)
  }

  toggleLight() {
    this.materialCssVarsService.setDarkTheme(false)
  }

  setTheme(primaryTheme: Theme, accentTheme: Theme) {

    let color = primaryTheme.color.substring(1)
    this.noDataImage.next(color)


    this.materialCssVarsService.setPrimaryColor(primaryTheme.color);
    this.materialCssVarsService.setAccentColor(accentTheme.color);

    document.documentElement.style.setProperty(`--primary-color`, primaryTheme.color);
    document.documentElement.style.setProperty(`--secundary-color`, accentTheme.color);
    document.documentElement.style.setProperty(`--third-color`,
      this.materialCssVarsService.getPaletteForColor(primaryTheme.color)[2].color.str);
    document.documentElement.style.setProperty(`--forth-color`,
      this.materialCssVarsService.getPaletteForColor(accentTheme.color)[3].color.str);
  }

  getCategories(): Observable<string[]> {
    return this.afs.collection(`/db`).doc<{ categories: string[], salesCounter: number, units: string[], districts: object[] }>('mandaditos').valueChanges()
      .pipe(
        map(res => res.categories),
        shareReplay(1)
      )
  }

  getUnits(): Observable<string[]> {
    return this.afs.collection(`/db`).doc<{ categories: string[], salesCounter: number, units: string[], districts: object[] }>('mandaditos').valueChanges()
      .pipe(
        map(res => res.units),
        shareReplay(1)
      )
  }

  getDistricts(): Observable<object[]> {
    return this.afs.collection(`/db`).doc<{ categories: string[], salesCounter: number, units: string[], districts: object[] }>('mandaditos').valueChanges()
      .pipe(
        map(res => res.districts),
        shareReplay(1)
      )
  }

  editCategories(categories: string[]): firebase.firestore.WriteBatch {
    let categoriesRef: DocumentReference
      = this.afs.firestore.collection(`/db`).doc('mandaditos')
    let batch = this.afs.firestore.batch();
    batch.set(categoriesRef, { categories }, { merge: true })
    return batch;
  }

  editUnits(units: string[]): firebase.firestore.WriteBatch {
    let unitsRef: DocumentReference
      = this.afs.firestore.collection(`/db`).doc('mandaditos')
    let batch = this.afs.firestore.batch();
    batch.set(unitsRef, { units }, { merge: true })
    return batch;
  }

  getProducts(): Observable<Product[]> {
    return this.afs.collection<Product>(`/db/mandaditos/products`, ref => ref.orderBy("description", "asc")/*, ref => ref.where('published', '==', true)*/)
      .get().pipe(map((snap) => {
        return snap.docs.map(el => <Product>el.data())
      }));
  }

  getContact() {
    return this.afs.collection(`/db`).doc<any>('mandaditos').valueChanges()
      .pipe(
        map(res => res['contact']),
        shareReplay(1)
      )
  }

  getProductsValueChanges(): Observable<Product[]> {
    return this.afs.collection<Product>(`/db/mandaditos/products`, ref => ref.orderBy("description", "asc"))
      .valueChanges().pipe(
        shareReplay(1)
      );
  }

  deleteProduct(product: Product): Observable<firebase.firestore.WriteBatch> {
    let productRef: DocumentReference = this.afs.firestore.collection(`/db/mandaditos/products`).doc(product.id)
    let batch = this.afs.firestore.batch();
    batch.delete(productRef)
    return this.deletePhotoProduct(product.photoPath).pipe(
      takeLast(1),
      mapTo(batch)
    )
  }

  createEditProduct(edit: boolean, product: Product, oldProduct?: Product, photo?: File): Observable<firebase.firestore.WriteBatch> {
    let productRef: DocumentReference;
    let productData: Product;
    let batch = this.afs.firestore.batch();

    //Editting
    if (edit) {
      productRef = this.afs.firestore.collection(`/db/mandaditos/products`).doc(oldProduct.id);
      productData = product;
      productData.id = productRef.id;
      productData.photoURL = oldProduct.photoURL;
      productData.promo = oldProduct.promo;
    }
    //creating
    else {
      productRef = this.afs.firestore.collection(`/db/mandaditos/products`).doc();
      productData = product;
      productData.id = productRef.id;
      productData.photoURL = null;
    }

    //With or without photo
    if (photo) {
      if (edit) {
        return concat(this.deletePhotoProduct(oldProduct.photoPath).pipe(takeLast(1)),
          this.uploadPhotoProduct(productRef.id, photo).pipe(takeLast(1)))
          .pipe(
            takeLast(1),
            map((res: string) => {
              productData.photoURL = res;
              productData.photoPath = `/products/pictures/${productRef.id}-${photo.name}`;
              batch.set(productRef, productData, { merge: true });
              return batch
            })
          )
      }
      else {
        return this.uploadPhotoProduct(productRef.id, photo).pipe(
          takeLast(1),
          map((res: string) => {
            productData.photoURL = res;
            productData.photoPath = `/products/pictures/${productRef.id}-${photo.name}`;
            batch.set(productRef, productData, { merge: true });
            return batch
          })
        )
      }
    }
    else {
      batch.set(productRef, productData, { merge: true });
      return of(batch);
    }
  }

  editPromo(productId: string, promo: boolean, promoData: Product['promoData']): firebase.firestore.WriteBatch {
    let productRef: DocumentReference;
    let productData: Product['promoData'];
    let batch = this.afs.firestore.batch();

    //Editting
    productRef = this.afs.firestore.collection(`/db/mandaditos/products`).doc(productId);
    productData = promoData;
    batch.update(productRef, {
      promo,
      promoData: {
        promoPrice: promoData.promoPrice,
        quantity: promoData.quantity
      }
    });
    return batch;
  }

  uploadPhotoProduct(id: string, file: File): Observable<string | number> {
    const path = `/products/pictures/${id}-${file.name}`;

    // Reference to storage bucket
    const ref = this.storage.ref(path);

    // The main task
    let uploadingTask = this.storage.upload(path, file);

    let snapshot$ = uploadingTask.percentageChanges()
    let url$ = of('url!').pipe(
      switchMap((res) => {
        return <Observable<string>>ref.getDownloadURL();
      }))

    let upload$ = concat(
      snapshot$,
      interval(1000).pipe(take(2)),
      url$)
    return upload$;
  }

  deletePhotoProduct(path: string): Observable<any> {
    let st = this.storage.ref(path);
    return st.delete();
  }

  getSalesUser(user: string, from: Date, to: Date): Observable<Sale[]> {
    return this.afs.collection<Sale>(`/users/${user}/sales`, ref => ref.orderBy("createdAt", 'desc').where('createdAt', '>=', from).where('createdAt', '<=', to))
      .valueChanges().pipe(
        shareReplay(1)
      );
  }

  getUserFinishedSales(user: User): Observable<Sale[]> {
    return this.afs.collection<Sale>(`/users/${user.uid}/sales`, ref => ref.orderBy("createdAt", 'desc'))
      .get().pipe(map((snap) => {
        return snap.docs
          .map(el => <Sale>el.data())
          .filter(el => ((el.status == 'Entregado') && (el.rateData === undefined)))
      }));
  }

  getSales(begin: Date, end: Date): Observable<Sale[]> {
    return this.afs.collection<Sale>(`/db/mandaditos/sales`
      , ref => ref.orderBy("createdAt", 'desc').where("createdAt", ">", begin)
        .where("createdAt", "<=", end)).valueChanges().pipe(
          shareReplay(1)
        )
  }

  onSaveSale(sale: Sale, type: string): Observable<firebase.firestore.WriteBatch> {
    let saleRef: DocumentReference = this.afs.firestore.collection(`/db/mandaditos/sales`).doc(sale.id);
    let userRef: DocumentReference = this.afs.firestore.collection(`/users/${sale.createdBy.uid}/sales`).doc(sale.id);
    let updateData: Object = {}
    let saleData: Sale = sale;
    let date = new Date();

    let batch = this.afs.firestore.batch();
    return this.auth.user$.pipe(
      take(1),
      map(user => {
        if (type == 'Confirmar') {
          saleData.confirmedAt = date;
          saleData.confirmedBy = user;
          saleData.status = 'Confirmado';
          updateData = {
            confirmedProductList: sale.confirmedProductList,
            confirmedAt: date,
            confirmedBy: user,
            totalConfirmedPrice: sale.totalConfirmedPrice,
            deliveryConfirmedPrice: sale.deliveryConfirmedPrice,
            status: 'Confirmado'
          }
        }
        if (type == 'Despachar') {
          saleData.dispatchedAt = date;
          saleData.dispatchedBy = user;
          saleData.status = 'En reparto'
          updateData = {
            dispatchedAt: date,
            dispatchedBy: user,
            driver: sale.driver,
            status: 'En reparto'
          }
        }
        if (type == 'Cancelar') {
          saleData.cancelledAt = date;
          saleData.cancelledBy = user;
          saleData.status = 'Cancelado'
          updateData = {
            cancelledAt: date,
            cancelledBy: user,
            status: 'Cancelado'
          }
        }
        if (type == 'Rate') {
          saleData = { ...sale };
          delete saleData.correlative;
          delete saleData.id;
          updateData = {
            rateData: sale.rateData
          }
        }
        batch.set(saleRef, saleData, { merge: true });
        batch.update(userRef, updateData)
        return batch;

      }))
  }

  getDriverList(): Observable<User[]> {
    return this.afs.collection<User>(`/users`, ref => ref.where('driver', '==', true))
      .valueChanges().pipe(
        shareReplay(1)
      );
  }

  getAdminList(): Observable<User[]> {
    return this.afs.collection<User>(`/users`, ref => ref.where('admin', '==', true))
      .valueChanges().pipe(
        shareReplay(1)
      );
  }

  getUsers(): Observable<User[]> {
    return this.afs.collection<User>(`/users`, ref => ref.orderBy("displayName", 'asc'))
      .valueChanges().pipe(
        shareReplay(1)
      );
  }

  getCustomers(): Observable<User[]> {
    return this.afs.collection<User>(`/users`, ref => ref.where('salesCount', '>', 0))
      .valueChanges().pipe(
        shareReplay(1)
      );
  }


  calculateTotalTicketLength(sale: Sale) {
    let individualLength = 0;
    // sale.confirmedProductList.forEach(el => {
    //   individualLength++;
    // });
    sale.confirmedProductList.forEach(prod => {
      if (!prod.product.ref) {
        if (!prod.product.promo) {
          //No ref no promo
        } else {
          //no ref, but promo
          individualLength = individualLength + 2;
          if (prod.quantity % prod.product.promoData.quantity) {
            individualLength = individualLength + 3;
          }
        }
      } else {
        if (!prod.product.promo) {
          //ref but no promo
          individualLength = individualLength + 2;
        } else {
          //ref and promo
          individualLength = individualLength + 2;
          if (prod.quantity % prod.product.promoData.quantity) {
            individualLength = individualLength + 4;
          }
        }
      }
    })

    /////
    individualLength += sale.confirmedProductList.length;

    return individualLength
  }

  cutTextTicket(doc: any, text: string, width: number): string {
    if (doc.getTextWidth(text) >= width) {
      //Cut description
      let descriptionSliced = "ERROR";
      for (let j = text.length; j > 0; j--) {
        if (doc.getTextWidth(text.slice(0, j)) < width) {
          descriptionSliced = text.slice(0, j);
          j = 0;
          return this.toTitleCase(descriptionSliced);
        };
      }
    }

    else {
      //Original description
      return this.toTitleCase(text);

    }

  }

  toTitleCase(str): string {
    return str.replace(
      /\w\S*/g,
      function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      }
    );
  }

  printTicket(sale: Sale) {

    var doc = new jsPDF({
      unit: 'pt',
      format: [414, 403 + 21 * (this.calculateTotalTicketLength(sale) + 5)],
      orientation: 'p'
    });

    doc.setFontStyle("bold");
    doc.setFontSize(15),
      doc.text("TICKET T001 - " + sale.correlative.toString().padStart(6, "0"), 207, 54, {
        align: "center",
        baseline: "bottom"
      });

    doc.text("MANDADITOS AQP", 207, 98, {
      align: "center",
      baseline: "bottom"
    });

    doc.setFontStyle('normal'),
      doc.text(sale.location.number, 207, 119, {
        align: "center",
        baseline: "bottom"
      });

    doc.text("www.mandaditosaqp.com", 207, 140, {
      align: "center",
      baseline: "bottom"
    });

    doc.text("Cliente", 29, 201, {
      align: "left",
      baseline: "bottom"
    });

    doc.text(this.cutTextTicket(doc, sale.createdBy.displayName, 190) + " / " + sale.location.number,
      117, 201, {
      align: "left",
      baseline: "bottom"
    });

    doc.text("Dirección", 29, 223, {
      align: "left",
      baseline: "bottom"
    });

    doc.text(this.cutTextTicket(doc, sale.location.address, 260), 117, 223, {
      align: "left",
      baseline: "bottom"
    });

    doc.setFontSize(14),
      doc.line(22, 243, 392, 243);
    doc.setFontStyle('bold');

    doc.text("Cant.", 39, 265, {
      align: "left",
      baseline: "bottom"
    });

    doc.text("Descrip.", 147, 265, {
      align: "left",
      baseline: "bottom"
    });

    doc.text("Precio", 337, 265, {
      align: "left",
      baseline: "bottom"
    });

    doc.line(22, 272, 392, 272);

    //Inside elements
    doc.setFontStyle('normal');

    for (let i = 0, aux = 0; i < this.calculateTotalTicketLength(sale); i++, aux++) {
      let productList = sale.confirmedProductList[aux];

      doc.setFontSize(14),
        doc.setFontStyle('normal');
      doc.text(productList.quantity.toFixed(2) + " " + (productList.product.ref ?
        productList.product.refUnit : productList.product.unit), 85, 303 + 21 * i, {
        align: "right",
        baseline: "bottom"
      });

      doc.setFontStyle('bold');

      //Cutting text
      doc.text(this.cutTextTicket(doc, productList.product.description, 220), 98, 303 + 21 * i, {
        align: "left",
        baseline: "bottom",
      });

      doc.setFontStyle('normal');
      doc.text("S/. ", 327, 303 + 21 * i, {
        align: "left",
        baseline: "bottom"
      });

      doc.text(productList.price.toFixed(2), 391, 303 + 21 * i, {
        align: "right",
        baseline: "bottom"
      });

      //entering details of each element
      doc.setFontSize(14);
      if (!productList.product.ref) {
        if (!productList.product.promo) {
          //No ref no promo
        } else {
          //no ref, but promo
          i++
          doc.text('OFERTA: ' + productList.product.promoData.quantity + " " + productList.product.unit +
            ' x S/.' + productList.product.promoData.promoPrice.toFixed(2),
            98, 303 + 21 * i, {
            align: "left",
            baseline: "bottom",
          });
          i++
          doc.text('Cantidad de ofertas: ' + Math.floor(productList.quantity / productList.product.promoData.quantity),
            98, 303 + 21 * i, {
            align: "left",
            baseline: "bottom",
          });
          if (productList.quantity % productList.product.promoData.quantity) {
            i++
            doc.text('Precio sin oferta: S/. ' + productList.product.price + "/" + productList.product.unit,
              98, 303 + 21 * i, {
              align: "left",
              baseline: "bottom",
            });
            i++
            doc.text('Cantidad sin oferta: ' + productList.quantity % productList.product.promoData.quantity,
              98, 303 + 21 * i, {
              align: "left",
              baseline: "bottom",
            });
            i++
            doc.text('Precio adicional: S/.' + ((productList.quantity % productList.product.promoData.quantity) * productList.product.price).toFixed(2),
              98, 303 + 21 * i, {
              align: "left",
              baseline: "bottom",
            });
          }
        }
      } else {
        if (!productList.product.promo) {
          //ref but no promo
          i++;
          doc.text('Precio real: S/.' + productList.product.price.toFixed(2) + "/" + productList.product.unit,
            98, 303 + 21 * i, {
            align: "left",
            baseline: "bottom",
          });
          i++;
          doc.text('Peso real: ' + productList.noRefQuantity + " " + productList.product.unit,
            98, 303 + 21 * i, {
            align: "left",
            baseline: "bottom",
          });
        } else {
          //ref and promo
          i++
          doc.text('OFERTA: ' + productList.product.promoData.quantity + " " + productList.product.refUnit +
            ' x S/.' + productList.product.promoData.promoPrice.toFixed(2),
            98, 303 + 21 * i, {
            align: "left",
            baseline: "bottom",
          });
          i++
          doc.text('Cantidad de ofertas: ' + Math.floor(productList.quantity / productList.product.promoData.quantity),
            98, 303 + 21 * i, {
            align: "left",
            baseline: "bottom",
          });
          if (productList.quantity % productList.product.promoData.quantity) {
            i++
            doc.text('Cantidad ref. sin oferta: ' + productList.quantity % productList.product.promoData.quantity +
              ' ' + productList.product.refUnit,
              98, 303 + 21 * i, {
              align: "left",
              baseline: "bottom",
            });
            i++
            doc.text('Peso real sin oferta: ' + productList.noRefQuantity + " " + productList.product.unit,
              98, 303 + 21 * i, {
              align: "left",
              baseline: "bottom",
            });
            i++
            doc.text('Precio real sin oferta: S/.' + productList.product.price + "/" + productList.product.unit,
              98, 303 + 21 * i, {
              align: "left",
              baseline: "bottom",
            });
            i++
            doc.text('Precio adicional: S/.' + (productList.quantity % productList.product.promoData.quantity ?
              productList.noRefQuantity * productList.product.price : 0).toFixed(2),
              98, 303 + 21 * i, {
              align: "left",
              baseline: "bottom",
            });
          }
        }
      }

      if (i == this.calculateTotalTicketLength(sale) - 1) {
        doc.setFontSize(17);

        doc.line(22, 328 + 21 * i, 392, 328 + 21 * i);

        doc.text('Sub-total', 202, 358 + 21 * i, {
          align: "left",
          baseline: "bottom"
        });

        doc.text("S/. ", 300, 358 + 21 * i, {
          align: "left",
          baseline: "bottom"
        });

        doc.text(sale.totalConfirmedPrice.toFixed(2), 391, 358 + 21 * i, {
          align: "right",
          baseline: "bottom"
        });

        doc.text('Delivery', 202, 381 + 21 * i, {
          align: "left",
          baseline: "bottom"
        });

        doc.text("S/.", 300, 381 + 21 * i, {
          align: "left",
          baseline: "bottom"
        });

        doc.text(sale.deliveryConfirmedPrice.toFixed(2), 391, 381 + 21 * i, {
          align: "right",
          baseline: "bottom"
        });

        doc.line(22, 396 + 21 * i, 392, 396 + 21 * i);

        doc.setFontStyle('bold');
        doc.setFontSize(20);

        doc.text("TOTAL", 202, 426 + 21 * i, {
          align: "left",
          baseline: "bottom"
        });

        doc.text("S/. " + (sale.deliveryConfirmedPrice + sale.totalConfirmedPrice).toFixed(2), 391, 426 + 21 * i, {
          align: "right",
          baseline: "bottom"
        });

        doc.setFontStyle('normal');
        doc.setFontSize(14);
        doc.text("----- Gracias por su preferencia -----", 207, 516 + 21 * i, {
          align: "center",
          baseline: "bottom"
        });

      }
    }

    saveAs(doc.output('blob'),
      "T001-" + sale.correlative.toString().padStart(6, "0") + "_" + sale.createdBy.displayName.split(" ").join("-") + ".pdf");

  }

  getBanners(tpe: string): Observable<Banner[]> {
    return this.afs.collection<Banner>(`/db/mandaditos/banners`, ref => ref.where('type', '==', tpe))
      .valueChanges().pipe(
        shareReplay(1)
      );
  }

  getConfi(): Observable<any> {
    return this.afs.collection(`/db`).doc('mandaditos').valueChanges().pipe(
      /*
      startWith({
        logoURL: localStorage.getItem('logoURL') ? localStorage.getItem('logoURL'): null,
        logomovilURL: localStorage.getItem('logomovilURL') ? localStorage.getItem('logomovilURL') :null,
        meta: localStorage.getItem('meta') ? localStorage.getItem('meta') :null
      }),*/
      tap(res => {
        if (res['logoURL']) {
          this.document.getElementById('appFavicon').setAttribute('href', res['logoURL'])
          this.logoURL = res['logoURL']
          this.logomovilURL = res['logomovilURL'] ? res['logomovilURL'] : null
          /*localStorage.setItem('logoURL', res['logoURL'])
          localStorage.setItem('logomovilURL', res['logomovilURL'])*/
        }
      }),
      shareReplay(1)
    );
  }

  getDefault(): Observable<any> {
    this.defaultImage$ = this.afs.collection(`/db`).doc('mandaditos').valueChanges().pipe(
      startWith({
        logoURL: localStorage.getItem('defaultURL') ? localStorage.getItem('defaultURL') : null,
      }),
      map(res => {
        if (res['defaultURL']) {
          localStorage.setItem('defaultURL', res['defaultURL'])
        }
        return res['defaultURL']
      }),
      shareReplay(1)
    );
    return this.defaultImage$
  }
}
