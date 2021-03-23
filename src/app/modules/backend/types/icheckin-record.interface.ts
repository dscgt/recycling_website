export interface ICheckinRecord {
  modelId?: string;
  modelTitle: string;
  checkinTime: Date;
  checkoutTime: Date;
  properties: {
    [additionalProperties: string]: string;
  };
  id?: string;
}
