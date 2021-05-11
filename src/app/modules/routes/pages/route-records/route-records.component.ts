import { Component, OnInit, TemplateRef } from '@angular/core';
import { FbFunctionsService, FirebaseRoutesService } from 'src/app/modules/backend/services/implementations/firebase';
import { DateTime } from 'luxon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { IRouteRecord, IRouteStopRecord } from 'src/app/modules/backend';
import { BehaviorSubject, Observable } from 'rxjs';
import { IDisplayData } from 'src/app/modules/extra-material';
import { MatDialogRef } from '@angular/material/dialog';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-route-records',
  templateUrl: './route-records.component.html',
  styleUrls: ['./route-records.component.scss'],
  providers: [
    MatDatepickerModule,
    MatNativeDateModule,
  ]
})
export class RouteRecordsComponent implements OnInit {

  public records$: Observable<IRouteRecord[]>;
  public startDate: Date = DateTime.fromJSDate(new Date()).minus({ days: 7 }).toJSDate();
  public endDate: Date = new Date();;
  public displayData: IDisplayData<IRouteRecord>[] = [];
  public disableButton = false;
  public selectScreen: boolean = true;
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
  public currentlyUpdatingRecord: IRouteRecord;

  constructor(
    private backend: FirebaseRoutesService,
    private fbFunctionsService: FbFunctionsService,
    private fb: FormBuilder
  ) { }

  get stops() {
    return this.form.get('stops') as FormArray;
  }
  get properties() {
    return this.form.get('properties') as FormGroup;
  }

  ngOnInit(): void {
    // Modal initializations
    this.controlDeletionDialogSubject$ = new BehaviorSubject<boolean>(false);
    this.controlDeletionDialog$ = this.controlDeletionDialogSubject$.asObservable();
    this.controlEditingDialogSubject$ = new BehaviorSubject<boolean>(false);
    this.controlEditingDialog$ = this.controlEditingDialogSubject$.asObservable();

    this.displayData = [
      {
        name: "Model",
        property: "modelTitle",
        accessor: (record: IRouteRecord) => {
          return record.modelTitle;
        },
        accessorAsString: (record: IRouteRecord) => {
          return record.modelTitle;
        }
      },
      {
        name: "Start Time",
        property: "startTime",
        accessor: (record: IRouteRecord) => record.startTime,
        accessorAsString: (record: IRouteRecord) => record.startTime.toLocaleString()
      },
      {
        name: "End Time",
        property: "endTime",
        accessor: (record: IRouteRecord) => record.endTime,
        accessorAsString: (record: IRouteRecord) => record.endTime.toLocaleString()
      }
    ];
    this.initEmptyForm();
  }

  populateForm(record: IRouteRecord): void {
    const properties: any = {};
    Object.keys(record.properties).forEach((key: string) => {
      properties[key] = [record.properties[key], Validators.required]
    });
    this.form = this.fb.group({
      properties: this.fb.group(properties),
      stops: this.fb.array(record.stops.map((stopRecord: IRouteStopRecord) => {
        const stopProperties: any = {};
        Object.keys(stopRecord.properties).forEach((key: string) => {
          stopProperties[key] = [stopRecord.properties[key], Validators.required]
        });
        return this.fb.group({
          title: [stopRecord.title],
          properties: this.fb.group(stopProperties)
        })
      }))
    });
  }

  initEmptyForm(): void {
    this.form = this.fb.group({
      properties: {},
      stops: this.fb.array([])
    })
  }

  handleViewRecords(): void {
    const start = DateTime.fromJSDate(this.startDate).startOf('day').toJSDate();
    const end = DateTime.fromJSDate(this.endDate).endOf('day').toJSDate();
    this.records$ = this.backend.getRecords(start, end);
    this.selectScreen = false;
  }

  handleDownload(): void {
    this.disableButton = true;
    // turn start and end date into beginning and end of day, respectively, then send to getRouteRecords
    const start = DateTime.fromJSDate(this.startDate).startOf('day').toJSDate();
    const end = DateTime.fromJSDate(this.endDate).endOf('day').toJSDate();
    this.fbFunctionsService.getRouteRecords(start, end)
      .then((res) => {
        if (res.ok) {
          return res.blob();
        } else {
          throw new Error('Network call failed: internal server error. Try again another time, or contact the creators if this keeps happening.');
        }
      })
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

  handleConfirmEdit(): void {
    this.handleCloseEditingDialog();
    const newRecord: IRouteRecord = Object.assign({}, this.currentlyUpdatingRecord);
    this.backend.updateRecord(newRecord.id, this.form.value.properties, this.form.value.stops).catch((err) => {
      if (err) {
        alert(`Error updating record. Please try again, or let us know. \n ${err}`);
      }
    });
  }

  handleDelete(): void {
    this.handleCloseDeletionDialog();
    this.backend.deleteRecord(this.recordToDelete.id).catch((err: any) => {
      if (err) {
        alert(`Error deleting record. Please try again, or let us know. \n ${err}`);
      }
    });
  }

  // modal-related functions
  receiveEditingDialogRef(ref: MatDialogRef<TemplateRef<any>>): void { this.editingDialogRef = ref }
  handleOpenEditingDialog(record: IRouteRecord): void {
    this.currentlyUpdatingRecord = record;
    this.populateForm(record);
    this.controlEditingDialogSubject$.next(true)
  }
  handleCloseEditingDialog(): void { this.controlEditingDialogSubject$.next(false) }
  receiveDeletionDialogRef(ref: MatDialogRef<TemplateRef<any>>): void { this.deletionDialogRef = ref }
  handleOpenDeletionDialog(record: IRouteRecord): void {
    this.recordToDelete = record;
    this.controlDeletionDialogSubject$.next(true);
  }
  handleCloseDeletionDialog(): void { this.controlDeletionDialogSubject$.next(false) }
}
