import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Asset2Component } from './asset2.component';

describe('Asset2Component', () => {
  let component: Asset2Component;
  let fixture: ComponentFixture<Asset2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Asset2Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Asset2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
