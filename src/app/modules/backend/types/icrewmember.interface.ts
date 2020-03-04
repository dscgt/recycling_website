export interface ICrewMember {
  name: string;
  id: string;
  hours: {
    start: Date;
    stop: Date;
  }[];
  [additional: string]: any;
}
