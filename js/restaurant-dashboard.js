// State Management
let currentSection = 'overview';
let isOpen = true;
let currentRestaurant = null;

// DOM Elements
const loginForm = document.getElementById('loginForm');
const restaurantDashboard = document.getElementById('restaurantDashboard');
const restaurantLogin = document.getElementById('restaurantLogin');
const sidebarLinks = document.querySelectorAll('.sidebar-nav a');
const statusToggle = document.getElementById('statusToggle');
const menuModal = document.getElementById('menuModal');
const menuForm = document.getElementById('menuForm');
const closeMenuModal = document.getElementById('closeMenuModal');

// Simulated Restaurant Accounts
const restaurantAccounts = [
    {
        id: 'restaurant1',
        password: 'restaurant123',
        name: 'Pizza Palace',
        email: 'pizza@palace.com',
        phone: '+1 234 567 8901',
        address: '123 Main St, City',
        rating: 4.5,
        totalOrders: 150,
        totalRevenue: 25000,
        isOpen: true,
        menu: [
            {
                id: 1,
                name: 'Margherita Pizza',
                category: 'Pizza',
                price: 12.99,
                description: 'Classic tomato sauce with mozzarella and basil',
                image: 'https://via.placeholder.com/300x200',
                available: true
            },
            {
                id: 2,
                name: 'Pepperoni Pizza',
                category: 'Pizza',
                price: 14.99,
                description: 'Spicy pepperoni with tomato sauce and cheese',
                image: 'https://via.placeholder.com/300x200',
                available: true
            }
        ],
        orders: [
            {
                id: 'ORD001',
                customerName: 'John Doe',
                items: [
                    { name: 'Margherita Pizza', quantity: 1, price: 12.99 }
                ],
                total: 12.99,
                status: 'pending',
                date: '2024-03-20T10:30:00'
            }
        ],
        reviews: [
            {
                id: 1,
                customerName: 'Jane Smith',
                rating: 5,
                comment: 'Great pizza and fast delivery!',
                date: '2024-03-19'
            }
        ]
    },
    {
        id: 'restaurant2',
        password: 'restaurant123',
        name: 'Burger House',
        email: 'burger@house.com',
        phone: '+1 234 567 8902',
        address: '456 Oak St, City',
        rating: 4.2,
        totalOrders: 120,
        totalRevenue: 18000,
        isOpen: true,
        menu: [
            {
                id: 1,
                name: 'Classic Burger',
                category: 'Burgers',
                price: 9.99,
                description: 'Beef patty with lettuce, tomato, and special sauce',
                image: 'https://via.placeholder.com/300x200',
                available: true
            }
        ],
        orders: [],
        reviews: []
    },
    {
        id: 'restaurant3',
        password: 'restaurant123',
        name: 'Sushi Bar',
        email: 'sushi@bar.com',
        phone: '+1 234 567 8903',
        address: '789 Pine St, City',
        rating: 4.8,
        totalOrders: 200,
        totalRevenue: 35000,
        isOpen: true,
        menu: [
            {
                id: 1,
                name: 'California Roll',
                category: 'Sushi',
                price: 8.99,
                description: 'Crab meat, avocado, and cucumber wrapped in rice',
                image: 'https://via.placeholder.com/300x200',
                available: true
            }
        ],
        orders: [],
        reviews: []
    }
];

// Event Listeners
loginForm.addEventListener('submit', handleLogin);
sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const section = e.currentTarget.getAttribute('data-section');
        navigateToSection(section);
    });
});
statusToggle.addEventListener('change', handleStatusToggle);
closeMenuModal.addEventListener('click', () => {
    menuModal.style.display = 'none';
    menuForm.reset();
});

// Login Handler
async function handleLogin(e) {
    e.preventDefault();
    const restaurantId = document.getElementById('restaurantId').value;
    const password = document.getElementById('password').value;

    try {
        const restaurant = await simulateLogin(restaurantId, password);
        currentRestaurant = restaurant;
        localStorage.setItem('currentRestaurant', JSON.stringify(restaurant));
        showNotification('Login successful!', 'success');
        restaurantLogin.style.display = 'none';
        restaurantDashboard.style.display = 'block';
        loadOverviewData();
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

// Simulate Login API Call
function simulateLogin(restaurantId, password) {
    return new Promise((resolve, reject) => {
        const restaurant = restaurantAccounts.find(
            acc => acc.id === restaurantId && acc.password === password
        );
        if (restaurant) {
            resolve(restaurant);
        } else {
            reject(new Error('Invalid credentials'));
        }
    });
}

// Navigation Handler
function navigateToSection(section) {
    currentSection = section;
    sidebarLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === section) {
            link.classList.add('active');
        }
    });

    document.querySelectorAll('.restaurant-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(`${section}-section`).classList.add('active');

    switch (section) {
        case 'overview':
            loadOverviewData();
            break;
        case 'menu':
            loadMenuData();
            break;
        case 'orders':
            loadOrdersData();
            break;
        case 'couriers':
            loadCouriersData();
            break;
        case 'reviews':
            loadReviewsData();
            break;
        case 'profile':
            loadProfileData();
            break;
    }
}

