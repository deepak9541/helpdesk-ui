import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BadgeComponent } from '@coreui/angular';
import { TicketStatus } from '../../../core/models/ticket.model';
import { getStatusBadgeColor, getStatusLabel } from '../../utils/ticket.util';

@Component({
  selector: 'app-ticket-status-badge',
  standalone: true,
  imports: [CommonModule, BadgeComponent],
  template: `
    <c-badge [color]="badgeColor" shape="rounded-pill" class="px-2 py-1">
      {{ label }}
    </c-badge>
  `
})
export class TicketStatusBadgeComponent {
  @Input({ required: true }) status!: TicketStatus | string | number;

  get label(): string {
    return getStatusLabel(this.status);
  }

  get badgeColor(): any {
    return getStatusBadgeColor(this.status);
  }
}
