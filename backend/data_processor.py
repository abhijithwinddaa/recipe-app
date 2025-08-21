import json
import sqlite3
import math

def handle_nan_value(value):
    """Convert NaN values to None for database storage"""
    if value is None:
        return None
    if isinstance(value, str) and value.lower() == 'nan':
        return None
    if isinstance(value, float) and math.isnan(value):
        return None
    return value

def process_recipes():
    """Parse JSON and store in database"""
    # Initialize database
    conn = sqlite3.connect('recipes.db')
    cursor = conn.cursor()
    
    # Create table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS recipes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cuisine VARCHAR(255),
            title VARCHAR(255),
            rating FLOAT,
            prep_time INTEGER,
            cook_time INTEGER,
            total_time INTEGER,
            description TEXT,
            nutrients TEXT,
            serves VARCHAR(255)
        )
    ''')
    
    # Clear existing data
    cursor.execute('DELETE FROM recipes')
    
    # Load and process JSON
    with open('../US_recipes.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    for key, recipe in data.items():
        # Extract and clean data
        rating = handle_nan_value(recipe.get('rating'))
        prep_time = handle_nan_value(recipe.get('prep_time'))
        cook_time = handle_nan_value(recipe.get('cook_time'))
        total_time = handle_nan_value(recipe.get('total_time'))
        
        # Insert into database
        cursor.execute('''
            INSERT INTO recipes (cuisine, title, rating, prep_time, cook_time, total_time, description, nutrients, serves)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            recipe.get('cuisine'),
            recipe.get('title'),
            rating,
            prep_time,
            cook_time,
            total_time,
            recipe.get('description'),
            json.dumps(recipe.get('nutrients', {})),
            recipe.get('serves')
        ))
    
    conn.commit()
    
    # Verify data
    cursor.execute('SELECT COUNT(*) FROM recipes')
    count = cursor.fetchone()[0]
    print(f"Processed {count} recipes successfully")
    
    cursor.execute('SELECT COUNT(*) FROM recipes WHERE rating IS NULL')
    null_ratings = cursor.fetchone()[0]
    print(f"Found {null_ratings} recipes with NULL ratings (NaN values handled)")
    
    conn.close()

if __name__ == '__main__':
    process_recipes()