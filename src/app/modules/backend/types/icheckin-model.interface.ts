import { InputType } from './input-type.enum';

export interface ICheckinModel {
  fields: {
    title: string;
    type: InputType;
  }[];
  title: string;
}
