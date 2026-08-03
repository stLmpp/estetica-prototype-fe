import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginatorComponent } from './paginator.component';

describe('PaginatorComponent', () => {
  let component: PaginatorComponent;
  let fixture: ComponentFixture<PaginatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginatorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PaginatorComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('length', 95);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compute the page count from length and page size', () => {
    expect(component['pageCount']()).toBe(10);
  });

  it('should not go before the first page', () => {
    component['previous']();
    expect(component.page()).toBe(1);
  });

  it('should advance to the next page', () => {
    component['next']();
    expect(component.page()).toBe(2);
  });

  it('should clamp the page when it exceeds the page count', () => {
    fixture.componentRef.setInput('length', 5);
    component.page.set(3);
    fixture.detectChanges();
    expect(component.page()).toBe(1);
  });

  it('should reset to the first page when the page size changes', () => {
    component.page.set(3);
    component.pageSize.set(25);
    expect(component.page()).toBe(3);
    component['onPageSizeChange']({ target: { value: '50' } } as unknown as Event);
    expect(component.page()).toBe(1);
    expect(component.pageSize()).toBe(50);
  });
});
