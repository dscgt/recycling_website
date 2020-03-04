export interface ITimestamp {
  nanoseconds: number;
  seconds: number;
  isEqual(other: ITimestamp): boolean;
  toDate(): Date;
  toMillis(): number;
  fromDate(date: Date): ITimestamp;
  fromMillis(milliseconds: number): ITimestamp;
  now(): ITimestamp;
}
