import { Component, OnInit, NgZone } from '@angular/core';
import { AuthService } from 'src/app/modules/backend/services/implementations/firebase';
import { Router } from '@angular/router';

// TODO: canActivate in routes seems to be affecting styles. Styles on initial page load don't apply and seem weird (to repro, refresh the page and poke around).
// try routing the conventional way with app routing module? have to verify that this will conform with the current weird standard of routing.
// Or, see what your own AuthGuard does.

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  username: string;
  password: string;
  forgotPasswordUsername: string;

  constructor(
    private authService: AuthService,
    private router: Router,
    private ngZone: NgZone,
  ) { }

  ngOnInit(): void {
    
  }

  signIn(): void {
    this.authService.signIn(this.username, this.password).then(() => {
      this.ngZone.run(() => {
        this.router.navigate(['home']);
      });
    }).catch((err) => {
      window.alert("There was an error:\n" + err.message);
    })
  }

  resetPassword(): void {
    this.authService.resetPassword(this.forgotPasswordUsername).then(() => {
      window.alert("Email sent; check your inbox or spam to reset your password.");
    }).catch((err) => {
      window.alert("There was an error:\n" + err.message);
    });
  }
}
