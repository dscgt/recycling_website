import { ITimestamp } from './itimestamp.interface';

export interface IFirestoreCrewmember {
  name: string;
  id: string;
  hours: {
    start: ITimestamp;
    stop: ITimestamp;
  }[];
  [additional: string]: any;
}
