import { Component, OnInit, TemplateRef, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Subscription, Observable } from 'rxjs';
import { shareReplay, map, startWith, take } from 'rxjs/operators';

@Component({
  selector: 'app-projection-dialog',
  templateUrl: './projection-dialog.component.html',
  styleUrls: ['./projection-dialog.component.scss']
})
export class ProjectionDialogComponent implements OnInit {

  @ViewChild('projection')
  private protectedChild: TemplateRef<any>;

  private isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  private isHandsetSubscription: Subscription;
  private dialogClosedSubscription: Subscription;
  private controlSubscription: Subscription;
  private isOpen: boolean;

  @Input()
  public control$: Observable<boolean>;

  @Output()
  public onClose: EventEmitter<any> = new EventEmitter();

  @Output()
  public getDialogRef: EventEmitter<MatDialogRef<TemplateRef<any>>> = new EventEmitter<MatDialogRef<TemplateRef<any>>>();

  public dialogRef: MatDialogRef<TemplateRef<any>>;

  constructor(
    public dialog: MatDialog,
    private breakpointObserver: BreakpointObserver
  ) { }

  public ngOnInit(): void {
    this.isHandsetSubscription = this.isHandset$.subscribe((isHandset: boolean): void => this.updateDialog(isHandset));
    this.isOpen = false;
    this.controlSubscription = this.control$.subscribe(
      (doOpen: boolean): void => {
        if (!this.isOpen && doOpen) {
          // now closed, should open
          this.openDialog();
        } else if (this.isOpen && !doOpen) {
          // now opened, should close
          this.closeDialog();
        }
      }
    );
  }

  public openDialog(): void {
    if (!this.isOpen) {
      this.dialogRef = this.dialog.open(this.protectedChild);
      this.isOpen = true;
      this.updateDialog(this.breakpointObserver.isMatched(Breakpoints.Handset));
      this.getDialogRef.emit(this.dialogRef);
      this.dialogClosedSubscription = this.dialogRef.afterClosed().subscribe(
        () => {
          this.getDialogRef.emit(undefined);
          this.dialogClosedSubscription.unsubscribe();
          this.onClose.emit();
          this.isOpen = false;
        }
      );
    }
  }

  public updateDialog(isHandset: boolean): void {
    if (this.isOpen) {
      this.dialogRef.updateSize(
        (isHandset)
          ? "280px"
          : "560px"
      );
    }
  }

  public closeDialog(): void {
    if (this.isOpen) {
      this.dialogRef?.close();
    }
  }

  public ngOnDestroy(): void {
    this.isHandsetSubscription.unsubscribe();
    this.dialogClosedSubscription?.unsubscribe();
    this.controlSubscription.unsubscribe();
  }
}
