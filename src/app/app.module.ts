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
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

// Firebase tooling
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';

import { APP_ROUTES } from './app.routes';
import { SharedModule } from './modules/shared';
import { AppComponent, NavigationComponent, PageNotFoundComponent, HomeComponent, LoginComponent } from './core';
import { environment } from '../environments/environment';

@NgModule({
  declarations: [
    AppComponent,
    NavigationComponent,
    PageNotFoundComponent,
    HomeComponent,
    LoginComponent
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
    MatInputModule,
    MatFormFieldModule,
    FormsModule,

    // Firebase tooling
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    // DON'T include AngularFireAuth here, or it causes an error
    // https://github.com/angular/angularfire/issues/2351
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
