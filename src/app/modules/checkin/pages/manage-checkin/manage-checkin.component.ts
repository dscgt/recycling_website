import { Component, OnInit, ViewChild, TemplateRef, ChangeDetectorRef, Input } from '@angular/core';
import { ExpansionTableComponent, IDisplayData } from 'src/app/modules/extra-material';
import { ICheckinModel, InputType, ICheckinGroup } from 'src/app/modules/backend';
import { BehaviorSubject, Observable } from 'rxjs';
import { MatDialogRef } from '@angular/material/dialog';
import { FormGroup, FormArray, FormBuilder, AsyncValidatorFn, AbstractControl, ValidationErrors, FormControl } from '@angular/forms';
import { UtilsService } from 'src/app/modules/extra-material/services/utils/utils.service';
import { DocumentReference } from '@angular/fire/firestore';
import { first, map } from 'rxjs/operators';
import { Validators } from '@angular/forms';
import { FirebaseCheckinService } from 'src/app/modules/backend/services/implementations/firebase';

@Component({
  selector: 'app-manage-checkin',
  templateUrl: './manage-checkin.component.html',
  styleUrls: ['./manage-checkin.component.scss']
})
export class ManageCheckinComponent implements OnInit {

  @ViewChild(ExpansionTableComponent)
  private expansionTable: ExpansionTableComponent<ICheckinModel>;

  public models$: Observable<ICheckinModel[]>;
  public groups$: Observable<ICheckinGroup[]>;
  public displayData: IDisplayData<ICheckinModel>[];
  public createModelForm: FormGroup;
  public fieldInputTypes: string[];
  public fieldInputTypeValues: string[];
  public modelToDelete: ICheckinModel;

  // Modal-related fields
  private controlCreationDialogSubject$: BehaviorSubject<boolean>;
  private controlDeletionDialogSubject$: BehaviorSubject<boolean>;
  public controlCreationDialog$: Observable<boolean>;
  public controlDeletionDialog$: Observable<boolean>;
  public creationDialogRef: MatDialogRef<TemplateRef<any>>;
  public deletionDialogRef: MatDialogRef<TemplateRef<any>>;

  // Fields used during editing
  public isEditMode: boolean = false;
  public storedCreationForm: FormGroup;
  public currentlyUpdatingModelId: string | undefined;

  constructor(
    private backend: FirebaseCheckinService,
    private fb: FormBuilder,
    private cdref: ChangeDetectorRef,
    private utils: UtilsService
  ) { }

  get fields(): FormArray {
    return this.createModelForm.get('fields') as FormArray;
  }

  ngOnInit(): void {
    this.fieldInputTypes = Object.keys(InputType);
    this.fieldInputTypeValues = Object.values(InputType);
    this.controlCreationDialogSubject$ = new BehaviorSubject<boolean>(false);
    this.controlDeletionDialogSubject$ = new BehaviorSubject<boolean>(false);
    this.controlCreationDialog$ = this.controlCreationDialogSubject$.asObservable();
    this.controlDeletionDialog$ = this.controlDeletionDialogSubject$.asObservable();
    this.models$ = this.backend.getModels();
    this.groups$ = this.backend.getGroups();
    this.displayData = [
      {
        name: "Title",
        property: "title",
        accessor: (model: ICheckinModel) => model.title,
        accessorAsString: (model: ICheckinModel) => model.title
      },
      {
        name: "# of Fields",
        property: "fields",
        accessor: (model: ICheckinModel) => model.fields.length,
        accessorAsString: (model: ICheckinModel) => model.fields.length.toString()
      },
    ];
    this.clearCreationForm();
  }

  // This is a workaround for a bug with Angular / Angular Forms
  // Without this, the dynamic [require] binding causes an error
  // However, this workaround may have performance impacts
  // See https://github.com/angular/angular/issues/23657
  ngAfterContentChecked(): void {
    this.cdref.detectChanges();
  }

  // Replaces the existing content of the form with the content of [model]
  public prepopulateCreationForm(model: ICheckinModel) {
    this.createModelForm = this.fb.group({
      title: [model.title, Validators.required, [this.modelTitleValidator(model.title)]],
      fields: this.fb.array(model.fields.map((field) => this.fb.group({
        title: [field.title, Validators.required],
        type: [field.type, Validators.required],
        optional: [field.optional],
        delay: [field.delay],
        groupId: [field.groupId ? (field.groupId as DocumentReference).id : ''],
      }, { validators: [this.groupIdValidator] })), { validators: [this.modelFieldsValidator] }),
    });
  }

