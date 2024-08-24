import { Platform } from '@ionic/angular';
import { Component } from '@angular/core';
import { environment } from '../environments/environment';
import { initializeApp } from 'firebase/app';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(private platform: Platform) {
    this.initializeApp();
  }

  title = 'app';
  elementType = 'url';
  value = 'Techiediaries';

  initializeApp() {
    initializeApp(environment.firebaseConfig);
  }
}
