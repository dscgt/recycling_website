import { Injectable } from '@angular/core';
import { AngularFirestoreCollection, DocumentChangeAction } from '@angular/fire/firestore';
import { IBackendRoutes } from '../../../interfaces/routes';
import { Observable, zip, of } from 'rxjs';
import { IRoute, IRouteRecord, ICrewmember, IRouteGroup, IField } from 'src/app/modules/backend/types';
import 'firebase/firestore';
import { switchMap, map } from 'rxjs/operators';
import { IFirestoreRouteRecord, IFirestoreCrewmember } from '../types';
import { FirebaseHelperService } from '../helper';
import { RoutesAngularFirestore } from '../../../factory/factory.service';
import { DocumentReference } from '@angular/fire/firestore';

// NOTE: w/ RxJS for some reason zip([observable1, observable2]) does not behave correctly
//               instead do zip(...[observable1, observable2]) instead to unroll array

@Injectable({
  providedIn: 'root'
})
export class FirebaseRoutesService implements IBackendRoutes {
  private recordsCollection: AngularFirestoreCollection<IFirestoreRouteRecord>;
  private routesCollection: AngularFirestoreCollection<IRoute>;
  private groupsCollection: AngularFirestoreCollection<IRouteGroup>;

  constructor(
    private readonly firestore: RoutesAngularFirestore,
    private helper: FirebaseHelperService,
  ) {
    this.recordsCollection = this.firestore.collection<IFirestoreRouteRecord>('records');
    this.routesCollection = this.firestore.collection<IRoute>('models');
    this.groupsCollection = this.firestore.collection<IRouteGroup>('groups');
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

  // Currently, all DocumentReference-type groups within fields are converted to empty strings.
  // This is not ideal, and is meant to be a temporary workaround for crashes.
  public getRoutes(): Observable<IRoute[]> {
    return this.routesCollection.snapshotChanges().pipe(
      map((snapshots: DocumentChangeAction<IRoute>[]) =>
        snapshots.map((snapshot: DocumentChangeAction<IRoute>) => {
          const toReturn: IRoute = snapshot.payload.doc.data();
          toReturn.id = snapshot.payload.doc.id;
          return toReturn;
        })
      )
    );
  }

  public getRoute(id: number): Observable<IRoute> {
    throw new Error("Method not implemented.");
  }

  public addRoute(route: IRoute): void {
    const toAdd = Object.assign({}, route);
    // change groupIds to DocumentReference's before sending to Firestore
    toAdd.fields.forEach((field:IField) => {
      if (typeof field.groupId === 'string' && field.groupId.trim().length > 0) {
        field.groupId = this.groupsCollection.doc(field.groupId).ref;
      }
    })
    toAdd.stopData.fields.forEach((field:IField) => {
      if (typeof field.groupId === 'string' && field.groupId.trim().length > 0) {
        field.groupId = this.groupsCollection.doc(field.groupId).ref;
      }
    })

    this.routesCollection.add(route);
  }

  public getGroups(): Observable<IRouteGroup[]> {
    return this.groupsCollection.snapshotChanges().pipe(
      map((snapshots: DocumentChangeAction<IRouteGroup>[]) =>
        snapshots.map((snapshot: DocumentChangeAction<IRouteGroup>) => {
          const toReturn: IRouteGroup = snapshot.payload.doc.data();
          toReturn.id = snapshot.payload.doc.id;
          return toReturn;
        })
      )
    );
  }

  public addGroup(group: IRouteGroup): void {
    this.groupsCollection.add(group);
  }

  public updateRoute(route: IRoute): void {
    const forUpdate = Object.assign({}, route);
    const id:string = forUpdate.id as string;
    delete forUpdate.id;
    this.routesCollection.doc(id).set(forUpdate);
  }

  public updateGroup(group: IRouteGroup): void {
    const forUpdate = Object.assign({}, group);
    const id:string = forUpdate.id as string;
    delete forUpdate.id;
    this.groupsCollection.doc(id).set(forUpdate);
  }

  public deleteRoute(id?: string): void {
    if (!id) {
      return;
    }
    this.routesCollection.doc(id).delete();
  }

  public deleteGroup(id?: string): void {
    if (!id) {
      return;
    }
    this.groupsCollection.doc(id).delete();
  }
  
}
