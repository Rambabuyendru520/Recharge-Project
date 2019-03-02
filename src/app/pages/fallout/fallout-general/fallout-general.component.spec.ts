import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FalloutGeneralComponent } from './fallout-general.component';

describe('FalloutGeneralComponent', () => {
  let component: FalloutGeneralComponent;
  let fixture: ComponentFixture<FalloutGeneralComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FalloutGeneralComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FalloutGeneralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
