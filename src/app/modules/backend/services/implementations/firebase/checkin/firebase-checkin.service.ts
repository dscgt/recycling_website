import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import 'firebase/firestore';
import { IBackendCheckin } from '../../../interfaces/checkin';
import { ICheckinRecord, ICheckinModel, ICheckinGroup } from 'src/app/modules/backend/types';
import { IFirestoreCheckinRecord } from '../types';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FirebaseCheckinService implements IBackendCheckin {
  private recordsCollection: AngularFirestoreCollection<IFirestoreCheckinRecord>;
  private modelsCollection: AngularFirestoreCollection<ICheckinModel>;
  private groupsCollection: AngularFirestoreCollection<ICheckinGroup>;

  constructor(
    private readonly firestore: AngularFirestore
  ) {
    this.groupsCollection = this.firestore.collection<ICheckinGroup>('test_checkin_groups');
    this.modelsCollection = this.firestore.collection<ICheckinModel>('test_checkin_models');
    this.recordsCollection = this.firestore.collection<IFirestoreCheckinRecord>('test_checkin_records');
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
    return this.modelsCollection.valueChanges();
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
