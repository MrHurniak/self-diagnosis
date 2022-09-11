import { Component, OnInit } from '@angular/core';

@Component({
  templateUrl: './emulation.component.html',
  styleUrls: ['./emulation.component.scss']
})
export class EmulationComponent implements OnInit {

  count: number = 18;

  constructor() { }

  ngOnInit(): void {
  }

}
