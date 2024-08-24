import { Component } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Storage } from '@ionic/storage-angular';
import { TabsPage } from '../tabs/tabs.page';
import { ModalController } from '@ionic/angular';
import { AddCustomerPage } from '../add-customer/add-customer.page';
import { TextCustomerPage } from '../text-customer/text-customer.page';
var $ = require('jquery');

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
})
export class Tab1Page {
  public userID;
  public firebaseUID;
  public firebaseName;
  public restaurantLogo;
  public itemList: any;
  public itemListReverse: any;
  public numItems: any;
  public items = [];
  public tab;

  public readyToOrderTotal: number;
  public waitingCustomersTotal: number;
  public onHoldTotal: number;
  public erroredOrders = [];

  constructor(
    public afd: AngularFireDatabase,
    public tabsPage: TabsPage,
    public modalController: ModalController,
    public storage: Storage
  ) {
    this.tab = 'waiting';

    this.getItems(this.getCurrentDate());
    if (localStorage.getItem('firebaseUID')) {
      this.firebaseUID = localStorage
        .getItem('firebaseUID')
        .replace(/['"]+/g, '');
      this.setData(this.firebaseUID);
    }
  }

  ionViewWillEnter() {
    this.tabsPage.getTabTotals();
  }

  setData(firebaseUID) {
    this.afd
      .object('users/clients/' + firebaseUID)
      .valueChanges()
      .subscribe((res: any) => {
        localStorage.setItem('restaurantName', res.restaurantName);
        localStorage.setItem('firebaseName', res.firebaseName);
        localStorage.setItem('restaurantLogo', res.restaurantLogo);
        this.restaurantLogo = res.restaurantLogo.replace(/['"]+/g, '');
        localStorage.setItem('restaurantType', res.restaurantType);
        localStorage.setItem('restaurantEmail', res.email);
        localStorage.setItem('planType', res.planType);
        localStorage.setItem('phone', res.phone);
        localStorage.setItem('email', res.email);
        localStorage.setItem('openStatus', res.openStatus);
      });
  }

  getCurrentDate() {
    // Get date info
    let d = new Date();
    let month = d.getMonth() + 1;
    let day = d.getDate();
    let year = d.getFullYear();
    let date = month + '-' + day + '-' + year;
    // let date = '8-14-2020';

    return date;
  }

  getItems(date) {
    // Pull items from Firebase to be displayed
    this.itemList = this.afd
      .list(
        'restaurants/' + localStorage.getItem('firebaseName') + '/' + date + '/'
      )
      .valueChanges();
    this.afd
      .list(
        'restaurants/' + localStorage.getItem('firebaseName') + '/' + date + '/'
      )
      .valueChanges()
      .subscribe((data) => {
        this.numItems = data.length;
        return data;
      });

    this.getOrderData('waiting');
    this.getOrderData('ready');
    this.getOrderData('on-hold');
  }

  getOrderData(status) {
    // Get completed orders
    this.afd
      .list(
        'restaurants/' +
          localStorage.getItem('firebaseName') +
          '/' +
          this.getCurrentDate() +
          '/',
        (ref) => ref.orderByChild('status').equalTo(status)
      )
      .snapshotChanges()
      .subscribe((res) => {
        let tempArray: any = [];
        res.forEach((e) => {
          tempArray.push(e.payload.val());
        });

        if (status == 'waiting') {
          this.waitingCustomersTotal = tempArray.length;
        } else if (status == 'ready') {
          this.readyToOrderTotal = tempArray.length;
        } else if (status == 'waiting') {
          this.waitingCustomersTotal = tempArray.length;
        } else if (status == 'on-hold') {
          this.onHoldTotal = tempArray.length;
        } else {
          this.erroredOrders = tempArray;
        }
      });
  }

  getTime() {
    // Get time info.
    let d = new Date();
    let hours = d.getHours();
    let minutes = d.getMinutes();
    let minutesString;
    let time;

    // Check whether AM or PM
    var newformat = hours >= 12 ? 'PM' : 'AM';

    // Find current hour in AM-PM Format
    hours = hours % 12;

    // To display "0" as "12"
    hours = hours ? hours : 12;
    minutesString = minutes < 10 ? '0' + minutes : minutes;

    // Format the date and time
    time = hours + ':' + minutesString + ' ' + newformat;

    return time;
  }

  statusUpdate(e, status) {
    // collect data from event
    let itemInfo = e.target.id.split('|');
    let itemKey = itemInfo[0];
    let phone = itemInfo[1];
    let date = this.getCurrentDate();
    let time = this.getTime();
    let payload;

    // create payload based on status
    if (status == 'cancelled') {
      payload = {
        status: status,
        text: status + '|' + phone,
        time_cancelled: time,
      };
    } else if (status == 'complete') {
      payload = {
        status: status,
        text: status + '|' + phone,
        time_complete: time,
      };
    } else if (status == 'in-progress') {
      payload = {
        status: status,
        text: status + '|' + phone,
        time_inProgress: time,
      };
    } else {
      payload = {
        status: status,
        text: status + '|' + phone,
      };
    }

    console.log(payload);

    this.afd
      .object(
        'restaurants/' +
          localStorage.getItem('firebaseName') +
          '/' +
          date +
          '/' +
          itemKey
      )
      .update(payload);
    this.tabsPage.getTabTotals();
  }

  async addCustomerModal() {
    const modal = await this.modalController.create({
      component: AddCustomerPage,
    });
    return await modal.present();
  }

  async textCustomerModal(e) {
    let itemInfo = e.target.id.split('|');
    let itemKey = itemInfo[0];
    let phone = itemInfo[1];
    let itemKeySplit = itemKey.split('_');
    let name = itemKeySplit[1];

    const modal = await this.modalController.create({
      component: TextCustomerPage,
      componentProps: {
        phoneNumber: phone,
        itemKey: itemKey,
        name: name,
      },
    });
    return await modal.present();
  }

  debug() {
    if (localStorage.getItem('debug') !== 'true') {
      localStorage.setItem('debug', 'true');
      localStorage.setItem('loggedIn', 'true');
      localStorage.setItem('firebaseName', 'popupDFW');
      localStorage.setItem('firebaseUID', 'nyOszrxRuNbMynNBZGu5PubBEhc2');
    } else {
      $('.debugBtn').text('Clear');
      localStorage.clear();
    }
  }

  segmentChanged(e) {
    console.log(e);
  }
}
