import { Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TabItem } from './tab-item.model';

@Component({
  selector: 'app-tabs',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './tabs.component.html',
  host: { class: 'block' },
})
export class TabsComponent {
  readonly tabs = input.required<TabItem[]>();
  readonly label = input<string>();
}
