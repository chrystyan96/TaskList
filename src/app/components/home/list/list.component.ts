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
  
  displayedColumns: string[];
  dataSource = new MatTableDataSource<TaskItens>();
  selection = new SelectionModel<TaskItens>(true, []);

  constructor(public dialog: MatDialog, private cdRef: ChangeDetectorRef) { }

  ngOnInit(): void {
    if(!!sessionStorage['TASK_LIST']) {
      const sessionStorageTasks: TaskItens[] = JSON.parse(sessionStorage.getItem('TASK_LIST') ?? '[]');
      if(!!sessionStorageTasks && sessionStorageTasks.length > 0) {
        this.tasks$.next(sessionStorageTasks);
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
    combineLatest([this.tasks$, this.statusFilter$])
    .pipe(
      map(([tasks, filter]) => {
        if (filter === 'all') return tasks;
        return tasks.filter(task =>
          filter === 'completed' ? task.status === 'Completed' : task.status === 'Incomplete'
        );
      })
    )
    .subscribe(filtered => {
      this.dataSource.data = filtered;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;

      this.cdRef.detectChanges();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['filterValue']) {
      this.statusFilter$.next(this.filterValue);
    }

    if (changes['newTask']) {
      if(!!this.newTask)
        this.addNewTask();
    }
  }

  addNewTask() {
    this.idCount++;
    const task: TaskItens = {
      id: this.idCount,
      task: this.newTask,
      status: 'Incomplete'
    }

    this.tasks$.next([...this.tasks$.getValue(), task]);
    sessionStorage.setItem('TASK_LIST', JSON.stringify(this.tasks$.getValue()));
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  masterToggle() {
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
    this.tasks$.next(this.dataSource.data);
    sessionStorage.setItem('TASK_LIST', JSON.stringify(this.tasks$.getValue()));
  }

  checkboxLabel(row?: TaskItens): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  checkItem(row: TaskItens) {
    this.selection.toggle(row);
    if(this.selection.isSelected(row)) {
      row.status = 'Completed';
    } else {
      row.status = 'Incomplete';
    }
    this.tasks$.next(this.dataSource.data);
    sessionStorage.setItem('TASK_LIST', JSON.stringify(this.tasks$.getValue()));
  }

  deleteTaskDialog(row: TaskItens) {
    const dialogRef = this.dialog.open(DeleteComponent);

    dialogRef.afterClosed().subscribe(result => {
      !!result ? this.deleteTask(row) : null;
    });
  }

  deleteTask(row: TaskItens) {
    const tasks = this.tasks$.getValue();
    const updatedTasks = tasks.filter(task => task.id !== row.id)
    this.tasks$.next(updatedTasks);
    sessionStorage.setItem('TASK_LIST', JSON.stringify(this.tasks$.getValue()));
  }

  rowCompletedStatus(status: string) {
    return status === 'Completed';
  }

  getHighestID(arr: TaskItens[], prop: string, n: number): TaskItens[] {
    var clone = arr.slice(0); 

    clone.sort(function(x, y) {
        if (x[prop] == y[prop]) return 0;
        else if (parseInt(x[prop]) < parseInt(y[prop])) return 1;
        else return -1;
    });

    return clone.slice(0, n || 1);
  }
}