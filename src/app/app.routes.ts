import { PageNotFoundComponent, HomeComponent, LoginComponent } from './core';
import { AuthGuard } from './modules/shared/guards/auth.guard';
import { NoAuthGuard } from './modules/shared/guards/no-auth.guard';

// taken from Shai Reznik: https://medium.com/@shairez/angular-routing-a-better-pattern-for-large-scale-apps-f2890c952a18

export const APP_ROUTES = [
  { 
    path: 'login', 
    component: LoginComponent,
    canActivate: [NoAuthGuard],
  },
  { path: 'home',
    component: HomeComponent, 
    canActivate: [AuthGuard],
  },
  {
    path: 'routes',
    loadChildren: () => import('./modules/routes/routes.module').then(m => m.RoutesModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'checkin',
    loadChildren: () => import('./modules/checkin/checkin.module').then(m => m.CheckinModule),
    canActivate: [AuthGuard],
  },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', component: PageNotFoundComponent }
];
