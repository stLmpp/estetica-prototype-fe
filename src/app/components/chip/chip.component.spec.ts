import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Chip } from './chip.component';

describe('Chip', () => {
  let component: Chip;
  let fixture: ComponentFixture<Chip>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Chip],
    }).compileComponents();

    fixture = TestBed.createComponent(Chip);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
