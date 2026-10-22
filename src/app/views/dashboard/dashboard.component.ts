import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AlertComponent,
  BadgeComponent,
  ButtonCloseDirective,
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  CardHeaderComponent,
  ColComponent,
  FormControlDirective,
  FormSelectDirective,
  RowComponent,
  SpinnerComponent,
  TableDirective
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { AuthService } from '../../core/services/auth.service';
import { TicketService } from '../../core/services/ticket.service';
import { DashboardStats, Ticket } from '../../core/models/ticket.model';
import { TicketStatusBadgeComponent } from '../../shared/components/ticket-status-badge/ticket-status-badge.component';
import { TicketPriorityBadgeComponent } from '../../shared/components/ticket-priority-badge/ticket-priority-badge.component';
import { CreateTicketModalComponent } from '../../shared/components/create-ticket-modal/create-ticket-modal.component';
import { AssignTicketModalComponent } from '../../shared/components/assign-ticket-modal/assign-ticket-modal.component';
import { TicketDetailsModalComponent } from '../../shared/components/ticket-details-modal/ticket-details-modal.component';
import { getPriorityLabel, getStatusLabel } from '../../shared/utils/ticket.util';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    RowComponent,
    ColComponent,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    ButtonDirective,
    ButtonCloseDirective,
    TableDirective,
    BadgeComponent,
    AlertComponent,
    SpinnerComponent,
    FormControlDirective,
    FormSelectDirective,
    IconDirective,
    TicketStatusBadgeComponent,
    TicketPriorityBadgeComponent,
    CreateTicketModalComponent,
    AssignTicketModalComponent,
    TicketDetailsModalComponent
  ]
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private ticketService = inject(TicketService);

  currentUser = this.authService.currentUserSignal;
  isAdmin = this.authService.isAdmin;
  isEmployee = this.authService.isEmployee;
  isDeveloper = this.authService.isDeveloper;

  tickets = signal<Ticket[]>([]);
  stats = signal<DashboardStats>({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0
  });

  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');
  successMessage = signal<string>('');

  // Search & Filter state
  searchQuery = signal<string>('');
  statusFilter = signal<string>('all');
  priorityFilter = signal<string>('all');

  // Modals state
  isCreateModalVisible = false;
  ticketToEdit: Ticket | null = null;
  isAssignModalVisible = false;
  selectedTicketForAssign: Ticket | null = null;
  isDetailsModalVisible = false;
  selectedTicketForDetails: Ticket | null = null;

  filteredTickets = computed(() => {
    const list = this.tickets();
    const query = this.searchQuery().toLowerCase().trim();
    const sFilter = this.statusFilter();
    const pFilter = this.priorityFilter();

    return list.filter((t) => {
      // Search matching
      const matchesQuery =
        !query ||
        t.title.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        (t.createdByName && t.createdByName.toLowerCase().includes(query)) ||
        (t.assignedToName && t.assignedToName.toLowerCase().includes(query)) ||
        t.id.toString().includes(query);

      // Status matching
      const statusLabel = getStatusLabel(t.status).toLowerCase();
      const matchesStatus =
        sFilter === 'all' ||
        statusLabel === sFilter.toLowerCase() ||
        String(t.status) === sFilter;

      // Priority matching
      const priorityLabel = getPriorityLabel(t.priority).toLowerCase();
      const matchesPriority =
        pFilter === 'all' ||
        priorityLabel === pFilter.toLowerCase() ||
        String(t.priority) === pFilter;

      return matchesQuery && matchesStatus && matchesPriority;
    });
  });

  ngOnInit(): void {
    this.refreshAll();
  }

  refreshAll(): void {
    this.loadTickets();
    this.loadStats();
  }

  loadTickets(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.ticketService.getTickets().subscribe({
      next: (data) => {
        this.tickets.set(data);
        this.isLoading.set(false);
        this.recalculateStatsFromTickets(data);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          err?.error?.message || 'Failed to load tickets. Please check server connection.'
        );
      }
    });
  }

  loadStats(): void {
    if (this.isAdmin()) {
      this.ticketService.getDashboardStats().subscribe({
        next: (s) => this.stats.set(s),
        error: () => {
          // If backend stats fail, compute from tickets list
          this.recalculateStatsFromTickets(this.tickets());
        }
      });
    }
  }

  private recalculateStatsFromTickets(list: Ticket[]): void {
    let open = 0;
    let inProgress = 0;
    let resolved = 0;
    let closed = 0;

    for (const t of list) {
      const s = getStatusLabel(t.status);
      if (s === 'Open') open++;
      else if (s === 'In Progress') inProgress++;
      else if (s === 'Resolved') resolved++;
      else if (s === 'Closed') closed++;
    }

    this.stats.set({
      total: list.length,
      open,
      inProgress,
      resolved,
      closed
    });
  }

  // Create & Edit Ticket
  openCreateModal(): void {
    this.ticketToEdit = null;
    this.isCreateModalVisible = true;
  }

  openEditModal(ticket: Ticket): void {
    this.ticketToEdit = ticket;
    this.isCreateModalVisible = true;
  }

  canEditTicket(ticket: Ticket): boolean {
    return this.isEmployee() && getStatusLabel(ticket.status) === 'Open';
  }

  canAssignTicket(ticket: Ticket): boolean {
    return this.isAdmin() && getStatusLabel(ticket.status) !== 'Closed';
  }

  onTicketCreated(newTicket: Ticket): void {
    this.successMessage.set(`Ticket #${newTicket.id} "${newTicket.title}" created successfully!`);
    this.tickets.update((prev) => [newTicket, ...prev]);
    this.recalculateStatsFromTickets(this.tickets());
    setTimeout(() => this.successMessage.set(''), 6000);
  }

  onTicketUpdated(updatedTicket: Ticket): void {
    this.successMessage.set(`Ticket #${updatedTicket.id} "${updatedTicket.title}" updated successfully!`);
    this.tickets.update((prev) =>
      prev.map((t) => (t.id === updatedTicket.id ? { ...t, ...updatedTicket } : t))
    );
    this.recalculateStatsFromTickets(this.tickets());
    setTimeout(() => this.successMessage.set(''), 6000);
  }

  // Assign Ticket (Admin)
  openAssignModal(ticket: Ticket): void {
    this.selectedTicketForAssign = ticket;
    this.isAssignModalVisible = true;
  }

  onTicketAssigned(updated: Ticket): void {
    this.successMessage.set(
      `Ticket #${updated.id} successfully assigned to ${updated.assignedToName}!`
    );
    this.tickets.update((prev) =>
      prev.map((t) => (t.id === updated.id ? { ...t, ...updated } : t))
    );
    this.recalculateStatsFromTickets(this.tickets());
    setTimeout(() => this.successMessage.set(''), 6000);
  }

  // Details Modal
  openDetailsModal(ticket: Ticket): void {
    this.selectedTicketForDetails = ticket;
    this.isDetailsModalVisible = true;
  }

  onStatusChange(event: { ticketId: number; newStatus: number }): void {
    this.isLoading.set(true);
    this.ticketService.changeStatus(event.ticketId, event.newStatus).subscribe({
      next: (updated) => {
        this.isLoading.set(false);
        this.successMessage.set(
          `Ticket #${updated.id} status updated to ${getStatusLabel(updated.status)}!`
        );
        this.tickets.update((prev) =>
          prev.map((t) => (t.id === updated.id ? { ...t, ...updated } : t))
        );
        this.recalculateStatsFromTickets(this.tickets());
        setTimeout(() => this.successMessage.set(''), 6000);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          err?.error?.message || 'Failed to update ticket status.'
        );
      }
    });
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.statusFilter.set('all');
    this.priorityFilter.set('all');
  }
}
