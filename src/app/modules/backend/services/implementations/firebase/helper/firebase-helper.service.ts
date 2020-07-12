import { Injectable } from '@angular/core';
import { DocumentReference } from '@angular/fire/firestore';
// import respective AngularFirestore versions and use?
import { Observable, of, EMPTY } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ICrewmember } from 'src/app/modules/backend/types';
import { ITimestamp, IFirestoreCrewmember } from '../types';
import { RoutesAngularFirestore, CheckinAngularFirestore } from '../../../factory/factory.service';

@Injectable({
  providedIn: 'root'
})
export class FirebaseHelperService {

  constructor(
    private readonly routesFirestore: RoutesAngularFirestore,
    private readonly checkinFirestore: CheckinAngularFirestore
  ) { }

  public getReference$<T>(ref: DocumentReference): Observable<T> {
    return this.routesFirestore.doc<T>(ref).valueChanges().pipe(
      switchMap((val: T | undefined): Observable<T> => {
        if (val) {
          return of(val);
        }
        return EMPTY;
      })
    );
  }

  public convertCrewmember(rawCrewmember: IFirestoreCrewmember): Observable<ICrewmember> {
    const crewmember = { ...rawCrewmember } as unknown as ICrewmember;
    crewmember.hours = [];
    rawCrewmember.hours.forEach((rawHour: { start: ITimestamp, stop: ITimestamp }) => {
      crewmember.hours.push({
        start: rawHour.start.toDate(),
        stop: rawHour.stop.toDate()
      });
    });
    return of(crewmember);
  }

  public convertCrewmember$(rawCrewmember$: Observable<IFirestoreCrewmember>): Observable<ICrewmember> {
    return rawCrewmember$.pipe(
      switchMap((rawCrewmember: IFirestoreCrewmember) => this.convertCrewmember(rawCrewmember))
    );
  }
}
