import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ButtonCloseDirective,
  ButtonDirective,
  ModalBodyComponent,
  ModalComponent,
  ModalFooterComponent,
  ModalHeaderComponent,
  ModalTitleDirective
} from '@coreui/angular';
import { Ticket } from '../../../core/models/ticket.model';
import { TicketStatusBadgeComponent } from '../ticket-status-badge/ticket-status-badge.component';
import { TicketPriorityBadgeComponent } from '../ticket-priority-badge/ticket-priority-badge.component';
import { getStatusLabel } from '../../utils/ticket.util';

@Component({
  selector: 'app-ticket-details-modal',
  standalone: true,
  imports: [
    CommonModule,
    ModalComponent,
    ModalHeaderComponent,
    ModalTitleDirective,
    ModalBodyComponent,
    ModalFooterComponent,
    ButtonDirective,
    ButtonCloseDirective,
    TicketStatusBadgeComponent,
    TicketPriorityBadgeComponent
  ],
  template: `
    <c-modal [visible]="visible" (visibleChange)="onVisibleChange($event)" size="lg">
      <c-modal-header>
        <h5 cModalTitle class="d-flex align-items-center gap-2">
          <span>Ticket Details</span>
          @if (ticket) {
            <span class="text-body-secondary fs-6 fw-normal">#{{ ticket.id }}</span>
          }
        </h5>
        <button (click)="closeModal()" cButtonClose></button>
      </c-modal-header>

      <c-modal-body>
        @if (ticket) {
          <div class="mb-3">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <h4 class="fw-bold fs-4 text-primary mb-0">{{ ticket.title }}</h4>
              <div class="d-flex gap-2">
                <app-ticket-priority-badge [priority]="ticket.priority"></app-ticket-priority-badge>
                <app-ticket-status-badge [status]="ticket.status"></app-ticket-status-badge>
              </div>
            </div>

            <div class="row g-3 py-2 border-top border-bottom my-2 small text-body-secondary">
              <div class="col-md-6">
                <div><strong>Created by:</strong> {{ ticket.createdByName || 'Unknown' }}</div>
                <div><strong>Created at:</strong> {{ ticket.createdAt | date:'medium' }}</div>
              </div>
              <div class="col-md-6">
                <div><strong>Assigned to:</strong> {{ ticket.assignedToName || 'Unassigned' }}</div>
                @if (ticket.updatedAt) {
                  <div><strong>Last updated:</strong> {{ ticket.updatedAt | date:'medium' }}</div>
                }
              </div>
            </div>

            <div class="mt-3">
              <label class="fw-semibold text-body-secondary small mb-1">Description:</label>
              <div class="p-3 bg-body-tertiary rounded border text-break" style="white-space: pre-wrap; min-height: 120px;">
                {{ ticket.description }}
              </div>
            </div>
          </div>
        }
      </c-modal-body>

      <c-modal-footer>
        @if (canEdit && ticket) {
          <button cButton color="warning" (click)="onRequestEdit()">
            Edit Ticket
          </button>
        }

        @if (canAssign && ticket) {
          <button cButton color="primary" (click)="onRequestAssign()">
            Assign / Reassign Developer
          </button>
        }

        @if (canResolve) {
          <button cButton color="success" (click)="updateStatus(3)">
            Mark as Resolved
          </button>
        }

        @if (canClose) {
          <button cButton color="dark" (click)="updateStatus(4)">
            Close Ticket
          </button>
        }

        @if (canReopen) {
          <button cButton color="warning" (click)="updateStatus(2)">
            Reopen Ticket
          </button>
        }

        <button cButton color="secondary" variant="ghost" (click)="closeModal()">
          Close
        </button>
      </c-modal-footer>
    </c-modal>
  `
})
export class TicketDetailsModalComponent {
  @Input() ticket: Ticket | null = null;
  @Input() visible = false;
  @Input() isAdmin = false;
  @Input() isEmployee = false;
  @Input() isDeveloper = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() requestAssign = new EventEmitter<Ticket>();
  @Output() requestEdit = new EventEmitter<Ticket>();
  @Output() statusChange = new EventEmitter<{ ticketId: number; newStatus: number }>();

  get currentStatusLabel(): string {
    return this.ticket ? getStatusLabel(this.ticket.status) : '';
  }

  get canAssign(): boolean {
    return this.isAdmin && this.currentStatusLabel !== 'Closed';
  }

  get canEdit(): boolean {
    return this.isEmployee && this.currentStatusLabel === 'Open';
  }

  get canResolve(): boolean {
    return (this.isAdmin || this.isDeveloper) && this.currentStatusLabel === 'In Progress';
  }

  get canClose(): boolean {
    return this.isAdmin && this.currentStatusLabel === 'Resolved';
  }

  get canReopen(): boolean {
    return this.isAdmin && this.currentStatusLabel === 'Resolved';
  }

  onVisibleChange(value: boolean): void {
    this.visible = value;
    this.visibleChange.emit(value);
  }

  closeModal(): void {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  onRequestAssign(): void {
    if (this.ticket) {
      this.closeModal();
      this.requestAssign.emit(this.ticket);
    }
  }

  onRequestEdit(): void {
    if (this.ticket) {
      this.closeModal();
      this.requestEdit.emit(this.ticket);
    }
  }

  updateStatus(newStatus: number): void {
    if (this.ticket) {
      this.statusChange.emit({ ticketId: this.ticket.id, newStatus });
      this.closeModal();
    }
  }
}
