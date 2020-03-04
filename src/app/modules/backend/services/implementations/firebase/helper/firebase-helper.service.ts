import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentReference } from '@angular/fire/firestore';
import { Observable, of, EMPTY } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ICrewmember } from 'src/app/modules/backend/types';
import { ITimestamp, IFirestoreCrewmember } from '../types';

@Injectable({
  providedIn: 'root'
})
export class FirebaseHelperService {

  constructor(
    private readonly firestore: AngularFirestore
  ) { }

  public getReference$<T>(ref: DocumentReference): Observable<T> {
  return this.firestore.doc<T>(ref).valueChanges().pipe(
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
