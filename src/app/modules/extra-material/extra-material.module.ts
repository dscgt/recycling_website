import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ProjectionDialogComponent, FABComponent, ExpansionTableComponent } from './components';
import { MatDialogModule } from '@angular/material/dialog';



@NgModule({
  declarations: [
    ExpansionTableComponent,
    FABComponent,
    ProjectionDialogComponent
  ],
  imports: [
    MatExpansionModule,
    MatSortModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    CommonModule
  ],
  exports: [
    ExpansionTableComponent,
    FABComponent,
    ProjectionDialogComponent
  ]
})
export class ExtraMaterialModule { }
