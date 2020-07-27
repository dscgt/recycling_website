import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ICheckinModel, ICheckinRecord, ICheckinGroup } from '../../../types';
import { IBackendCheckin } from './ibackend-checkin.interface';
import { FirebaseHelperService, FirebaseCheckinService } from '../../implementations/firebase';
import { CheckinAngularFirestore } from '../../factory/factory.service';

@Injectable({
  providedIn: 'root',
  useFactory: (firestore: CheckinAngularFirestore) => {
    return new FirebaseCheckinService(firestore);
  },
  deps: [
    CheckinAngularFirestore,
    FirebaseHelperService
  ]
})
export abstract class BackendCheckinService implements IBackendCheckin {
  public abstract getGroups(): Observable<ICheckinGroup[]>;
  public abstract getModels(): Observable<ICheckinModel[]>;
  public abstract getRecords(): Observable<ICheckinRecord[]>;
  public abstract addGroup(group: ICheckinGroup): void;
  public abstract addModel(model: ICheckinModel): void;
  public abstract updateGroup(group: ICheckinGroup): void;
  public abstract updateModel(model: ICheckinModel): void;
  public abstract deleteGroup(id?:string): void;
  public abstract deleteModel(id?: string): void;
}
