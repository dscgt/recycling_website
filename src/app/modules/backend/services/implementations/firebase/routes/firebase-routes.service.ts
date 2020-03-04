import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentReference } from '@angular/fire/firestore';
import { IBackendRoutes } from '../../../interfaces/routes';
import { Observable, EMPTY, of, zip } from 'rxjs';
import { IRoute, IRouteRecord, ICrewMember, IRouteStop, IField } from 'src/app/modules/backend/types';
import 'firebase/firestore';
import { switchMap, tap } from 'rxjs/operators';
import { IFirestoreRouteRecord } from '../types';
import { IFirestoreRoute } from '../types/ifirestore-route.interface';

// NOTE: w/ RxJS for some reason zip([observable1, observable2]) does not behave correctly
//               instead do zip(...[observable1, observable2]) instead to unroll array

@Injectable({
  providedIn: 'root'
})
export class FirebaseRoutesService implements IBackendRoutes {
  private recordsCollection: AngularFirestoreCollection<IFirestoreRouteRecord>;
  private routesCollection: AngularFirestoreCollection<IRoute>;

  constructor(
    private readonly firestore: AngularFirestore
  ) {
    this.recordsCollection = this.firestore.collection<IFirestoreRouteRecord>('records');
    this.routesCollection = this.firestore.collection<IRoute>('routes');
  }

  private getReference$<T>(ref: DocumentReference): Observable<T> {
    console.log("Call to getReference()");
    return this.firestore.doc<T>(ref).valueChanges().pipe(
      switchMap((val: T | undefined): Observable<T> => {
        if (val) {
          return of(val);
        }
        return EMPTY;
      })
    );
  }

  private convertRecord(rawRecord: IFirestoreRouteRecord): Observable<IRouteRecord> {
    console.log("Call to convertRecord()");
    const crewmember$: Observable<ICrewMember> = this.getReference$<ICrewMember>(rawRecord.crewmember);
    const rawRoute$: Observable<IFirestoreRoute> = this.getReference$<IFirestoreRoute>(rawRecord.route);
    const route$: Observable<IRoute> = this.convertRoute$(rawRoute$);
    return zip<Observable<ICrewMember>, Observable<IRoute>>(crewmember$, route$).pipe(
      switchMap(([crewmember, route]: [ICrewMember, IRoute]): Observable<IRouteRecord> => {
        const record: IRouteRecord = rawRecord as unknown as IRouteRecord;
        record.crewmember = crewmember;
        record.route = route;
        return of(record);
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
    console.log("Call to convertRoute()", rawRoute);
    const field$s: Observable<IField>[] = rawRoute.stopData.fields.map(
      (field: DocumentReference): Observable<IField> => {
        return this.getReference$<IField>(field);
      }
    );
    const fields$: Observable<IField[]> = zip<Observable<IField>>(...field$s);
    const stop$s: Observable<IRouteStop>[] = rawRoute.stopData.stops.map(
      (stop: DocumentReference): Observable<IRouteStop> => {
        return this.getReference$<IRouteStop>(stop);
      }
    );
    const stops$: Observable<IRouteStop[]> = zip<Observable<IRouteStop>>(...stop$s);
    const route$: Observable<IRoute> = zip<Observable<IField[]>, Observable<IRouteStop[]>>(fields$, stops$).pipe(
      switchMap(([fields, stops]: [IField[], IRouteStop[]]): Observable<IRoute> => {
        const route: IRoute = rawRoute as unknown as IRoute;
        route.stopData.fields = fields;
        route.stopData.stops = stops;
        return of(route);
      })
    );
    return route$;
  }

  private convertRoute$(rawRoute$: Observable<IFirestoreRoute>): Observable<IRoute> {
    console.log("Call to convertRoute$()");
    const route$: Observable<IRoute> = rawRoute$.pipe(
      tap((rawRoute: IFirestoreRoute) => {
        console.log(rawRoute);
      }),
      switchMap((rawRoute: IFirestoreRoute): Observable<IRoute> => {
        return this.convertRoute(rawRoute);
      })
    );
    return route$;
  }

  public getRecords(): Observable<IRouteRecord[]> {
    console.log("Call to getRecords()");
    const records$: Observable<IRouteRecord[]> = this.recordsCollection.valueChanges().pipe(
      switchMap((rawRecords: IFirestoreRouteRecord[]): Observable<IRouteRecord[]> => {
        const record$s: Observable<IRouteRecord>[] = rawRecords.map(
          (rawRecord: IFirestoreRouteRecord): Observable<IRouteRecord> => {
            return this.convertRecord(rawRecord);
          }
        );
        return zip<Observable<IRouteRecord>>(...record$s);
      })
    );
    //records$.subscribe((records) => console.log(records));
    return records$;
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
