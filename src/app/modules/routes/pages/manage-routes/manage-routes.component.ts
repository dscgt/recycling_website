import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { IRoute, BackendRoutesService, InputType, IField, IRouteStop } from 'src/app/modules/backend';
import { ExpansionTableComponent, IDisplayData } from 'src/app/modules/extra-material';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FormGroup, FormControl, FormBuilder, FormArray } from '@angular/forms';

@Component({
  selector: 'app-manage-routes',
  templateUrl: './manage-routes.component.html',
  styleUrls: ['./manage-routes.component.scss']
})
export class ManageRoutesComponent implements OnInit {

  @ViewChild(ExpansionTableComponent)
  private expansionTable: ExpansionTableComponent<IRoute>;

  private controlDialogSubject$: BehaviorSubject<boolean>;

  public routes$: Observable<IRoute[]>;
  public displayData: IDisplayData<IRoute>[];
  public controlDialog$: Observable<boolean>;
  public dialogRef: MatDialogRef<TemplateRef<any>>;
  public createRouteForm: FormGroup;
  public fieldInputTypes: string[];
  public fieldInputTypeValues: string[];
  public selectedInputType: string[];
  public groupTitles: string[];
  public selectedGroup: string;
  public selectedInputType_stop: string[];
  public selectedGroup_stop: string;

  get fields(): FormArray {
    return this.createRouteForm.get('fields') as FormArray;
  }

  get stops(): FormArray {
    return this.createRouteForm.get('stops') as FormArray;
  }

  get fields_stops(): FormArray {
    return this.createRouteForm.get('fields_stops') as FormArray;
  }

  constructor(
    private routesBackend: BackendRoutesService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.fieldInputTypes = Object.keys(InputType);
    this.fieldInputTypeValues = Object.values(InputType);
    this.controlDialogSubject$ = new BehaviorSubject<boolean>(false);
    this.controlDialog$ = this.controlDialogSubject$.asObservable();
    this.routes$ = this.routesBackend.getRoutes();
    this.selectedInputType = [];
    this.selectedGroup = "Group 1";  // ignore, this was to test default groups
    this.selectedInputType_stop = [];
    this.selectedGroup_stop = "Group 1";  // ignore, this was to test default groups
    this.displayData = [
      {
        name: "Title",
        property: "title",
        accessor: (route: IRoute) => route.title
      },
      {
        name: "# of Fields in Route",
        property: "fields",
        accessor: (route: IRoute) => route.fields.length.toString()
      },
      {
        name: "# of Fields in Stops",
        property: "fields_stops",
        accessor: (route: IRoute) => route.stopData.fields.length.toString()
      },
      {
        name: "# of Stops",
        property: "stops",
        accessor: (route: IRoute) => route.stopData.stops.length.toString()
      },
    ];
    this.createRouteForm = this.fb.group({
      title: [''],
      fields: this.fb.array([ this.createField() ]),
      stops: this.fb.array([ this.createStop() ]),
      fields_stops: this.fb.array([ this.createField() ])
    });
    this.groupTitles = ["Group 1", "Group 2"];
  }

  public addField(): void {
    this.fields.push(this.createField());
  }

  public addField_Stop(): void {
    this.fields_stops.push(this.createField_Stop());
  }

  public addStop(): void {
    this.stops.push(this.createStop());
  }

  public removeField(): void {
    if (this.fields.length > 1) {
      this.fields.removeAt(this.fields.length - 1);
    }
  }

  public removeField_Stop(): void {
    if (this.fields_stops.length > 1) {
      this.fields_stops.removeAt(this.fields_stops.length - 1);
    }
  }

  public removeStop(): void {
    if (this.stops.length > 1) {
      this.stops.removeAt(this.stops.length - 1);
    }
  }

  public createField(): FormGroup {
    this.selectedInputType.push('');
    return this.fb.group({
      title: [''],
      optional: [false],
      type: [''],
      groupid: ['']
    });
  }

  public createField_Stop(): FormGroup {
    this.selectedInputType_stop.push('');
    return this.fb.group({
      title: [''],
      optional: [false],
      type: [''],
      groupid: ['']
    });
  }

  public createStop(): FormGroup {
    return this.fb.group({
      title: [''],
      description: ['']
    });
  }

  public dialogClosed(): void {
    // console.log("Dialog closed in child");
  }

  public createRoute(): void {
    this.controlDialogSubject$.next(true);
  }

  public receiveDialogRef(ref: MatDialogRef<TemplateRef<any>>): void {
    this.dialogRef = ref;
  }

  public closeDialog(): void {
    this.dialogRef?.close();
  }

  public onSubmit(): void {
    const vals: any = this.createRouteForm.value;
    const route: IRoute = {
      title: vals["title"],
      fields: [],
      stopData: {
        fields: [],
        stops: []
      }
    };

    for (let field of vals["fields"]) {
      route.fields.push(field as IField);
    }

    for (let field of vals["fields_stops"]) {
      route.stopData.fields.push(field as IField);
    }

    for (let stop of vals["stops"]) {
      route.stopData.stops.push(stop as IRouteStop);
    }

    this.routesBackend.addRoute(route);
    this.closeDialog();
  }

}
