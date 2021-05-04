import { ICheckinGroupMember } from './icheckin-group-member.interface';

export interface ICheckinGroup {
    title: string;
    members: ICheckinGroupMember[];
    id: string;
}