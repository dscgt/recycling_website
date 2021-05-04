import { Injectable } from '@angular/core';
import { AngularFirestoreCollection, DocumentChangeAction, AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { IRouteModel, IRouteRecord, IRouteGroup, IField, InputType, IRouteStopRecord } from 'src/app/modules/backend/types';
import { map } from 'rxjs/operators';
import { IFirestoreRouteGroup, IFirestoreRouteModel, IFirestoreRouteRecord } from '../types';

@Injectable({
  providedIn: 'root'
})
export class FirebaseRoutesService {
  private recordsCollection: AngularFirestoreCollection<IFirestoreRouteRecord>;
  private routesCollection: AngularFirestoreCollection<IFirestoreRouteModel>;
  private groupsCollection: AngularFirestoreCollection<IFirestoreRouteGroup>;

  constructor(
    private readonly firestore: AngularFirestore,
  ) {
    this.recordsCollection = this.firestore.collection<IFirestoreRouteRecord>('route_records');
    this.routesCollection = this.firestore.collection<IFirestoreRouteModel>('route_models');
    this.groupsCollection = this.firestore.collection<IFirestoreRouteGroup>('route_groups');
  }

  public getRecords(startDate: Date, endDate: Date): Observable<IRouteRecord[]> {
    const query = this.firestore.collection<IFirestoreRouteRecord>('route_records', ref => ref.where('startTime', '>', startDate).where('startTime', '<', endDate));
    return query.valueChanges({ idField: 'id' }).pipe(
      map((rawRecords: IFirestoreRouteRecord[]): IRouteRecord[] => {
        return rawRecords.map((rawRecord: IFirestoreRouteRecord): IRouteRecord => {
          const record: any = { ...rawRecord };
          record.endTime = rawRecord.endTime.toDate();
          record.startTime = rawRecord.startTime.toDate();
          record.id = rawRecord.id;
          return record;
        });
      })
    );
  }

  public getRoutes(): Observable<IRouteModel[]> {
    return this.routesCollection.snapshotChanges().pipe(
      map((snapshots: DocumentChangeAction<IFirestoreRouteModel>[]) =>
        snapshots.map((snapshot: DocumentChangeAction<IFirestoreRouteModel>) => {
          const toReturn: any = snapshot.payload.doc.data();
          toReturn.id = snapshot.payload.doc.id;
          return toReturn;
        })
      )
    );
  }

  public getGroups(): Observable<IRouteGroup[]> {
    return this.groupsCollection.snapshotChanges().pipe(
      map((snapshots: DocumentChangeAction<IFirestoreRouteGroup>[]) =>
        snapshots.map((snapshot: DocumentChangeAction<IFirestoreRouteGroup>) => {
          const toReturn: IRouteGroup = snapshot.payload.doc.data();
          toReturn.id = snapshot.payload.doc.id;
          return toReturn;
        })
      )
    );
  }

  public addRoute(route: IFirestoreRouteModel): void {
    const toAdd = Object.assign({}, route);
    this.cleanGroupIds(toAdd);
    this.routesCollection.add(toAdd);
  }


  public addGroup(group: IFirestoreRouteGroup): void {
    this.groupsCollection.add(group);
  }

  public updateRoute(route: IRouteModel): void {
    const forUpdate:any = Object.assign({}, route);
    this.cleanGroupIds(forUpdate);
    delete forUpdate.id;
    this.routesCollection.doc(route.id).set(forUpdate as IFirestoreRouteModel);
  }

  public updateGroup(group: IRouteGroup): void {
    const forUpdate:any = Object.assign({}, group);
    delete forUpdate.id;
    this.groupsCollection.doc(group.id).set(forUpdate as IFirestoreRouteGroup);
  }

  /**
   * Updates a record with new properties and new stops. If nothing is passed into newProperties or newStops,
   * no action will be taken. If only newProperties or newStops are provided, then only properties or stops
   * respectively will be updated.
   * @param recordId the ID of the record to update
   * @param newProperties 
   * @param newStops 
   * @returns 
   */
  public updateRecord(recordId: string, newProperties: {value: string}, newStops: IRouteStopRecord[]): Promise<void> {
    if (!newProperties && !newStops) {
      return Promise.resolve();
    }
    let updateObj:any = {};
    if (newProperties) {
      updateObj.stops = newStops;
    }
    if (newStops) { 
      updateObj.properties = newProperties;
    }
    return this.recordsCollection.doc(recordId).update(updateObj);
  }

  public deleteRoute(id: string): void {
    this.routesCollection.doc(id).delete();
  }

  public deleteGroup(id: string): void {
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
   */
  public cleanGroupIds(model: IRouteModel | IFirestoreRouteModel): void {
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
  }
}
