import { Injectable, NgZone } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RoutesAngularFirestore extends AngularFirestore { }

@Injectable({
  providedIn: 'root'  
})
export class CheckinAngularFirestore extends AngularFirestore { }

export function RoutesAngularFirestoreFactory(platformId: Object, zone: NgZone): RoutesAngularFirestore {
  return new RoutesAngularFirestore(environment.firebaseConfigRoutes, 'gt-recycling', false, null, platformId, zone, null);
}
export function CheckinAngularFirestoreFactory(platformId: Object, zone: NgZone): CheckinAngularFirestore {
  return new CheckinAngularFirestore(environment.firebaseConfigCheckin, 'gt-recycling', false, null, platformId, zone, null);
}
