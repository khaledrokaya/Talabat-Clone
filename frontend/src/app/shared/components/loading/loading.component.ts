import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TalabatLogo } from '../../components/talabat-logo/talabat-logo';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule, TalabatLogo],
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss']
})
export class LoadingComponent implements OnInit, OnDestroy {
  @Input() isLoading: boolean = false;
  @Input() text: string = 'Loading delicious food...';
  @Input() showProgress: boolean = false;
  @Input() progress: number = 0;

  private resizeListener?: () => void;

  ngOnInit() {
    // Listen for window resize to update logo size responsively
    this.resizeListener = () => this.updateLogoSize();
    window.addEventListener('resize', this.resizeListener);
  }

  ngOnDestroy() {
    if (this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
    }
  }

  private updateLogoSize() {
    // This will trigger change detection and update the logo size
  }

  // Responsive logo sizing
  get logoSize() {
    const isMobile = window.innerWidth <= 768;
    return {
      width: isMobile ? '100' : '140',
      height: isMobile ? '38' : '53'
    };
  }

  // Loading messages array for variety
  get loadingMessages() {
    return [
      'Loading delicious food...',
      'Preparing your feast...',
      'Finding the best restaurants...',
      'Getting your order ready...',
      'Almost there...'
    ];
  }

  // Get a random loading message if none provided
  get displayText() {
    if (this.text !== 'Loading delicious food...') {
      return this.text;
    }
    const messages = this.loadingMessages;
    return messages[Math.floor(Math.random() * messages.length)];
  }
}
