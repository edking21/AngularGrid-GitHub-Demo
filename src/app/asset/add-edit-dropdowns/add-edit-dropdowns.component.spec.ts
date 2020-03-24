import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditDropdownsComponent } from './add-edit-dropdowns.component';

describe('AddEditDropdownsComponent', () => {
  let component: AddEditDropdownsComponent;
  let fixture: ComponentFixture<AddEditDropdownsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddEditDropdownsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditDropdownsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
