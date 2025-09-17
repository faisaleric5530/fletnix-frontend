import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
  imports: [CommonModule, ReactiveFormsModule]
})
export class AuthComponent implements OnInit {
  isLogin = true;
  authForm: FormGroup;
  isLoading = false;
  error = '';
  returnUrl = '/home';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.authForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      age: [18, [Validators.required, Validators.min(1), Validators.max(120)]]
    });
  }

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
    
    if (this.isLogin) {
      this.authForm.get('age')?.clearValidators();
      this.authForm.get('age')?.updateValueAndValidity();
    }
  }

  toggleMode(): void {
    this.isLogin = !this.isLogin;
    this.error = '';
    this.authForm.reset();
    
    if (this.isLogin) {
      this.authForm.get('age')?.clearValidators();
    } else {
      this.authForm.get('age')?.setValidators([Validators.required, Validators.min(1), Validators.max(120)]);
    }
    this.authForm.get('age')?.updateValueAndValidity();
  }

  onSubmit(): void {
    if (this.authForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;
    this.error = '';

    const formValue = this.authForm.value;

    if (this.isLogin) {
      this.authService.login({
        email: formValue.email,
        password: formValue.password
      }).subscribe({
        next: (res) => {
          if (res && res.token) {
            localStorage.setItem('authToken', res.token);
          }

          this.router.navigate([this.returnUrl]);
        },
        error: (error) => {
          this.error = error.message;
          this.isLoading = false;
        }
      });
    } else {
      this.authService.register({
        email: formValue.email,
        password: formValue.password,
        age: formValue.age
      }).subscribe({
        next: (res) => {
          if (res && res.token) {
            localStorage.setItem('authToken', res.token);
          }

          this.router.navigate([this.returnUrl]);
        },
        error: (error) => {
          this.error = error.message;
          this.isLoading = false;
        }
      });
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.authForm.controls).forEach(key => {
      const control = this.authForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.authForm.get(fieldName);
    if (field?.touched && field?.errors) {
      if (field.errors['required']) {
        return `${fieldName} is required`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email';
      }
      if (field.errors['minlength']) {
        return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
      if (field.errors['min']) {
        return `Age must be at least ${field.errors['min'].min}`;
      }
      if (field.errors['max']) {
        return `Age must be at most ${field.errors['max'].max}`;
      }
    }
    return '';
  }

  hasFieldError(fieldName: string): boolean {
    const field = this.authForm.get(fieldName);
    return !!(field?.touched && field?.errors);
  }
}