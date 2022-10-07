import { Component, Input } from '@angular/core';
import { ModalService } from '../modal-service/modal.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  @Input() title: string;
  @Input() subtitle?: string;

  constructor(
    public modalService: ModalService,
    private router: Router
  ) {}

  loadMainPage(): Promise<boolean> {
    return this.router.navigate(['/']);
  }
}
