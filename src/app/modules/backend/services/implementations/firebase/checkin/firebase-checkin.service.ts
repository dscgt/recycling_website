import { Injectable } from '@angular/core';
import { AngularFirestoreCollection, DocumentChangeAction } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import 'firebase/firestore';
import { IBackendCheckin } from '../../../interfaces/checkin';
import { ICheckinRecord, ICheckinModel, ICheckinGroup, IField } from 'src/app/modules/backend/types';
import { IFirestoreCheckinRecord } from '../types';
import { map } from 'rxjs/operators';
import { CheckinAngularFirestore } from '../../../factory/factory.service';
import { AbstractFormGroupDirective } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class FirebaseCheckinService implements IBackendCheckin {
  private recordsCollection: AngularFirestoreCollection<IFirestoreCheckinRecord>;
  private modelsCollection: AngularFirestoreCollection<ICheckinModel>;
  private groupsCollection: AngularFirestoreCollection<ICheckinGroup>;

  constructor(
    private readonly firestore: CheckinAngularFirestore
  ) {
    this.groupsCollection = this.firestore.collection<ICheckinGroup>('groups');
    this.modelsCollection = this.firestore.collection<ICheckinModel>('models');
    this.recordsCollection = this.firestore.collection<IFirestoreCheckinRecord>('records');
  }

  public getRecords(): Observable<ICheckinRecord[]> {
    return this.recordsCollection.valueChanges().pipe(
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

  public addModel(checkin: ICheckinModel): void {
    const toAdd = Object.assign({}, checkin);
    // change groupIds to DocumentReference's before sending to Firestore
    toAdd.fields.forEach((field: IField) => {
      if (typeof field.groupId === 'string' && field.groupId.trim().length > 0) {
        field.groupId = this.groupsCollection.doc(field.groupId).ref;
      }
    })
    this.modelsCollection.add(toAdd);
  }

  public deleteModel(id?: string): void {
    if (!id) {
      return;
    }
    this.modelsCollection.doc(id).delete();
  }

  public getGroups(): Observable<ICheckinGroup[]> {
    return this.groupsCollection.snapshotChanges().pipe(
      map((snapshots: DocumentChangeAction<ICheckinGroup>[]) =>
        snapshots.map((snapshot: DocumentChangeAction<ICheckinGroup>) => {
          const toReturn:ICheckinGroup = snapshot.payload.doc.data();
          toReturn.id = snapshot.payload.doc.id;
          return toReturn;
        })
      )
    );
  }

  public addGroup(group: ICheckinGroup): void {
    this.groupsCollection.add(group);
  }

  public deleteGroup(id?: string): void {
    if (!id) {
      return;
    }
    this.groupsCollection.doc(id).delete();
  }

}
