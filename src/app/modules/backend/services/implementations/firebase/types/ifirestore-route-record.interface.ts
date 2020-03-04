import { DocumentReference } from '@angular/fire/firestore/interfaces';
import { IRouteStop } from 'src/app/modules/backend/types';

export interface IFirestoreRouteRecord {
  crewmember: DocumentReference;
  comments: string;
  tonnage: number;
  startTime: Date;
  endTime: Date;
  route: DocumentReference;
  id: string;
  stops: IRouteStop[];
  [additional: string]: any;
}
