import { ManageCheckinComponent, CheckinRecordsComponent } from './pages';

// taken from Shai Reznik: https://medium.com/@shairez/angular-routing-a-better-pattern-for-large-scale-apps-f2890c952a18

export const CHECKIN_ROUTES = [
  { path: 'manage', component: ManageCheckinComponent },
  { path: 'records', component: CheckinRecordsComponent },
  { path: '', redirectTo: 'manage', pathMatch: 'full' },
];
