import { DataSource } from '@angular/cdk/table';
import { effect, Signal } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export class TableDataSource extends DataSource<any> {
  constructor(data: Signal<any[]>) {
    super();
    effect(() => {
      this.data.next(data());
      return () => {
        this.data.complete();
      };
    });
  }

  private readonly data = new BehaviorSubject<any[]>([]);

  connect(): Observable<any[]> {
    return this.data.asObservable();
  }

  disconnect(): void {
    this.data.complete();
  }
}
