export interface IDisplayData<T> {
  name: string;
  property: string;
  accessorAsString: (datum: T) => string;
  accessor: (datum: T) => any;
}
