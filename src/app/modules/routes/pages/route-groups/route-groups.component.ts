import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { ExpansionTableComponent, IDisplayData } from 'src/app/modules/extra-material';
import { IRouteGroup, BackendRoutesService, IRoute } from 'src/app/modules/backend';
import { BehaviorSubject, Observable } from 'rxjs';
import { MatDialogRef } from '@angular/material/dialog';
import { FormGroup, FormArray, FormBuilder, AsyncValidatorFn, FormControl, ValidationErrors } from '@angular/forms';
import { UtilsService } from 'src/app/modules/extra-material/services/utils/utils.service';
import { first, map } from 'rxjs/operators';
import { Validators } from '@angular/forms';

@Component({
  selector: 'app-manage-route',
  templateUrl: './route-groups.component.html',
  styleUrls: ['./route-groups.component.scss']
})
export class RouteGroupComponent implements OnInit {

  @ViewChild(ExpansionTableComponent)
  private expansionTable: ExpansionTableComponent<IRouteGroup>;

  private controlCreationDialogSubject$: BehaviorSubject<boolean>;
  private controlConfirmationDialogSubject$: BehaviorSubject<boolean>;

  public groups$: Observable<IRouteGroup[]>;
  // maps a group ID to an array of titles of models which use that group
  public groupsAndModels$: Observable<Map<string, string[]>>;
  public displayData: IDisplayData<IRouteGroup>[];
  public controlCreationDialog$: Observable<boolean>;
  public creationDialogRef: MatDialogRef<TemplateRef<any>>;
  public controlConfirmationDialog$: Observable<boolean>;
  public confirmationDialogRef: MatDialogRef<TemplateRef<any>>;
  public createGroupForm: FormGroup;
  public fieldInputTypes: string[];
  public fieldInputTypeValues: string[];

  // fields related to editing groups; see openCreationDialog
  public editMode: boolean = false;
  public storedCreationForm: FormGroup;
  public currentlyUpdatingGroupId: string | undefined;

  // workaround. app-expansion-table contains information for a group, and uses these to populate
  // each row, however this bugs out with app-projection-dialog. 
  public groupToDelete: IRouteGroup;

  get members(): FormArray {
    return this.createGroupForm.get('members') as FormArray;
  }

  constructor(
    private backend: BackendRoutesService,
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

    this.groupsAndModels$ = this.backend.getRoutes().pipe(
      map((models: IRoute[]) => {
        const toReturn = new Map<string, string[]>();
        for (let model of models) {
          for (let field of model.fields) {
            if (field.groupId) {
              const thisGroupId: string = typeof field.groupId === 'string'
                ? field.groupId
                : field.groupId.id;
              if (toReturn.has(thisGroupId)) {
                toReturn.get(thisGroupId)?.push(model.title);
              } else {
                toReturn.set(thisGroupId, [model.title]);
              }
            }
          }

          for (let field of model.stopData.fields) {
            if (field.groupId) {
              const thisGroupId: string = typeof field.groupId === 'string'
                ? field.groupId
                : field.groupId.id;
              if (toReturn.has(thisGroupId)) {
                toReturn.get(thisGroupId)?.push(model.title);
              } else {
                toReturn.set(thisGroupId, [model.title]);
              }
            }
          }
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
    this.clearCreationDialog();
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

  public openCreationDialog(group?: IRouteGroup, editMode?: boolean): void {
    this.editMode = editMode || false;
    if (editMode && group) {
      // save the old state of the form before replacing with group to update
      // also save the group-to-update's ID so that we can refer to it on confirm
      this.storedCreationForm = this.createGroupForm;
      this.currentlyUpdatingGroupId = group.id;
      this.prepopulateCreationForm(group);
    }
    this.controlCreationDialogSubject$.next(true);
  }

  public clearCreationDialog(): void {
    this.createGroupForm = this.fb.group({
      title: ['', { asyncValidators: [this.groupTitleValidator()] }],
      members: this.fb.array([this.createMember()]),
    });
  }

  public confirmDeleteGroup(group: IRouteGroup): void {
    this.groupToDelete = group;
    this.controlConfirmationDialogSubject$.next(true);
  }

  public onDelete(): void {
    this.closeConfirmationDialog();
    this.backend.deleteGroup(this.groupToDelete.id);
  }

  public onSubmit(): void {
    const group: IRouteGroup = this.createGroupForm.value;
    if (this.editMode) {
      group.id = this.currentlyUpdatingGroupId;
      this.backend.updateGroup(group);
    } else {
      this.backend.addGroup(group);
      this.clearCreationDialog();
    }
    this.closeCreationDialog();
  }

  public receiveCreationDialogRef(ref: MatDialogRef<TemplateRef<any>>): void {
    this.creationDialogRef = ref;
  }

  public closeCreationDialog(): void {
    this.creationDialogRef?.close();
  }

  public creationDialogClosed(): void {
    if (this.editMode && this.storedCreationForm) {
      this.createGroupForm = this.storedCreationForm;
    }
  }

  public receiveConfirmationDialogRef(ref: MatDialogRef<TemplateRef<any>>): void {
    this.confirmationDialogRef = ref;
  }

  public closeConfirmationDialog(): void {
    this.controlConfirmationDialogSubject$.next(false);
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
