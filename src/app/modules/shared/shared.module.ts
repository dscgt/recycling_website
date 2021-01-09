import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DebugPipe } from './pipes';

@NgModule({
  declarations: [
    DebugPipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    DebugPipe
  ]
})
export class SharedModule {
  static forRoot(): ModuleWithProviders<SharedModule> {
    return {
      ngModule: SharedModule,
      providers: [
        // put services here to avoid double import
      ]
    }
  }
}
