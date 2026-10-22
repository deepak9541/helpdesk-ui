import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  AlertComponent,
  ButtonCloseDirective,
  ButtonDirective,
  FormControlDirective,
  FormFeedbackComponent,
  FormLabelDirective,
  FormSelectDirective,
  ModalBodyComponent,
  ModalComponent,
  ModalFooterComponent,
  ModalHeaderComponent,
  ModalTitleDirective,
  SpinnerComponent
} from '@coreui/angular';
import { TicketService } from '../../../core/services/ticket.service';
import { Ticket } from '../../../core/models/ticket.model';
import { getPriorityNumber } from '../../utils/ticket.util';

@Component({
  selector: 'app-create-ticket-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ModalComponent,
    ModalHeaderComponent,
    ModalTitleDirective,
    ModalBodyComponent,
    ModalFooterComponent,
    ButtonDirective,
    ButtonCloseDirective,
    FormControlDirective,
    FormLabelDirective,
    FormSelectDirective,
    FormFeedbackComponent,
    AlertComponent,
    SpinnerComponent
  ],
  template: `
    <c-modal [visible]="visible" (visibleChange)="onVisibleChange($event)" size="lg" backdrop="static">
      <c-modal-header>
        <h5 cModalTitle class="d-flex align-items-center gap-2">
          @if (isEditMode) {
            <span>Edit Support Ticket</span>
            <span class="text-body-secondary fs-6 fw-normal">#{{ ticketToEdit?.id }}</span>
          } @else {
            <span>Create New Support Ticket</span>
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

        <form [formGroup]="form" (ngSubmit)="submitTicket()">
          <div class="mb-3">
            <label cLabel for="ticketTitle" class="form-label fw-semibold">
              Ticket Title <span class="text-danger">*</span>
            </label>
            <input
              cFormControl
              id="ticketTitle"
              type="text"
              placeholder="Brief summary of the issue (min 5 characters)"
              formControlName="title"
              [valid]="form.get('title')?.touched ? form.get('title')?.valid : undefined"
            />
            @if (form.get('title')?.touched && form.get('title')?.invalid) {
              <c-form-feedback [valid]="false">
                @if (form.get('title')?.errors?.['required']) {
                  Title is required.
                } @else if (form.get('title')?.errors?.['minlength']) {
                  Title must be at least 5 characters.
                } @else if (form.get('title')?.errors?.['maxlength']) {
                  Title cannot exceed 150 characters.
                }
              </c-form-feedback>
            }
          </div>

          <div class="mb-3">
            <label cLabel for="ticketPriority" class="form-label fw-semibold">
              Priority <span class="text-danger">*</span>
            </label>
            <select
              cSelect
              id="ticketPriority"
              formControlName="priority"
              [valid]="form.get('priority')?.touched ? form.get('priority')?.valid : undefined"
            >
              <option [ngValue]="1">Low</option>
              <option [ngValue]="2">Medium</option>
              <option [ngValue]="3">High</option>
            </select>
          </div>

          <div class="mb-3">
            <label cLabel for="ticketDescription" class="form-label fw-semibold">
              Description <span class="text-danger">*</span>
            </label>
            <textarea
              cFormControl
              id="ticketDescription"
              rows="5"
              placeholder="Detailed description of the issue or request (min 10 characters)"
              formControlName="description"
              [valid]="form.get('description')?.touched ? form.get('description')?.valid : undefined"
            ></textarea>
            @if (form.get('description')?.touched && form.get('description')?.invalid) {
              <c-form-feedback [valid]="false">
                @if (form.get('description')?.errors?.['required']) {
                  Description is required.
                } @else if (form.get('description')?.errors?.['minlength']) {
                  Description must be at least 10 characters.
                } @else if (form.get('description')?.errors?.['maxlength']) {
                  Description cannot exceed 2000 characters.
                }
              </c-form-feedback>
            }
          </div>
        </form>
      </c-modal-body>

      <c-modal-footer>
        <button cButton color="secondary" variant="ghost" (click)="closeModal()" [disabled]="isSubmitting">
          Cancel
        </button>
        <button cButton color="primary" (click)="submitTicket()" [disabled]="form.invalid || isSubmitting">
          @if (isSubmitting) {
            <c-spinner size="sm" class="me-2"></c-spinner>
            {{ isEditMode ? 'Updating...' : 'Submitting...' }}
          } @else {
            {{ isEditMode ? 'Update Ticket' : 'Submit Ticket' }}
          }
        </button>
      </c-modal-footer>
    </c-modal>
  `
})
export class CreateTicketModalComponent implements OnChanges {
  @Input() visible = false;
  @Input() ticketToEdit: Ticket | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() ticketCreated = new EventEmitter<Ticket>();
  @Output() ticketUpdated = new EventEmitter<Ticket>();

  private fb = inject(FormBuilder);
  private ticketService = inject(TicketService);

  isSubmitting = false;
  errorMessage = '';

  form: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(150)]],
    description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(2000)]],
    priority: [2, [Validators.required]] // Medium by default
  });

  get isEditMode(): boolean {
    return !!this.ticketToEdit;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['ticketToEdit'] || changes['visible']) && this.visible) {
      if (this.ticketToEdit) {
        this.form.reset({
          title: this.ticketToEdit.title,
          description: this.ticketToEdit.description,
          priority: getPriorityNumber(this.ticketToEdit.priority)
        });
      } else {
        this.resetModal();
      }
    }
  }

  onVisibleChange(value: boolean): void {
    this.visible = value;
    this.visibleChange.emit(value);
    if (!value) {
      this.resetModal();
    }
  }

  closeModal(): void {
    this.visible = false;
    this.visibleChange.emit(false);
    this.resetModal();
  }

  submitTicket(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const payload = {
      title: this.form.value.title.trim(),
      description: this.form.value.description.trim(),
      priority: Number(this.form.value.priority)
    };

    if (this.isEditMode && this.ticketToEdit) {
      this.ticketService.updateTicket(this.ticketToEdit.id, payload).subscribe({
        next: (updatedTicket) => {
          this.isSubmitting = false;
          this.ticketUpdated.emit(updatedTicket);
          this.closeModal();
        },
        error: (err) => {
          this.isSubmitting = false;
          this.errorMessage =
            err?.error?.message ||
            err?.error?.title ||
            'Failed to update ticket. Tickets can only be edited while Open.';
        }
      });
    } else {
      this.ticketService.createTicket(payload).subscribe({
        next: (newTicket) => {
          this.isSubmitting = false;
          this.ticketCreated.emit(newTicket);
          this.closeModal();
        },
        error: (err) => {
          this.isSubmitting = false;
          this.errorMessage =
            err?.error?.message ||
            err?.error?.title ||
            'Failed to create ticket. Please check your input and try again.';
        }
      });
    }
  }

  private resetModal(): void {
    this.form.reset({ priority: 2 });
    this.errorMessage = '';
    this.isSubmitting = false;
  }
}
