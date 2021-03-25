import { Injectable } from '@angular/core';
import { AngularFirestoreCollection, DocumentChangeAction, AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { IBackendCheckin } from '../../../interfaces/checkin';
import { ICheckinRecord, ICheckinModel, ICheckinGroup, InputType } from 'src/app/modules/backend/types';
import { IFirestoreCheckinRecord } from '../types';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FirebaseCheckinService implements IBackendCheckin {
  private modelsCollection: AngularFirestoreCollection<ICheckinModel>;
  private groupsCollection: AngularFirestoreCollection<ICheckinGroup>;
  private recordsCollection: AngularFirestoreCollection<ICheckinRecord>;

  constructor(
    private readonly firestore: AngularFirestore
  ) {
    this.groupsCollection = this.firestore.collection<ICheckinGroup>('checkin_groups');
    this.modelsCollection = this.firestore.collection<ICheckinModel>('checkin_models');
    this.recordsCollection = this.firestore.collection<ICheckinRecord>('checkin_records');
  }

  public getRecords(startDate: Date, endDate: Date): Observable<ICheckinRecord[]> {
    const query = this.firestore.collection<IFirestoreCheckinRecord>('checkin_records', ref => ref.where('checkoutTime', '>', startDate).where('checkoutTime', '<', endDate));
    return query.valueChanges().pipe(
      map((rawRecords: IFirestoreCheckinRecord[]): ICheckinRecord[] => {
        return rawRecords.map((rawRecord: IFirestoreCheckinRecord): ICheckinRecord => {
          const record: ICheckinRecord = { ...rawRecord } as unknown as ICheckinRecord;
          record.checkinTime = rawRecord.checkinTime.toDate();
          record.checkoutTime = rawRecord.checkoutTime.toDate();
          return record;
        });
      })
    );
  }

  public getModels(): Observable<ICheckinModel[]> {
    return this.modelsCollection.snapshotChanges().pipe(
      map((snapshots:DocumentChangeAction<ICheckinModel>[]) =>
        snapshots.map((snapshot: DocumentChangeAction<ICheckinModel>) => {
          const toReturn: ICheckinModel = snapshot.payload.doc.data();
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

  public addModel(checkin: ICheckinModel): void {
    const toAdd = Object.assign({}, checkin);
    this.cleanModel(toAdd);
    this.modelsCollection.add(toAdd);
  }

  public addGroup(group: ICheckinGroup): void {
    this.groupsCollection.add(group);
  }

  public updateModel(model: ICheckinModel): void {
    const forUpdate = Object.assign({}, model);
    const id: string = (forUpdate.id) as string;
    this.cleanModel(forUpdate);
    this.modelsCollection.doc(id).set(forUpdate);
  }

  public updateGroup(group: ICheckinGroup): void {
    const forUpdate = Object.assign({}, group);
    const id:string = (forUpdate.id) as string;
    delete forUpdate.id;
    this.groupsCollection.doc(id).set(forUpdate);
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

  public deleteModel(id?: string): void {
    if (!id) {
      return;
    }
    this.modelsCollection.doc(id).delete();
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
   * - fields not of dropdown type will be cleaned to ensure no groupId is passed
   * - string groupIds will be changed to DocumentReference's
   * - id will be deleted; preserve the ID before calling if you need it
   */
  public cleanModel(model: ICheckinModel): void {
    model.fields.forEach((field) => {
      if (field.type !== InputType.Dropdown) {
        // remove groupIds for non-select fields, since this is not handled by the Angular forms
        delete field.groupId;
      } else if (typeof field.groupId === 'string') {
        // change groupIds to DocumentReference's before sending to Firestore
        field.groupId = this.groupsCollection.doc(field.groupId).ref;
      }
    });
    delete model.id;
  }

}
