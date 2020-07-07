import { Observable } from 'rxjs';
import { ICheckinRecord, ICheckinModel, ICheckinGroup } from '../../../types';

export interface IBackendCheckin {
  getGroups(): Observable<ICheckinGroup[]>;
  getRecords(): Observable<ICheckinRecord[]>;
  getModels(): Observable<ICheckinModel[]>;
  addGroup(checkin: ICheckinGroup): void;
  addModel(checkin: ICheckinModel): void;
}
