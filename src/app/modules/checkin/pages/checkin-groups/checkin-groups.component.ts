import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { ExpansionTableComponent, IDisplayData } from 'src/app/modules/extra-material';
// different model
import { ICheckinGroup, ICheckinGroupMember, BackendCheckinService, ICheckinModel } from 'src/app/modules/backend';
import { BehaviorSubject, Observable } from 'rxjs';
import { MatDialogRef } from '@angular/material/dialog';
import { FormGroup, FormArray, FormBuilder } from '@angular/forms';
import { UtilsService } from 'src/app/modules/extra-material/services/utils/utils.service';

@Component({
  selector: 'app-manage-checkin',
  templateUrl: './checkin-groups.component.html',
  styleUrls: ['./checkin-groups.component.scss']
})
export class CheckinGroupComponent implements OnInit {

  @ViewChild(ExpansionTableComponent)
  private expansionTable: ExpansionTableComponent<ICheckinGroup>;

  private controlCreationDialogSubject$: BehaviorSubject<boolean>;
  private controlConfirmationDialogSubject$: BehaviorSubject<boolean>;

  public groups$: Observable<ICheckinGroup[]>;
  public displayData: IDisplayData<ICheckinGroup>[];
  public controlCreationDialog$: Observable<boolean>;
  public controlConfirmationDialog$: Observable<boolean>;
  public creationDialogRef: MatDialogRef<TemplateRef<any>>;
  public confirmationDialogRef: MatDialogRef<TemplateRef<any>>;
  public createGroupForm: FormGroup;
  public fieldInputTypes: string[];
  public fieldInputTypeValues: string[];

  // fields related to editing groups; see openCreationDialog
  public editMode: boolean = false;
  public storedCreationForm: FormGroup;
  public currentlyUpdatingGroupId: string | undefined;

  // workaround. there is no way for deletion method to know which group to delete without this reference.
  // ideally, this is passed to the deletion method directly--but the nesting required to do so causes
  // bugs with expansion tables.
  public groupToDelete: ICheckinGroup;

  get members(): FormArray {
    return this.createGroupForm.get('members') as FormArray;
  }

  constructor(
    private backend: BackendCheckinService,
    private fb: FormBuilder,
    private utils: UtilsService
  ) { }

  ngOnInit(): void {
    // initialize dialog controls
    this.controlCreationDialogSubject$ = new BehaviorSubject<boolean>(false);
    this.controlCreationDialog$ = this.controlCreationDialogSubject$.asObservable();
    this.controlConfirmationDialogSubject$ = new BehaviorSubject<boolean>(false);
    this.controlConfirmationDialog$ = this.controlConfirmationDialogSubject$.asObservable();

    this.groups$ = this.backend.getGroups();
    this.displayData = [
      {
        name: "Title",
        property: "title",
        accessor: (group: ICheckinGroup) => group.title
      },
      {
        name: "# of Members",
        property: "members",
        accessor: (group: ICheckinGroup) => group.members.length.toString()
      },
    ];
    this.createGroupForm = this.fb.group({
      title: [''],
      members: this.fb.array([ this.createMember() ]),
    });
  }

  // Replaces the existing content of the form with the content of [group]
  public prepopulateCreationForm(group: ICheckinGroup) {
    this.createGroupForm = this.fb.group({
      title: [group.title],
      members: this.fb.array(group.members.map((member: ICheckinGroupMember) => this.fb.group({
        title: [member.title]
      }))),
    });
  }

  public addMember(): void {
    this.members.push(this.createMember());
  }

  public removeMember(index: number): void {
    if (this.members.length <= 1) {
      return;
    }

    this.members.removeAt(index);
  }

  public swapMember(a: number, b: number): void {
    if (a < 0 || b < 0 || a >= this.members.length || b >= this.members.length) {
      return;
    }
    this.utils.swapFormArray(this.members, a, b);
  }

  public createMember(): FormGroup {
    return this.fb.group({
      title: [''],
    });
  }

  public confirmDeleteGroup(group: ICheckinGroup): void {
    this.groupToDelete = group;
    this.controlConfirmationDialogSubject$.next(true);
  }

  public onDelete(): void {
    this.closeConfirmationDialog();
    this.backend.deleteGroup(this.groupToDelete.id);
  }

  public onSubmit(): void {
    const group: ICheckinGroup = this.createGroupForm.value;

    if (this.editMode) {
      group.id = this.currentlyUpdatingGroupId;
      this.backend.updateGroup(group);
    } else {
      this.backend.addGroup(group);
      this.clearCreationDialog();
    }
    this.closeCreationDialog();
  }

  public openCreationDialog(group?: ICheckinGroup, editMode?: boolean): void {
    this.editMode = editMode || false;
    if (editMode && group) {
      // save the old state of the form
      // ex. when a user is in the middle of creating a new group, then edits a group, this allows
      // them to return to their new group
      this.storedCreationForm = this.createGroupForm;

      // save the ID of this group, so that update knows which ID to refer to
      // this ID is otherwise lost in prepopulation
      this.currentlyUpdatingGroupId = group.id;

      // editing an existing group, so prepopulate the creation form with it
      this.prepopulateCreationForm(group);
    }
    this.controlCreationDialogSubject$.next(true);
  }

  public creationDialogClosed(): void {
    if (this.editMode && this.storedCreationForm) {
      this.createGroupForm = this.storedCreationForm;
    }
  }

  public receiveCreationDialogRef(ref: MatDialogRef<TemplateRef<any>>): void {
    this.creationDialogRef = ref;
  }

  public closeCreationDialog(): void {
    console.log(this.creationDialogRef);
    console.log(this.creationDialogRef?.close);
    this.creationDialogRef?.close();
  }

  public clearCreationDialog(): void {
    this.createGroupForm.reset();
  }

  public confirmationDialogClosed(): void {
    // console.log("Dialog closed in child");
  }

  public receiveConfirmationDialogRef(ref: MatDialogRef<TemplateRef<any>>): void {
    this.confirmationDialogRef = ref;
  }

  public closeConfirmationDialog(): void {
    this.confirmationDialogRef?.close();
  }

}
