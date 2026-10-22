import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AlertComponent,
  ButtonCloseDirective,
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  FormLabelDirective,
  FormSelectDirective,
  ModalBodyComponent,
  ModalComponent,
  ModalFooterComponent,
  ModalHeaderComponent,
  ModalTitleDirective,
  SpinnerComponent
} from '@coreui/angular';
import { Ticket, UserSummary } from '../../../core/models/ticket.model';
import { TicketService } from '../../../core/services/ticket.service';
import { TicketStatusBadgeComponent } from '../ticket-status-badge/ticket-status-badge.component';
import { TicketPriorityBadgeComponent } from '../ticket-priority-badge/ticket-priority-badge.component';
import { getStatusLabel } from '../../utils/ticket.util';

@Component({
  selector: 'app-assign-ticket-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ModalComponent,
    ModalHeaderComponent,
    ModalTitleDirective,
    ModalBodyComponent,
    ModalFooterComponent,
    ButtonDirective,
    ButtonCloseDirective,
    FormLabelDirective,
    FormSelectDirective,
    CardComponent,
    CardBodyComponent,
    AlertComponent,
    SpinnerComponent,
    TicketStatusBadgeComponent,
    TicketPriorityBadgeComponent
  ],
  template: `
    <c-modal [visible]="visible" (visibleChange)="onVisibleChange($event)" size="lg" backdrop="static">
      <c-modal-header>
        <h5 cModalTitle class="d-flex align-items-center gap-2">
          <span>Review Ticket & Assign Developer</span>
          @if (ticket) {
            <span class="text-body-secondary fs-6 fw-normal">#{{ ticket.id }}</span>
          }
        </h5>
        <button (click)="closeModal()" cButtonClose></button>
      </c-modal-header>

      <c-modal-body>
        @if (errorMessage) {
          <c-alert color="danger" class="mb-3 d-flex align-items-center justify-content-between">
            <span>{{ errorMessage }}</span>
            <button (click)="errorMessage = ''" cButtonClose></button>
          </c-alert>
        }

        @if (isClosed) {
          <c-alert color="warning" class="mb-3">
            <strong>Ticket is Closed:</strong> This ticket is already closed and cannot be assigned or reassigned to a developer.
          </c-alert>
        }

        @if (ticket) {
          <!-- Ticket Details Card for Admin Review -->
          <c-card class="mb-4 bg-body-tertiary border-0 shadow-sm">
            <c-card-body>
              <div class="d-flex justify-content-between align-items-start mb-2">
                <h6 class="fw-bold fs-5 mb-1 text-primary">{{ ticket.title }}</h6>
                <div class="d-flex gap-2">
                  <app-ticket-priority-badge [priority]="ticket.priority"></app-ticket-priority-badge>
                  <app-ticket-status-badge [status]="ticket.status"></app-ticket-status-badge>
                </div>
              </div>

              <div class="text-body-secondary small mb-3">
                <span>Created by: <strong>{{ ticket.createdByName || 'Unknown' }}</strong></span>
                <span class="mx-2">•</span>
                <span>Created at: {{ ticket.createdAt | date:'medium' }}</span>
                @if (ticket.assignedToName) {
                  <span class="mx-2">•</span>
                  <span>Currently assigned to: <strong class="text-info">{{ ticket.assignedToName }}</strong></span>
                }
              </div>

              <div class="p-3 bg-body rounded border">
                <div class="fw-semibold small text-body-secondary mb-1">Description:</div>
                <p class="mb-0 text-break" style="white-space: pre-wrap;">{{ ticket.description }}</p>
              </div>
            </c-card-body>
          </c-card>

          <!-- Developer Assignment Selection -->
          @if (!isClosed) {
            <div class="mb-3">
              <label cLabel for="developerSelect" class="form-label fw-semibold">
                Select Developer to Assign <span class="text-danger">*</span>
              </label>

              @if (isLoadingDevelopers) {
                <div class="d-flex align-items-center gap-2 text-body-secondary py-2">
                  <c-spinner size="sm"></c-spinner>
                  <span>Loading available developers...</span>
                </div>
              } @else {
                <select
                  cSelect
                  id="developerSelect"
                  [(ngModel)]="selectedDeveloperId"
                  class="form-select"
                >
                  <option [ngValue]="null" disabled>-- Choose a developer --</option>
                  @for (dev of developers; track dev.id) {
                    <option [ngValue]="dev.id">
                      {{ dev.fullName }} ({{ dev.email }})
                    </option>
                  }
                </select>
                @if (developers.length === 0) {
                  <div class="text-warning small mt-1">No developers found.</div>
                }
              }
            </div>
          }
        }
      </c-modal-body>

      <c-modal-footer>
        <button cButton color="secondary" variant="ghost" (click)="closeModal()" [disabled]="isSubmitting">
          Cancel
        </button>
        @if (!isClosed) {
          <button
            cButton
            color="primary"
            (click)="assignTicket()"
            [disabled]="!selectedDeveloperId || isSubmitting || isLoadingDevelopers"
          >
            @if (isSubmitting) {
              <c-spinner size="sm" class="me-2"></c-spinner>
              Assigning...
            } @else {
              Confirm & Assign
            }
          </button>
        }
      </c-modal-footer>
    </c-modal>
  `
})
export class AssignTicketModalComponent implements OnChanges {
  @Input() ticket: Ticket | null = null;
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() assigned = new EventEmitter<Ticket>();

  private ticketService = inject(TicketService);

  developers: UserSummary[] = [];
  selectedDeveloperId: number | null = null;
  isLoadingDevelopers = false;
  isSubmitting = false;
  errorMessage = '';

  get isClosed(): boolean {
    return this.ticket ? getStatusLabel(this.ticket.status) === 'Closed' : false;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && this.visible) {
      this.errorMessage = '';
      this.selectedDeveloperId = null;
      if (!this.isClosed) {
        this.loadDevelopers();
      }
    }
  }

  loadDevelopers(): void {
    if (this.developers.length > 0) return;

    this.isLoadingDevelopers = true;
    this.ticketService.getDevelopers().subscribe({
      next: (devs) => {
        this.developers = devs;
        this.isLoadingDevelopers = false;
      },
      error: () => {
        // Fallback to known seed developers if developer API endpoint returns error
        this.developers = [
          { id: 4, fullName: 'Amit Developer', email: 'amit@helpdesk.com' },
          { id: 5, fullName: 'Neha Developer', email: 'neha@helpdesk.com' }
        ];
        this.isLoadingDevelopers = false;
      }
    });
  }

  onVisibleChange(value: boolean): void {
    this.visible = value;
    this.visibleChange.emit(value);
    if (!value) {
      this.errorMessage = '';
    }
  }

  closeModal(): void {
    this.visible = false;
    this.visibleChange.emit(false);
    this.errorMessage = '';
  }

  assignTicket(): void {
    if (!this.ticket || !this.selectedDeveloperId || this.isClosed) return;

    this.isSubmitting = true;
    this.errorMessage = '';

    this.ticketService.assignTicket(this.ticket.id, this.selectedDeveloperId).subscribe({
      next: (updatedTicket) => {
        this.isSubmitting = false;
        this.assigned.emit(updatedTicket);
        this.closeModal();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage =
          err?.error?.message ||
          'Failed to assign ticket. Please ensure developer is valid.';
      }
    });
  }
}
