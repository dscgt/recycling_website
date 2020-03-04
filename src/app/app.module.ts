import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LayoutModule } from '@angular/cdk/layout';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { NavigationComponent, AppComponent } from './core';
import { RouterModule } from '@angular/router';
import { APP_ROUTES } from './app.routes';
import { PageNotFoundComponent } from './core/pages/page-not-found/page-not-found.component';
import { HomeComponent } from './core/pages/home/home.component';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';

@NgModule({
  declarations: [
    AppComponent,
    NavigationComponent,
    PageNotFoundComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    LayoutModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    RouterModule.forRoot(APP_ROUTES),
    AngularFireModule.initializeApp({
      apiKey: "AIzaSyCHz8Yz0SigXL5xOioF_l2UzYpkrkdhC7Q",
      authDomain: "route-recorder-de136.firebaseapp.com",
      databaseURL: "https://route-recorder-de136.firebaseio.com",
      projectId: "route-recorder-de136",
      storageBucket: "route-recorder-de136.appspot.com",
      messagingSenderId: "53721343327",
      appId: "1:53721343327:web:f872ccfcc666c82fc7c2ea",
      measurementId: "G-6K8HWZ5GME"
    }),
    AngularFirestoreModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
