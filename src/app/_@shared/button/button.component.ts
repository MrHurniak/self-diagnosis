import { Component, Input } from '@angular/core';

export type Type = 'success' | 'danger' | 'primary';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss']
})
export class ButtonComponent {
  @Input() link: string;
  @Input() type?: Type;
  @Input() disabled = false;
}
