import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss']
})
export class InputComponent {
  @Output() sendTask: EventEmitter<string> = new EventEmitter<string>();
  task: string; 
  
  constructor() { }

  addTask() {
    this.sendTask.emit(this.task);
    this.task = '';
  }
}
