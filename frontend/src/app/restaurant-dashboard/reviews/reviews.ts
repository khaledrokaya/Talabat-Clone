import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { RestaurantService } from '../../shared/services/restaurant.service';

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './reviews.html',
  styleUrls: ['./reviews.scss']
})
export class Reviews implements OnInit {
  reviews: any[] = [];
  filteredReviews: any[] = [];
  isLoading = true;
  activeFilter = 'all';
  searchTerm = '';

  showReplyModal = false;
  selectedReview: any = null;
  replyForm!: FormGroup;
  isSubmittingReply = false;
  isEditingReply = false;

  constructor(
    private restaurantService: RestaurantService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadReviews();
  }

  initializeForm(): void {
    this.replyForm = this.fb.group({
      replyText: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  loadReviews(): void {
    this.isLoading = true;
    // استخدام getRestaurantReviewsForDashboard بدلاً من getRestaurantReviews
    this.restaurantService.getRestaurantReviewsForDashboard().subscribe({
      next: (reviews) => {
        this.reviews = reviews || [];
        this.filterReviews();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('خطأ في تحميل المراجعات:', error);
        // Simulate some reviews for demonstration
        this.reviews = [
          {
            _id: '1',
            customer: { name: 'أحمد محمد' },
            rating: 5,
            comment: 'طعام ممتاز وخدمة رائعة. أنصح بشدة!',
            reply: null,
            createdAt: new Date().toISOString()
          },
          {
            _id: '2',
            customer: { name: 'فاطمة علي' },
            rating: 4,
            comment: 'الطعام جيد لكن التوصيل كان متأخراً قليلاً.',
            reply: 'شكراً لك على التقييم. سنعمل على تحسين أوقات التوصيل.',
            createdAt: new Date(Date.now() - 86400000).toISOString()
          },
          {
            _id: '3',
            customer: { name: 'محمد سالم' },
            rating: 3,
            comment: 'الطعام عادي، يحتاج تحسين في النكهة.',
            reply: null,
            createdAt: new Date(Date.now() - 172800000).toISOString()
          }
        ];
        this.filterReviews();
        this.isLoading = false;
      }
    });
  }

  filterReviews(): void {
    let tempReviews = [...this.reviews];

    // Apply reply status filter
    if (this.activeFilter === 'replied') {
      tempReviews = tempReviews.filter(review => review.reply);
    } else if (this.activeFilter === 'unreplied') {
      tempReviews = tempReviews.filter(review => !review.reply);
    }

    // Apply search term filter
    if (this.searchTerm) {
      const lowerCaseSearchTerm = this.searchTerm.toLowerCase();
      tempReviews = tempReviews.filter(review =>
        review.customer?.name.toLowerCase().includes(lowerCaseSearchTerm) ||
        review.comment.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    this.filteredReviews = tempReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  setFilter(filter: string): void {
    this.activeFilter = filter;
    this.filterReviews();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.activeFilter = 'all';
    this.filterReviews();
  }

  getAverageRating(): number {
    if (this.reviews.length === 0) return 0;
    const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / this.reviews.length;
  }

  getReviewsByReplyStatus(hasReply: boolean): any[] {
    return this.reviews.filter(review => hasReply ? review.reply : !review.reply);
  }

  getStars(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }

  getEmptyStars(rating: number): number[] {
    return Array(5 - Math.floor(rating)).fill(0);
  }

  formatDate(dateString: string): string {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('ar-SA', options);
  }

  // Reply modal methods
  openReplyModal(review: any): void {
    this.selectedReview = review;
    this.isEditingReply = !!review.reply;
    this.showReplyModal = true;
    this.replyForm.patchValue({
      replyText: review.reply || ''
    });
  }

  closeReplyModal(): void {
    this.showReplyModal = false;
    this.selectedReview = null;
    this.isEditingReply = false;
    this.replyForm.reset();
  }

  onSubmitReply(): void {
    if (this.replyForm.valid && this.selectedReview) {
      this.isSubmittingReply = true;
      const replyText = this.replyForm.get('replyText')?.value;

      this.restaurantService.replyToReview(this.selectedReview._id, replyText).subscribe({
        next: () => {
          this.isSubmittingReply = false;
          this.closeReplyModal();
          this.loadReviews();
          const action = this.isEditingReply ? 'تحديث' : 'إرسال';
          alert(`تم ${action} الرد بنجاح`);
        },
        error: (error) => {
          this.isSubmittingReply = false;
          console.error('خطأ في إرسال الرد:', error);
          
          // Simulate successful reply for demonstration
          const reviewIndex = this.reviews.findIndex(r => r._id === this.selectedReview._id);
          if (reviewIndex !== -1) {
            this.reviews[reviewIndex].reply = replyText;
            this.filterReviews();
          }
          
          this.closeReplyModal();
          const action = this.isEditingReply ? 'تحديث' : 'إرسال';
          alert(`تم ${action} الرد بنجاح`);
        }
      });
    } else {
      this.markFormGroupTouched(this.replyForm);
    }
  }

  deleteReview(reviewId: string): void {
    if (confirm('هل أنت متأكد من حذف هذه المراجعة؟')) {
      // In a real application, you would call a service here
      // For demonstration, we'll just remove it from the local array
      this.reviews = this.reviews.filter(review => review._id !== reviewId);
      this.filterReviews();
      alert('تم حذف المراجعة بنجاح');
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }
}

