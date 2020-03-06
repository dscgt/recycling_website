import { Observable } from 'rxjs';
import { ICheckinRecord, ICheckinModel } from '../../../types';

export interface IBackendCheckin {
  getRecords(): Observable<ICheckinRecord[]>;
  getModels(): Observable<ICheckinModel[]>;
  addModel(checkin: ICheckinModel): void;
}
