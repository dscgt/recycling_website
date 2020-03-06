import { ITimestamp } from './itimestamp.interface';

export interface IFirestoreCheckinRecord {
  categoryId?: string;
  checkinTime: ITimestamp;
  checkoutTime: ITimestamp;
  properties: {
    [additionalProperties: string]: string;
  }
}
