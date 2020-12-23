import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentChangeAction } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IFirestoreAdmins } from '../types/ifirestore-admins.interface';

@Injectable({
  providedIn: 'root'
})
export class AdminAccessService {

  private docId: string = '00TTVF1pCWUmPQXdIRtj';
  private adminsCollection: AngularFirestoreCollection<IFirestoreAdmins>;

  constructor(
    private readonly firestore: AngularFirestore
  ) {
    this.adminsCollection = this.firestore.collection<IFirestoreAdmins>('admins');
  }

  /**
   * Retrieves admins as an array of email address strings
   */
  public getAdmins(): Observable<string[]> {
    return this.adminsCollection.doc(this.docId).valueChanges().pipe(
      map((snapshot: IFirestoreAdmins) =>
        snapshot.admins
      )
    );
  }
}
