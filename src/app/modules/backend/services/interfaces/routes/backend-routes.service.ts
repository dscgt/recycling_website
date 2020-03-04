import { Injectable } from '@angular/core';
import { FirebaseRoutesService, FirebaseHelperService } from '../../implementations/firebase';
import { Observable } from 'rxjs';
import { IBackendRoutes } from './ibackend-routes.interface';
import { IRoute, IRouteRecord } from '../../../types';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
  useFactory: (firestore: AngularFirestore, helper: FirebaseHelperService) => {
    return new FirebaseRoutesService(firestore, helper);
  },
  deps: [
    AngularFirestore,
    FirebaseHelperService
  ]
})
export abstract class BackendRoutesService implements IBackendRoutes {
  public abstract getRecords(): Observable<IRouteRecord[]>;
  public abstract getRecord(id: number): Observable<IRouteRecord>;
  public abstract getRoutes(): Observable<IRoute[]>;
  public abstract getRoute(id: number): Observable<IRoute>;
}
