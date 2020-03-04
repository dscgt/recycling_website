import { DocumentReference } from '@angular/fire/firestore/interfaces';
import { IRouteStop } from 'src/app/modules/backend/types';
import { ITimestamp } from './itimestamp.interface';

export interface IFirestoreRouteRecord {
  crewmember: DocumentReference;
  comments: string;
  tonnage: number;
  startTime: ITimestamp;
  endTime: ITimestamp;
  route: DocumentReference;
  id: string;
  stops: IRouteStop[];
  [additional: string]: any;
}
