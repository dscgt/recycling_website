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

  private controlDialogSubject$: BehaviorSubject<boolean>;

  public models$: Observable<ICheckinModel[]>;
  public displayData: IDisplayData<ICheckinModel>[];
  public controlDialog$: Observable<boolean>;
  public dialogRef: MatDialogRef<TemplateRef<any>>;
  public createModelForm: FormGroup;
  public fieldInputTypes: string[];
  public fieldInputTypeValues: string[];
  public selectedInputType: string[];
  public groups$: Observable<ICheckinGroup[]>;
  public selectedGroup: string[];

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
    this.controlDialogSubject$ = new BehaviorSubject<boolean>(false);
    this.controlDialog$ = this.controlDialogSubject$.asObservable();
    this.models$ = this.backend.getModels();
    this.selectedInputType = [];
    this.selectedGroup = [];  // ignore, this was to test default groups
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
  // This may have performance impacts
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

    this.selectedInputType.splice(index, 1);
    this.selectedGroup.splice(index, 1);
    if (this.fields.length > 1) {
      this.fields.removeAt(index);
    }
  }

  // swaps the contents of the field at [index] with the field at [index - 1]
  swapFieldUp(index: number): void {
    if (this.fields.length <= 1 || index === 0) {
      return;
    }
    this.utils.swap(this.selectedInputType, index, index - 1);
    this.utils.swap(this.selectedGroup, index, index - 1);
    this.utils.swapFormArray(this.fields, index, index - 1);
  }

  // swaps the contents of the field at [index] with the field at [index + 1]
  swapFieldDown(index: number): void {
    if (this.fields.length <= 1 || index === this.fields.length - 1) {
      return;
    }
    this.utils.swap(this.selectedInputType, index, index + 1);
    this.utils.swap(this.selectedGroup, index, index + 1);
    this.utils.swapFormArray(this.fields, index, index + 1);
  }

  public createField(): FormGroup {
    this.selectedInputType.push("");
    this.selectedGroup.push("");
    return this.fb.group({
      title: [''],
      type: [''],
      optional: [false],
      delay: [false],
      groupId: ['']
    });
  }

  public dialogClosed(): void {
    // console.log("Dialog closed in child");
  }

  public createModel(): void {
    this.controlDialogSubject$.next(true);
  }

  public receiveDialogRef(ref: MatDialogRef<TemplateRef<any>>): void {
    this.dialogRef = ref;
  }

  public closeDialog(): void {
    this.dialogRef?.close();
  }

  public onSubmit(): void {
    const model: ICheckinModel = this.createModelForm.value;
    this.backend.addModel(model);
    this.closeDialog();
  }

}
