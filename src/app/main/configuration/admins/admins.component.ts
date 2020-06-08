import { AngularFirestore } from '@angular/fire/firestore';
import { FormControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { tap, filter, startWith, map } from 'rxjs/operators';
import { User } from './../../../core/models/user.model';
import { Observable, combineLatest, BehaviorSubject } from 'rxjs';
import { DatabaseService } from 'src/app/core/database.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-admins',
  templateUrl: './admins.component.html',
  styleUrls: ['./admins.component.css']
})
export class AdminsComponent implements OnInit {

  loadingAdmin = new BehaviorSubject<boolean>(false);
  loadingAdmin$ = this.loadingAdmin.asObservable();

  dataSource = new MatTableDataSource();
  displayedColumns: string[] = ['index', 'name', 'email', 'delete'];

  @ViewChild("paginatorAdmin", { static: false }) set content(paginator: MatPaginator) {
    this.dataSource.paginator = paginator;
  }

  loadingDriver = new BehaviorSubject<boolean>(false);
  loadingDriver$ = this.loadingDriver.asObservable();

  dataSource2 = new MatTableDataSource();
  displayedColumns2: string[] = ['index', 'name', 'email', 'delete'];

  @ViewChild("paginatorDriver", { static: false }) set content2(paginator: MatPaginator) {
    this.dataSource2.paginator = paginator;
  }

  loadingDistrict = new BehaviorSubject<boolean>(false);
  loadingDistrict$ = this.loadingDistrict.asObservable();


  dataSource3 = new MatTableDataSource();
  displayedColumns3: string[] = ['name', 'delivery', 'delete'];

  @ViewChild("paginatorDistrict", { static: false }) set content3(paginator: MatPaginator) {
    this.dataSource3.paginator = paginator;
  }

  drivers$: Observable<User[]>;
  admins$: Observable<User[]>;
  districts$: Observable<object[]>

  filteredUsers$: Observable<User[]>;
  filteredUsers2$: Observable<User[]>;

  userForm = new FormControl('')
  driverForm = new FormControl('')

  existDistrict: Array<any> = []
  districtForm: FormGroup

  repeat$: Observable<boolean>

  contactForm: FormGroup
  contact$: Observable<any>

  loadingContact = new BehaviorSubject<boolean>(false);
  loadingContact$ = this.loadingContact.asObservable();

  p1: number = 1;
  p2: number = 1;
  p3: number = 1;

  constructor(
    private fb: FormBuilder,
    private af: AngularFirestore,
    public dbs: DatabaseService
  ) { }

  ngOnInit() {
    this.districtForm = this.fb.group({
      name: ['', Validators.required],
      delivery: ['', Validators.required]
    })

    this.contactForm = this.fb.group({
      phone: [null, [Validators.required, Validators.minLength(6), Validators.maxLength(9)]],
      facebook: ['', Validators.required]
    })

    this.districts$ = this.dbs.getDistricts().pipe(
      tap(res => {
        if (res) {
          this.dataSource3.data = res
          this.existDistrict = res
        }

      })
    )

    this.drivers$ = this.dbs.getDriverList().pipe(
      tap(res => {
        this.dataSource2.data = res.map((el, i) => {
          return {
            ...el,
            index: i + 1
          }
        })
      })
    )

    this.admins$ = this.dbs.getAdminList().pipe(
      tap(res => {
        this.dataSource.data = res.map((el, i) => {
          return {
            ...el,
            index: i + 1
          }
        })
      })
    )

    this.filteredUsers$ = combineLatest(
      this.dbs.getUsers(),
      this.userForm.valueChanges.pipe(
        filter(input => input !== null),
        startWith<any>(''),
        map(value => typeof value === 'string' ? value.toLowerCase() : value.displayName.toLowerCase()))
    ).pipe(
      map(([users, name]) => {
        let noAdmins = users.filter(el => !el['admin'])
        return name ? noAdmins.filter(option => option['displayName'].toLowerCase().includes(name)) : noAdmins;
      })
    );

    this.filteredUsers2$ = combineLatest(
      this.dbs.getUsers(),
      this.driverForm.valueChanges.pipe(
        filter(input => input !== null),
        startWith<any>(''),
        map(value => typeof value === 'string' ? value.toLowerCase() : value.displayName.toLowerCase()))
    ).pipe(
      map(([users, name]) => {
        let noAdmins = users.filter(el => !el['driver'])
        return name ? noAdmins.filter(option => option['displayName'].toLowerCase().includes(name)) : noAdmins;
      })
    );

    this.repeat$ = combineLatest(
      this.dbs.getDistricts(),
      this.districtForm.get('name').valueChanges.pipe(
        startWith(''))
    )
      .pipe(
        map(([array, district]) => {
          if (array) {
            return district ? array.map(el => el['name'].toLowerCase()).includes(district.toLowerCase()) : false
          } else {
            return false
          }

        })
      )

    this.contact$ = this.dbs.getContact().pipe(
      tap(res => {
        if (res) {
          this.contactForm.setValue({
            phone: res['phone'],
            facebook: res['facebook']
          })
        }

      })
    )
  }

