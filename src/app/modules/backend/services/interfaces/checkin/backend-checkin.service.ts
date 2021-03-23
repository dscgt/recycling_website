import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ICheckinModel, ICheckinRecord, ICheckinGroup } from '../../../types';
import { IBackendCheckin } from './ibackend-checkin.interface';
import { FirebaseHelperService, FirebaseCheckinService } from '../../implementations/firebase';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
  useFactory: (firestore: AngularFirestore) => {
    return new FirebaseCheckinService(firestore);
  },
  deps: [
    AngularFirestore,
    FirebaseHelperService
  ]
})
export abstract class BackendCheckinService implements IBackendCheckin {
  public abstract getGroups(): Observable<ICheckinGroup[]>;
  public abstract getModels(): Observable<ICheckinModel[]>;
  public abstract getRecords(startDate: Date, endDate: Date): Observable<ICheckinRecord[]>;
  public abstract addGroup(group: ICheckinGroup): void;
  public abstract addModel(model: ICheckinModel): void;
  public abstract updateGroup(group: ICheckinGroup): void;
  public abstract updateModel(model: ICheckinModel): void;
  public abstract updateRecord(record: ICheckinRecord): void;
  public abstract deleteGroup(id?:string): void;
  public abstract deleteModel(id?: string): void;
  public abstract deleteRecord(id: string): void;
  
}
