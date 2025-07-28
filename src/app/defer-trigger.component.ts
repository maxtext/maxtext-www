import { Component, AfterViewInit, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-defer-trigger',
  standalone: true,
  template: '', // This component has no visible template
  changeDetection: ChangeDetectionStrategy.OnPush, // Highly efficient
})
export class DeferTriggerComponent implements AfterViewInit {
  @Output() loaded = new EventEmitter<void>();

  ngAfterViewInit() {
    // This hook fires only when the component is rendered in the DOM,
    // which happens after the @defer block loads.
    this.loaded.emit();
  }
}
