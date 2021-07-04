import { Injectable } from '@angular/core';
import { AngularFirestoreCollection, DocumentChangeAction, AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { ICheckinRecord, ICheckinModel, ICheckinGroup, InputType } from 'src/app/modules/backend/types';
import { IFirestoreCheckinRecord, IFirestoreCheckinModel, IFirestoreCheckinGroup } from '../types';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FirebaseCheckinService {
  private modelsCollection: AngularFirestoreCollection<IFirestoreCheckinModel>;
  private groupsCollection: AngularFirestoreCollection<IFirestoreCheckinGroup>;
  private recordsCollection: AngularFirestoreCollection<IFirestoreCheckinRecord>;

  constructor(
    private readonly firestore: AngularFirestore
  ) {
    this.groupsCollection = this.firestore.collection<IFirestoreCheckinGroup>('checkin_groups');
    this.modelsCollection = this.firestore.collection<IFirestoreCheckinModel>('checkin_models');
    this.recordsCollection = this.firestore.collection<IFirestoreCheckinRecord>('checkin_records');
  }

  public getRecords(startDate: Date, endDate: Date): Observable<ICheckinRecord[]> {
    const query = this.firestore.collection<IFirestoreCheckinRecord>('checkin_records', ref => ref
      .where('checkoutTime', '>', startDate)
      .where('checkoutTime', '<', endDate)
      .limit(2000)
    );
    return query.valueChanges({ idField: 'id' }).pipe(
      map((rawRecords: IFirestoreCheckinRecord[]): ICheckinRecord[] => {
        return rawRecords.map((rawRecord: IFirestoreCheckinRecord): ICheckinRecord => {
          const record: any = {...rawRecord};
          record.checkinTime = rawRecord.checkinTime.toDate();
          record.checkoutTime = rawRecord.checkoutTime.toDate();
          record.id = rawRecord.id;
          return record;
        });
      })
    );
  }

  public getModels(): Observable<ICheckinModel[]> {
    return this.modelsCollection.snapshotChanges().pipe(
      map((snapshots: DocumentChangeAction<IFirestoreCheckinModel>[]) =>
        snapshots.map((snapshot: DocumentChangeAction<IFirestoreCheckinModel>) => {
          const toReturn: any = snapshot.payload.doc.data();
          toReturn.id = snapshot.payload.doc.id;
          return toReturn;
        })
      )
    );
  }

  public getGroups(): Observable<ICheckinGroup[]> {
    return this.groupsCollection.snapshotChanges().pipe(
      map((snapshots: DocumentChangeAction<ICheckinGroup>[]) =>
        snapshots.map((snapshot: DocumentChangeAction<ICheckinGroup>) => {
          const toReturn: ICheckinGroup = snapshot.payload.doc.data();
          toReturn.id = snapshot.payload.doc.id;
          return toReturn;
        })
      )
    );
  }

  public addModel(checkin: IFirestoreCheckinModel): void {
    const toAdd = Object.assign({}, checkin);
    this.cleanGroupIds(toAdd);
    this.modelsCollection.add(toAdd);
  }

  public addGroup(group: IFirestoreCheckinGroup): void {
    this.groupsCollection.add(group);
  }

  public updateModel(model: ICheckinModel): void {
    const forUpdate:any = Object.assign({}, model);
    delete forUpdate.id;
    this.cleanGroupIds(forUpdate);
    this.modelsCollection.doc(model.id).set(forUpdate);
  }

  public updateGroup(group: ICheckinGroup): void {
    const forUpdate: any = Object.assign({}, group);
    delete forUpdate.id;
    this.groupsCollection.doc(group.id).set(forUpdate);
  }

  /**
   * Updates the `properties` field of a checkin record
   * @param recordId 
   * @param newProperties 
   */
  public updateRecordProperties(recordId: string, newProperties: {value: string }): Promise<void> {
    return this.recordsCollection.doc(recordId).update({
      properties: newProperties
    });
  }

  public deleteModel(id: string): void {
    this.modelsCollection.doc(id).delete();
  }

  public deleteGroup(id: string): void {
    this.groupsCollection.doc(id).delete();
  }

  public deleteRecord(id: string): Promise<void> {
    return this.recordsCollection.doc(id).delete();
  }

  /**
   * Mutates the model passed in with the following actions:
   * - fields not of dropdown type will be cleaned to ensure no groupId is passed
   * - string groupIds will be changed to DocumentReference's
   */
  public cleanGroupIds(model: ICheckinModel|IFirestoreCheckinModel): void {
    model.fields.forEach((field: any) => {
      if (field.type !== InputType.Dropdown) {
        // remove groupIds for non-select fields, since this is not handled by the Angular forms
        delete field.groupId;
      } else if (typeof field.groupId === 'string') {
        // change groupIds to DocumentReference's before sending to Firestore
        field.groupId = this.groupsCollection.doc(field.groupId).ref;
      }
    });
  }
}
