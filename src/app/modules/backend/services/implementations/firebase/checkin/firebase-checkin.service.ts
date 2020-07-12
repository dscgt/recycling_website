import { Injectable } from '@angular/core';
import { AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import 'firebase/firestore';
import { IBackendCheckin } from '../../../interfaces/checkin';
import { ICheckinRecord, ICheckinModel, ICheckinGroup, IField } from 'src/app/modules/backend/types';
import { IFirestoreCheckinRecord } from '../types';
import { map } from 'rxjs/operators';
import { CheckinAngularFirestore } from '../../../factory/factory.service';

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

  // Currently, all DocumentReference-type groups within fields are converted to empty strings.
  // This is not ideal, and is meant to be a temporary workaround for crashes.
  public getModels(): Observable<ICheckinModel[]> {
    return this.modelsCollection.valueChanges().pipe(
      map((models:ICheckinModel[]) => models.map((model:ICheckinModel) => {
        model.fields.forEach((field) => {
          if (typeof field.groupId !== "string") {
            field.groupId = "";
          }
          field.groupId = "";
        })
        return model;
      }))
    );
  }

  public addModel(checkin: ICheckinModel): void {
    this.modelsCollection.add(checkin);
  }

  public getGroups(): Observable<ICheckinGroup[]> {
    return this.groupsCollection.valueChanges();
  }

  public addGroup(group: ICheckinGroup): void {
    this.groupsCollection.add(group);
  }

}
