import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ICheckinModel, ICheckinRecord } from '../../../types';
import { AngularFirestore } from '@angular/fire/firestore';
import { IBackendCheckin } from './ibackend-checkin.interface';
import { FirebaseHelperService, FirebaseCheckinService } from '../../implementations/firebase';

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
  public abstract getModels(): Observable<ICheckinModel[]>;
  public abstract getRecords(): Observable<ICheckinRecord[]>;
  public abstract addModel(model: ICheckinModel): void;
}
