import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { ExpansionTableComponent, IDisplayData } from 'src/app/modules/extra-material';
import { ICheckinModel, InputType, BackendCheckinService } from 'src/app/modules/backend';
import { BehaviorSubject, Observable } from 'rxjs';
import { MatDialogRef } from '@angular/material/dialog';
import { FormGroup, FormArray, FormBuilder } from '@angular/forms';

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

  get fields(): FormArray {
    return this.createModelForm.get('fields') as FormArray;
  }

  constructor(
    private backend: BackendCheckinService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.fieldInputTypes = Object.keys(InputType);
    this.fieldInputTypeValues = Object.values(InputType);
    this.controlDialogSubject$ = new BehaviorSubject<boolean>(false);
    this.controlDialog$ = this.controlDialogSubject$.asObservable();
    this.models$ = this.backend.getModels();
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

  public addField(): void {
    this.fields.push(this.createField());
  }

  public removeField(): void {
    if (this.fields.length > 1) {
      this.fields.removeAt(this.fields.length - 1);
    }
  }

  public createField(): FormGroup {
    return this.fb.group({
      title: [''],
      type: [''],
      optional: [false],
      delay: [false],
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
