import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../shared/services/auth.service';
import { RestaurantService } from '../../../shared/services/restaurant.service';
import { User } from '../../../shared/models/user';
import { Review } from '../../../shared/models/review';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-restaurant-reviews',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './restaurant-reviews.html',
  styleUrls: ['./restaurant-reviews.scss']
})
export class RestaurantReviews implements OnInit, OnDestroy {
  @Input() restaurantId!: string;
  
  // إضافة Math للاستخدام في template
  Math = Math;
  
  reviews: Review[] = [];
  currentUser: User | null = null;
  reviewForm: FormGroup;
  loading = false;
  submitting = false;
  showReviewForm = false;
  userReview: Review | null = null;
  averageRating = 0;
  totalReviews = 0;
  ratingDistribution = [0, 0, 0, 0, 0]; // 1-5 stars
  
  private subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private restaurantService: RestaurantService
  ) {
    this.reviewForm = this.createReviewForm();
  }

  ngOnInit() {
    this.subscribeToAuth();
    this.loadReviews();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private createReviewForm(): FormGroup {
    return this.fb.group({
      rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
      comment: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]]
    });
  }

  private subscribeToAuth() {
    const authSub = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.checkUserReview();
      }
    });
    this.subscriptions.push(authSub);
  }

  private loadReviews() {
    this.loading = true;
    
    const reviewsSub = this.restaurantService.getRestaurantReviews(this.restaurantId).subscribe({
      next: (reviews) => {
        this.reviews = reviews;
        this.calculateRatingStats();
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
      }
    });
    this.subscriptions.push(reviewsSub);
  }

  private checkUserReview() {
    if (!this.currentUser) return;
    
    const userReviewSub = this.restaurantService.getUserReview(this.restaurantId, this.currentUser.id).subscribe({
      next: (review) => {
        this.userReview = review;
        if (review) {
          this.reviewForm.patchValue({
            rating: review.rating,
            comment: review.comment
          });
        }
      },
      error: (error) => {
      }
    });
    this.subscriptions.push(userReviewSub);
  }

  private calculateRatingStats() {
    if (this.reviews.length === 0) {
      this.averageRating = 0;
      this.totalReviews = 0;
      this.ratingDistribution = [0, 0, 0, 0, 0];
      return;
    }

    this.totalReviews = this.reviews.length;
    
    // Calculate average rating
    const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.averageRating = totalRating / this.totalReviews;

    // Calculate rating distribution
    this.ratingDistribution = [0, 0, 0, 0, 0];
    this.reviews.forEach(review => {
      this.ratingDistribution[review.rating - 1]++;
    });
  }

  toggleReviewForm() {
    if (!this.currentUser) {
      // Redirect to login or show login modal
      return;
    }
    this.showReviewForm = !this.showReviewForm;
  }

  onSubmitReview() {
    if (this.reviewForm.invalid || !this.currentUser) {
      this.markFormGroupTouched();
      return;
    }

    this.submitting = true;
    const formData = this.reviewForm.value;
    
    const reviewData = {
      restaurantId: this.restaurantId,
      userId: this.currentUser.id,
      rating: formData.rating,
      comment: formData.comment
    };

    const submitSub = this.userReview 
      ? this.restaurantService.updateReview(this.userReview.id, reviewData)
      : this.restaurantService.addReview(reviewData);

    this.subscriptions.push(submitSub.subscribe({
      next: (review) => {
        this.userReview = review;
        this.showReviewForm = false;
        this.submitting = false;
        this.loadReviews(); // Reload reviews to show updated data
      },
      error: (error) => {
        this.submitting = false;
      }
    }));
  }

  deleteReview() {
    if (!this.userReview) return;

    const deleteSub = this.restaurantService.deleteReview(this.userReview.id).subscribe({
      next: () => {
        this.userReview = null;
        this.reviewForm.reset({ rating: 5, comment: '' });
        this.loadReviews();
      },
      error: (error) => {
      }
    });
    this.subscriptions.push(deleteSub);
  }

  setRating(rating: number) {
    this.reviewForm.patchValue({ rating });
  }

  getStarArray(rating: number): boolean[] {
    return Array(5).fill(false).map((_, i) => i < rating);
  }

  getRatingPercentage(starIndex: number): number {
    if (this.totalReviews === 0) return 0;
    return (this.ratingDistribution[starIndex] / this.totalReviews) * 100;
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  private markFormGroupTouched() {
    Object.keys(this.reviewForm.controls).forEach(key => {
      const control = this.reviewForm.get(key);
      control?.markAsTouched();
    });
  }
}

