import { PageNotFoundComponent, HomeComponent, LoginComponent } from './core';
import { AngularFireAuthGuard, redirectUnauthorizedTo, redirectLoggedInTo } from '@angular/fire/auth-guard';

// taken from Shai Reznik: https://medium.com/@shairez/angular-routing-a-better-pattern-for-large-scale-apps-f2890c952a18

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['login']);
const redirectAuthorizedToHome = () => redirectLoggedInTo(['home']);

export const APP_ROUTES = [
  { 
    path: 'login', 
    component: LoginComponent, 
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: redirectAuthorizedToHome }
  },
  { path: 'home', component: HomeComponent, 
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin } 
  },
  {
    path: 'routes',
    loadChildren: () => import('./modules/routes/routes.module').then(m => m.RoutesModule),
    canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin },
  },
  {
    path: 'checkin',
    loadChildren: () => import('./modules/checkin/checkin.module').then(m => m.CheckinModule),
    canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin }
  },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', component: PageNotFoundComponent }
];
