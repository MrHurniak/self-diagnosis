import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-task-info',
  templateUrl: './task-info.component.html',
  styleUrls: ['./task-info.component.scss']
})
export class TaskInfoComponent {

  @Input() matrix: string[][];
  @Input() failures: string[];

}
