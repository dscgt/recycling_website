import { Injectable } from '@angular/core';
import { FirebaseRoutesService, FirebaseHelperService } from '../../implementations/firebase';
import { Observable } from 'rxjs';
import { IBackendRoutes } from './ibackend-routes.interface';
import { IRoute, IRouteRecord, IRouteGroup } from '../../../types';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
  useFactory: (firestore: AngularFirestore) => {
    return new FirebaseRoutesService(firestore);
  },
  deps: [
    AngularFirestore,
    FirebaseHelperService
  ]
})
export abstract class BackendRoutesService implements IBackendRoutes {
  public abstract getRecords(startDate: Date, endDate: Date): Observable<IRouteRecord[]>;
  public abstract getRoutes(): Observable<IRoute[]>;
  public abstract getRoute(id: number): Observable<IRoute>;
  public abstract getGroups(): Observable<IRouteGroup[]>;
  public abstract addRoute(route: IRoute): void;
  public abstract addGroup(route: IRouteGroup): void;
  public abstract updateRoute(route: IRoute): void;
  public abstract updateRecord(record: IRouteRecord): Promise<void>;
  public abstract updateGroup(route: IRouteGroup): void;
  public abstract deleteRoute(id?: string): void;
  public abstract deleteGroup(id?: string): void;
  public abstract deleteRecord(id?: string): Promise<void>;
}
