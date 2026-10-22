import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  AlertComponent,
  ButtonCloseDirective,
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  ColComponent,
  ContainerComponent,
  FormControlDirective,
  FormDirective,
  FormFeedbackComponent,
  FormLabelDirective,
  InputGroupComponent,
  InputGroupTextDirective,
  RowComponent,
  RowDirective,
  SpinnerComponent,
  TooltipDirective
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  host: {
    class: 'bg-body-tertiary min-vh-100 d-flex flex-row align-items-center'
  },
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonDirective,
    ButtonCloseDirective,
    CardBodyComponent,
    CardComponent,
    ColComponent,
    ContainerComponent,
    FormControlDirective,
    FormDirective,
    FormFeedbackComponent,
    FormLabelDirective,
    IconDirective,
    InputGroupComponent,
    InputGroupTextDirective,
    RowComponent,
    RowDirective,
    TooltipDirective,
    AlertComponent,
    SpinnerComponent
  ]
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  isLoading = false;
  errorMessage = '';
  showPassword = false;

  loginForm: FormGroup = this.fb.group({
    email: ['admin@helpdesk.com', [Validators.required, Validators.email]],
    password: ['Password@123', [Validators.required]]
  });

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }


  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.value;

    this.authService.login({ email, password }).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 401 || err.status === 400) {
          this.errorMessage = err?.error?.message || 'Invalid email or password.';
        } else {
          this.errorMessage = 'Unable to connect to the server. Please ensure the backend is running.';
        }
      }
    });
  }
}
