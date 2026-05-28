import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-hint',
  imports: [],
  templateUrl: './hint.component.html',
  styleUrl: './hint.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HintComponent {}