  showSelectedUser(staff): string | undefined {
    return staff ? staff['displayName'] : undefined;
  }

  addAdmin() {
    let user = this.userForm.value
    if (user.uid) {
      this.loadingAdmin.next(true)
      const batch = this.af.firestore.batch()
      const ref = this.af.firestore.collection(`users`).doc(user.uid);
      batch.update(ref, {
        admin: true
      })
      batch.commit().then(() => {
        this.loadingAdmin.next(false)
        this.userForm.setValue('');
      })
    }
  }

  deleteAdmin(user) {
    this.loadingAdmin.next(true)
    const batch = this.af.firestore.batch()
    const ref = this.af.firestore.collection(`users`).doc(user.uid);
    batch.update(ref, {
      admin: false
    })
    batch.commit().then(() => {
      this.loadingAdmin.next(false)
    })
  }

  addDriver() {
    let user = this.driverForm.value
    if (user.uid) {
      this.loadingDriver.next(true)
      const batch = this.af.firestore.batch()
      const ref = this.af.firestore.collection(`users`).doc(user.uid);
      batch.update(ref, {
        driver: true
      })
      batch.commit().then(() => {
        this.loadingDriver.next(false)
        this.driverForm.setValue('');
      })
    }
  }

  deleteDriver(user) {
    this.loadingDriver.next(true)
    const batch = this.af.firestore.batch()
    const ref = this.af.firestore.collection(`users`).doc(user.uid);
    batch.update(ref, {
      driver: false
    })
    batch.commit().then(() => {
      this.loadingDriver.next(false)
    })
  }

  addDistrict() {
    let district = this.districtForm.value
    this.existDistrict.push(district)
    this.loadingDistrict.next(true)
    this.updateDistrict()
    this.districtForm.setValue({
      name: '',
      delivery: null
    })
  }

  deleteDistrict(district) {
    let index = this.existDistrict.findIndex(el => el['name'] == district['name'])
    this.existDistrict.splice(index, 1)
    this.loadingDistrict.next(true)
    this.updateDistrict()
  }

  editDistrict(district) {
    this.districtForm.setValue(district)
    this.deleteDistrict(district)
  }

  updateDistrict() {
    const batch = this.af.firestore.batch()
    const ref = this.af.firestore.collection(`/db`).doc('mandaditos')
    batch.update(ref, {
      districts: this.existDistrict
    })
    batch.commit().then(() => {
      this.loadingDistrict.next(false)

    })
  }

  saveContact() {
    this.loadingContact.next(false)
    const batch = this.af.firestore.batch()
    const ref = this.af.firestore.collection(`/db`).doc('mandaditos')
    batch.update(ref, {
      contact: this.contactForm.value
    })
    batch.commit().then(() => {
      this.loadingContact.next(false)

    })
  }

}
