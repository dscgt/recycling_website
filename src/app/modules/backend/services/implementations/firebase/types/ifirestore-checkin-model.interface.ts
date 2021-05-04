import { DocumentReference } from '@angular/fire/firestore';
import { InputType } from 'src/app/modules/backend/types';

export interface IFirestoreCheckinModel {
  fields: {
    title: string;
    type: InputType;
    optional: boolean;
    groupId?: DocumentReference;
    delay: boolean;
  }[];
  title: string;
}
