import { IRouteGroupMember } from 'src/app/modules/backend/types';

export interface IFirestoreRouteGroup {
    title: string;
    members: IRouteGroupMember[];
    id: string;
}