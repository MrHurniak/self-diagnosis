import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";

@Component({
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  constructor(
    private router: Router,
  ) { }

  ngOnInit(): void {
  }

  openDiagnosis(type: 'manual' | 'random'): void {
    if (type === 'random') {
      this.router.navigate(['task'])
      return;
    }
    // TODO add modal
  }
}
