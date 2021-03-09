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
        // return an empty array if admins document doesn't exist
        snapshot ? snapshot.admins : []
      )
    );
  }
  
  /**
   * Updates admins array. Replaces the array with the provided array
   */
  public updateAdmins(admins: string[]): Promise<void> {
    // creates the admins document if it doesn't exist yet
    return this.adminsCollection.doc(this.docId).set({
      admins: admins
    }, { merge: true });
  }
}
