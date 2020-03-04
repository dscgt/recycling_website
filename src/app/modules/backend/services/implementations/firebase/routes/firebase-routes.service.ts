import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentReference } from '@angular/fire/firestore';
import { IBackendRoutes } from '../../../interfaces/routes';
import { Observable, of, zip } from 'rxjs';
import { IRoute, IRouteRecord, ICrewmember, IRouteStop, IField } from 'src/app/modules/backend/types';
import 'firebase/firestore';
import { switchMap, map } from 'rxjs/operators';
import { IFirestoreRouteRecord, IFirestoreRoute, IFirestoreCrewmember } from '../types';
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
    const rawRoute$: Observable<IFirestoreRoute> = this.helper.getReference$<IFirestoreRoute>(rawRecord.route);
    const route$: Observable<IRoute> = this.convertRoute$(rawRoute$);
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

  private convertRoute(rawRoute: IFirestoreRoute): Observable<IRoute> {
    const field$s: Observable<IField>[] = rawRoute.stopData.fields.map(
      (field: DocumentReference): Observable<IField> => {
        return this.helper.getReference$<IField>(field);
      }
    );
    const fields$: Observable<IField[]> = zip<Observable<IField>>(...field$s);
    const stop$s: Observable<IRouteStop>[] = rawRoute.stopData.stops.map(
      (stop: DocumentReference): Observable<IRouteStop> => {
        return this.helper.getReference$<IRouteStop>(stop);
      }
    );
    const stops$: Observable<IRouteStop[]> = zip<Observable<IRouteStop>>(...stop$s);
    return zip<Observable<IField[]>, Observable<IRouteStop[]>>(fields$, stops$).pipe(
      map(([fields, stops]: [IField[], IRouteStop[]]): IRoute => {
        const route: IRoute = { ...rawRoute } as unknown as IRoute;
        route.stopData.fields = fields;
        route.stopData.stops = stops;
        return route;
      })
    );
  }

  private convertRoute$(rawRoute$: Observable<IFirestoreRoute>): Observable<IRoute> {
    return rawRoute$.pipe(
      switchMap((rawRoute: IFirestoreRoute): Observable<IRoute> => {
        return this.convertRoute(rawRoute);
      })
    );
  }

  public getRecords(): Observable<IRouteRecord[]> {
    return this.recordsCollection.valueChanges().pipe(
      switchMap((rawRecords: IFirestoreRouteRecord[]): Observable<IRouteRecord[]> => {
        const record$s: Observable<IRouteRecord>[] = rawRecords.map(
          (rawRecord: IFirestoreRouteRecord): Observable<IRouteRecord> => {
            return this.convertRecord(rawRecord);
          }
        );
        return zip<Observable<IRouteRecord>>(...record$s);
      })
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
}
