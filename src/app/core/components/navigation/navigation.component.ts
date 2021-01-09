import { Component, Input, NgZone, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay, tap, catchError } from 'rxjs/operators';
import { ILink, DrawerService } from 'src/app/modules/navigation';
import { AuthService } from 'src/app/modules/backend/services/implementations/firebase';
import { Router } from '@angular/router';
import firebase from 'firebase/app';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit {

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  public links$: Observable<ILink[]> = this.drawer.links$;

  @Input()
  public title: string;
  public authenticated: Observable<boolean>;

  constructor(
    public drawer: DrawerService,
    private breakpointObserver: BreakpointObserver,
    private authService: AuthService,
    private router: Router,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    // setup observable for authentication states; subscribed to receive events of logins and outs
    this.authenticated = this.authService.authState().pipe(
      map((data: firebase.User|null) => {
        return data != null;
      }),
      catchError((err: any, caught: Observable<boolean>) => {
        window.alert("There was an error:\n" + err.message);
        return caught;
      })
    );

    // change sidenav links depending on authentication states
    this.authenticated.subscribe((loggedIn: boolean) => {
      this.links$ = loggedIn
        ? this.drawer.links$
        : this.drawer.unauthenticatedLinks$
    })
  }

  logout(): void {
    this.authService.signOut().then(() => {
      this.ngZone.run(() => {
        this.router.navigate(['login']);
      });
    }).catch((err: any) => {
      window.alert(err.message)
    });
  }

}
