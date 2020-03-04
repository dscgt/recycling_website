import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouteRecordsComponent, ManageRoutesComponent } from './pages';
import { RouterModule } from '@angular/router';
import { ROUTES_ROUTES } from './routes.routes';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSortModule } from '@angular/material/sort';

@NgModule({
  declarations: [
    ManageRoutesComponent,
    RouteRecordsComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(ROUTES_ROUTES),
    MatPaginatorModule,
    MatExpansionModule,
    MatSortModule
  ]
})
export class RoutesModule { }
