import { InputType } from './input-type.enum';

export interface IField {
  title: string;
  optional: boolean;
  type: InputType;
  groupId: string;
}
