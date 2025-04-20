import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputModule } from './input/input.module';
import { HomeComponent } from './home.component';
import { MatCardModule } from '@angular/material/card'; 
import { MatGridListModule } from '@angular/material/grid-list'; 
import { FilterModule } from './filter/filter.module';
import { ListModule } from './list/list.module';

@NgModule({
  declarations: [
    HomeComponent
  ],
  imports: [
    CommonModule,
    InputModule,
    FilterModule,
    ListModule,
    MatCardModule,
    MatGridListModule
  ],
  exports: [HomeComponent]
})
export class HomeModule { }
