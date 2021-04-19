import { Component, OnInit, TemplateRef } from '@angular/core';
import { FbFunctionsService } from 'src/app/modules/backend/services/implementations/firebase';
import { DateTime } from 'luxon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { BackendRoutesService, IRouteRecord, IRouteStopRecord } from 'src/app/modules/backend';
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

  // Modal-related fields
  private controlDeletionDialogSubject$: BehaviorSubject<boolean>;
  public controlDeletionDialog$: Observable<boolean>;
  public deletionDialogRef: MatDialogRef<TemplateRef<any>>;
  private controlEditDialogSubject$: BehaviorSubject<boolean>;
  public controlEditDialog$: Observable<boolean>;
  public editDialogRef: MatDialogRef<TemplateRef<any>>;

  // Form-related fields
  public form: FormGroup;
  public currentlyUpdatingRecord: IRouteRecord;

  public records$: Observable<IRouteRecord[]>;
  public startDate: Date = DateTime.fromJSDate(new Date()).minus({ days: 7 }).toJSDate();
  public endDate: Date = new Date();;
  public displayData: IDisplayData<IRouteRecord>[] = [];
  public disableButton = false;
  public selectScreen: boolean = true;

  // workaround, see checkin-groups component for explanation
  public recordToDelete: any;

  // form getters
  get stops() {
    return this.form.get('stops') as FormArray;
  }
  get properties() {
    return this.form.get('properties') as FormGroup;
  }

  constructor(
    private backend: BackendRoutesService,
    private fbFunctionsService: FbFunctionsService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    // Modal initializations
    this.controlDeletionDialogSubject$ = new BehaviorSubject<boolean>(false);
    this.controlDeletionDialog$ = this.controlDeletionDialogSubject$.asObservable();
    this.controlEditDialogSubject$ = new BehaviorSubject<boolean>(false);
    this.controlEditDialog$ = this.controlEditDialogSubject$.asObservable();

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

  // modal-related functions
  openDeletionDialog(): void { this.controlDeletionDialogSubject$.next(true) }
  closeDeletionDialog(): void { this.controlDeletionDialogSubject$.next(false) }
  receiveDeletionDialogRef(ref: MatDialogRef<TemplateRef<any>>): void { this.deletionDialogRef = ref }
  handleStartDeletion(record: IRouteRecord): void {
    this.recordToDelete = record;
    this.openDeletionDialog();
  }
  handleConfirmDeletion(): void {
    this.closeDeletionDialog();
    this.backend.deleteRecord(this.recordToDelete.id).catch((err:any) => {
      if (err) {
        alert(`Error deleting record. Please try again, or let us know. \n ${err}`);
      }
    });
  }
  openEditDialog(): void { this.controlEditDialogSubject$.next(true) }
  closeEditDialog(): void { this.controlEditDialogSubject$.next(false) }
  receiveEditDialogRef(ref: MatDialogRef<TemplateRef<any>>): void { this.editDialogRef = ref }
  handleStartEdit(record: IRouteRecord): void {
    this.currentlyUpdatingRecord = record;
    this.populateForm(record);
    this.openEditDialog();
  }
  handleConfirmEdit(): void {
    this.closeEditDialog();
    const newRecord: IRouteRecord = Object.assign({}, this.currentlyUpdatingRecord);
    this.backend.updateRecord(newRecord.id as string, this.form.value.properties, this.form.value.stops).catch((err) => {
      if (err) {
        alert(`Error updating record. Please try again, or let us know. \n ${err}`);
      }
    });
  }
}
