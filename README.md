# Recipe Data Collection and API Development

A complete full-stack application for managing and displaying recipe data with search, filtering, and pagination capabilities.

## Features

### Backend API
- **Data Parsing**: Reads and parses JSON recipe data
- **Database Storage**: SQLite database with proper schema
- **NaN Handling**: Converts NaN values to NULL in database
- **RESTful API**: Two main endpoints for recipes
- **Search & Filter**: Advanced filtering by multiple criteria
- **Pagination**: Efficient data pagination

### Frontend UI
- **Responsive Table**: Clean recipe display with truncated titles
- **Star Ratings**: Visual star rating system
- **Detail Drawer**: Side panel with complete recipe information
- **Advanced Search**: Field-level filtering
- **Pagination**: Customizable results per page (15-50)
- **Fallback Screens**: No results and no data states

## API Endpoints

### 1. Get All Recipes (Paginated)
```
GET /api/recipes?page=1&limit=10
```

**Response:**
```json
{
  "page": 1,
  "limit": 10,
  "total": 50,
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
        ...
      },
      "serves": "8 servings"
    }
  ]
}
```

### 2. Search Recipes
```
GET /api/recipes/search?calories=<=400&title=pie&rating=>=4.5
```

**Supported Filters:**
- `title`: Partial text search
- `cuisine`: Exact cuisine match
- `rating`: Comparison operators (>=, <=, >, <, =)
- `total_time`: Comparison operators
- `calories`: Comparison operators

## Database Schema

```sql
CREATE TABLE recipes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cuisine VARCHAR(255),
    title VARCHAR(255),
    rating FLOAT,
    prep_time INTEGER,
    cook_time INTEGER,
    total_time INTEGER,
    description TEXT,
    nutrients TEXT, -- JSON stored as TEXT
    serves VARCHAR(255)
);
```

## Quick Start

### Option 1: Automated Setup (Windows)
```powershell
.\setup_and_run.bat
```

### Option 2: Manual Setup

**Step 1: Setup Backend**
```powershell
cd backend
pip install Flask Flask-CORS
python data_processor.py
python app.py
```

**Step 2: Setup Frontend (New Terminal)**
```powershell
cd frontend
python -m http.server 8000 --bind 127.0.0.1
```

**Step 3: Access Application**
- Frontend: http://localhost:8000
- API: http://localhost:5000
- API Docs: http://localhost:5000/

### Database Setup

Run `python data_processor.py` to parse `US_recipes.json` and populate SQLite database with 8,451 recipes.

## Project Structure

```
JAVA-INTERN-ASSESSMENT/
├── backend/
│   ├── app.py              # Flask API server
│   ├── data_processor.py   # JSON parser & DB loader
│   ├── requirements.txt    # Python dependencies
│   ├── schema.sql         # Database schema
│   ├── test_db.py         # Database verification
│   └── recipes.db         # SQLite database (auto-generated)
├── frontend/
│   ├── index.html         # Main HTML file
│   ├── styles.css         # CSS styles
│   └── script.js          # JavaScript functionality
├── US_recipes.json        # Recipe data source (8,451 recipes)
├── setup_and_run.bat      # Automated setup script
├── API_Testing_Examples.md # API testing guide
└── README.md             # This file
```

## Key Features Implementation

### NaN Value Handling
```python
# Backend handles NaN values during data parsing
if rating == 'NaN' or rating is None or (isinstance(rating, str) and rating.lower() == 'nan'):
    rating = None
```

### Advanced Search
```javascript
// Frontend supports comparison operators
const params = new URLSearchParams();
if (rating) params.append('rating', rating); // e.g., ">=4.5"
```

### Responsive Design
- Mobile-friendly table layout
- Collapsible search filters
- Full-width drawer on mobile devices

### Star Rating Display
```javascript
renderRating(rating) {
    const stars = Math.round(rating);
    const fullStars = '★'.repeat(stars);
    const emptyStars = '☆'.repeat(5 - stars);
    return `<span class="stars">${fullStars}${emptyStars}</span>`;
}
```

## Testing the API

### Example Requests

1. **Get first 10 recipes:**
   ```
   GET http://localhost:5000/api/recipes?page=1&limit=10
   ```

2. **Search for pies with high rating:**
   ```
   GET http://localhost:5000/api/recipes/search?title=pie&rating=>=4.5
   ```

3. **Filter by cuisine and calories:**
   ```
   GET http://localhost:5000/api/recipes/search?cuisine=Southern%20Recipes&calories=<=400
   ```

## Technologies Used

### Backend
- **Flask**: Python web framework
- **SQLite**: Lightweight database
- **Flask-CORS**: Cross-origin resource sharing

### Frontend
- **Vanilla JavaScript**: No frameworks for simplicity
- **CSS3**: Modern styling with flexbox/grid
- **Font Awesome**: Icons for UI elements

## Future Enhancements

- Add recipe ingredients and instructions to detail view
- Implement user favorites functionality
- Add recipe image support
- Include advanced nutrition filtering
- Add recipe creation/editing capabilities


##Live-Link: https://github.com/abhijithwinddaa/recipe-app.git
