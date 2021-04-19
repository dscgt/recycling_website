import { Injectable } from '@angular/core';
import { DocumentReference, AngularFirestore } from '@angular/fire/firestore';
// import respective AngularFirestore versions and use?
import { Observable, of, EMPTY } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FirebaseHelperService {

  constructor(
    private readonly firestore: AngularFirestore,
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
}
