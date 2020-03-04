import { PageNotFoundComponent, HomeComponent } from './core';

// taken from Shai Reznik: https://medium.com/@shairez/angular-routing-a-better-pattern-for-large-scale-apps-f2890c952a18

export const APP_ROUTES = [
  { path: 'home', component: HomeComponent },
  {
    path: 'routes',
    loadChildren: () => import('./modules/routes/routes.module').then(m => m.RoutesModule)
  },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', component: PageNotFoundComponent }
];
