## قائمة المهام لمشروع Angular

### المرحلة 1: تطوير الواجهة الأمامية وربطها بالواجهة الخلفية

- [x] تحديث ملفات `environment.ts` و `environment.prod.ts` لتعريف `apiUrl`.
- [x] تحديث `AuthService` للتفاعل مع API المصادقة.
- [x] تحديث `RestaurantService` للتفاعل مع API المطاعم.
- [x] تحديث `CartService` لإدارة سلة التسوق محليًا.
- [x] تحديث `OrderService` للتفاعل مع API الطلبات.
- [x] تنفيذ مكونات المصادقة (Login, Register, Verify Email, Forgot Password) لربطها بـ `AuthService`.
- [x] تنفيذ مكونات المطاعم (Restaurant List, Restaurant Details) لربطها بـ `RestaurantService`.
- [x] تنفيذ مكونات سلة التسوق (Cart) لربطها بـ `CartService`.
- [x] تنفيذ مكونات الدفع (Checkout, Address Selection, Payment Method) لربطها بـ `OrderService` و `CartService`.
- [x] تنفيذ مكونات الطلبات (Customer Orders, Restaurant Orders) لربطها بـ `OrderService`.
- [x] تنفيذ مكونات الملف الشخصي (Profile, Personal Data, Password, Favorites, Addresses) لربطها بـ `UserService`.
- [ ] تنفيذ مكونات لوحة تحكم المطعم (Restaurant Dashboard, Menu Management, Wallet, Reviews) لربطها بـ `DashboardService`.
- [ ] تنفيذ مكونات لوحة تحكم المسؤول (Admin Dashboard, User Management, Restaurant Management, Order Management, Statistics) لربطها بـ `AdminService`.
- [x] تحديث مكونات `Navbar` و `Footer`.
- [x] إضافة `HttpClientModule` إلى `app.config.ts`.
- [x] إضافة `AuthInterceptor` لمعالجة الرموز المميزة (Tokens).

### المرحلة 2: ضغط المشروع

- [ ] ضغط مجلد المشروع Angular.

### المرحلة 3: تقديم المشروع وتعليمات التشغيل للمستخدم

- [ ] تقديم الملف المضغوط للمشروع.
- [ ] توفير تعليمات مفصلة لتشغيل الواجهة الأمامية والخلفية.

