import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AssignTicketRequest,
  CreateTicketRequest,
  UpdateTicketRequest,
  DashboardStats,
  Ticket,
  UpdateTicketStatusRequest,
  UserSummary
} from '../models/ticket.model';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/tickets`;

  getTickets(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(this.baseUrl);
  }

  getTicketById(id: number): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.baseUrl}/${id}`);
  }

  createTicket(dto: CreateTicketRequest): Observable<Ticket> {
    return this.http.post<Ticket>(this.baseUrl, dto);
  }

  updateTicket(ticketId: number, dto: UpdateTicketRequest): Observable<Ticket> {
    return this.http.put<Ticket>(`${this.baseUrl}/${ticketId}`, dto);
  }

  assignTicket(ticketId: number, developerId: number): Observable<Ticket> {
    const payload: AssignTicketRequest = { developerId };
    return this.http.patch<Ticket>(`${this.baseUrl}/${ticketId}/assign`, payload);
  }

  changeStatus(ticketId: number, status: number): Observable<Ticket> {
    const payload: UpdateTicketStatusRequest = { status };
    return this.http.patch<Ticket>(`${this.baseUrl}/${ticketId}/status`, payload);
  }

  getDevelopers(): Observable<UserSummary[]> {
    return this.http.get<UserSummary[]>(`${this.baseUrl}/developers`);
  }

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${environment.apiUrl}/dashboard/stats`);
  }
}
