import { NgModule, PLATFORM_ID, NgZone } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LayoutModule } from '@angular/cdk/layout';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';

// Firebase tooling
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';

import { APP_ROUTES } from './app.routes';
import { SharedModule } from './modules/shared';
import { AppComponent, NavigationComponent, PageNotFoundComponent, HomeComponent } from './core';
import { environment } from '../environments/environment';

// multiple-app Firebase solution taken from https://github.com/angular/angularfire/issues/1026#issuecomment-387328730

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
    BrowserModule,
    BrowserAnimationsModule,
    LayoutModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatCardModule,

    // Firebase tooling
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
