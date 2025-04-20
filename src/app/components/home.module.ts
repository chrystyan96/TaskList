import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputModule } from '../../../components/input/input.module';
import { HomeComponent } from './home/home.component';
import { MatCardModule } from '@angular/material/card'; 
import { MatGridListModule } from '@angular/material/grid-list'; 
import { FilterModule } from '../../../components/filter/filter.module';
import { ListModule } from '../../../components/list/list.module';

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
