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

  private controlDialogSubject$: BehaviorSubject<boolean>;

  public groups$: Observable<IRouteGroup[]>;
  public displayData: IDisplayData<IRouteGroup>[];
  public controlDialog$: Observable<boolean>;
  public dialogRef: MatDialogRef<TemplateRef<any>>;
  public createGroupForm: FormGroup;
  public fieldInputTypes: string[];
  public fieldInputTypeValues: string[];

  get members(): FormArray {
    return this.createGroupForm.get('members') as FormArray;
  }

  constructor(
    private backend: BackendRoutesService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.controlDialogSubject$ = new BehaviorSubject<boolean>(false);
    this.controlDialog$ = this.controlDialogSubject$.asObservable();
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

  public dialogClosed(): void {
    // console.log("Dialog closed in child");
  }

  public createGroup(): void {
    this.controlDialogSubject$.next(true);
  }

  public receiveDialogRef(ref: MatDialogRef<TemplateRef<any>>): void {
    this.dialogRef = ref;
  }

  public closeDialog(): void {
    this.dialogRef?.close();
  }

  public onSubmit(): void {
    const group: IRouteGroup = this.createGroupForm.value;
    this.backend.addGroup(group);
    this.closeDialog();
  }

}
