import { IRouteStopRecord } from './iroute-stop-record.interface';
import { IRouteSave } from './iroute-save.interface';

export interface IRouteRecord {
  startTime: Date;
  endTime: Date;
  modelId: string;
  modelTitle: string;
  id: string;
  properties: {
    [additionalProperties: string]: string;
  };
  saves: IRouteSave[];
  stops: IRouteStopRecord[];
}
