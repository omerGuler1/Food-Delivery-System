// Örnek menü verileri
const menuItems = {
    starters: [
        {
            id: 1,
            name: "Mozzarella Sticks",
            description: "Çıtır çıtır mozzarella peyniri, marinara sos ile servis edilir",
            price: 8.99,
            image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            category: "starters"
        },
        {
            id: 2,
            name: "Buffalo Wings",
            description: "Acılı sos ile marine edilmiş tavuk kanatları, ranch sos ile servis edilir",
            price: 12.99,
            image: "https://images.unsplash.com/photo-1527477396000-e27163b481c2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            category: "starters"
        }
    ],
    main: [
        {
            id: 3,
            name: "Margherita Pizza",
            description: "Domates sosu, mozzarella peyniri, taze fesleğen",
            price: 14.99,
            image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            category: "main"
        },
        {
            id: 4,
            name: "Spaghetti Carbonara",
            description: "Kremalı sos, parmesan peyniri, pastırma, yumurta",
            price: 16.99,
            image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            category: "main"
        }
    ],
    desserts: [
        {
            id: 5,
            name: "Tiramisu",
            description: "İtalyan usulü kahveli tatlı, kakao ile süslenmiş",
            price: 7.99,
            image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            category: "desserts"
        },
        {
            id: 6,
            name: "Cheesecake",
            description: "New York usulü cheesecake, meyve sosu ile servis edilir",
            price: 6.99,
            image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            category: "desserts"
        }
    ],
    beverages: [
        {
            id: 7,
            name: "Italian Soda",
            description: "Taze meyve aromalı soda",
            price: 3.99,
            image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            category: "beverages"
        },
        {
            id: 8,
            name: "Espresso",
            description: "İtalyan usulü espresso",
            price: 2.99,
            image: "https://images.unsplash.com/photo-1510590339098-1e4b48dcb855?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            category: "beverages"
        }
    ]
};

// Sepet işlemleri için state
let cart = [];

// URL'den restoran ID'sini al
const urlParams = new URLSearchParams(window.location.search);
const restaurantId = parseInt(urlParams.get('id'));

// Restoran bilgilerini yükle
function loadRestaurantDetails() {
    // Örnek restoran verisi (gerçek uygulamada API'den gelecek)
    const restaurant = {
        id: restaurantId,
        name: "Pizza Paradise",
        image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        rating: 4.8,
        cuisine: "Italian",
        deliveryTime: "30-45 min",
        minOrder: "$15"
    };

    // Restoran bilgilerini DOM'a ekle
    document.getElementById('restaurantName').textContent = restaurant.name;
    document.getElementById('restaurantRating').textContent = restaurant.rating;
    document.getElementById('restaurantCuisine').textContent = restaurant.cuisine;
    document.getElementById('deliveryTime').textContent = restaurant.deliveryTime;
    document.getElementById('minOrder').textContent = restaurant.minOrder;
    document.getElementById('restaurantImage').src = restaurant.image;
}

// Menü öğelerini oluştur
function createMenuItems(category = 'all') {
    const menuItemsContainer = document.getElementById('menuItems');
    menuItemsContainer.innerHTML = '';

    let items = [];
    if (category === 'all') {
        Object.values(menuItems).forEach(catItems => {
            items = items.concat(catItems);
        });
    } else {
        items = menuItems[category] || [];
    }

    items.forEach(item => {
        const menuItem = document.createElement('div');
        menuItem.className = 'menu-item';
        menuItem.innerHTML = `
            <div class="menu-item-image">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="menu-item-info">
                <h3>${item.name}</h3>
                <p>${item.description}</p>
                <div class="menu-item-price">$${item.price.toFixed(2)}</div>
                <button class="add-to-cart-btn" data-id="${item.id}">Sepete Ekle</button>
            </div>
        `;

        menuItem.querySelector('.add-to-cart-btn').addEventListener('click', () => {
            addToCart(item);
        });

        menuItemsContainer.appendChild(menuItem);
    });
}

// Sepete ürün ekle
function addToCart(item) {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...item,
            quantity: 1
        });
    }

    updateCart();
}

// Sepeti güncelle
function updateCart() {
    const cartItems = document.getElementById('cartItems');
    const itemCount = document.querySelector('.item-count');
    const subtotal = document.getElementById('subtotal');
    const deliveryFee = document.getElementById('deliveryFee');
    const total = document.getElementById('total');
    const checkoutBtn = document.querySelector('.checkout-btn');

    cartItems.innerHTML = '';
    let totalAmount = 0;

    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <div class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
            </div>
            <div class="cart-item-quantity">
                <button class="quantity-btn" data-id="${item.id}" data-action="decrease">-</button>
                <span>${item.quantity}</span>
                <button class="quantity-btn" data-id="${item.id}" data-action="increase">+</button>
            </div>
        `;

        cartItem.querySelectorAll('.quantity-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                updateQuantity(item.id, action);
            });
        });

        cartItems.appendChild(cartItem);
        totalAmount += item.price * item.quantity;
    });

    itemCount.textContent = `${cart.reduce((sum, item) => sum + item.quantity, 0)} items`;
    subtotal.textContent = `$${totalAmount.toFixed(2)}`;
    
    const deliveryFeeAmount = totalAmount > 0 ? 2.99 : 0;
    deliveryFee.textContent = `$${deliveryFeeAmount.toFixed(2)}`;
    
    const finalTotal = totalAmount + deliveryFeeAmount;
    total.textContent = `$${finalTotal.toFixed(2)}`;
    
    checkoutBtn.disabled = cart.length === 0;
}

// Ürün miktarını güncelle
function updateQuantity(itemId, action) {
    const item = cart.find(item => item.id === itemId);
    
    if (action === 'increase') {
        item.quantity += 1;
    } else if (action === 'decrease') {
        item.quantity -= 1;
        if (item.quantity === 0) {
            cart = cart.filter(item => item.id !== itemId);
        }
    }
    
    updateCart();
}

// Event Listeners
function setupEventListeners() {
    // Kategori butonları
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            createMenuItems(btn.dataset.category);
        });
    });

    // Checkout butonu
    document.querySelector('.checkout-btn').addEventListener('click', () => {
        // Sepet verilerini localStorage'a kaydet
        localStorage.setItem('cart', JSON.stringify(cart));
        // Checkout sayfasına yönlendir
        window.location.href = 'checkout.html';
    });
}

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
    loadRestaurantDetails();
    createMenuItems();
    setupEventListeners();
}); 