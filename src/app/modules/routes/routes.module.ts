import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouteRecordsComponent, ManageRoutesComponent } from './pages';
import { RouterModule } from '@angular/router';
import { ROUTES_ROUTES } from './routes.routes';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { ExtraMaterialModule } from 'src/app/modules/extra-material';
import { SharedModule } from '../shared';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider'
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';

@NgModule({
  declarations: [
    ManageRoutesComponent,
    RouteRecordsComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(ROUTES_ROUTES),
    MatPaginatorModule,
    MatExpansionModule,
    MatSortModule,
    MatTableModule,
    MatDialogModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatFormFieldModule,
    MatCardModule,
    MatInputModule,
    MatSelectModule,
    MatDividerModule,
    ReactiveFormsModule,
    ExtraMaterialModule,
    SharedModule
  ]
})
export class RoutesModule { }
