import { IRouteStop } from './iroute-stop.interface';
import { IField } from './ifield.interface';

export interface IRoute {
  fields: IField[];
  title: string;
  stopData: {
    fields: IField[];
    stops: IRouteStop[];
  };
}
