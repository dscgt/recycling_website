import { Injectable } from '@angular/core';
import { FirebaseRoutesService, FirebaseHelperService } from '../../implementations/firebase';
import { Observable } from 'rxjs';
import { IBackendRoutes } from './ibackend-routes.interface';
import { IRoute, IRouteRecord, IRouteGroup } from '../../../types';
import { RoutesAngularFirestore } from '../../factory/factory.service';

@Injectable({
  providedIn: 'root',
  useFactory: (firestore: RoutesAngularFirestore, helper: FirebaseHelperService) => {
    return new FirebaseRoutesService(firestore, helper);
  },
  deps: [
    RoutesAngularFirestore,
    FirebaseHelperService
  ]
})
export abstract class BackendRoutesService implements IBackendRoutes {
  public abstract getRecords(): Observable<IRouteRecord[]>;
  public abstract getRecord(id: number): Observable<IRouteRecord>;
  public abstract getRoutes(): Observable<IRoute[]>;
  public abstract getRoute(id: number): Observable<IRoute>;
  public abstract addRoute(route: IRoute): void;
  public abstract deleteRoute(id?: string): void;
  public abstract getGroups(): Observable<IRouteGroup[]>;
  public abstract addGroup(route: IRouteGroup): void;
  public abstract deleteGroup(id?: string): void;
}
