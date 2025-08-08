import { Component, signal, OnInit } from "@angular/core";
import { RouterOutlet } from '@angular/router';
import { Navbar } from './shared/navbar/navbar';
import { Footer } from './shared/footer/footer';
import { AuthService } from './shared/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Navbar, Footer],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('food-delivery-platform');

  constructor(private authService: AuthService) { }

  ngOnInit() {
    // Initialize authentication state when app starts
    this.authService.initializeAuthState().subscribe({
      next: (isAuthenticated) => {
        console.log('App: Authentication state initialized:', isAuthenticated);
      },
      error: (error) => {
        console.error('App: Error initializing auth state:', error);
      }
    });
  }
}

