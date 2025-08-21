class RecipeApp {
    constructor() {
        this.apiUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : 'https://recipe-app-xyz.onrender.com/api';
        this.currentPage = 1;
        this.pageSize = 15;
        this.totalPages = 1;
        this.isSearchMode = false;
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadRecipes();
        this.loadCuisines();
    }

    bindEvents() {
        // Search and filter events
        document.getElementById('searchBtn').addEventListener('click', () => this.searchRecipes());
        document.getElementById('clearBtn').addEventListener('click', () => this.clearFilters());
        
        // Pagination events
        document.getElementById('prevBtn').addEventListener('click', () => this.previousPage());
        document.getElementById('nextBtn').addEventListener('click', () => this.nextPage());
        document.getElementById('pageSize').addEventListener('change', (e) => {
            this.pageSize = parseInt(e.target.value);
            this.currentPage = 1;
            this.isSearchMode ? this.searchRecipes() : this.loadRecipes();
        });

        // Drawer events
        document.getElementById('closeDrawer').addEventListener('click', () => this.closeDrawer());
        document.getElementById('drawerOverlay').addEventListener('click', (e) => {
            if (e.target === document.getElementById('drawerOverlay')) {
                this.closeDrawer();
            }
        });
        document.getElementById('expandTime').addEventListener('click', () => this.toggleTimeDetails());

        // Enter key for search
        document.querySelectorAll('.search-filters input').forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.searchRecipes();
                }
            });
        });
    }

    async loadRecipes() {
        try {
            const response = await fetch(`${this.apiUrl}/recipes?page=${this.currentPage}&limit=${this.pageSize}`);
            const data = await response.json();
            
            if (data.data && data.data.length > 0) {
                this.displayRecipes(data.data);
                this.updatePagination(data.page, Math.ceil(data.total / data.limit));
                this.hideNoResults();
                this.hideNoData();
            } else {
                this.showNoData();
            }
        } catch (error) {
            console.error('Error loading recipes:', error);
            this.showNoData();
        }
    }

    async loadCuisines() {
        try {
            const response = await fetch(`${this.apiUrl}/recipes?page=1&limit=1000`);
            const data = await response.json();
            
            const cuisines = [...new Set(data.data.map(recipe => recipe.cuisine))].sort();
            const select = document.getElementById('cuisineFilter');
            
            cuisines.forEach(cuisine => {
                const option = document.createElement('option');
                option.value = cuisine;
                option.textContent = cuisine;
                select.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading cuisines:', error);
        }
    }

    async searchRecipes() {
        const params = new URLSearchParams();
        
        const title = document.getElementById('titleFilter').value.trim();
        const cuisine = document.getElementById('cuisineFilter').value;
        const rating = document.getElementById('ratingFilter').value.trim();
        const time = document.getElementById('timeFilter').value.trim();
        const calories = document.getElementById('caloriesFilter').value.trim();

        if (title) params.append('title', title);
        if (cuisine) params.append('cuisine', cuisine);
        if (rating) params.append('rating', rating);
        if (time) params.append('total_time', time);
        if (calories) params.append('calories', calories);

        try {
            const response = await fetch(`${this.apiUrl}/recipes/search?${params}`);
            const data = await response.json();
            
            this.isSearchMode = true;
            this.currentPage = 1;
            
            if (data.data && data.data.length > 0) {
                this.displayRecipes(data.data);
                this.updatePagination(1, 1); // Search doesn't have pagination
                this.hideNoResults();
                this.hideNoData();
            } else {
                this.showNoResults();
            }
        } catch (error) {
            console.error('Error searching recipes:', error);
            this.showNoData();
        }
    }

    clearFilters() {
        document.getElementById('titleFilter').value = '';
        document.getElementById('cuisineFilter').value = '';
        document.getElementById('ratingFilter').value = '';
        document.getElementById('timeFilter').value = '';
        document.getElementById('caloriesFilter').value = '';
        
        this.isSearchMode = false;
        this.currentPage = 1;
        this.loadRecipes();
    }

    displayRecipes(recipes) {
        const tbody = document.getElementById('recipesBody');
        tbody.innerHTML = '';

        recipes.forEach(recipe => {
            const row = document.createElement('tr');
            row.addEventListener('click', () => this.showRecipeDetails(recipe));
            
            row.innerHTML = `
                <td class="title-cell" title="${recipe.title}">${recipe.title}</td>
                <td>${recipe.cuisine || 'N/A'}</td>
                <td class="rating">
                    ${this.renderRating(recipe.rating)}
                </td>
                <td>${recipe.total_time ? `${recipe.total_time} min` : 'N/A'}</td>
                <td>${recipe.serves || 'N/A'}</td>
            `;
            
            tbody.appendChild(row);
        });

        document.querySelector('.table-container').style.display = 'block';
    }

    renderRating(rating) {
        if (!rating) return 'N/A';
        
        const stars = Math.round(rating);
        const fullStars = '★'.repeat(stars);
        const emptyStars = '☆'.repeat(5 - stars);
        
        return `
            <span class="stars">${fullStars}${emptyStars}</span>
            <span>${rating}</span>
        `;
    }

    showRecipeDetails(recipe) {
        document.getElementById('drawerTitle').textContent = `${recipe.title} - ${recipe.cuisine}`;
        document.getElementById('recipeDescription').textContent = recipe.description || 'No description available';
        document.getElementById('recipeTotalTime').textContent = recipe.total_time ? `${recipe.total_time} minutes` : 'N/A';
        document.getElementById('recipePrepTime').textContent = recipe.prep_time ? `${recipe.prep_time} minutes` : 'N/A';
        document.getElementById('recipeCookTime').textContent = recipe.cook_time ? `${recipe.cook_time} minutes` : 'N/A';

        // Populate nutrition table
        const nutritionBody = document.getElementById('nutritionBody');
        nutritionBody.innerHTML = '';

        const nutritionOrder = [
            'calories', 'carbohydrateContent', 'cholesterolContent', 'fiberContent',
            'proteinContent', 'saturatedFatContent', 'sodiumContent', 'sugarContent', 'fatContent'
        ];

        const nutritionLabels = {
            calories: 'Calories',
            carbohydrateContent: 'Carbohydrates',
            cholesterolContent: 'Cholesterol',
            fiberContent: 'Fiber',
            proteinContent: 'Protein',
            saturatedFatContent: 'Saturated Fat',
            sodiumContent: 'Sodium',
            sugarContent: 'Sugar',
            fatContent: 'Fat'
        };

        nutritionOrder.forEach(key => {
            if (recipe.nutrients && recipe.nutrients[key]) {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${nutritionLabels[key]}</td>
                    <td>${recipe.nutrients[key]}</td>
                `;
                nutritionBody.appendChild(row);
            }
        });

        this.openDrawer();
    }

    openDrawer() {
        document.getElementById('drawerOverlay').style.display = 'block';
        setTimeout(() => {
            document.getElementById('recipeDrawer').classList.add('open');
        }, 10);
    }

    closeDrawer() {
        document.getElementById('recipeDrawer').classList.remove('open');
        setTimeout(() => {
            document.getElementById('drawerOverlay').style.display = 'none';
        }, 300);
    }

    toggleTimeDetails() {
        const details = document.getElementById('timeDetails');
        const button = document.getElementById('expandTime');
        
        if (details.style.display === 'none') {
            details.style.display = 'block';
            button.classList.add('expanded');
        } else {
            details.style.display = 'none';
            button.classList.remove('expanded');
        }
    }

    updatePagination(currentPage, totalPages) {
        this.currentPage = currentPage;
        this.totalPages = totalPages;

        document.getElementById('pageInfo').textContent = `Page ${currentPage} of ${totalPages}`;
        document.getElementById('prevBtn').disabled = currentPage <= 1;
        document.getElementById('nextBtn').disabled = currentPage >= totalPages;
    }

    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.isSearchMode ? this.searchRecipes() : this.loadRecipes();
        }
    }

    nextPage() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.isSearchMode ? this.searchRecipes() : this.loadRecipes();
        }
    }

    showNoResults() {
        document.querySelector('.table-container').style.display = 'none';
        document.getElementById('noResults').style.display = 'block';
        document.getElementById('noData').style.display = 'none';
    }

    showNoData() {
        document.querySelector('.table-container').style.display = 'none';
        document.getElementById('noResults').style.display = 'none';
        document.getElementById('noData').style.display = 'block';
    }

    hideNoResults() {
        document.getElementById('noResults').style.display = 'none';
    }

    hideNoData() {
        document.getElementById('noData').style.display = 'none';
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new RecipeApp();
});