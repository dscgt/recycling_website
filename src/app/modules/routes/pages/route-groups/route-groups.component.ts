import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { ExpansionTableComponent, IDisplayData } from 'src/app/modules/extra-material';
import { IRouteGroup, IRoute } from 'src/app/modules/backend';
import { BehaviorSubject, Observable } from 'rxjs';
import { MatDialogRef } from '@angular/material/dialog';
import { FormGroup, FormArray, FormBuilder, AsyncValidatorFn, FormControl, ValidationErrors } from '@angular/forms';
import { UtilsService } from 'src/app/modules/extra-material/services/utils/utils.service';
import { first, map } from 'rxjs/operators';
import { Validators } from '@angular/forms';
import { FirebaseRoutesService } from 'src/app/modules/backend/services/implementations/firebase';

@Component({
  selector: 'app-manage-route',
  templateUrl: './route-groups.component.html',
  styleUrls: ['./route-groups.component.scss']
})
export class RouteGroupComponent implements OnInit {

  @ViewChild(ExpansionTableComponent)
  private expansionTable: ExpansionTableComponent<IRouteGroup>;

  public groups$: Observable<IRouteGroup[]>;
  public groupsAndModels$: Observable<Map<string, string[]>>; // maps a group ID to an array of titles of models which use that group
  public displayData: IDisplayData<IRouteGroup>[];
  public createGroupForm: FormGroup;
  public fieldInputTypes: string[];
  public fieldInputTypeValues: string[];
  public groupToDelete: IRouteGroup;

  // Modal-related fields
  private controlCreationDialogSubject$: BehaviorSubject<boolean>;
  private controlDeletionDialogSubject$: BehaviorSubject<boolean>;
  public controlCreationDialog$: Observable<boolean>;
  public creationDialogRef: MatDialogRef<TemplateRef<any>>;
  public controlDeletionDialog$: Observable<boolean>;
  public deletionDialogRef: MatDialogRef<TemplateRef<any>>;

  // fields related to editing groups
  public isEditMode: boolean = false;
  public storedCreationForm: FormGroup;
  public currentlyUpdatingGroupId: string | undefined;
  
  constructor(
    private backend: FirebaseRoutesService,
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

    this.groupsAndModels$ = this.backend.getRoutes().pipe(
      map((models: IRoute[]) => {
        // check all models for groupId and create a map groupId -> [modelTitle, modelTitle, ...]
        const toReturnWithSets = new Map<string, Set<string>>();
        for (let model of models) {
          const allFields = model.fields.concat(model.stopData.fields);
          for (let field of allFields) {
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
        accessor: (group: IRouteGroup) => group.title,
        accessorAsString: (group: IRouteGroup) => group.title
      },
      {
        name: "# of Members",
        property: "members",
        accessor: (group: IRouteGroup) => group.members.length,
        accessorAsString: (group: IRouteGroup) => group.members.length.toString()
      },
    ];
    this.clearCreationForm();
  }

  // Replaces the existing content of the form with the content of [group]
  public prepopulateCreationForm(group: IRouteGroup) {
    this.createGroupForm = this.fb.group({
      //Reactive form validator added
      title: [group.title, Validators.required, [this.groupTitleValidator(group.title)] ],
      members: this.fb.array(group.members.map((member) => this.fb.group({
        title: [member.title, Validators.required]
      }))),
    });
  }

  public clearCreationForm(): void {
    this.createGroupForm = this.fb.group({
      title: ['', { asyncValidators: [this.groupTitleValidator()] }],
      members: this.fb.array([this.createMember()]),
    });
  }

  public createMember(): FormGroup {
    return this.fb.group({
      title: [''],
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

  public handleCreate(): void {
    const group: IRouteGroup = this.createGroupForm.value;
    if (this.isEditMode) {
      group.id = this.currentlyUpdatingGroupId;
      this.backend.updateGroup(group);
    } else {
      this.backend.addGroup(group);
      this.clearCreationForm();
    }
    this.handleCloseCreationDialog();
  }

  public handleDelete(): void {
    this.handleCloseDeletionDialog();
    this.backend.deleteGroup(this.groupToDelete.id);
  }

  // Modal-handling functions
  public receiveCreationDialogRef(ref: MatDialogRef<TemplateRef<any>>): void {
    this.creationDialogRef = ref;
  }
  public handleOpenCreationDialog(group?: IRouteGroup, isEditMode?: boolean): void {
    this.isEditMode = isEditMode || false;
    if (isEditMode && group) {
      // save the old state of the form before replacing with group to update
      // also save the group-to-update's ID so that we can refer to it on confirm
      this.storedCreationForm = this.createGroupForm;
      this.currentlyUpdatingGroupId = group.id;
      this.prepopulateCreationForm(group);
    }
    this.controlCreationDialogSubject$.next(true);
  }
  public handleCloseCreationDialog(): void {
    this.creationDialogRef?.close();
  }
  public handleCreationDialogClosed(): void {
    if (this.isEditMode && this.storedCreationForm) {
      this.createGroupForm = this.storedCreationForm;
    }
  }
  public receiveDeletionDialogRef(ref: MatDialogRef<TemplateRef<any>>): void {
    this.deletionDialogRef = ref;
  }
  public handleOpenDeletionDialog(group: IRouteGroup): void {
    this.groupToDelete = group;
    this.controlDeletionDialogSubject$.next(true);
  }
  public handleCloseDeletionDialog(): void {
    this.controlDeletionDialogSubject$.next(false);
  }  

  /**
   * For use with form controls which require validation to avoid duplicating a title which already exists among already-created groups.
   * @param allow Group titles to allow. This excludes them from validation checks; if a title which already exists is specified here, then it will still pass validation. 
   */
  public groupTitleValidator = (allow: string | string[] = []): AsyncValidatorFn => {
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
