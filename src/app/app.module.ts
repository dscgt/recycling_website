import { NgModule } from '@angular/core';
import { AppComponent, NavigationComponent, PageNotFoundComponent, HomeComponent } from './core';
import { RouterModule } from '@angular/router';
import { APP_ROUTES } from './app.routes';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LayoutModule } from '@angular/cdk/layout';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { SharedModule } from './modules/shared';

@NgModule({
  declarations: [
    AppComponent,
    NavigationComponent,
    PageNotFoundComponent,
    HomeComponent
  ],
  imports: [
    RouterModule.forRoot(APP_ROUTES),
    SharedModule.forRoot(),
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
    BrowserModule,
    BrowserAnimationsModule,
    LayoutModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
