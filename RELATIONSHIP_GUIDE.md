# 🍽️ Restaurant, Cuisine, Meals & Categories Relationship Guide

## 📊 **Database Relationships Overview**

```
RESTAURANT (1) -----> (MANY) MEALS
    |                    |
    |                    |
CUISINE TYPES      MEAL CATEGORIES
```

---

## 🏪 **1. RESTAURANT Schema**

### **Restaurant Cuisine Types (Restaurant Level)**
```javascript
// Restaurant can have multiple cuisine types
cuisineType: [
  'Italian',        // Pizza, Pasta, etc.
  'Chinese',        // Noodles, Fried Rice, etc.
  'Indian',         // Curry, Biryani, etc.
  'Mexican',        // Tacos, Burritos, etc.
  'American',       // Burgers, Steaks, etc.
  'Japanese',       // Sushi, Ramen, etc.
  'Thai',           // Pad Thai, Tom Yum, etc.
  'Mediterranean',  // Hummus, Grilled Fish, etc.
  'French',         // Croissants, Coq au Vin, etc.
  'Lebanese',       // Shawarma, Tabbouleh, etc.
  'Fast Food',      // Quick service items
  'Desserts',       // Cakes, Ice cream, etc.
  'Healthy',        // Salads, Smoothies, etc.
  'Vegan',          // Plant-based only
  'Other'           // Mixed or unique cuisines
]
```

**Example Restaurant:**
```javascript
{
  name: "Mario's Italian Kitchen",
  cuisineType: ["Italian", "Mediterranean"],
  // This restaurant specializes in Italian & Mediterranean food
}
```

---

## 🍕 **2. MEAL Schema**

### **Meal Categories (Individual Meal Level)**
```javascript
// Each meal belongs to ONE category
category: [
  'appetizers',     // Starters, finger foods
  'main-course',    // Primary dishes
  'desserts',       // Sweet treats
  'beverages',      // Drinks
  'salads',         // Fresh greens
  'soups',          // Liquid dishes
  'pizza',          // Pizza varieties
  'pasta',          // Noodle dishes
  'burgers',        // Burger varieties
  'sandwiches',     // Sandwich types
  'seafood',        // Fish, shrimp, etc.
  'vegetarian',     // Veggie options
  'kids-menu'       // Child-friendly
]
```

**Example Meals:**
```javascript
// Meal 1
{
  name: "Margherita Pizza",
  category: "pizza",           // Meal category
  restaurantId: "Mario's Italian Kitchen"
}

// Meal 2  
{
  name: "Caesar Salad", 
  category: "salads",          // Different category
  restaurantId: "Mario's Italian Kitchen"  // Same restaurant
}
```

---

## 🔍 **3. FILTERING LOGIC**

### **A. Filter Restaurants by Cuisine**
```javascript
// Find all Italian restaurants
GET /api/restaurants?cuisine=Italian

// Backend Query:
{
  'restaurantDetails.cuisineType': { $in: ['Italian'] }
}

// Returns: All restaurants that serve Italian food
```

### **B. Filter Meals by Category**
```javascript
// Find all pizza meals across ALL restaurants
GET /api/restaurants/meals/category/pizza

// Backend Query:
{
  category: 'pizza',
  isAvailable: true
}

// Returns: All pizza meals from any restaurant
```

### **C. Search Meals with Multiple Filters**
```javascript
// Find pizza meals under $20
GET /api/restaurants/meals/search?category=pizza&maxPrice=20

// Backend Query:
{
  category: 'pizza',
  price: { $lte: 20 },
  isAvailable: true
}
```

---

## 🎯 **4. PRACTICAL FILTERING EXAMPLES**

### **Scenario 1: "I want Italian food"**
```javascript
// Step 1: Find Italian restaurants
GET /api/restaurants?cuisine=Italian

// Step 2: Get meals from a specific Italian restaurant
GET /api/restaurants/{restaurantId}  // includes menu

// OR Search all Italian meals
GET /api/restaurants/meals/search?q=italian
```

### **Scenario 2: "I want pizza from anywhere"**
```javascript
// Get all pizza meals regardless of restaurant
GET /api/restaurants/meals/category/pizza

// Result: Pizza from Italian, American, and other restaurants
```

### **Scenario 3: "I want healthy Chinese food under $15"**
```javascript
// Step 1: Find Chinese restaurants
GET /api/restaurants?cuisine=Chinese

// Step 2: Search for healthy meals with price filter
GET /api/restaurants/meals/search?q=healthy&maxPrice=15

// Then filter results by Chinese restaurants on frontend
```

---

## 🏗️ **5. RELATIONSHIP BREAKDOWN**

### **Restaurant → Cuisine Type (1:Many)**
- One restaurant can serve **multiple cuisine types**
- Example: "Mario's Kitchen" serves both "Italian" AND "Mediterranean"

### **Restaurant → Meals (1:Many)**
- One restaurant can have **many meals**
- Each meal belongs to **one restaurant**

### **Meal → Category (1:1)**
- Each meal has **exactly one category**
- Categories are independent of cuisine types

### **Cuisine vs Category Difference:**
```javascript
// CUISINE = Restaurant's cooking style/origin
cuisineType: "Italian"    // Restaurant level

// CATEGORY = Type of dish/meal
category: "pizza"         // Meal level

// An Italian restaurant can have:
// - Pizza (category: "pizza")
// - Salad (category: "salads") 
// - Pasta (category: "pasta")
// All are Italian cuisine, different categories
```

---

## 📱 **6. FRONTEND FILTERING IMPLEMENTATION**

### **Filter Flow:**
1. **User selects cuisine** → Show restaurants of that cuisine
2. **User selects restaurant** → Show that restaurant's menu (all meal categories)
3. **User filters by meal category** → Show only selected category meals
4. **User searches** → Search across names, descriptions, ingredients

### **Example Filter Component:**
```html
<!-- Restaurant Filters -->
<select name="cuisine">
  <option value="Italian">Italian Restaurants</option>
  <option value="Chinese">Chinese Restaurants</option>
</select>

<!-- Meal Filters -->
<select name="category">
  <option value="pizza">Pizza</option>
  <option value="pasta">Pasta</option>
  <option value="salads">Salads</option>
</select>

<!-- Price Filter -->
<input type="range" name="maxPrice" min="0" max="50">
```

---

## 🚀 **7. API ENDPOINTS SUMMARY**

| Purpose | Endpoint | Filter Type |
|---------|----------|-------------|
| Browse restaurants by cuisine | `GET /api/restaurants?cuisine=Italian` | Cuisine |
| Get restaurant's full menu | `GET /api/restaurants/{id}` | Restaurant |
| Find meals by category | `GET /api/restaurants/meals/category/pizza` | Category |
| Search meals | `GET /api/restaurants/meals/search?q=spicy` | Text Search |
| Combined filters | `GET /api/restaurants/meals/search?category=pizza&maxPrice=20` | Multiple |

---

## 💡 **8. KEY INSIGHTS**

1. **Cuisine ≠ Category**: Cuisine is restaurant-level, Category is meal-level
2. **Cross-cuisine categories**: Pizza can exist in Italian, American, or other cuisines
3. **Flexible filtering**: Users can filter by restaurant cuisine OR meal category
4. **Search flexibility**: Can search across restaurant cuisines and meal categories
5. **Independence**: Meal categories work independently of restaurant cuisine types

This structure allows for maximum flexibility in filtering and searching! 🎯