// Status Toggle Handler
function handleStatusToggle(e) {
    currentRestaurant.isOpen = e.target.checked;
    localStorage.setItem('currentRestaurant', JSON.stringify(currentRestaurant));
    showNotification(
        `Restaurant is now ${currentRestaurant.isOpen ? 'open' : 'closed'}`,
        'success'
    );
}

// Data Loading Functions
async function loadOverviewData() {
    try {
        const stats = await simulateGetOverviewStats();
        updateOverviewDisplay(stats);
    } catch (error) {
        showNotification('Error loading overview data', 'error');
    }
}

async function loadMenuData() {
    try {
        const menu = await simulateGetMenu();
        updateMenuDisplay(menu);
    } catch (error) {
        showNotification('Error loading menu data', 'error');
    }
}

async function loadOrdersData() {
    try {
        const orders = await simulateGetOrders();
        updateOrdersDisplay(orders);
    } catch (error) {
        showNotification('Error loading orders data', 'error');
    }
}

async function loadCouriersData() {
    try {
        const couriers = await simulateGetCouriers();
        updateCouriersDisplay(couriers);
    } catch (error) {
        showNotification('Error loading couriers data', 'error');
    }
}

async function loadReviewsData() {
    try {
        const reviews = await simulateGetReviews();
        updateReviewsDisplay(reviews);
    } catch (error) {
        showNotification('Error loading reviews data', 'error');
    }
}

async function loadProfileData() {
    try {
        const profile = await simulateGetProfile();
        updateProfileDisplay(profile);
    } catch (error) {
        showNotification('Error loading profile data', 'error');
    }
}

// Simulated API Calls
function simulateGetOverviewStats() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                totalOrders: currentRestaurant.totalOrders,
                totalRevenue: currentRestaurant.totalRevenue,
                averageRating: currentRestaurant.rating,
                activeOrders: currentRestaurant.orders.filter(order => 
                    ['pending', 'preparing', 'ready', 'delivering'].includes(order.status)
                ).length
            });
        }, 500);
    });
}

function simulateGetMenu() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(currentRestaurant.menu);
        }, 500);
    });
}

function simulateGetOrders() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(currentRestaurant.orders);
        }, 500);
    });
}

function simulateGetCouriers() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                {
                    id: 1,
                    name: 'John Doe',
                    vehicle: 'Motorcycle',
                    rating: 4.8,
                    isAvailable: true
                },
                {
                    id: 2,
                    name: 'Jane Smith',
                    vehicle: 'Bicycle',
                    rating: 4.5,
                    isAvailable: true
                }
            ]);
        }, 500);
    });
}

function simulateGetReviews() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(currentRestaurant.reviews);
        }, 500);
    });
}

function simulateGetProfile() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                name: currentRestaurant.name,
                email: currentRestaurant.email,
                phone: currentRestaurant.phone,
                address: currentRestaurant.address,
                rating: currentRestaurant.rating,
                totalOrders: currentRestaurant.totalOrders,
                totalRevenue: currentRestaurant.totalRevenue
            });
        }, 500);
    });
}

// UI Update Functions
function updateOverviewDisplay(stats) {
    document.getElementById('totalOrders').textContent = stats.totalOrders;
    document.getElementById('totalRevenue').textContent = `$${stats.totalRevenue.toFixed(2)}`;
    document.getElementById('averageRating').textContent = stats.averageRating.toFixed(1);
    document.getElementById('activeOrders').textContent = stats.activeOrders;
}

function updateMenuDisplay(menu) {
    const menuContainer = document.getElementById('menuItems');
    menuContainer.innerHTML = '';

    menu.forEach(item => {
        const menuItem = document.createElement('div');
        menuItem.className = 'menu-item';
        menuItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="menu-item-image">
            <div class="menu-item-content">
                <div class="menu-item-header">
                    <h3>${item.name}</h3>
                    <span>$${item.price.toFixed(2)}</span>
                </div>
                <p>${item.description}</p>
                <div class="menu-item-actions">
                    <button class="btn-primary" onclick="editMenuItem(${item.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn-danger" onclick="deleteMenuItem(${item.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
        menuContainer.appendChild(menuItem);
    });
}

