import { IRouteStop } from './iroute-stop.interface';
import { ICrewMember } from './icrewmember.interface';
import { IRoute } from './iroute.interface';

export interface IRouteRecord {
  crewmember: ICrewMember;
  comments: string;
  tonnage: number;
  startTime: Date;
  endTime: Date;
  route: IRoute;
  id: string;
  stops: IRouteStop[];
  [additional: string]: any;
}
