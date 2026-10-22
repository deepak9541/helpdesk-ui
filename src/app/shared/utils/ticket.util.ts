import { TicketPriority, TicketStatus } from '../../core/models/ticket.model';

export function getStatusLabel(status: TicketStatus | string | number): string {
  if (status === TicketStatus.Open || status === 1 || status === 'Open' || status === '1') {
    return 'Open';
  }
  if (status === TicketStatus.InProgress || status === 2 || status === 'InProgress' || status === '2') {
    return 'In Progress';
  }
  if (status === TicketStatus.Resolved || status === 3 || status === 'Resolved' || status === '3') {
    return 'Resolved';
  }
  if (status === TicketStatus.Closed || status === 4 || status === 'Closed' || status === '4') {
    return 'Closed';
  }
  return String(status || 'Unknown');
}

export function getStatusBadgeColor(status: TicketStatus | string | number): string {
  const label = getStatusLabel(status);
  switch (label) {
    case 'Open':
      return 'info';
    case 'In Progress':
      return 'warning';
    case 'Resolved':
      return 'success';
    case 'Closed':
      return 'secondary';
    default:
      return 'dark';
  }
}

export function getPriorityLabel(priority: TicketPriority | string | number): string {
  if (priority === TicketPriority.Low || priority === 1 || priority === 'Low' || priority === '1') {
    return 'Low';
  }
  if (priority === TicketPriority.Medium || priority === 2 || priority === 'Medium' || priority === '2') {
    return 'Medium';
  }
  if (priority === TicketPriority.High || priority === 3 || priority === 'High' || priority === '3') {
    return 'High';
  }
  return String(priority || 'Unknown');
}

export function getPriorityBadgeColor(priority: TicketPriority | string | number): string {
  const label = getPriorityLabel(priority);
  switch (label) {
    case 'Low':
      return 'success';
    case 'Medium':
      return 'warning';
    case 'High':
      return 'danger';
    default:
      return 'secondary';
  }
}

export function getPriorityNumber(priority: TicketPriority | string | number): number {
  if (priority === TicketPriority.Low || priority === 1 || priority === 'Low' || priority === '1') {
    return 1;
  }
  if (priority === TicketPriority.Medium || priority === 2 || priority === 'Medium' || priority === '2') {
    return 2;
  }
  if (priority === TicketPriority.High || priority === 3 || priority === 'High' || priority === '3') {
    return 3;
  }
  return 2;
}
