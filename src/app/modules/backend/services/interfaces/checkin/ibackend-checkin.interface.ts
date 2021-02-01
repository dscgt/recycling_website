import { Observable } from 'rxjs';
import { ICheckinRecord, ICheckinModel, ICheckinGroup } from '../../../types';

export interface IBackendCheckin {
  getGroups(): Observable<ICheckinGroup[]>;
  getRecords(startDate: Date, endDate: Date): Observable<ICheckinRecord[]>;
  getModels(): Observable<ICheckinModel[]>;
  addGroup(checkin: ICheckinGroup): void;
  addModel(checkin: ICheckinModel): void;
}
