import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListComponent } from './list.component';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

describe('ListComponent', () => {
  let component: ListComponent;
  let fixture: ComponentFixture<ListComponent>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;

  beforeEach(async () => {
    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    dialogSpy.open.and.returnValue({
      afterClosed: () => of(true)
    } as unknown as MatDialogRef<any>);

    await TestBed.configureTestingModule({
      declarations: [ListComponent],
      imports: [MatTableModule, NoopAnimationsModule],
      providers: [
        { provide: MatDialog, useValue: dialogSpy }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  })

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('adding a new task', () => {
    component.newTask = 'new task';
    component.addNewTask();

    const tasks = JSON.parse(sessionStorage.getItem('TASK_LIST') ?? '[]');
    expect(tasks.length).toBeGreaterThan(0);
    expect(tasks[tasks.length - 1].task).toBe('new task');
  });

  it('checking and unchecking all tasks', () => {
    component.dataSource.data = [
      { id: 1, task: 'A', status: 'Incomplete' },
      { id: 2, task: 'B', status: 'Incomplete' }
    ];

    component.masterToggle(); //check all
    expect(component.selection.selected.length).toBe(2);
    expect(component.dataSource.data.every(t => t.status === 'Completed')).toBeTrue();

    component.masterToggle(); // uncheck all
    expect(component.selection.selected.length).toBe(0);
    expect(component.dataSource.data.every(t => t.status === 'Incomplete')).toBeTrue();
  });

  it('checking and unchecking single row', () => {
    component.dataSource.data = [
      { id: 1, task: 'A', status: 'Incomplete' },
      { id: 2, task: 'B', status: 'Incomplete' }
    ];
    const row = { id: 1, task: 'A', status: 'Incomplete' };

    component.checkItem(row); //check all
    expect(component.selection.isSelected(row)).toBeTruthy();
    expect(row.status).toBe('Completed');

    component.checkItem(row); // uncheck all
    expect(component.selection.isSelected(row)).toBeFalsy();
    expect(row.status).toBe('Incomplete');
  });

  it('open the delete dialog', () => {
    const row = { id: 1, task: 'A', status: 'Incomplete' };
    
    component.deleteTaskDialog(row);
    expect(dialogSpy.open).toHaveBeenCalled();
  });

  it('delete from the task list', () => {
    const row = { id: 1, task: 'A', status: 'Incomplete' };
    component['tasks$'].next([row]);

    component.deleteTask(row);
    const updated = component['tasks$'].getValue();
    expect(updated.find(task => task.id === row.id)).toBeUndefined();
  });
});
