import { IField, IRouteStop } from "src/app/modules/backend/types";

export interface IFirestoreRouteModel {
  fields: IField[];
  title: string;
  stopData: {
    fields: IField[];
    stops: IRouteStop[];
  };
}
