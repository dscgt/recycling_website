import { Injectable } from '@angular/core';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { IBackendRoutes } from '../../../interfaces/routes';
import { Observable, zip } from 'rxjs';
import { IRoute, IRouteRecord, ICrewmember } from 'src/app/modules/backend/types';
import 'firebase/firestore';
import { switchMap, map } from 'rxjs/operators';
import { IFirestoreRouteRecord, IFirestoreCrewmember } from '../types';
import { FirebaseHelperService } from '../helper';

// NOTE: w/ RxJS for some reason zip([observable1, observable2]) does not behave correctly
//               instead do zip(...[observable1, observable2]) instead to unroll array

@Injectable({
  providedIn: 'root'
})
export class FirebaseRoutesService implements IBackendRoutes {
  private recordsCollection: AngularFirestoreCollection<IFirestoreRouteRecord>;
  private routesCollection: AngularFirestoreCollection<IRoute>;

  constructor(
    private readonly firestore: AngularFirestore,
    private helper: FirebaseHelperService
  ) {
    this.recordsCollection = this.firestore.collection<IFirestoreRouteRecord>('records');
    this.routesCollection = this.firestore.collection<IRoute>('routes');
  }

  private convertRecord(rawRecord: IFirestoreRouteRecord): Observable<IRouteRecord> {
    const rawCrewmember$: Observable<IFirestoreCrewmember> = this.helper.getReference$<IFirestoreCrewmember>(rawRecord.crewmember);
    const crewmember$: Observable<ICrewmember> = this.helper.convertCrewmember$(rawCrewmember$);
    const route$: Observable<IRoute> = this.helper.getReference$<IRoute>(rawRecord.route);
    return zip<Observable<ICrewmember>, Observable<IRoute>>(crewmember$, route$).pipe(
      map(([crewmember, route]: [ICrewmember, IRoute]): IRouteRecord => {
        const record: IRouteRecord = { ...rawRecord } as unknown as IRouteRecord;
        record.crewmember = crewmember;
        record.route = route;
        record.startTime = rawRecord.startTime.toDate();
        record.endTime = rawRecord.endTime.toDate();
        return record;
      })
    );
  }

  private convertRecord$(rawRecord$: Observable<IFirestoreRouteRecord>): Observable<IRouteRecord> {
    return rawRecord$.pipe(
      switchMap((rawRecord: IFirestoreRouteRecord): Observable<IRouteRecord> => {
        return this.convertRecord(rawRecord);
      })
    );
  }

  private convertItems$<T, U>(rawItems$: Observable<T[]>, convertFn: (raw: T) => Observable<U>): Observable<U[]> {
    return rawItems$.pipe(
      switchMap((rawItems: T[]): Observable<U[]> => {
        const item$s: Observable<U>[] = rawItems.map(
          (rawItem: T): Observable<U> => convertFn(rawItem)
        );
        return zip<Observable<U>>(...item$s);
      })
    );
  }

  public getRecords(): Observable<IRouteRecord[]> {
    return this.convertItems$<IFirestoreRouteRecord, IRouteRecord>(
      this.recordsCollection.valueChanges(),
      (record: IFirestoreRouteRecord): Observable<IRouteRecord> => this.convertRecord(record)
    );
  }

  public getRecord(id: number): Observable<IRouteRecord> {
    throw new Error("Method not implemented.");
  }

  public getRoutes(): Observable<IRoute[]> {
    return this.routesCollection.valueChanges();
  }

  public getRoute(id: number): Observable<IRoute> {
    throw new Error("Method not implemented.");
  }

  public addRoute(route: IRoute): void {
    this.routesCollection.add(route);
  }
}
