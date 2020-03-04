import { DocumentReference } from '@angular/fire/firestore/interfaces';

export interface IFirestoreRoute {
  name: string;
  id: string;
  stopData: {
    fields: DocumentReference[];
    stops: DocumentReference[];
  };
  [additional: string]: any;
}
