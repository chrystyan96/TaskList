import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  filterValue: string;
  newTask: string;

  constructor() { }

  ngOnInit(): void {
    this.filterValue = 'all';
    this.newTask = '';
  }

  getFilter(event: string) {
    this.filterValue = event;
  }

  getTask(event: string) {
    this.newTask = event;
  }
}
