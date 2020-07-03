import { InputType } from './input-type.enum';

export interface ICheckinModel {
  fields: {
    title: string;
    type: InputType;
    optional: boolean;
    groupid: string;
    delay: boolean;
  }[];
  title: string;
}
