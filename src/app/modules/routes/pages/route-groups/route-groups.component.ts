import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { ExpansionTableComponent, IDisplayData } from 'src/app/modules/extra-material';
// different model
import { IRouteGroup, IRouteGroupMember, BackendRoutesService } from 'src/app/modules/backend';
import { BehaviorSubject, Observable } from 'rxjs';
import { MatDialogRef } from '@angular/material/dialog';
import { FormGroup, FormArray, FormBuilder } from '@angular/forms';

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
  public displayData: IDisplayData<IRouteGroup>[];
  public controlCreationDialog$: Observable<boolean>;
  public creationDialogRef: MatDialogRef<TemplateRef<any>>;
  public controlConfirmationDialog$: Observable<boolean>;
  public confirmationDialogRef: MatDialogRef<TemplateRef<any>>;
  public createGroupForm: FormGroup;
  public fieldInputTypes: string[];
  public fieldInputTypeValues: string[];

  // workaround. app-expansion-table contains information for a group, and uses these to populate
  // each row, however this bugs out with app-projection-dialog. 
  public groupToDelete: IRouteGroup;

  get members(): FormArray {
    return this.createGroupForm.get('members') as FormArray;
  }

  constructor(
    private backend: BackendRoutesService,
    private fb: FormBuilder
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
        accessor: (group: IRouteGroup) => group.title
      },
      {
        name: "# of Members",
        property: "members",
        accessor: (group: IRouteGroup) => group.members.length.toString()
      },
    ];
    this.createGroupForm = this.fb.group({
      title: [''],
      members: this.fb.array([ this.createMember() ]),
    });
  }

  public addMember(): void {
    this.members.push(this.createMember());
  }

  public removeMember(): void {
    if (this.members.length > 1) {
      this.members.removeAt(this.members.length - 1);
    }
  }

  public createMember(): FormGroup {
    return this.fb.group({
      title: [''],
    });
  }

  public createGroup(): void {
    this.controlCreationDialogSubject$.next(true);
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
    this.backend.addGroup(group);
    this.closeCreationDialog();
  }

  public receiveCreationDialogRef(ref: MatDialogRef<TemplateRef<any>>): void {
    this.creationDialogRef = ref;
  }

  public closeCreationDialog(): void {
    this.creationDialogRef?.close();
  }

  public creationDialogClosed(): void {
    // console.log("Dialog closed in child");
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
