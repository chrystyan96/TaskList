import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { DeleteComponent } from './delete/delete.component';
import { TaskItens } from 'src/app/interfaces/task-itens';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit, AfterViewInit, OnChanges {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  @Input() filterValue: string;
  @Input() newTask: string;

  private statusFilter$ = new BehaviorSubject<string>('all');
  private tasks$ = new BehaviorSubject<TaskItens[]>([]);

  private idCount: number;
  
  totalTasks: number;
  displayedColumns: string[];
  dataSource = new MatTableDataSource<TaskItens>();
  selection = new SelectionModel<TaskItens>(true, []);

  constructor(public dialog: MatDialog, private cdRef: ChangeDetectorRef) { }

  ngOnInit(): void {
    // I look if 'TASK_LIST' exists in the sessionStorage

    if(!!sessionStorage['TASK_LIST']) {
      const sessionStorageTasks: TaskItens[] = JSON.parse(sessionStorage.getItem('TASK_LIST') ?? '[]');
      if(!!sessionStorageTasks && sessionStorageTasks.length > 0) {

        // Update the table with the value from sessionStorage
        // Grab the highest ID from sessionStorage
        // Check on screen the tasks that are already completed

        this.updateTasks(sessionStorageTasks);
        this.idCount = this.getHighestID(sessionStorageTasks, 'id', 1)[0].id;
        this.tasks$.getValue().forEach(task => {
          task.status === 'Completed' ? this.selection.select(task) : null;
        })
      } else {
        this.idCount = 0;
      }
    } else {
      this.idCount = 0;
    }
    
    this.filterValue = 'all';
    this.displayedColumns = ['select', 'id', 'task', 'status', 'options'];
    this.dataSource.data = [];
  }

  ngAfterViewInit() {
    // When the observer for the tasks or for the statusFilter triggers because a change

    combineLatest([this.tasks$, this.statusFilter$])
    .pipe(
      map(([tasks, filter]) => {

        // I return the tasks based on the status returned from the filter

        if (filter === 'all') return tasks;
        return tasks.filter(task =>
          filter === 'completed' ? task.status === 'Completed' : task.status === 'Incomplete'
        );
      })
    )
    .subscribe(filtered => {
      // Then a set in the table dataSource the filtered array, the paginator and the sort
      // After that I ask the Angular for DOM changes, this fixed ExpressionChangedAfterItHasBeenCheckedError bug

      this.dataSource.data = filtered;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.cdRef.detectChanges();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    // I look for @Input changes, the filter and the new task are separate components
    // If changes, I trigger the observable with the new value and the OnChanges catches it

    if (changes['filterValue']) {
      this.statusFilter$.next(this.filterValue);
    }

    if (changes['newTask']) {
      if(!!this.newTask)
        this.addNewTask();
    }
  }

  updateTasks(tasks: TaskItens[]) {
    // I sort the array on desc order by the ID

    const sortedTasks = tasks.sort(function(a, b){
      return b.id - a.id;
    });

    // I trigger the observable passing the new array
    // I save the total tasks in a number variable
    // Then I save the new array in the sessionStorage

    this.tasks$.next(sortedTasks);
    this.totalTasks = this.tasks$.getValue().length;
    sessionStorage.setItem('TASK_LIST', JSON.stringify(this.tasks$.getValue()));
  }

  addNewTask() {
    // I increment the ID variable and create a new obj for the task
    // Then I call the updateTasks adding a new value

    this.idCount++;
    const task: TaskItens = {
      id: this.idCount,
      task: this.newTask,
      status: 'Incomplete'
    }

    this.updateTasks([...this.tasks$.getValue(), task]);
  }

  isAllSelected() {
    // The table's header checkbox looks if all rows are selected

    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  togleAll() {
    // Here I toggle all the checkboxes and change each row status

    if(this.isAllSelected()) {
      this.selection.clear();
      this.dataSource.data.forEach(row => {
        row.status = 'Incomplete';
      });
    } else {
      this.dataSource.data.forEach(row => {
        this.selection.select(row);
        row.status = 'Completed';
      });
    }

    this.updateTasks(this.dataSource.data);
  }

  checkboxLabel(row?: TaskItens): string {
    // Generate the labels for the aria-label
    // Default in the Angular Material Docs

    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  checkItem(row: TaskItens) {
    // Here it's for a individual row's checkbox
    // I toggle the row's checkbox, after that I remove the row from the task list by filtering by id

    this.selection.toggle(row);
    const updatedTasks = this.tasks$.getValue().filter(task => task.id !== row.id);

    if(this.selection.isSelected(row)) {
      row.status = 'Completed';
    } else {
      row.status = 'Incomplete';
    }

    // Then I save the updated row again with the original ID
    // I could do that bacause there's no database to worry about

    this.updateTasks([...updatedTasks, row]);
  }

  deleteTaskDialog(row: TaskItens) {
    const dialogRef = this.dialog.open(DeleteComponent);

    dialogRef.afterClosed().subscribe(result => {
      // result returns TRUE or undefined
      // If TRUE deletes the task, else ignores

      !!result ? this.deleteTask(row) : null;
    });
  }

  deleteTask(row: TaskItens) {
    // Here I do the same as before. I filter the task list removing the task by the id, then save it

    const updatedTasks = this.tasks$.getValue().filter(task => task.id !== row.id)

    this.updateTasks(updatedTasks);
  }

  rowCompletedStatus(status: string) {
    return status === 'Completed';
  }

  getHighestID(arr: TaskItens[], prop: string, n: number): TaskItens[] {
    // This aims to return the elements with the highest values ​​of a given property (prop) from an array of TaskItens objects (arr).

    var clone = arr.slice(0); 

    // Sorts the clone array from largest to smallest prop property value.

    clone.sort(function(x, y) {
        if (x[prop] == y[prop]) return 0;
        else if (parseInt(x[prop]) < parseInt(y[prop])) return 1;
        else return -1;
    });

    //Returns the first n items of the sorted array, or 1 by default if n is not passed.

    return clone.slice(0, n || 1);
  }
}