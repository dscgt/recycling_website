import { IRouteStop } from "./iroute-stop.interface";
import { IField } from "./ifield.interface";

export interface IRouteModel {
  fields: IField[];
  title: string;
  stopData: {
    fields: IField[];
    stops: IRouteStop[];
  };
  id: string;
}
