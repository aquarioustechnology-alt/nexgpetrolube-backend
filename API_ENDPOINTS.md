# Requirements API Endpoints

This document describes the API endpoints for fetching dropdown data for the requirements form.

## Base URL
```
http://localhost:8000/api/v1/requirements
```

## Dropdown Endpoints

### 1. Get Categories (Top-level only)
**Endpoint:** `GET /dropdowns/categories`

**Description:** Fetches all top-level categories (categories without parentId)

**Response:**
```json
[
  {
    "id": "string",
    "name": "string",
    "description": "string",
    "sortOrder": "number"
  }
]
```

**Usage in Frontend:**
```typescript
const categories = await requirementsService.getCategories();
```

### 2. Get Subcategories
**Endpoint:** `GET /dropdowns/subcategories/:categoryId`

**Description:** Fetches all subcategories for a specific category

**Parameters:**
- `categoryId` (string): The ID of the parent category

**Response:**
```json
[
  {
    "id": "string",
    "name": "string",
    "description": "string",
    "sortOrder": "number"
  }
]
```

**Usage in Frontend:**
```typescript
const subcategories = await requirementsService.getSubcategories(categoryId);
```

### 3. Get Products
**Endpoint:** `GET /dropdowns/products/:categoryId`

**Description:** Fetches all products for a specific category

**Parameters:**
- `categoryId` (string): The ID of the category

**Response:**
```json
[
  {
    "id": "string",
    "name": "string",
    "description": "string",
    "specifications": "object",
    "brand": {
      "id": "string",
      "name": "string"
    }
  }
]
```

**Usage in Frontend:**
```typescript
const products = await requirementsService.getProducts(categoryId);
```

### 4. Get Brands
**Endpoint:** `GET /dropdowns/brands`

**Description:** Fetches all active brands

**Response:**
```json
[
  {
    "id": "string",
    "name": "string",
    "description": "string",
    "logo": "string"
  }
]
```

**Usage in Frontend:**
```typescript
const brands = await requirementsService.getBrands();
```

### 5. Get Product Specifications
**Endpoint:** `GET /products/:productId/specifications`

**Description:** Fetches technical specifications for a specific product

**Parameters:**
- `productId` (string): The ID of the product

**Response:**
```json
{
  "productId": "string",
  "productName": "string",
  "specifications": "object"
}
```

**Usage in Frontend:**
```typescript
const specifications = await requirementsService.getProductSpecifications(productId);
```

## Frontend Implementation

The frontend service (`Frontend/lib/requirementsService.ts`) provides methods to interact with these endpoints:

```typescript
// Initialize data loading
useEffect(() => {
  const loadInitialData = async () => {
    try {
      const [categoriesData, brandsData] = await Promise.all([
        requirementsService.getCategories(),
        requirementsService.getBrands()
      ]);
      
      setCategories(categoriesData);
      setBrands(brandsData);
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  loadInitialData();
}, []);

// Load subcategories when category changes
useEffect(() => {
  if (formData.productCategory) {
    const loadSubcategories = async () => {
      try {
        setLoadingSubcategories(true);
        const subcategoriesData = await requirementsService.getSubcategories(formData.productCategory);
        setSubcategories(subcategoriesData);
      } catch (error) {
        console.error('Error loading subcategories:', error);
      } finally {
        setLoadingSubcategories(false);
      }
    };
    loadSubcategories();
  } else {
    setSubcategories([]);
  }
}, [formData.productCategory]);

// Load products when category changes
useEffect(() => {
  if (formData.productCategory) {
    const loadProducts = async () => {
      try {
        setLoadingProducts(true);
        const productsData = await requirementsService.getProducts(formData.productCategory);
        setProducts(productsData);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoadingProducts(false);
      }
    };
    loadProducts();
  } else {
    setProducts([]);
  }
}, [formData.productCategory]);
```

## Data Flow

1. **Page Load**: Load categories and brands in parallel
2. **Category Selection**: Load subcategories and products for the selected category
3. **Product Selection**: Update form data with selected product information
4. **Form Submission**: Send complete form data including userType and productId

## Error Handling

All API calls include proper error handling:
- Loading states for each dropdown
- Error logging for debugging
- Graceful fallbacks when data fails to load
- User-friendly error messages

## Authentication

All endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <token>
```
