import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RouteRecordsResolver implements Resolve<ObjectToResolve> {
  resolve(route: ActivatedRouteSnapshot): Observable<ObjectToResolve> | Promise<ObjectToResolve> | ObjectToResolve {
    return ;
  }
}
