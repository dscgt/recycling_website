import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ExpansionTableComponent, IDisplayData } from 'src/app/modules/extra-material';
import { ICheckinRecord } from 'src/app/modules/backend';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { FbFunctionsService, FirebaseCheckinService } from 'src/app/modules/backend/services/implementations/firebase';
import { DateTime } from 'luxon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-checkin-records',
  templateUrl: './checkin-records.component.html',
  styleUrls: ['./checkin-records.component.scss'],
  providers: [
    MatDatepickerModule,
    MatNativeDateModule,
  ]
})
export class CheckinRecordsComponent implements OnInit {

  @ViewChild(ExpansionTableComponent)
  private expansionTable: ExpansionTableComponent<ICheckinRecord>;

  public records$: Observable<ICheckinRecord[]>;
  public displayData: IDisplayData<ICheckinRecord>[] = [];
  public disableButton: boolean = false;
  public selectScreen: boolean = true;
  public startDate: Date = DateTime.fromJSDate(new Date()).minus({ days: 7 }).toJSDate();
  public endDate: Date = new Date();
  public recordToDelete: any;

  // Modal-related fields
  private controlDeletionDialogSubject$: BehaviorSubject<boolean>;
  public controlDeletionDialog$: Observable<boolean>;
  public deletionDialogRef: MatDialogRef<TemplateRef<any>>;
  private controlEditingDialogSubject$: BehaviorSubject<boolean>;
  public controlEditingDialog$: Observable<boolean>;
  public editingDialogRef: MatDialogRef<TemplateRef<any>>;
  
  // Form-related fields
  public form: FormGroup;
  public currentlyUpdatingRecord: ICheckinRecord;
  public formFieldTitles: string[]; // workaround for not being able to use Object.keys in the HTML

  constructor(
    private backend: FirebaseCheckinService,
    private fbFunctionsService: FbFunctionsService,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // Modal initializations
    this.controlDeletionDialogSubject$ = new BehaviorSubject<boolean>(false);
    this.controlDeletionDialog$ = this.controlDeletionDialogSubject$.asObservable();
    this.controlEditingDialogSubject$ = new BehaviorSubject<boolean>(false);
    this.controlEditingDialog$ = this.controlEditingDialogSubject$.asObservable();

    this.form = this.fb.group({});
  }

  populateForm(record: ICheckinRecord): void {
    const fields: any = {};
    Object.keys(record.properties).forEach((key: string) => {
      fields[key] = [record.properties[key]]
    });
    this.formFieldTitles = Object.keys(record.properties);
    this.form = this.fb.group(fields);
  }

  handleViewRecords(): void {
    const start = DateTime.fromJSDate(this.startDate).startOf('day').toJSDate();
    const end = DateTime.fromJSDate(this.endDate).endOf('day').toJSDate();
    this.records$ = this.backend.getRecords(start, end);
    this.records$.subscribe({
      next: (recordsArray: Array<ICheckinRecord>) => {

        // collect all column names needed
        const columns = new Set();
        recordsArray.forEach((record) => {
          Object.keys(record.properties).forEach((propertyName) => {
            if (!columns.has(propertyName)) {
              columns.add(propertyName);
            }
          });
        });

        // generate IDisplayData from columns
        const newDisplayData = Array.from(columns).map((columnName: string) => {
          const thisAccessor = (record: ICheckinRecord): any => {
            if (record.properties[columnName] == null) {
              return 'N/A';
            }
            return record.properties[columnName];
          };
          return {
            name: columnName,
            property: columnName,
            accessor: thisAccessor,
            accessorAsString: thisAccessor
          }
        });

        // add top-level properties (model title, checkoutTime, checkinTime)
        newDisplayData.unshift(
          {
            name: "Model",
            property: "modelTitle",
            accessor: (record: ICheckinRecord) => {
              return record.modelTitle;
            },
            accessorAsString: (record: ICheckinRecord) => {
              return record.modelTitle;
            }
          },
          {
            name: "Checkout Time",
            property: "checkoutTime",
            accessor: (record: ICheckinRecord) => record.checkoutTime,
            accessorAsString: (record: ICheckinRecord) => record.checkoutTime.toLocaleString()
          },
          {
            name: "Checkin Time",
            property: "checkinTime",
            accessor: (record: ICheckinRecord) => record.checkinTime,
            accessorAsString: (record: ICheckinRecord) => record.checkinTime.toLocaleString()
          }
        )

        // give to table for rendering
        this.displayData = newDisplayData;
      }
    });
    this.selectScreen = false;
  }

  handleDownload(): void {
    this.disableButton = true;
    const start = DateTime.fromJSDate(this.startDate).startOf('day').toJSDate();
    const end = DateTime.fromJSDate(this.endDate).endOf('day').toJSDate();
    this.fbFunctionsService.getCheckinRecords(start, end)
      .then((res) => res.blob())
      .then((res) => {
        var a = document.createElement("a");
        a.href = URL.createObjectURL(res);
        a.setAttribute("download", 'data.xlsx');
        a.click();
      }).then(() => {
        this.disableButton = false;
      })
      .catch((err) => {
        window.alert("There was an error:\n" + err.message);
        this.disableButton = false;
      });
  }

  handleBack(): void {
    this.selectScreen = true;
  }

  handleDelete(): void {
    this.handleCloseDeletionDialog();
    this.backend.deleteRecord(this.recordToDelete.id).catch((err) => {
      if (err) {
        alert(`Error deleting record. Please try again, or let us know. \n ${err}`);
      }
    });
  }

  handleConfirmEdit(): void {
    this.handleCloseEditingDialog();
    this.backend.updateRecordProperties(this.currentlyUpdatingRecord.id, this.form.value).catch((err) => {
      if (err) {
        alert(`Error updating record. Please try again, or let us know. \n ${err}`);
      }
    });
  }

  // Modal-handling functions
  receiveDeletionDialogRef(ref: MatDialogRef<TemplateRef<any>>): void { this.deletionDialogRef = ref }
  handleOpenDeletionDialog(record: ICheckinRecord): void {
    this.recordToDelete = record;
    this.controlDeletionDialogSubject$.next(true);
  }
  handleCloseDeletionDialog(): void { this.controlDeletionDialogSubject$.next(false) }
  receiveEditingDialogRef(ref: MatDialogRef<TemplateRef<any>>): void { this.editingDialogRef = ref }
  handleOpenEditingDialog(record: ICheckinRecord): void {
    this.currentlyUpdatingRecord = record;
    this.populateForm(record);
    this.controlEditingDialogSubject$.next(true);
    this.cd.detectChanges(); // workaround for occasional ExpressionChangedAfterItHasBeenCheckedError
  }
  handleCloseEditingDialog(): void { this.controlEditingDialogSubject$.next(false) }
}
