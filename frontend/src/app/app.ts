import { Component, signal, OnInit } from "@angular/core";
import { RouterOutlet } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { Navbar } from './shared/navbar/navbar';
import { Footer } from './shared/footer/footer';
import { LoadingComponent } from './shared/components/loading/loading.component';
import { AuthService } from './shared/services/auth.service';
import { LoadingService } from './shared/services/loading.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Navbar, Footer, LoadingComponent, AsyncPipe],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('food-delivery-platform');

  constructor(
    private authService: AuthService,
    public loadingService: LoadingService
  ) { }

  ngOnInit() {
    this.authService.initializeAuthState().subscribe({
      next: (isAuthenticated) => {
        this.loadingService.hideInitialLoading();
      },
      error: (error) => {
        this.loadingService.hideInitialLoading();
      }
    });
  }
}

