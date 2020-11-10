import { Injectable } from '@angular/core';
import { Observable, combineLatest } from 'rxjs';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { Sort, MatSort } from '@angular/material/sort';
import { startWith } from 'rxjs/operators';

// Much of this pattern was inspired by @james-schwartzkopf

@Injectable({
  providedIn: 'root'
})
export class MatDataService {

  public compare(a: any, b: any): number {
    console.log(`read ${a} of type ${typeof a}`);
    console.log(`read ${b} of type ${typeof b}`);
    
    a = (a === undefined) ? null : a;
    b = (b === undefined) ? null : b;
    if (a === b) {
      return 0;
    } else if (a === null) {
      return -1;
    } else if (b === null) {
      return 1;
    } else if (typeof a !== typeof b) {
      // do not handle type mismatch
      return 0;
    }
    
    if (typeof a === 'string') {
      a = a.toLowerCase();
      b = b.toLowerCase();
    }
    return (a > b) ? 1 : -1;
  }

  public toSort$(sort: MatSort): Observable<Sort> {
    return sort.sortChange.asObservable().pipe(
      startWith(sort as Sort)
    );
  }

  public toPaginator$(pager: MatPaginator): Observable<PageEvent> {
    return pager.page.asObservable().pipe(
      startWith(pager as PageEvent)
    );
  }

  public sortData$<T>(
    sort$: Observable<Sort>,
    propertiesWithSpecialSorting?: {
      [prop: string]: (a: T) => any;
    }
  ): (vals$: Observable<T[]>) => Observable<T[]> {
    return (data$: Observable<T[]>): Observable<T[]> => {
      return combineLatest(
        data$, sort$,
        (data: T[], sort: Sort): T[] => {
          let compareFn: (a: T, b: T) => number = this.compare;
          if (propertiesWithSpecialSorting && propertiesWithSpecialSorting.hasOwnProperty(sort.active)) {
            compareFn = (a: T, b: T) => this.compare(
              propertiesWithSpecialSorting[sort.active](a),
              propertiesWithSpecialSorting[sort.active](b)
            );
          }

          // reverse sort order if descending
          let toReturn;
          if (sort.direction === 'desc') {
            toReturn = data.slice().sort((a, b) => compareFn(b, a));
          } else {
            toReturn = data.slice().sort(compareFn);
          }
          return toReturn;
        }
      );
    }
  }

  public paginateData$<T>(page$: Observable<PageEvent>): (vals$: Observable<T[]>) => Observable<T[]> {
    return (data$: Observable<T[]>): Observable<T[]> => combineLatest(
      data$, page$, (data: T[], page: PageEvent): T[] => {
        const startIndex: number = page.pageIndex * page.pageSize;
        return data.slice().splice(startIndex, page.pageSize);
      }
    );
  }
}
