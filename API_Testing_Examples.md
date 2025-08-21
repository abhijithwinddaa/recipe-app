# API Testing Examples

This document provides examples of how to test the Recipe API endpoints using various tools.

## Base URL
```
http://localhost:5000/api
```

## Endpoint 1: Get All Recipes (Paginated)

### Basic Request
```bash
curl "http://localhost:5000/api/recipes"
```

### With Pagination
```bash
curl "http://localhost:5000/api/recipes?page=2&limit=5"
```

### Expected Response
```json
{
  "page": 1,
  "limit": 10,
  "total": 112,
  "data": [
    {
      "id": 1,
      "title": "Sweet Potato Pie",
      "cuisine": "Southern Recipes",
      "rating": 4.8,
      "prep_time": 15,
      "cook_time": 100,
      "total_time": 115,
      "description": "Shared from a Southern recipe, this homemade sweet potato pie...",
      "nutrients": {
        "calories": "389 kcal",
        "carbohydrateContent": "48 g",
        "cholesterolContent": "78 mg",
        "fiberContent": "3 g",
        "proteinContent": "5 g",
        "saturatedFatContent": "10 g",
        "sodiumContent": "254 mg",
        "sugarContent": "28 g",
        "fatContent": "21 g"
      },
      "serves": "8 servings"
    }
  ]
}
```

## Endpoint 2: Search Recipes

### Search by Title
```bash
curl "http://localhost:5000/api/recipes/search?title=pie"
```

### Search by Cuisine
```bash
curl "http://localhost:5000/api/recipes/search?cuisine=Southern%20Recipes"
```

### Search with Rating Filter
```bash
curl "http://localhost:5000/api/recipes/search?rating=>=4.5"
```

### Search with Calories Filter
```bash
curl "http://localhost:5000/api/recipes/search?calories=<=400"
```

### Search with Total Time Filter
```bash
curl "http://localhost:5000/api/recipes/search?total_time=<=60"
```

### Complex Search (Multiple Filters)
```bash
curl "http://localhost:5000/api/recipes/search?title=pie&rating=>=4.5&calories=<=400"
```

### Expected Search Response
```json
{
  "data": [
    {
      "id": 1,
      "title": "Sweet Potato Pie",
      "cuisine": "Southern Recipes",
      "rating": 4.8,
      "prep_time": 15,
      "cook_time": 100,
      "total_time": 115,
      "description": "Shared from a Southern recipe...",
      "nutrients": {
        "calories": "389 kcal",
        "carbohydrateContent": "48 g",
        "cholesterolContent": "78 mg",
        "fiberContent": "3 g",
        "proteinContent": "5 g",
        "saturatedFatContent": "10 g",
        "sodiumContent": "254 mg",
        "sugarContent": "28 g",
        "fatContent": "21 g"
      },
      "serves": "8 servings"
    }
  ]
}
```

## Filter Operators

### Rating Filters
- `rating=4.5` - Exact match
- `rating=>=4.5` - Greater than or equal to 4.5
- `rating=<=4.0` - Less than or equal to 4.0
- `rating=>4.0` - Greater than 4.0
- `rating=<4.0` - Less than 4.0

### Time Filters
- `total_time=60` - Exact match (60 minutes)
- `total_time=<=30` - 30 minutes or less
- `total_time=>=120` - 2 hours or more

### Calories Filters
- `calories=<=400` - 400 calories or less
- `calories=>=500` - 500 calories or more

## Testing with Postman

### Collection Setup
1. Create a new collection called "Recipe API"
2. Set base URL variable: `{{baseUrl}}` = `http://localhost:5000/api`

### Request Examples

#### Get Recipes
- **Method**: GET
- **URL**: `{{baseUrl}}/recipes`
- **Params**: 
  - `page`: 1
  - `limit`: 10

#### Search Recipes
- **Method**: GET
- **URL**: `{{baseUrl}}/recipes/search`
- **Params**:
  - `title`: pie
  - `rating`: >=4.5
  - `calories`: <=400

## Testing with JavaScript (Browser Console)

```javascript
// Get all recipes
fetch('http://localhost:5000/api/recipes?page=1&limit=5')
  .then(response => response.json())
  .then(data => console.log(data));

// Search recipes
fetch('http://localhost:5000/api/recipes/search?title=pie&rating=>=4.5')
  .then(response => response.json())
  .then(data => console.log(data));
```

## Error Handling

### Invalid Parameters
```bash
curl "http://localhost:5000/api/recipes/search?rating=invalid"
```

### Empty Results
```bash
curl "http://localhost:5000/api/recipes/search?title=nonexistent"
```

Response:
```json
{
  "data": []
}
```

## Performance Testing

### Load Testing with curl
```bash
# Test multiple requests
for i in {1..10}; do
  curl "http://localhost:5000/api/recipes?page=$i&limit=10" &
done
wait
```

### Benchmark with Apache Bench
```bash
ab -n 100 -c 10 "http://localhost:5000/api/recipes"
```

## Database Verification

After running the API, you can verify the data was loaded correctly:

```bash
# Check if database exists
ls backend/recipes.db

# Count total recipes (should be 112 from the JSON file)
sqlite3 backend/recipes.db "SELECT COUNT(*) FROM recipes;"

# Check for NaN handling
sqlite3 backend/recipes.db "SELECT COUNT(*) FROM recipes WHERE rating IS NULL;"
```