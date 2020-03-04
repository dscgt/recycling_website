import { IRouteStop } from './iroute-stop.interface';
import { ICrewmember } from './icrewmember.interface';
import { IRoute } from './iroute.interface';

export interface IRouteRecord {
  crewmember: ICrewmember;
  comments: string;
  tonnage: number;
  startTime: Date;
  endTime: Date;
  route: IRoute;
  id: string;
  stops: IRouteStop[];
  [additional: string]: any;
}
