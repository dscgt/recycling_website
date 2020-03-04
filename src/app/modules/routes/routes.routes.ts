import { ManageRoutesComponent, RouteRecordsComponent } from './pages';

// taken from Shai Reznik: https://medium.com/@shairez/angular-routing-a-better-pattern-for-large-scale-apps-f2890c952a18

export const ROUTES_ROUTES = [
  { path: 'manage', component: ManageRoutesComponent },
  { path: 'records', component: RouteRecordsComponent },
  { path: '', redirectTo: 'manage', pathMatch: 'full' },
];
