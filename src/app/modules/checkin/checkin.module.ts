import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CHECKIN_ROUTES } from './checkin.routes';
import { CheckinRecordsComponent, ManageCheckinComponent, CheckinGroupComponent } from './pages';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ExtraMaterialModule } from '../extra-material';
import { SharedModule } from '../shared';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@NgModule({
  declarations: [
    ManageCheckinComponent,
    CheckinRecordsComponent,
    CheckinGroupComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(CHECKIN_ROUTES),
    MatPaginatorModule,
    MatExpansionModule,
    MatSortModule,
    MatTableModule,
    MatDialogModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatFormFieldModule,
    MatCardModule,
    MatInputModule,
    MatSelectModule,
    MatDividerModule,
    ReactiveFormsModule,
    ExtraMaterialModule,
    SharedModule,
    FormsModule
  ]
})
export class CheckinModule { }
