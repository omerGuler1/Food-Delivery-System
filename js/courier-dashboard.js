// State Management
let currentSection = 'overview';
let isAvailable = false;
let currentOrder = null;

// Simulated Courier Accounts
const courierAccounts = [
    {
        id: 'courier1',
        password: 'courier123',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        vehicle: 'Motorcycle',
        rating: 4.8,
        totalDeliveries: 156,
        totalEarnings: 2340
    },
    {
        id: 'courier2',
        password: 'courier123',
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+1987654321',
        vehicle: 'Bicycle',
        rating: 4.9,
        totalDeliveries: 89,
        totalEarnings: 1450
    },
    {
        id: 'courier3',
        password: 'courier123',
        name: 'Mike Johnson',
        email: 'mike@example.com',
        phone: '+1122334455',
        vehicle: 'Car',
        rating: 4.7,
        totalDeliveries: 234,
        totalEarnings: 3450
    }
];

// DOM Elements
const loginForm = document.getElementById('loginForm');
const courierDashboard = document.querySelector('.courier-dashboard');
const courierLogin = document.querySelector('.courier-login');
const sidebarLinks = document.querySelectorAll('.sidebar-nav a');
const sections = document.querySelectorAll('.courier-section');
const statusToggle = document.getElementById('statusToggle');
const currentOrderSection = document.getElementById('currentOrder');
const noOrderSection = document.getElementById('noOrder');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Login form submission
    loginForm.addEventListener('submit', handleLogin);
    
    // Sidebar navigation
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = e.currentTarget.getAttribute('data-section');
            navigateToSection(section);
        });
    });
    
    // Status toggle
    statusToggle.addEventListener('change', handleStatusChange);
});

// Authentication
async function handleLogin(e) {
    e.preventDefault();
    const courierId = document.getElementById('courierId').value;
    const password = document.getElementById('password').value;
    
    try {
        // Simulate API call
        const courier = await simulateLogin(courierId, password);
        
        // Store courier data
        localStorage.setItem('currentCourier', JSON.stringify(courier));
        
        // Show success notification
        showNotification('Login successful!', 'success');
        
        // Show dashboard
        courierLogin.style.display = 'none';
        courierDashboard.style.display = 'block';
        
        // Load initial data
        loadOverviewData();
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

async function simulateLogin(courierId, password) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const courier = courierAccounts.find(account => 
                account.id === courierId && account.password === password
            );
            
            if (courier) {
                resolve(courier);
            } else {
                reject(new Error('Invalid credentials'));
            }
        }, 1000);
    });
}

// Navigation
function navigateToSection(section) {
    // Update active section
    currentSection = section;
    
    // Update sidebar links
    sidebarLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === section) {
            link.classList.add('active');
        }
    });
    
    // Show selected section
    sections.forEach(s => {
        s.classList.remove('active');
        if (s.id === section) {
            s.classList.add('active');
        }
    });
    
    // Load section data
    switch (section) {
        case 'overview':
            loadOverviewData();
            break;
        case 'orders':
            loadOrdersData();
            break;
        case 'earnings':
            loadEarningsData();
            break;
        case 'restaurants':
            loadRestaurantsData();
            break;
        case 'profile':
            loadProfileData();
            break;
    }
}

// Status Management
function handleStatusChange(e) {
    isAvailable = e.target.checked;
    const statusText = document.querySelector('.status-text');
    statusText.textContent = isAvailable ? 'Available' : 'Unavailable';
    
    // Update status in backend (simulated)
    updateCourierStatus(isAvailable);
}

async function updateCourierStatus(status) {
    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        showNotification(`Status updated to ${status ? 'Available' : 'Unavailable'}`, 'success');
    } catch (error) {
        showNotification('Failed to update status', 'error');
    }
}

// Data Loading Functions
async function loadOverviewData() {
    try {
        // Simulate API call
        const data = await simulateOverviewData();
        
        // Update stats
        updateStats(data.stats);
        
        // Update current order
        updateCurrentOrder(data.currentOrder);
    } catch (error) {
        showNotification('Failed to load overview data', 'error');
    }
}

async function loadOrdersData() {
    try {
        // Simulate API call
        const orders = await simulateOrdersData();
        
        // Update orders list
        updateOrdersList(orders);
    } catch (error) {
        showNotification('Failed to load orders', 'error');
    }
}

async function loadEarningsData() {
    try {
        // Simulate API call
        const earnings = await simulateEarningsData();
        
        // Update earnings display
        updateEarningsDisplay(earnings);
    } catch (error) {
        showNotification('Failed to load earnings data', 'error');
    }
}

async function loadRestaurantsData() {
    try {
        // Simulate API call
        const restaurants = await simulateRestaurantsData();
        
        // Update restaurants list
        updateRestaurantsList(restaurants);
    } catch (error) {
        showNotification('Failed to load restaurants', 'error');
    }
}

async function loadProfileData() {
    try {
        // Simulate API call
        const profile = await simulateProfileData();
        
        // Update profile display
        updateProfileDisplay(profile);
    } catch (error) {
        showNotification('Failed to load profile data', 'error');
    }
}

