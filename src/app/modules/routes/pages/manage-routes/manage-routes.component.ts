import { Component, OnInit, ViewChild, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { IRoute, BackendRoutesService, InputType, IField, IRouteStop, IRouteGroup } from 'src/app/modules/backend';
import { ExpansionTableComponent, IDisplayData } from 'src/app/modules/extra-material';
import { MatDialogRef } from '@angular/material/dialog';
import { FormGroup, FormBuilder, FormArray, AsyncValidatorFn, FormControl, ValidationErrors } from '@angular/forms';
import { UtilsService } from 'src/app/modules/extra-material/services/utils/utils.service';
import { DocumentReference } from '@angular/fire/firestore';
import { first, map } from 'rxjs/operators';
import { Validators } from '@angular/forms';

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

  // fields related to editing groups; see openCreationDialog
  public editMode: boolean = false;
  public storedCreationForm: FormGroup;
  public currentlyUpdatingModelId: string | undefined;

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
        accessor: (route: IRoute) => route.title,
        accessorAsString: (route: IRoute) => route.title
      },
      {
        name: "# of Fields in Route",
        property: "fields",
        accessor: (route: IRoute) => route.fields.length,
        accessorAsString: (route: IRoute) => route.fields.length.toString()
      },
      {
        name: "# of Fields in Stops",
        property: "fields_stops",
        accessor: (route: IRoute) => route.stopData.fields.length,
        accessorAsString: (route: IRoute) => route.stopData.fields.length.toString()
      },
      {
        name: "# of Stops",
        property: "stops",
        accessor: (route: IRoute) => route.stopData.stops.length,
        accessorAsString: (route: IRoute) => route.stopData.stops.length.toString()
      },
    ];
    this.clearCreationDialog();
  }

  // This is a workaround for a bug with Angular / Angular Forms
  // Without this, the dynamic [require] binding causes an error
  // This may have performance impacts
  // See https://github.com/angular/angular/issues/23657
  ngAfterContentChecked(): void {
    this.cdref.detectChanges();
  }

  public clearCreationDialog() {
    this.createRouteForm = this.fb.group({
      title: ['', { asyncValidators: [this.routeTitleValidator()] } ],
      fields: this.fb.array([this.createField()], { validators: [this.routeFieldsValidator] }),
      stops: this.fb.array([this.createStop()], { validators: [this.routeFieldsValidator] }),
      fields_stops: this.fb.array([this.createField_Stop()], { validators: [this.routeFieldsValidator] })
    });
  }

  // Replaces the existing content of the form with the content of [model]
  public prepopulateCreationForm(model: IRoute) {
    this.createRouteForm = this.fb.group({
      title: [model.title, Validators.required, [this.routeTitleValidator(model.title)] ],
      fields: this.fb.array(model.fields.map((field: IField) => this.fb.group({
        title: [field.title, Validators.required],
        optional: [field.optional],
        type: [field.type, Validators.required],
        groupId: [field.groupId ? (field.groupId as DocumentReference).id : '']
      }, { validators: [this.groupIdValidator] })), { validators: [this.routeFieldsValidator] }),
      stops: this.fb.array(model.stopData.stops.map((stop: IRouteStop) => this.fb.group({
        title: [stop.title, Validators.required],
        description: [stop.description || ''],
        exclude: [stop.exclude?.join(',') || '']
      })), { validators: [this.routeFieldsValidator] }),
      fields_stops: this.fb.array(model.stopData.fields.map((field: IField) => this.fb.group({
        title: [field.title, [Validators.required, this.stopFieldTitleValidator]],
        optional: [field.optional],
        type: [field.type, Validators.required],
        groupId: [field.groupId ? (field.groupId as DocumentReference).id : '']
      }, { validators: [this.groupIdValidator] })), { validators: [this.routeFieldsValidator] }),
    });
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
    }, { validators: [ this.groupIdValidator ] });
  }

  public createField_Stop(): FormGroup {
    return this.fb.group({
      title: ['', { validators: this.stopFieldTitleValidator }],
      optional: [false],
      type: [''],
      groupId: ['']
    }, { validators: [this.groupIdValidator] });
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
    // build Route from form data
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
        .map(s => s.trim())
        .filter(s => s.length > 0);
      route.stopData.stops.push(stopCopy as IRouteStop);
    }

    if (this.editMode) {
      route.id = this.currentlyUpdatingModelId;
      this.routesBackend.updateRoute(route);
    } else {
      this.routesBackend.addRoute(route);
      this.clearCreationDialog();
    }
    this.closeCreationDialog();
  }

  public receiveCreationDialogRef(ref: MatDialogRef<TemplateRef<any>>): void {
    this.creationDialogRef = ref;
  }

  public receiveDeletionDialogRef(ref: MatDialogRef<TemplateRef<any>>): void {
    this.deletionDialogRef = ref;
  }

  public openCreationDialog(model?: IRoute, editMode?: boolean): void {
    this.editMode = editMode || false;
    if (editMode && model) {
      // save the old state of the form before replacing with group to update
      // also save the group-to-update's ID so that we can refer to it on confirm
      this.storedCreationForm = this.createRouteForm;
      this.currentlyUpdatingModelId = model.id;
      this.prepopulateCreationForm(model);
    }
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
    if (this.editMode && this.storedCreationForm) {
      this.createRouteForm = this.storedCreationForm;
    }
  }

  public deletionDialogClosed(): void {
    // console.log("Dialog closed in child");
  }

  /**
   * For use with form controls which require validation to avoid duplicating a title which already exists among already-created routes.
   * @param allow Group titles to allow. This excludes them from validation checks; if a title which already exists is specified here, then it will still pass validation. 
   */
  public routeTitleValidator = (allow: string | string[] = []): AsyncValidatorFn => {
    const allowedTitles = Array.isArray(allow)
      ? allow
      : [allow];

    return (control: FormControl): Observable<ValidationErrors | null> => {
      const thisValue = control.value.trim();
      return this.routes$.pipe(
        map(routes => !allowedTitles.includes(thisValue) && routes.map(r => r.title).includes(thisValue)
          ? { titleExistsAlready: true }
          : null
        ),
        first()
      );
    }
  }

  /**
   * For use with FormArrays which require validation to ensure no two FormControl's within it have the same 'title' property.
   * In this context, this is used to prevent two fields, two stops, or two stop fields from having the same title. Also applies to more than two.
   */
  public routeFieldsValidator = (array: FormArray): ValidationErrors | null => {
    // first, scan the array for duplicates. 
    const dupFinder = new Map();
    const dups = [];
    for (let control of array.controls) {
      const thisTitle = control.get('title')?.value;
      if (thisTitle != null && thisTitle.length != 0) {
        // only mark a duplicate once
        if (dupFinder.get(thisTitle) === true) {
          dups.push(thisTitle);
          dupFinder.set(thisTitle, false);
        } else {
          dupFinder.set(thisTitle, true)
        }
      }
    }

    // then, return duplicates (or null) to the caller
    if (dups.length != 0) {
      return {
        duplicateFields: dups
      };
    } else {
      return null;
    }
  }

  /**
   * Synchronous validator for use with FormControl's which represent fields and stop fields. 
   * Ensures that groupId is required if type is specified. 
   */
  public groupIdValidator = (group: FormGroup): ValidationErrors | null => {
    const thisGroupId = group.get('groupId')?.value;
    const groupIdIsEmpty = thisGroupId == null || thisGroupId.trim().length === 0;
    return group.get('type')?.value === 'select' && groupIdIsEmpty
      ? { groupIdIsNeeded: true }
      : null;
  }

  /**
   * Ensures that stop fields don't have commas
   */
  public stopFieldTitleValidator = (control: FormControl): ValidationErrors | null =>
    control.value.indexOf(',') === -1
      ? null
      : { stopFieldHasComma: true };

}
