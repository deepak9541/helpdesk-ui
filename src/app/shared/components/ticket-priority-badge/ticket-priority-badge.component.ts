import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BadgeComponent } from '@coreui/angular';
import { TicketPriority } from '../../../core/models/ticket.model';
import { getPriorityBadgeColor, getPriorityLabel } from '../../utils/ticket.util';

@Component({
  selector: 'app-ticket-priority-badge',
  standalone: true,
  imports: [CommonModule, BadgeComponent],
  template: `
    <c-badge [color]="badgeColor" shape="rounded-pill" class="px-2 py-1">
      {{ label }}
    </c-badge>
  `
})
export class TicketPriorityBadgeComponent {
  @Input({ required: true }) priority!: TicketPriority | string | number;

  get label(): string {
    return getPriorityLabel(this.priority);
  }

  get badgeColor(): any {
    return getPriorityBadgeColor(this.priority);
  }
}
