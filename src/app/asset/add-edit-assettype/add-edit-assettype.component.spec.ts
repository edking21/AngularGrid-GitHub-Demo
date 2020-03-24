import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditAssettypeComponent } from './add-edit-assettype.component';

describe('AddEditAssettypeComponent', () => {
  let component: AddEditAssettypeComponent;
  let fixture: ComponentFixture<AddEditAssettypeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddEditAssettypeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditAssettypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
