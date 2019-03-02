import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FalloutNonMTNComponent } from './fallout-non-mtn.component';

describe('FalloutNonMTNComponent', () => {
  let component: FalloutNonMTNComponent;
  let fixture: ComponentFixture<FalloutNonMTNComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FalloutNonMTNComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FalloutNonMTNComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
