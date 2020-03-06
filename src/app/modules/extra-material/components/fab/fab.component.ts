import { Component, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'app-fab',
  templateUrl: './fab.component.html',
  styleUrls: ['./fab.component.scss']
})
export class FABComponent {

  @Input()
  public label: string;

  @Input()
  public icon: string;

  @Output()
  public click = new EventEmitter();

  public onClick(): void {
    this.click.emit();
  }

}
