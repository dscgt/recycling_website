import { Component, Input, NgZone } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { ILink, DrawerService } from 'src/app/modules/navigation';
import { AuthService } from 'src/app/modules/backend/services/implementations/firebase';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent {

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  public links$: Observable<ILink[]> = this.drawer.links$;

  @Input()
  public title: string;

  constructor(
    public drawer: DrawerService,
    private breakpointObserver: BreakpointObserver,
    private auth: AuthService,
    private router: Router,
    private ngZone: NgZone
  ) {}

  logout(): void {
    this.auth.signOut().then(() => {
      this.ngZone.run(() => {
        this.router.navigate(['login']);
      });
    }).catch((err) => {
      window.alert(err.message)
    });
  }

}
