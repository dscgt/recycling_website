import { ITimestamp } from './itimestamp.interface';

export interface IFirestoreCheckinRecord {
  modelId?: string;
  modelTitle: string;
  checkinTime: ITimestamp;
  checkoutTime: ITimestamp;
  id?: string;
  properties: {
    [additionalProperties: string]: string;
  }
}
