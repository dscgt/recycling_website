import { Observable } from 'rxjs';
import { IRouteRecord, IRoute, IRouteGroup } from '../../../types';

export interface IBackendRoutes {
  getRecords(): Observable<IRouteRecord[]>;
  getRecord(id: number): Observable<IRouteRecord>;
  getRoutes(): Observable<IRoute[]>;
  getRoute(id: number): Observable<IRoute>;
  addRoute(route: IRoute): void;
  getGroups(): Observable<IRouteGroup[]>;
  addGroup(route: IRouteGroup): void;
}
