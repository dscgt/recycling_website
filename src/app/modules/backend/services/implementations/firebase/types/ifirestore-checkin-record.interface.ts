import { ITimestamp } from './itimestamp.interface';

export interface IFirestoreCheckinRecord {
  modelId?: string;
  modelTitle: string;
  checkinTime: ITimestamp;
  checkoutTime: ITimestamp;
  properties: {
    [additionalProperties: string]: string;
  }
}
