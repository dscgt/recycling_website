import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { ILink } from '../types';

@Injectable({
  providedIn: 'root'
})
export class DrawerService {

  public get links$(): Observable<ILink[]> {
    if (!this.linksSource) {
      this.linksSource = new BehaviorSubject(this.linksBacking);
    }
    return this.linksSource.asObservable();
  }

  public set links(value: ILink[]) {
    this.linksBacking = [...value];
    this.linksSource.next(this.links);
  }

  private linksSource: BehaviorSubject<ILink[]>;
  private linksBacking: ILink[] = [
    {
      icon: 'edit_location',
      path: 'routes/manage',
      name: 'Manage Routes'
    },
    {
      icon: 'assignment',
      path: 'routes/records',
      name: 'Route Records'
    },
    {
      icon: 'format_list_bulleted',
      path: 'checkin/manage',
      name: 'Manage Checkin'
    },
    {
      icon: 'assignment',
      path: 'checkin/records',
      name: 'Checkin Records'
    },
  ];
}
