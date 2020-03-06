import { IRouteStop } from './iroute-stop.interface';
import { IField } from './ifield.interface';

export interface IRoute {
  name: string;
  id?: string;
  stopData: {
    fields: IField[];
    stops: IRouteStop[];
  };
  [additional: string]: any;
}