// Simulated API Data
async function simulateOverviewData() {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                stats: {
                    totalDeliveries: 156,
                    totalEarnings: 2340,
                    rating: 4.8
                },
                currentOrder: null
            });
        }, 1000);
    });
}

async function simulateOrdersData() {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve([
                {
                    id: 'ORD001',
                    restaurant: 'Restaurant A',
                    customer: 'John Doe',
                    status: 'pending',
                    amount: 25.99,
                    date: '2024-03-20 14:30'
                },
                // Add more orders...
            ]);
        }, 1000);
    });
}

async function simulateEarningsData() {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                today: 120.50,
                week: 850.75,
                month: 2340.00,
                total: 15600.00
            });
        }, 1000);
    });
}

async function simulateRestaurantsData() {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve([
                {
                    id: 'REST001',
                    name: 'Restaurant A',
                    address: '123 Main St',
                    registered: true
                },
                // Add more restaurants...
            ]);
        }, 1000);
    });
}

async function simulateProfileData() {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                name: 'John Doe',
                email: 'john@example.com',
                phone: '+1234567890',
                vehicle: 'Motorcycle',
                rating: 4.8,
                totalDeliveries: 156,
                totalEarnings: 2340
            });
        }, 1000);
    });
}

// UI Update Functions
function updateStats(stats) {
    document.getElementById('totalDeliveries').textContent = stats.totalDeliveries;
    document.getElementById('totalEarnings').textContent = `$${stats.totalEarnings.toFixed(2)}`;
    document.getElementById('rating').textContent = stats.rating;
}

function updateCurrentOrder(order) {
    if (order) {
        currentOrderSection.style.display = 'block';
        noOrderSection.style.display = 'none';
        // Update order details...
    } else {
        currentOrderSection.style.display = 'none';
        noOrderSection.style.display = 'block';
    }
}

function updateOrdersList(orders) {
    const ordersList = document.querySelector('.orders-list');
    ordersList.innerHTML = orders.map(order => `
        <div class="order-card">
            <div class="order-header">
                <h3>Order #${order.id}</h3>
                <span class="order-status ${order.status}">${order.status}</span>
            </div>
            <div class="order-details">
                <p><strong>Restaurant:</strong> ${order.restaurant}</p>
                <p><strong>Customer:</strong> ${order.customer}</p>
                <p><strong>Amount:</strong> $${order.amount.toFixed(2)}</p>
                <p><strong>Date:</strong> ${order.date}</p>
            </div>
            <div class="order-actions">
                ${order.status === 'pending' ? `
                    <button class="btn-accept" onclick="acceptOrder('${order.id}')">Accept</button>
                    <button class="btn-reject" onclick="rejectOrder('${order.id}')">Reject</button>
                ` : ''}
            </div>
        </div>
    `).join('');
}

function updateEarningsDisplay(earnings) {
    document.getElementById('todayEarnings').textContent = `$${earnings.today.toFixed(2)}`;
    document.getElementById('weekEarnings').textContent = `$${earnings.week.toFixed(2)}`;
    document.getElementById('monthEarnings').textContent = `$${earnings.month.toFixed(2)}`;
    document.getElementById('totalEarnings').textContent = `$${earnings.total.toFixed(2)}`;
}

function updateRestaurantsList(restaurants) {
    const restaurantsGrid = document.querySelector('.restaurants-grid');
    restaurantsGrid.innerHTML = restaurants.map(restaurant => `
        <div class="restaurant-card">
            <h3>${restaurant.name}</h3>
            <p>${restaurant.address}</p>
            ${restaurant.registered ? `
                <span class="registered">Registered</span>
            ` : `
                <button class="btn-register" onclick="registerWithRestaurant('${restaurant.id}')">
                    Register
                </button>
            `}
        </div>
    `).join('');
}

function updateProfileDisplay(profile) {
    const currentCourier = JSON.parse(localStorage.getItem('currentCourier'));
    if (currentCourier) {
        document.getElementById('profileName').textContent = currentCourier.name;
        document.getElementById('profileEmail').textContent = currentCourier.email;
        document.getElementById('profilePhone').textContent = currentCourier.phone;
        document.getElementById('profileVehicle').textContent = currentCourier.vehicle;
        document.getElementById('profileRating').textContent = currentCourier.rating;
        document.getElementById('profileDeliveries').textContent = currentCourier.totalDeliveries;
        document.getElementById('profileEarnings').textContent = `$${currentCourier.totalEarnings.toFixed(2)}`;
    }
}

// Order Actions
async function acceptOrder(orderId) {
    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        showNotification('Order accepted successfully', 'success');
        loadOverviewData();
        loadOrdersData();
    } catch (error) {
        showNotification('Failed to accept order', 'error');
    }
}

async function rejectOrder(orderId) {
    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        showNotification('Order rejected', 'success');
        loadOverviewData();
        loadOrdersData();
    } catch (error) {
        showNotification('Failed to reject order', 'error');
    }
}

async function registerWithRestaurant(restaurantId) {
    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        showNotification('Successfully registered with restaurant', 'success');
        loadRestaurantsData();
    } catch (error) {
        showNotification('Failed to register with restaurant', 'error');
    }
}

// Utility Functions
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
} 