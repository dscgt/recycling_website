import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { ExpansionTableComponent, IDisplayData } from 'src/app/modules/extra-material';
import { ICheckinGroup, ICheckinGroupMember, BackendCheckinService, ICheckinModel } from 'src/app/modules/backend';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { MatDialogRef } from '@angular/material/dialog';
import { FormGroup, FormArray, FormBuilder, AsyncValidatorFn, AbstractControl, ValidationErrors, FormControl } from '@angular/forms';
import { UtilsService } from 'src/app/modules/extra-material/services/utils/utils.service';
import { first, map } from 'rxjs/operators';
import { Validators } from '@angular/forms';

@Component({
  selector: 'app-manage-checkin',
  templateUrl: './checkin-groups.component.html',
  styleUrls: ['./checkin-groups.component.scss']
})
export class CheckinGroupComponent implements OnInit {
  
  @ViewChild(ExpansionTableComponent)
  private expansionTable: ExpansionTableComponent<ICheckinGroup>;

  public groups$: Observable<ICheckinGroup[]>;
  public groupsAndModels$: Observable<Map<string, string[]>>; // maps a group ID to an array of titles of models which use that group
  public displayData: IDisplayData<ICheckinGroup>[];
  public createGroupForm: FormGroup;
  public fieldInputTypes: string[];
  public fieldInputTypeValues: string[];
  public groupToDelete: ICheckinGroup;

  // Modal-related fields
  private controlCreationDialogSubject$: BehaviorSubject<boolean>;
  public controlCreationDialog$: Observable<boolean>;
  public creationDialogRef: MatDialogRef<TemplateRef<any>>;
  private controlDeletionDialogSubject$: BehaviorSubject<boolean>;
  public controlDeletionDialog$: Observable<boolean>;
  public deletionDialogRef: MatDialogRef<TemplateRef<any>>;

  // Fields used when editing groups
  public isEditMode: boolean = false;
  public storedCreationForm: FormGroup;
  public currentlyUpdatingGroupId: string | undefined;

  constructor(
    private backend: BackendCheckinService,
    private fb: FormBuilder,
    private utils: UtilsService
  ) { }

  get members(): FormArray {
    return this.createGroupForm.get('members') as FormArray;
  }

  ngOnInit(): void {
    // initialize dialog controls
    this.controlCreationDialogSubject$ = new BehaviorSubject<boolean>(false);
    this.controlCreationDialog$ = this.controlCreationDialogSubject$.asObservable();
    this.controlDeletionDialogSubject$ = new BehaviorSubject<boolean>(false);
    this.controlDeletionDialog$ = this.controlDeletionDialogSubject$.asObservable();

    this.groups$ = this.backend.getGroups();
    this.groupsAndModels$ = this.backend.getModels().pipe(
      map((models: ICheckinModel[]) => {
        const toReturnWithSets = new Map<string, Set<string>>();
        // check all models for groupId and create a map groupId -> [modelTitle, modelTitle, ...]
        for (let model of models) {
          for (let field of model.fields) {
            if (field.groupId) {
              const thisGroupId: string = typeof field.groupId === 'string'
                ? field.groupId
                : field.groupId.id;
              if (!toReturnWithSets.has(thisGroupId)) {
                toReturnWithSets.set(thisGroupId, new Set());
              }
              toReturnWithSets.get(thisGroupId)?.add(model.title);
            }
          }
        }
        // convert to proper form
        const toReturn = new Map<string, string[]>();
        for (let [groupId, set] of toReturnWithSets) {
          toReturn.set(groupId, Array.from(set));
        }
        return toReturn;
      })
    );

    this.displayData = [
      {
        name: "Title",
        property: "title",
        accessor: (group: ICheckinGroup) => group.title,
        accessorAsString: (group: ICheckinGroup) => group.title,
      },
      {
        name: "# of Members",
        property: "members",
        accessor: (group: ICheckinGroup) => group.members.length,
        accessorAsString: (group: ICheckinGroup) => group.members.length.toString(),
      },
    ];
    
    this.clearCreationForm();
  }

  // Replaces the existing content of the form with the content of [group]
  public prepopulateCreationForm(group: ICheckinGroup) {
    this.createGroupForm = this.fb.group({
      // Reactive form validator added
      title: [group.title, Validators.required, [this.groupTitleValidator(group.title)]],
      members: this.fb.array(group.members.map((member: ICheckinGroupMember) => this.fb.group({
        title: [member.title, Validators.required]
      }))),
    });
  }

  public createMember(): FormGroup {
    return this.fb.group({
      title: [''],
    });
  }

  public clearCreationForm(): void {
    this.createGroupForm = this.fb.group({
      title: ['', { asyncValidators: [this.groupTitleValidator()] }],
      members: this.fb.array([this.createMember()]),
    });
  }

  public handleAddMember(): void {
    this.members.push(this.createMember());
  }

  public handleRemoveMember(index: number): void {
    if (this.members.length <= 1) {
      return;
    }
    this.members.removeAt(index);
  }

  public handleSwapMember(a: number, b: number): void {
    if (a < 0 || b < 0 || a >= this.members.length || b >= this.members.length) {
      return;
    }
    this.utils.swapFormArray(this.members, a, b);
  }

  public handleDelete(): void {
    this.handleCloseDeletionDialog();
    this.backend.deleteGroup(this.groupToDelete.id);
  }

  public handleCreate(): void {
    const group: ICheckinGroup = this.createGroupForm.value;
    if (this.isEditMode) {
      group.id = this.currentlyUpdatingGroupId;
      this.backend.updateGroup(group);
    } else {
      this.backend.addGroup(group);
      this.clearCreationForm();
    }
    this.handleCloseCreationDialog();
  }

  // Modal-handling functions
  public receiveDeletionDialogRef(ref: MatDialogRef<TemplateRef<any>>): void {
    this.deletionDialogRef = ref;
  }
  public handleOpenDeletionDialog(group: ICheckinGroup): void {
    this.groupToDelete = group;
    this.controlDeletionDialogSubject$.next(true);
  }
  public handleCloseDeletionDialog(): void {
    this.controlDeletionDialogSubject$.next(false);
  }
  public receiveCreationDialogRef(ref: MatDialogRef<TemplateRef<any>>): void {
    this.creationDialogRef = ref;
  }
  public handleOpenCreationDialog(group?: ICheckinGroup, isEditMode?: boolean): void {
    this.isEditMode = isEditMode || false;
    if (isEditMode && group) {
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
  public handleCloseCreationDialog(): void {
    this.controlCreationDialogSubject$.next(false);
  }
  public handleCreationDialogClosed(): void {
    if (this.isEditMode && this.storedCreationForm) {
      this.createGroupForm = this.storedCreationForm;
    }
  }

  /**
   * For use with form controls which require validation to avoid duplicating a title which already exists among already-created groups.
   * @param allow Group titles to allow. This excludes them from validation checks; if a title which already exists is specified here, then it will still pass validation. 
   */
  public groupTitleValidator = (allow: string|string[] = []): AsyncValidatorFn => {
    const allowedTitles = Array.isArray(allow)
      ? allow
      : [allow];
    
    return (control: FormControl): Observable<ValidationErrors | null> => {
      const thisValue = control.value.trim();
      return this.groups$.pipe(
        map(groups => !allowedTitles.includes(thisValue) && groups.map(g => g.title).includes(thisValue)
          ? { titleExistsAlready: true }
          : null
        ),
        first()
      );
    }
  }
}
