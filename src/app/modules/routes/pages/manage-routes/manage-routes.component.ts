import { Component, OnInit, ViewChild, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { IRoute, BackendRoutesService, InputType, IField, IRouteStop, IRouteGroup } from 'src/app/modules/backend';
import { ExpansionTableComponent, IDisplayData } from 'src/app/modules/extra-material';
import { MatDialogRef } from '@angular/material/dialog';
import { FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { UtilsService } from 'src/app/modules/extra-material/services/utils/utils.service';

@Component({
  selector: 'app-manage-routes',
  templateUrl: './manage-routes.component.html',
  styleUrls: ['./manage-routes.component.scss']
})
export class ManageRoutesComponent implements OnInit {

  @ViewChild(ExpansionTableComponent)
  private expansionTable: ExpansionTableComponent<IRoute>;

  private controlCreationDialogSubject$: BehaviorSubject<boolean>;
  private controlDeletionDialogSubject$: BehaviorSubject<boolean>;

  public routes$: Observable<IRoute[]>;
  public displayData: IDisplayData<IRoute>[];
  public controlCreationDialog$: Observable<boolean>;
  public controlDeletionDialog$: Observable<boolean>;
  public creationDialogRef: MatDialogRef<TemplateRef<any>>;
  public deletionDialogRef: MatDialogRef<TemplateRef<any>>;
  public createRouteForm: FormGroup;
  public fieldInputTypes: string[];
  public fieldInputTypeValues: string[];
  public groups$: Observable<IRouteGroup[]>;

  // workaround, see checkin groups component for explanation
  public routeToDelete: IRoute;

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
    private fb: FormBuilder,
    private cdref: ChangeDetectorRef,
    private utils: UtilsService
  ) { }

  ngOnInit(): void {
    this.fieldInputTypes = Object.keys(InputType);
    this.fieldInputTypeValues = Object.values(InputType);
    this.controlCreationDialogSubject$ = new BehaviorSubject<boolean>(false);
    this.controlCreationDialog$ = this.controlCreationDialogSubject$.asObservable();
    this.controlDeletionDialogSubject$ = new BehaviorSubject<boolean>(false);
    this.controlDeletionDialog$ = this.controlDeletionDialogSubject$.asObservable();
    this.routes$ = this.routesBackend.getRoutes();
    this.groups$ = this.routesBackend.getGroups();
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
  }

  // This is a workaround for a bug with Angular / Angular Forms
  // Without this, the dynamic [require] binding causes an error
  // This may have performance impacts
  // See https://github.com/angular/angular/issues/23657
  ngAfterContentChecked(): void {
    this.cdref.detectChanges();
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

  public removeField(i: number): void {
    if (this.fields.length <= 1) {
      return;
    }
    this.fields.removeAt(i);
  }

  public removeField_Stop(i: number): void {
    if (this.fields_stops.length <= 1) {
      return;
    }

    this.fields_stops.removeAt(i);
  }

  public removeStop(i: number): void {
    if (this.stops.length <= 1) {
      return;
    }
    this.stops.removeAt(i);
  }

  public swapField(a: number, b: number): void {
    if (a < 0 || b < 0 || a >= this.fields.length || b >= this.fields.length) {
      return;
    }

    this.utils.swapFormArray(this.fields, a, b);
  }

  public swapField_Stop(a: number, b: number): void {
    if (a < 0 || b < 0 || a >= this.fields_stops.length || b >= this.fields_stops.length) {
      return;
    }

    this.utils.swapFormArray(this.fields_stops, a, b);
  }

  public swapStop(a: number, b: number): void {
    if (a < 0 || b < 0 || a >= this.stops.length || b >= this.stops.length) {
      return;
    }

    this.utils.swapFormArray(this.stops, a, b);
  }

  public createField(): FormGroup {
    return this.fb.group({
      title: [''],
      optional: [false],
      type: [''],
      groupId: ['']
    });
  }

  public createField_Stop(): FormGroup {
    return this.fb.group({
      title: [''],
      optional: [false],
      type: [''],
      groupId: ['']
    });
  }

  public createStop(): FormGroup {
    return this.fb.group({
      title: [''],
      description: [''],
      exclude: ['']
    });
  }

  public confirmDeleteRoute(route: IRoute): void {
    this.routeToDelete = route;
    this.controlDeletionDialogSubject$.next(true);
  }

  public onDelete(): void {
    this.closeDeletionDialog();
    this.routesBackend.deleteRoute(this.routeToDelete.id);
  }

  public onSubmit(): void {
    // check for empty groupIds where they are required
    // this is a WORKAROUND. Ideally, groupIds are automatically validated
    // by Angular Forms as intended. However, that is currently bugged. See ticket
    const missings: string[] = [];
    this.fields.value.forEach((obj:any) => {
      if (obj.type === 'select' && obj.groupId.trim().length === 0) {
        missings.push(obj.title);
      }
    });
    this.fields_stops.value.forEach((obj: any) => {
      if (obj.type === 'select' && obj.groupId.trim().length === 0) {
        missings.push(obj.title);
      }
    });
    if (missings.length > 0) {
      alert(`Please enter a groupId for: ${missings.join(', ')}`);
      return;
    }

    // ensure stop field titles don't have commas
    // this makes sure the comma-separated "excludes" input works
    const violators: string[] = [];
    this.fields_stops.value.forEach((obj: any) => {
      if (obj.title.indexOf(',') !== -1) {
        violators.push(obj.title);
      }
    });
    if (violators.length > 0) {
      alert(`Please remove commas from: ${violators.join(', ')}`);
      return;
    }

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
      // convert exclusions string into array of exclusions
      const stopCopy = Object.assign({}, stop);
      const excludeAsString: string = stopCopy.exclude;
      stopCopy.exclude = excludeAsString
        .split(',')
        .map(s => s.trim());
      route.stopData.stops.push(stopCopy as IRouteStop);
    }

    this.routesBackend.addRoute(route);
    this.closeCreationDialog();
  }

  public receiveCreationDialogRef(ref: MatDialogRef<TemplateRef<any>>): void {
    this.creationDialogRef = ref;
  }

  public receiveDeletionDialogRef(ref: MatDialogRef<TemplateRef<any>>): void {
    this.deletionDialogRef = ref;
  }

  public openCreationDialog(): void {
    this.controlCreationDialogSubject$.next(true);
  }

  public openDeletionDialog(): void {
    this.controlDeletionDialogSubject$.next(true);
  }

  public closeCreationDialog(): void {
    this.creationDialogRef?.close();
  }

  public closeDeletionDialog(): void {
    this.deletionDialogRef?.close();
  }

  public creationDialogClosed(): void {
    // console.log("Dialog closed in child");
  }

  public deletionDialogClosed(): void {
    // console.log("Dialog closed in child");
  }

}
