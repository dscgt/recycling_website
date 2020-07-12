import { InputType } from './input-type.enum';
import { DocumentReference } from '@angular/fire/firestore';

export interface IField {
  title: string;
  optional: boolean|null;
  type: InputType;
  groupId: DocumentReference|string;
}
