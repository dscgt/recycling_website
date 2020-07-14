import { IRouteGroupMember } from './iroute-group-member.interface';

export interface IRouteGroup {
    title: string;
    members: IRouteGroupMember[];
    id: string;
}