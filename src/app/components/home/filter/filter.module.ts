import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input'; 
import { FormsModule } from '@angular/forms';
import { MatRippleModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select'; 
import { FilterComponent } from './filter.component';

@NgModule({
  declarations: [
    FilterComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MatInputModule,
    MatRippleModule,
    MatSelectModule
  ],
  exports: [
    FilterComponent
  ]
})
export class FilterModule { }