  public clearCreationForm(): void {
    this.createModelForm = this.fb.group({
      title: ['', { asyncValidators: [this.modelTitleValidator()] }],
      fields: this.fb.array([this.createField()], { validators: [this.modelFieldsValidator] }),
    });
  }

  public createField(): FormGroup {
    return this.fb.group({
      title: [''],
      type: [''],
      optional: [false],
      delay: [false],
      groupId: ['']
    }, { validators: [this.groupIdValidator] });
  }

  public handleAddField(): void {
    this.fields.push(this.createField());
  }

  public handleRemoveField(index: number): void {
    if (this.fields.length <= 1) {
      return;
    }
    this.fields.removeAt(index);
  }

  // swaps the contents of the field at [a] with the field at [b]
  public handleSwapField(a: number, b: number): void {
    if (a < 0 || b < 0 || a >= this.fields.length || b >= this.fields.length) {
      return;
    }

    this.utils.swapFormArray(this.fields, a, b);
  }

  public handleCreate(): void {
    if (this.isEditMode && this.currentlyUpdatingModelId) {
      const model: ICheckinModel = this.createModelForm.value;
      model.id = this.currentlyUpdatingModelId;
      this.backend.updateModel(model);
    } else {
      this.backend.addModel(this.createModelForm.value);
      this.clearCreationForm();
    }
    this.handleCloseCreationDialog();
  }

  public handleDelete(): void {
    this.handleCloseDeletionDialog();
    this.backend.deleteModel(this.modelToDelete.id);
  }

  // Modal-handling functions
  public receiveCreationDialogRef(ref: MatDialogRef<TemplateRef<any>>): void {
    this.creationDialogRef = ref;
  }
  public handleOpenCreationDialog(model?: ICheckinModel, isEditMode?: boolean): void {
    this.isEditMode = isEditMode || false;
    if (isEditMode && model) {
      // save the old state of the form before replacing with model to update
      // also save the model-to-update's ID so that we can refer to it on confirm
      this.storedCreationForm = this.createModelForm;
      this.currentlyUpdatingModelId = model.id;
      this.prepopulateCreationForm(model);
    }
    this.controlCreationDialogSubject$.next(true);
  }
  public handleCloseCreationDialog(): void {
    this.controlCreationDialogSubject$.next(false);
  }
  public handleCreationDialogClosed(): void {
    if (this.isEditMode && this.storedCreationForm) {
      this.createModelForm = this.storedCreationForm;
    }
  }
  public receiveDeletionDialogRef(ref: MatDialogRef<TemplateRef<any>>): void {
    this.deletionDialogRef = ref;
  }
  public handleOpenDeletionDialog(model: ICheckinModel): void {
    this.modelToDelete = model;
    this.controlDeletionDialogSubject$.next(true);
  }
  public handleCloseDeletionDialog(): void {
    this.controlDeletionDialogSubject$.next(false);
  }

  /**
   * For use with form controls which require validation to avoid duplicating a title which already exists among already-created checkin models.
   * @param allow Group titles to allow. This excludes them from validation checks; if a title which already exists is specified here, then it will still pass validation. 
   */
  public modelTitleValidator = (allow: string | string[] = []): AsyncValidatorFn => {
    const allowedTitles = Array.isArray(allow)
      ? allow
      : [allow];

    return (control: FormControl): Observable<ValidationErrors | null> => {
      const thisValue = control.value.trim();
      return this.models$.pipe(
        map(models => !allowedTitles.includes(thisValue) && models.map(g => g.title).includes(thisValue)
          ? { titleExistsAlready: true }
          : null
        ),
        first()
      );
    }
  }
  /**
   * For use with FormArrays which require validation to ensure no two FormControl's within it have the same 'title' property.
   * In this context, this is used to prevent two fields from having the same title.
   */
  public modelFieldsValidator = (array: FormArray): ValidationErrors | null => {
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
        duplicateModelFields: dups
      };
    } else {
      return null;
    }
  }
  /**
   * Synchronous validator for use with FormControl's which represent fields. 
   * Ensures that groupId is required if type is specified. 
   */
  public groupIdValidator = (group: FormGroup): ValidationErrors | null => {
    const thisGroupId = group.get('groupId')?.value;
    const groupIdIsEmpty = thisGroupId == null || thisGroupId.trim().length === 0;
    return group.get('type')?.value === 'select' && groupIdIsEmpty
      ? { groupIdIsNeeded: true }
      : null;
  }
}
