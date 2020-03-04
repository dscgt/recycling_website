import { InputType } from './input-type.enum';

export interface IField {
  name: string;
  optional: boolean;
  inputType: InputType;
}
