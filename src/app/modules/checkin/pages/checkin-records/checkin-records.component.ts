import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ExpansionTableComponent, IDisplayData } from 'src/app/modules/extra-material';
import { ICheckinRecord } from 'src/app/modules/backend';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { BackendCheckinService } from 'src/app/modules/backend/services/interfaces/checkin';
import { FbFunctionsService } from 'src/app/modules/backend/services/implementations/firebase';
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

  // Modal-related fields
  private controlDeletionDialogSubject$: BehaviorSubject<boolean>;
  public controlDeletionDialog$: Observable<boolean>;
  public deletionDialogRef: MatDialogRef<TemplateRef<any>>;
  private controlEditDialogSubject$: BehaviorSubject<boolean>;
  public controlEditDialog$: Observable<boolean>;
  public editDialogRef: MatDialogRef<TemplateRef<any>>;
  
  // Form-related fields
  public form: FormGroup;
  public currentlyUpdatingRecord: ICheckinRecord;
  public formFieldTitles: string[]; // workaround for not being able to use Object.keys in the HTML

  public records$: Observable<ICheckinRecord[]>;
  public displayData: IDisplayData<ICheckinRecord>[] = [];
  public disableButton: boolean = false;
  public selectScreen: boolean = true;
  public startDate: Date = DateTime.fromJSDate(new Date()).minus({ days: 7 }).toJSDate();
  public endDate: Date = new Date();

  // workaround, see checkin-groups component for explanation
  public recordToDelete: any;

  constructor(
    private backend: BackendCheckinService,
    private fbFunctionsService: FbFunctionsService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    // Modal initializations
    this.controlDeletionDialogSubject$ = new BehaviorSubject<boolean>(false);
    this.controlDeletionDialog$ = this.controlDeletionDialogSubject$.asObservable();
    this.controlEditDialogSubject$ = new BehaviorSubject<boolean>(false);
    this.controlEditDialog$ = this.controlEditDialogSubject$.asObservable();

    this.form = this.fb.group({});
  }

  handleViewRecords(): void {
    const start = DateTime.fromJSDate(this.startDate).startOf('day').toJSDate();
    const end = DateTime.fromJSDate(this.endDate).endOf('day').toJSDate();
    this.records$ = this.backend.getRecords(start, end);
    this.records$.subscribe({
      next: (recordsArray: Array<any>) => {

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

  populateForm(record: ICheckinRecord): void {
    const fields:any = {};
    Object.keys(record.properties).forEach((key: string) => {
      fields[key] = [record.properties[key]]
    });
    this.formFieldTitles = Object.keys(record.properties);
    this.form = this.fb.group(fields);
  }

  // modal-related functions
  openDeletionDialog(): void { this.controlDeletionDialogSubject$.next(true) }
  closeDeletionDialog(): void { this.controlDeletionDialogSubject$.next(false) }
  receiveDeletionDialogRef(ref: MatDialogRef<TemplateRef<any>>): void { this.deletionDialogRef = ref }
  handleStartDeletion(record: ICheckinRecord): void {
    this.recordToDelete = record;
    this.openDeletionDialog();
  }
  handleConfirmDeletion(): void {
    this.closeDeletionDialog();
    this.backend.deleteRecord(this.recordToDelete.id);
  }
  openEditDialog(): void { this.controlEditDialogSubject$.next(true) }
  closeEditDialog(): void { this.controlEditDialogSubject$.next(false) }
  receiveEditDialogRef(ref: MatDialogRef<TemplateRef<any>>): void { this.editDialogRef = ref }
  handleStartEdit(record: ICheckinRecord): void {
    this.currentlyUpdatingRecord = record;
    this.populateForm(record);
    this.openEditDialog();
  }
  handleConfirmEdit(): void {
    const updatedRecord = Object.assign({}, this.currentlyUpdatingRecord);
    updatedRecord.properties = this.form.value;
    this.backend.updateRecord(updatedRecord);
    this.closeEditDialog();
  }
}