function updateOrdersDisplay(orders) {
    const ordersContainer = document.getElementById('ordersList');
    ordersContainer.innerHTML = '';

    orders.forEach(order => {
        const orderCard = document.createElement('div');
        orderCard.className = 'order-card';
        orderCard.innerHTML = `
            <div class="order-header">
                <h3>Order #${order.id}</h3>
                <span class="order-status ${order.status}">${order.status}</span>
            </div>
            <p>Customer: ${order.customerName}</p>
            <p>Total: $${order.total.toFixed(2)}</p>
            <p>Date: ${new Date(order.date).toLocaleString()}</p>
            <div class="order-actions">
                ${getOrderActions(order.status)}
            </div>
        `;
        ordersContainer.appendChild(orderCard);
    });
}

function updateCouriersDisplay(couriers) {
    const couriersContainer = document.getElementById('couriersList');
    couriersContainer.innerHTML = '';

    couriers.forEach(courier => {
        const courierCard = document.createElement('div');
        courierCard.className = 'courier-card';
        courierCard.innerHTML = `
            <div class="courier-avatar">
                <i class="fas fa-user"></i>
            </div>
            <h3>${courier.name}</h3>
            <p>Vehicle: ${courier.vehicle}</p>
            <p>Rating: ${courier.rating.toFixed(1)}</p>
            <span class="status ${courier.isAvailable ? 'available' : 'unavailable'}">
                ${courier.isAvailable ? 'Available' : 'Unavailable'}
            </span>
        `;
        couriersContainer.appendChild(courierCard);
    });
}

function updateReviewsDisplay(reviews) {
    const reviewsContainer = document.getElementById('reviewsList');
    reviewsContainer.innerHTML = '';

    reviews.forEach(review => {
        const reviewCard = document.createElement('div');
        reviewCard.className = 'review-card';
        reviewCard.innerHTML = `
            <div class="review-header">
                <h3>${review.customerName}</h3>
                <div class="review-rating">
                    ${getRatingStars(review.rating)}
                </div>
            </div>
            <p>${review.comment}</p>
            <p>Date: ${new Date(review.date).toLocaleDateString()}</p>
        `;
        reviewsContainer.appendChild(reviewCard);
    });
}

function updateProfileDisplay(profile) {
    document.getElementById('restaurantName').textContent = profile.name;
    document.getElementById('restaurantEmail').value = profile.email;
    document.getElementById('restaurantPhone').value = profile.phone;
    document.getElementById('restaurantAddress').value = profile.address;
    document.getElementById('profileRating').textContent = profile.rating.toFixed(1);
    document.getElementById('profileTotalOrders').textContent = profile.totalOrders;
    document.getElementById('profileTotalRevenue').textContent = `$${profile.totalRevenue.toFixed(2)}`;
}

// Utility Functions
function getOrderActions(status) {
    switch (status) {
        case 'pending':
            return `
                <button class="btn-primary" onclick="updateOrderStatus('${status}', 'preparing')">
                    Start Preparing
                </button>
            `;
        case 'preparing':
            return `
                <button class="btn-primary" onclick="updateOrderStatus('${status}', 'ready')">
                    Mark as Ready
                </button>
            `;
        case 'ready':
            return `
                <button class="btn-primary" onclick="assignCourier()">
                    Assign Courier
                </button>
            `;
        case 'delivering':
            return `
                <button class="btn-primary" onclick="updateOrderStatus('${status}', 'delivered')">
                    Mark as Delivered
                </button>
            `;
        default:
            return '';
    }
}

function getRatingStars(rating) {
    return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Order Actions
function updateOrderStatus(currentStatus, newStatus) {
    // Simulate API call
    showNotification(`Order status updated to ${newStatus}`, 'success');
}

function assignCourier() {
    // Simulate API call
    showNotification('Courier assigned successfully', 'success');
}

// Menu Actions
function editMenuItem(itemId) {
    const item = currentRestaurant.menu.find(item => item.id === itemId);
    if (item) {
        document.getElementById('menuItemName').value = item.name;
        document.getElementById('menuItemCategory').value = item.category;
        document.getElementById('menuItemPrice').value = item.price;
        document.getElementById('menuItemDescription').value = item.description;
        document.getElementById('menuItemAvailable').checked = item.available;
        menuModal.style.display = 'block';
    }
}

function deleteMenuItem(itemId) {
    if (confirm('Are you sure you want to delete this item?')) {
        // Simulate API call
        showNotification('Menu item deleted successfully', 'success');
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const savedRestaurant = localStorage.getItem('currentRestaurant');
    if (savedRestaurant) {
        currentRestaurant = JSON.parse(savedRestaurant);
        restaurantLogin.style.display = 'none';
        restaurantDashboard.style.display = 'block';
        statusToggle.checked = currentRestaurant.isOpen;
        loadOverviewData();
    }
}); 