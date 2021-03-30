import { IRouteSave, IRouteStopRecord } from 'src/app/modules/backend/types';
import { ITimestamp } from './itimestamp.interface';

export interface IFirestoreRouteRecord {
  startTime: ITimestamp;
  endTime: ITimestamp;
  modelId: string;
  modelTitle: string;
  id?: string;
  properties: {
    [additionalProperties: string]: string;
  };
  saves: IRouteSave[];
  stops: IRouteStopRecord[];
}
