// Örnek restoran verileri
const featuredRestaurants = [
    {
        id: 1,
        name: "Pizza Paradise",
        image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        rating: 4.8,
        cuisine: "Italian",
        deliveryTime: "30-45 min",
        minOrder: "$15"
    },
    {
        id: 2,
        name: "Burger Bliss",
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        rating: 4.6,
        cuisine: "American",
        deliveryTime: "25-35 min",
        minOrder: "$12"
    },
    {
        id: 3,
        name: "Sushi Master",
        image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        rating: 4.9,
        cuisine: "Japanese",
        deliveryTime: "35-50 min",
        minOrder: "$20"
    },
    {
        id: 4,
        name: "Taco Fiesta",
        image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        rating: 4.7,
        cuisine: "Mexican",
        deliveryTime: "20-30 min",
        minOrder: "$10"
    }
];

// Restoran kartlarını oluştur
function createRestaurantCards() {
    const restaurantGrid = document.querySelector('.restaurant-grid');
    
    featuredRestaurants.forEach(restaurant => {
        const card = document.createElement('div');
        card.className = 'restaurant-card';
        card.innerHTML = `
            <img src="${restaurant.image}" alt="${restaurant.name}">
            <div class="restaurant-info">
                <h3>${restaurant.name}</h3>
                <div class="rating">
                    <i class="fas fa-star"></i>
                    <span>${restaurant.rating}</span>
                </div>
                <p class="cuisine">${restaurant.cuisine}</p>
                <div class="details">
                    <span><i class="fas fa-clock"></i> ${restaurant.deliveryTime}</span>
                    <span><i class="fas fa-dollar-sign"></i> Min. ${restaurant.minOrder}</span>
                </div>
            </div>
        `;
        
        card.addEventListener('click', () => {
            window.location.href = `restaurant-detail.html?id=${restaurant.id}`;
        });
        
        restaurantGrid.appendChild(card);
    });
}

// Arama fonksiyonu
function setupSearch() {
    const searchInput = document.querySelector('.search-box input');
    const searchButton = document.querySelector('.search-box button');
    
    searchButton.addEventListener('click', () => {
        const searchTerm = searchInput.value.trim();
        if (searchTerm) {
            window.location.href = `restaurants.html?search=${encodeURIComponent(searchTerm)}`;
        }
    });
    
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const searchTerm = searchInput.value.trim();
            if (searchTerm) {
                window.location.href = `restaurants.html?search=${encodeURIComponent(searchTerm)}`;
            }
        }
    });
}

// Kategori kartları için hover efekti
function setupCategoryCards() {
    const categoryCards = document.querySelectorAll('.category-card');
    
    categoryCards.forEach(card => {
        card.addEventListener('click', () => {
            const category = card.querySelector('h3').textContent;
            window.location.href = `restaurants.html?category=${encodeURIComponent(category)}`;
        });
    });
}

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
    createRestaurantCards();
    setupSearch();
    setupCategoryCards();
}); 