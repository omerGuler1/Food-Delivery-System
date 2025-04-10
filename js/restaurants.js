// Örnek restoran verileri
const restaurants = [
    {
        id: 1,
        name: "Pizza Paradise",
        image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        rating: 4.8,
        cuisine: "Italian",
        deliveryTime: "30-45 min",
        minOrder: "$15",
        categories: ["pizza", "italian"],
        priceRange: "medium",
        isOpen: true
    },
    {
        id: 2,
        name: "Burger Bliss",
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        rating: 4.6,
        cuisine: "American",
        deliveryTime: "25-35 min",
        minOrder: "$12",
        categories: ["burger", "american"],
        priceRange: "low",
        isOpen: true
    },
    {
        id: 3,
        name: "Sushi Master",
        image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        rating: 4.9,
        cuisine: "Japanese",
        deliveryTime: "35-50 min",
        minOrder: "$20",
        categories: ["sushi", "japanese"],
        priceRange: "high",
        isOpen: true
    },
    {
        id: 4,
        name: "Taco Fiesta",
        image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        rating: 4.7,
        cuisine: "Mexican",
        deliveryTime: "20-30 min",
        minOrder: "$10",
        categories: ["mexican"],
        priceRange: "low",
        isOpen: true
    }
];

// Restoran kartlarını oluştur
function createRestaurantCards(filteredRestaurants = restaurants) {
    const restaurantsGrid = document.querySelector('.restaurants-grid');
    restaurantsGrid.innerHTML = '';
    
    filteredRestaurants.forEach(restaurant => {
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
        
        restaurantsGrid.appendChild(card);
    });
}

// Filtreleme fonksiyonu
function filterRestaurants() {
    const selectedCategories = Array.from(document.querySelectorAll('input[name="category"]:checked')).map(cb => cb.value);
    const selectedPrices = Array.from(document.querySelectorAll('input[name="price"]:checked')).map(cb => cb.value);
    const selectedRatings = Array.from(document.querySelectorAll('input[name="rating"]:checked')).map(cb => parseInt(cb.value));
    const selectedDelivery = Array.from(document.querySelectorAll('input[name="delivery"]:checked')).map(cb => cb.value);
    const searchTerm = document.querySelector('.search-input input').value.toLowerCase();
    
    let filtered = restaurants.filter(restaurant => {
        // Kategori filtresi
        if (selectedCategories.length > 0 && !selectedCategories.some(cat => restaurant.categories.includes(cat))) {
            return false;
        }
        
        // Fiyat filtresi
        if (selectedPrices.length > 0 && !selectedPrices.includes(restaurant.priceRange)) {
            return false;
        }
        
        // Puan filtresi
        if (selectedRatings.length > 0 && !selectedRatings.some(rating => restaurant.rating >= rating)) {
            return false;
        }
        
        // Teslimat süresi filtresi
        if (selectedDelivery.length > 0) {
            const deliveryTime = parseInt(restaurant.deliveryTime);
            if (selectedDelivery.includes('fast') && deliveryTime > 30) return false;
            if (selectedDelivery.includes('medium') && (deliveryTime <= 30 || deliveryTime > 45)) return false;
            if (selectedDelivery.includes('slow') && deliveryTime <= 45) return false;
        }
        
        // Arama filtresi
        if (searchTerm && !restaurant.name.toLowerCase().includes(searchTerm) && !restaurant.cuisine.toLowerCase().includes(searchTerm)) {
            return false;
        }
        
        return true;
    });
    
    // Sıralama
    const sortBy = document.querySelector('.sort-options select').value;
    switch (sortBy) {
        case 'rating':
            filtered.sort((a, b) => b.rating - a.rating);
            break;
        case 'delivery':
            filtered.sort((a, b) => parseInt(a.deliveryTime) - parseInt(b.deliveryTime));
            break;
        case 'price-low':
            filtered.sort((a, b) => parseInt(a.minOrder.replace('$', '')) - parseInt(b.minOrder.replace('$', '')));
            break;
        case 'price-high':
            filtered.sort((a, b) => parseInt(b.minOrder.replace('$', '')) - parseInt(a.minOrder.replace('$', '')));
            break;
        default: // popular
            filtered.sort((a, b) => b.rating - a.rating);
    }
    
    createRestaurantCards(filtered);
}

// Event Listeners
function setupEventListeners() {
    // Filtre değişikliklerini dinle
    document.querySelectorAll('.filter-option input').forEach(input => {
        input.addEventListener('change', filterRestaurants);
    });
    
    // Arama değişikliklerini dinle
    const searchInput = document.querySelector('.search-input input');
    let searchTimeout;
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(filterRestaurants, 300);
    });
    
    // Sıralama değişikliklerini dinle
    document.querySelector('.sort-options select').addEventListener('change', filterRestaurants);
}

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
    createRestaurantCards();
    setupEventListeners();
}); 