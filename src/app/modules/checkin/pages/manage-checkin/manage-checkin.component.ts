import { Component, OnInit, ViewChild, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { ExpansionTableComponent, IDisplayData } from 'src/app/modules/extra-material';
import { ICheckinModel, InputType, BackendCheckinService, ICheckinGroup } from 'src/app/modules/backend';
import { BehaviorSubject, Observable } from 'rxjs';
import { MatDialogRef } from '@angular/material/dialog';
import { FormGroup, FormArray, FormBuilder } from '@angular/forms';
import { UtilsService } from 'src/app/modules/extra-material/services/utils/utils.service';

@Component({
  selector: 'app-manage-checkin',
  templateUrl: './manage-checkin.component.html',
  styleUrls: ['./manage-checkin.component.scss']
})
export class ManageCheckinComponent implements OnInit {

  @ViewChild(ExpansionTableComponent)
  private expansionTable: ExpansionTableComponent<ICheckinModel>;

  private controlCreationDialogSubject$: BehaviorSubject<boolean>;
  private controlDeletionDialogSubject$: BehaviorSubject<boolean>;

  public models$: Observable<ICheckinModel[]>;
  public displayData: IDisplayData<ICheckinModel>[];
  public controlCreationDialog$: Observable<boolean>;
  public controlDeletionDialog$: Observable<boolean>;
  public creationDialogRef: MatDialogRef<TemplateRef<any>>;
  public deletionDialogRef: MatDialogRef<TemplateRef<any>>;
  public createModelForm: FormGroup;
  public fieldInputTypes: string[];
  public fieldInputTypeValues: string[];
  public groups$: Observable<ICheckinGroup[]>;

  // workaround, see checkin-groups component for explanation
  public modelToDelete: ICheckinModel;

  get fields(): FormArray {
    return this.createModelForm.get('fields') as FormArray;
  }

  constructor(
    private backend: BackendCheckinService,
    private fb: FormBuilder,
    private cdref: ChangeDetectorRef,
    private utils: UtilsService
  ) { }

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
        accessor: (model: ICheckinModel) => model.title
      },
      {
        name: "# of Fields",
        property: "fields",
        accessor: (model: ICheckinModel) => model.fields.length.toString()
      },
    ];
    this.createModelForm = this.fb.group({
      title: [''],
      fields: this.fb.array([ this.createField() ]),
    });
  }

  // This is a workaround for a bug with Angular / Angular Forms
  // Without this, the dynamic [require] binding causes an error
  // However, this workaround may have performance impacts
  // See https://github.com/angular/angular/issues/23657
  ngAfterContentChecked(): void {
    this.cdref.detectChanges();
  }

  public addField(): void {
    this.fields.push(this.createField());
  }

  public removeField(index: number): void {
    if (this.fields.length <= 1) {
      return;
    }

    this.fields.removeAt(index);
  }

  // swaps the contents of the field at [a] with the field at [b]
  public swapField(a: number, b: number): void {
    if (a < 0 || b < 0 || a >= this.fields.length || b >= this.fields.length) {
      return;
    }

    this.utils.swapFormArray(this.fields, a, b);
  }

  public createField(): FormGroup {
    return this.fb.group({
      title: [''],
      type: [''],
      optional: [false],
      delay: [false],
      groupId: ['']
    });
  }

  public confirmDeleteModel(model: ICheckinModel): void {
    this.modelToDelete = model;
    this.controlDeletionDialogSubject$.next(true);
  }

  public onDelete(): void {
    this.closeDeletionDialog();
    this.backend.deleteModel(this.modelToDelete.id);
  }

  public onSubmit(): void {
    // check for empty groupIds where they are required
    // this is a WORKAROUND. Ideally, groupIds are automatically validated
    // by Angular Forms as intended. However, that is currently bugged. See ticket
    const fieldsToScan:any[] = this.fields.value;
    const missings:string[] = [];
    fieldsToScan.forEach((obj) => {
      if (obj.type === 'select'  && obj.groupId.trim().length === 0) {
        missings.push(obj.title);
      }
    });
    if (missings.length > 0) {
      alert(`Please enter a groupId for: ${missings.join(', ')}`);
      return;
    }

    const model: ICheckinModel = this.createModelForm.value;
    this.backend.addModel(model);
    this.closeCreationDialog();
  }

  public openCreationDialog(): void {
    this.controlCreationDialogSubject$.next(true);
  }

  public openDeletionDialog(): void {
    this.controlDeletionDialogSubject$.next(true);
  }

  public creationDialogClosed(): void {
    // console.log("Dialog closed in child");
  }

  public deletionDialogClosed(): void {
    // console.log("Dialog closed in child");
  }

  public receiveCreationDialogRef(ref: MatDialogRef<TemplateRef<any>>): void {
    this.creationDialogRef = ref;
  }

  public receiveDeletionDialogRef(ref: MatDialogRef<TemplateRef<any>>): void {
    this.deletionDialogRef = ref;
  }

  public closeCreationDialog(): void {
    this.creationDialogRef?.close();
  }

  public closeDeletionDialog(): void {
    this.deletionDialogRef?.close();
  }
}
