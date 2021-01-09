import { InputType } from './input-type.enum';
import { DocumentReference } from '@angular/fire/firestore';

export interface ICheckinModel {
  fields: {
    title: string;
    type: InputType;
    optional: boolean;
    groupId?: DocumentReference|string;
    delay: boolean;
  }[];
  title: string;
  id?: string;
}
