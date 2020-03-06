export interface ICheckinRecord {
  categoryId?: string;
  checkinTime: Date;
  checkoutTime: Date;
  properties: {
    [additionalProperties: string]: string;
  }
}
