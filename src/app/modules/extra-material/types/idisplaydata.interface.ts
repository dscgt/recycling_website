export interface IDisplayData<T> {
  name: string;
  property: string;
  accessor: (datum: T) => string;
}
