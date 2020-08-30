import { Injectable } from '@angular/core';
import { AngularFireAuth } from "@angular/fire/auth";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    public auth: AngularFireAuth
  ) { }

  authState() {
    return this.auth.authState;
  }

  getIdToken() {
    return this.auth.idToken;
  }

  // Sign in with email/password
  signIn(email: string, password: string) {
    return this.auth.signInWithEmailAndPassword(email, password);
  }

  // Reset forgotten password
  resetPassword(passwordResetEmail: string) {
    return this.auth.sendPasswordResetEmail(passwordResetEmail);
  }

  // Sign out
  signOut() {
    return this.auth.signOut();
  }
}
