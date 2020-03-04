import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouteRecordsComponent, ManageRoutesComponent } from './pages';
import { RouterModule } from '@angular/router';
import { ROUTES_ROUTES } from './routes.routes';


@NgModule({
  declarations: [
    ManageRoutesComponent,
    RouteRecordsComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(ROUTES_ROUTES)
  ]
})
export class RoutesModule { }
