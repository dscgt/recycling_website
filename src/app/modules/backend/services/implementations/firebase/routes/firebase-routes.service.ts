import { Injectable } from '@angular/core';
import { AngularFirestoreCollection, DocumentChangeAction, AngularFirestore } from '@angular/fire/firestore';
import { IBackendRoutes } from '../../../interfaces/routes';
import { Observable } from 'rxjs';
import { IRoute, IRouteRecord, IRouteGroup, IField, InputType, IRouteStopRecord } from 'src/app/modules/backend/types';
import { map } from 'rxjs/operators';
import { IFirestoreRouteRecord } from '../types';

@Injectable({
  providedIn: 'root'
})
export class FirebaseRoutesService implements IBackendRoutes {
  private recordsCollection: AngularFirestoreCollection<IFirestoreRouteRecord>;
  private routesCollection: AngularFirestoreCollection<IRoute>;
  private groupsCollection: AngularFirestoreCollection<IRouteGroup>;

  constructor(
    private readonly firestore: AngularFirestore,
  ) {
    this.recordsCollection = this.firestore.collection<IFirestoreRouteRecord>('route_records');
    this.routesCollection = this.firestore.collection<IRoute>('route_models');
    this.groupsCollection = this.firestore.collection<IRouteGroup>('route_groups');
  }

  public getRecords(startDate: Date, endDate: Date): Observable<IRouteRecord[]> {
    const query = this.firestore.collection<IFirestoreRouteRecord>('route_records', ref => ref.where('startTime', '>', startDate).where('startTime', '<', endDate));
    return query.valueChanges({ idField: 'id' }).pipe(
      map((rawRecords: IFirestoreRouteRecord[]): IRouteRecord[] => {
        return rawRecords.map((rawRecord: IFirestoreRouteRecord): IRouteRecord => {
          const record: IRouteRecord = { ...rawRecord } as unknown as IRouteRecord;
          record.endTime = rawRecord.endTime.toDate();
          record.startTime = rawRecord.startTime.toDate();
          record.id = rawRecord.id;
          return record;
        });
      })
    );
  }

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
    this.cleanModel(toAdd);
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
    this.cleanModel(forUpdate);
    this.routesCollection.doc(id).set(forUpdate);
  }

  public updateGroup(group: IRouteGroup): void {
    const forUpdate = Object.assign({}, group);
    const id:string = forUpdate.id as string;
    delete forUpdate.id;
    this.groupsCollection.doc(id).set(forUpdate);
  }

  public updateRecord(recordId: string, newProperties: {value: string}, newStops: IRouteStopRecord[]): Promise<void> {
    return this.recordsCollection.doc(recordId).update({
      properties: newProperties,
      stops: newStops
    });
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

  public deleteRecord(id: string): Promise<void> {
    return this.recordsCollection.doc(id).delete();
  }

  /**
   * Mutates the model passed in to conform with Firebase data model standards.
   * Changes made:
   * - fields and stop fields not of dropdown type will be cleaned to ensure no groupId is passed
   * - string groupIds will be changed to DocumentReference's
   * - id will be deleted; preserve the ID before calling if you need it
   */
  public cleanModel(model: IRoute) {
    model.fields.forEach((field: IField) => {
      if (field.type !== InputType.Dropdown) {
        // remove groupIds for non-select fields, since this is not handled by the Angular forms
        delete field.groupId;
      } else if (typeof field.groupId === 'string') {
        // change groupIds to DocumentReference's before sending to Firestore
        field.groupId = this.groupsCollection.doc(field.groupId).ref;
      }
    })
    // do the same as above, but for stops' fields
    model.stopData.fields.forEach((field: IField) => {
      if (field.type !== InputType.Dropdown) {
        delete field.groupId;
      } else if (typeof field.groupId === 'string') {
        field.groupId = this.groupsCollection.doc(field.groupId).ref;
      }
    })
    delete model.id;
  }
}
