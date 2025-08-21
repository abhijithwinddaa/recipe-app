from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import sqlite3
import math
import re

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return jsonify({
        'message': 'Recipe API Server',
        'endpoints': {
            'recipes': '/api/recipes',
            'search': '/api/recipes/search'
        }
    })

def init_db():
    conn = sqlite3.connect('recipes.db')
    cursor = conn.cursor()
    
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
    
    conn.commit()
    conn.close()

def ensure_data_exists():
    """Check if data exists, if not run data processor"""
    conn = sqlite3.connect('recipes.db')
    cursor = conn.cursor()
    cursor.execute('SELECT COUNT(*) FROM recipes')
    count = cursor.fetchone()[0]
    conn.close()
    
    if count == 0:
        print("No data found. Run data_processor.py first.")
        return False
    return True

@app.route('/api/recipes', methods=['GET'])
def get_recipes():
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 10))
    offset = (page - 1) * limit
    
    conn = sqlite3.connect('recipes.db')
    cursor = conn.cursor()
    
    # Get total count
    cursor.execute('SELECT COUNT(*) FROM recipes')
    total = cursor.fetchone()[0]
    
    # Get paginated results sorted by rating
    cursor.execute('''
        SELECT id, title, cuisine, rating, prep_time, cook_time, total_time, description, nutrients, serves
        FROM recipes
        ORDER BY rating DESC NULLS LAST
        LIMIT ? OFFSET ?
    ''', (limit, offset))
    
    recipes = []
    for row in cursor.fetchall():
        recipes.append({
            'id': row[0],
            'title': row[1],
            'cuisine': row[2],
            'rating': row[3],
            'prep_time': row[4],
            'cook_time': row[5],
            'total_time': row[6],
            'description': row[7],
            'nutrients': json.loads(row[8]) if row[8] else {},
            'serves': row[9]
        })
    
    conn.close()
    
    return jsonify({
        'page': page,
        'limit': limit,
        'total': total,
        'data': recipes
    })

@app.route('/api/recipes/search', methods=['GET'])
def search_recipes():
    conn = sqlite3.connect('recipes.db')
    cursor = conn.cursor()
    
    query = 'SELECT id, title, cuisine, rating, prep_time, cook_time, total_time, description, nutrients, serves FROM recipes WHERE 1=1'
    params = []
    
    # Title search
    title = request.args.get('title')
    if title:
        query += ' AND title LIKE ?'
        params.append(f'%{title}%')
    
    # Cuisine filter
    cuisine = request.args.get('cuisine')
    if cuisine:
        query += ' AND cuisine = ?'
        params.append(cuisine)
    
    # Rating filter
    rating = request.args.get('rating')
    if rating:
        if rating.startswith('>='):
            query += ' AND rating >= ?'
            params.append(float(rating[2:]))
        elif rating.startswith('<='):
            query += ' AND rating <= ?'
            params.append(float(rating[2:]))
        elif rating.startswith('>'):
            query += ' AND rating > ?'
            params.append(float(rating[1:]))
        elif rating.startswith('<'):
            query += ' AND rating < ?'
            params.append(float(rating[1:]))
        else:
            query += ' AND rating = ?'
            params.append(float(rating))
    
    # Total time filter
    total_time = request.args.get('total_time')
    if total_time:
        if total_time.startswith('>='):
            query += ' AND total_time >= ?'
            params.append(int(total_time[2:]))
        elif total_time.startswith('<='):
            query += ' AND total_time <= ?'
            params.append(int(total_time[2:]))
        elif total_time.startswith('>'):
            query += ' AND total_time > ?'
            params.append(int(total_time[1:]))
        elif total_time.startswith('<'):
            query += ' AND total_time < ?'
            params.append(int(total_time[1:]))
        else:
            query += ' AND total_time = ?'
            params.append(int(total_time))
    
    # Calories filter (from nutrients JSON)
    calories = request.args.get('calories')
    if calories:
        if calories.startswith('>='):
            query += ' AND CAST(REPLACE(REPLACE(json_extract(nutrients, "$.calories"), " kcal", ""), " ", "") AS INTEGER) >= ?'
            params.append(int(calories[2:]))
        elif calories.startswith('<='):
            query += ' AND CAST(REPLACE(REPLACE(json_extract(nutrients, "$.calories"), " kcal", ""), " ", "") AS INTEGER) <= ?'
            params.append(int(calories[2:]))
        elif calories.startswith('>'):
            query += ' AND CAST(REPLACE(REPLACE(json_extract(nutrients, "$.calories"), " kcal", ""), " ", "") AS INTEGER) > ?'
            params.append(int(calories[1:]))
        elif calories.startswith('<'):
            query += ' AND CAST(REPLACE(REPLACE(json_extract(nutrients, "$.calories"), " kcal", ""), " ", "") AS INTEGER) < ?'
            params.append(int(calories[1:]))
        else:
            query += ' AND CAST(REPLACE(REPLACE(json_extract(nutrients, "$.calories"), " kcal", ""), " ", "") AS INTEGER) = ?'
            params.append(int(calories))
    
    query += ' ORDER BY rating DESC NULLS LAST'
    
    cursor.execute(query, params)
    
    recipes = []
    for row in cursor.fetchall():
        recipes.append({
            'id': row[0],
            'title': row[1],
            'cuisine': row[2],
            'rating': row[3],
            'prep_time': row[4],
            'cook_time': row[5],
            'total_time': row[6],
            'description': row[7],
            'nutrients': json.loads(row[8]) if row[8] else {},
            'serves': row[9]
        })
    
    conn.close()
    
    return jsonify({'data': recipes})

if __name__ == '__main__':
    import os
    init_db()
    if ensure_data_exists():
        print("Starting Recipe API server...")
        port = int(os.environ.get('PORT', 5000))
        app.run(host='0.0.0.0', port=port, debug=False)
    else:
        print("Please run 'python data_processor.py' first to load recipe data.")