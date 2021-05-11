import { ICheckinGroupMember } from "src/app/modules/backend/types";

export interface IFirestoreCheckinGroup {
  title: string;
  members: ICheckinGroupMember[];
}