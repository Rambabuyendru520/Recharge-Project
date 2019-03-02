import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SlimloaderComponent } from './slimloader.component';

describe('SlimloaderComponent', () => {
  let component: SlimloaderComponent;
  let fixture: ComponentFixture<SlimloaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SlimloaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SlimloaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
