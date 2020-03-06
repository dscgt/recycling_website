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

  get fields(): FormArray {
    return this.createRouteForm.get('fields') as FormArray;
  }

  get stops(): FormArray {
    return this.createRouteForm.get('stops') as FormArray;
  }

  constructor(
    private routesBackend: BackendRoutesService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.fieldInputTypes = Object.values(InputType);
    this.controlDialogSubject$ = new BehaviorSubject<boolean>(false);
    this.controlDialog$ = this.controlDialogSubject$.asObservable();
    this.routes$ = this.routesBackend.getRoutes();
    this.displayData = [
      {
        name: "Name",
        property: "name",
        accessor: (route: IRoute) => route.name
      },
      {
        name: "# of Fields",
        property: "fields",
        accessor: (route: IRoute) => route.stopData.fields.length.toString()
      },
      {
        name: "# of Stops",
        property: "stops",
        accessor: (route: IRoute) => route.stopData.stops.length.toString()
      },
    ];
    this.createRouteForm = this.fb.group({
      name: [''],
      fields: this.fb.array([ this.createField() ]),
      stops: this.fb.array([ this.createStop() ])
    });
  }

  public addField(): void {
    this.fields.push(this.createField());
  }

  public addStop(): void {
    this.stops.push(this.createStop());
  }

  public removeField(): void {
    if (this.fields.length > 1) {
      this.fields.removeAt(this.fields.length - 1);
    }
  }

  public removeStop(): void {
    if (this.stops.length > 1) {
      this.stops.removeAt(this.stops.length - 1);
    }
  }

  public createField(): FormGroup {
    return this.fb.group({
      name: [''],
      optional: [''],
      inputType: ['']
    });
  }

  public createStop(): FormGroup {
    return this.fb.group({
      name: ['']
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
      name: vals["name"],
      stopData: {
        fields: [],
        stops: []
      }
    };

    for (let field of vals["fields"]) {
      route.stopData.fields.push(field as IField);
    }

    for (let stop of vals["stops"]) {
      route.stopData.stops.push(stop as IRouteStop);
    }

    this.routesBackend.addRoute(route);
    this.closeDialog();
  }

}
