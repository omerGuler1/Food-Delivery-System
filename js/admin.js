// Admin Panel JavaScript

// DOM Elements
const loginForm = document.getElementById('loginForm');
const adminDashboard = document.querySelector('.admin-dashboard');
const adminLogin = document.querySelector('.admin-login');
const sidebarLinks = document.querySelectorAll('.sidebar-nav a');
const adminSections = document.querySelectorAll('.admin-section');
const searchInput = document.querySelector('.header-search input');
const statusFilter = document.getElementById('statusFilter');
const userTypeFilter = document.getElementById('userTypeFilter');
const registrationStatusFilter = document.getElementById('registrationStatusFilter');
const complaintStatusFilter = document.getElementById('complaintStatusFilter');
const complaintTypeFilter = document.getElementById('complaintTypeFilter');

// State Management
let currentSection = 'overview';
let currentPage = 1;
const itemsPerPage = 10;

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (!isLoggedIn) {
        showLoginForm();
    } else {
        showDashboard();
        loadCurrentSection();
    }

    // Setup event listeners
    setupEventListeners();
});

// Event Listeners Setup
function setupEventListeners() {
    // Login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Sidebar navigation
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = e.currentTarget.getAttribute('data-section');
            navigateToSection(section);
        });
    });

    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }

    // Filter changes
    if (statusFilter) {
        statusFilter.addEventListener('change', handleFilterChange);
    }
    if (userTypeFilter) {
        userTypeFilter.addEventListener('change', handleFilterChange);
    }
    if (registrationStatusFilter) {
        registrationStatusFilter.addEventListener('change', handleFilterChange);
    }
    if (complaintStatusFilter) {
        complaintStatusFilter.addEventListener('change', handleFilterChange);
    }
    if (complaintTypeFilter) {
        complaintTypeFilter.addEventListener('change', handleFilterChange);
    }

    // Form submissions
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', handleFormSubmit);
    });
}

// Authentication
function handleLogin(e) {
    e.preventDefault();
    const adminId = document.getElementById('adminId').value;
    const password = document.getElementById('password').value;

    // Show loading indicator
    showLoading();

    // Simulate API call
    setTimeout(() => {
        if (adminId === 'admin' && password === 'admin123') {
            localStorage.setItem('adminLoggedIn', 'true');
            showDashboard();
            loadCurrentSection();
            showNotification('Giriş başarılı!', 'success');
        } else {
            showNotification('Geçersiz kullanıcı adı veya şifre!', 'error');
        }
        hideLoading();
    }, 1000);
}

// Navigation
function navigateToSection(section) {
    currentSection = section;
    localStorage.setItem('currentSection', section);
    
    // Update active states
    sidebarLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === section) {
            link.classList.add('active');
        }
    });

    // Show selected section
    adminSections.forEach(section => {
        section.classList.remove('active');
        if (section.id === currentSection) {
            section.classList.add('active');
        }
    });

    // Load section data
    loadCurrentSection();
}

// Section Data Loading
function loadCurrentSection() {
    showLoading();

    switch (currentSection) {
        case 'overview':
            loadOverviewData();
            break;
        case 'users':
            loadUsers();
            break;
        case 'registrations':
            loadRegistrations();
            break;
        case 'complaints':
            loadComplaints();
            break;
        case 'settings':
            loadSettings();
            break;
        case 'security':
            loadSecuritySettings();
            break;
    }

    hideLoading();
}

// Overview Section
function loadOverviewData() {
    // Simulate API call
    setTimeout(() => {
        const stats = {
            totalUsers: 1250,
            activeUsers: 980,
            totalOrders: 8500,
            totalRevenue: 125000
        };

        updateOverviewStats(stats);
        loadRecentActivity();
    }, 1000);
}

function updateOverviewStats(stats) {
    document.getElementById('totalUsers').textContent = stats.totalUsers;
    document.getElementById('activeUsers').textContent = stats.activeUsers;
    document.getElementById('totalOrders').textContent = stats.totalOrders;
    document.getElementById('totalRevenue').textContent = `₺${stats.totalRevenue.toLocaleString()}`;
}

function loadRecentActivity() {
    const activityList = document.querySelector('.activity-list');
    if (!activityList) return;

    const activities = [
        {
            type: 'user',
            title: 'Yeni kullanıcı kaydı',
            time: '5 dakika önce'
        },
        {
            type: 'order',
            title: 'Yeni sipariş alındı',
            time: '15 dakika önce'
        },
        {
            type: 'complaint',
            title: 'Yeni şikayet bildirimi',
            time: '30 dakika önce'
        }
    ];

    activityList.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon">
                <i class="fas fa-${getActivityIcon(activity.type)}"></i>
            </div>
            <div class="activity-content">
                <div class="activity-title">${activity.title}</div>
                <div class="activity-time">${activity.time}</div>
            </div>
        </div>
    `).join('');
}

// Users Section
function loadUsers() {
    // Simulate API call
    setTimeout(() => {
        const users = [
            {
                id: 1,
                name: 'Ahmet Yılmaz',
                email: 'ahmet@example.com',
                type: 'Müşteri',
                status: 'active',
                joinDate: '2024-01-15'
            },
            {
                id: 2,
                name: 'Mehmet Demir',
                email: 'mehmet@example.com',
                type: 'Restoran',
                status: 'suspended',
                joinDate: '2024-01-10'
            }
        ];

        renderUsers(users);
        setupPagination(users.length);
    }, 1000);
}

function renderUsers(users) {
    const tbody = document.querySelector('#usersTable tbody');
    if (!tbody) return;

    tbody.innerHTML = users.map(user => `
        <tr>
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.type}</td>
            <td><span class="status ${user.status}">${getStatusText(user.status)}</span></td>
            <td>${formatDate(user.joinDate)}</td>
            <td>
                <button onclick="viewUser(${user.id})" class="btn-view">Görüntüle</button>
                <button onclick="editUser(${user.id})" class="btn-edit">Düzenle</button>
                <button onclick="toggleUserStatus(${user.id})" class="btn-${user.status === 'active' ? 'suspend' : 'activate'}">
                    ${user.status === 'active' ? 'Askıya Al' : 'Aktifleştir'}
                </button>
            </td>
        </tr>
    `).join('');
}

// Registrations Section
function loadRegistrations() {
    // Simulate API call
    setTimeout(() => {
        const registrations = [
            {
                id: 1,
                name: 'Yeni Restoran',
                type: 'Restoran',
                status: 'pending',
                submitDate: '2024-01-20'
            }
        ];

        renderRegistrations(registrations);
        setupPagination(registrations.length);
    }, 1000);
}

function renderRegistrations(registrations) {
    const tbody = document.querySelector('#registrationsTable tbody');
    if (!tbody) return;

    tbody.innerHTML = registrations.map(reg => `
        <tr>
            <td>${reg.id}</td>
            <td>${reg.name}</td>
            <td>${reg.type}</td>
            <td><span class="status ${reg.status}">${getStatusText(reg.status)}</span></td>
            <td>${formatDate(reg.submitDate)}</td>
            <td>
                <button onclick="viewRegistration(${reg.id})" class="btn-view">Görüntüle</button>
                <button onclick="approveRegistration(${reg.id})" class="btn-approve">Onayla</button>
                <button onclick="rejectRegistration(${reg.id})" class="btn-reject">Reddet</button>
            </td>
        </tr>
    `).join('');
}

// Complaints Section
function loadComplaints() {
    // Simulate API call
    setTimeout(() => {
        const complaints = [
            {
                id: 1,
                user: 'Ahmet Yılmaz',
                type: 'Sipariş',
                status: 'pending',
                date: '2024-01-20'
            }
        ];

        renderComplaints(complaints);
        setupPagination(complaints.length);
    }, 1000);
}

function renderComplaints(complaints) {
    const tbody = document.querySelector('#complaintsTable tbody');
    if (!tbody) return;

    tbody.innerHTML = complaints.map(complaint => `
        <tr>
            <td>${complaint.id}</td>
            <td>${complaint.user}</td>
            <td>${complaint.type}</td>
            <td><span class="status ${complaint.status}">${getStatusText(complaint.status)}</span></td>
            <td>${formatDate(complaint.date)}</td>
            <td>
                <button onclick="viewComplaint(${complaint.id})" class="btn-view">Görüntüle</button>
                <button onclick="respondToComplaint(${complaint.id})" class="btn-respond">Yanıtla</button>
                <button onclick="resolveComplaint(${complaint.id})" class="btn-resolve">Çöz</button>
            </td>
        </tr>
    `).join('');
}

// Settings Section
function loadSettings() {
    // Load saved settings
    const settings = {
        deliveryFee: localStorage.getItem('deliveryFee') || '15',
        minOrderAmount: localStorage.getItem('minOrderAmount') || '50',
        maxPromoDiscount: localStorage.getItem('maxPromoDiscount') || '20'
    };

    // Update form values
    document.getElementById('deliveryFee').value = settings.deliveryFee;
    document.getElementById('minOrderAmount').value = settings.minOrderAmount;
    document.getElementById('maxPromoDiscount').value = settings.maxPromoDiscount;
}

// Security Section
function loadSecuritySettings() {
    // Load saved security settings
    const settings = {
        passwordPolicy: localStorage.getItem('passwordPolicy') || 'medium',
        twoFactorAuth: localStorage.getItem('twoFactorAuth') === 'true',
        sessionTimeout: localStorage.getItem('sessionTimeout') || '30'
    };

    // Update form values
    document.getElementById('passwordPolicy').value = settings.passwordPolicy;
    document.getElementById('twoFactorAuth').checked = settings.twoFactorAuth === 'true';
    document.getElementById('sessionTimeout').value = settings.sessionTimeout;
}

// Form Handling
function handleFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);

    showLoading();

    // Simulate API call
    setTimeout(() => {
        // Save settings
        if (form.id === 'settingsForm') {
            localStorage.setItem('deliveryFee', formData.get('deliveryFee'));
            localStorage.setItem('minOrderAmount', formData.get('minOrderAmount'));
            localStorage.setItem('maxPromoDiscount', formData.get('maxPromoDiscount'));
        } else if (form.id === 'securityForm') {
            localStorage.setItem('passwordPolicy', formData.get('passwordPolicy'));
            localStorage.setItem('twoFactorAuth', formData.get('twoFactorAuth'));
            localStorage.setItem('sessionTimeout', formData.get('sessionTimeout'));
        }

        showNotification('Ayarlar başarıyla kaydedildi!', 'success');
        hideLoading();
    }, 1000);
}

// Search and Filter
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('tbody tr');

    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

function handleFilterChange() {
    const status = statusFilter ? statusFilter.value : '';
    const userType = userTypeFilter ? userTypeFilter.value : '';
    const registrationStatus = registrationStatusFilter ? registrationStatusFilter.value : '';
    const complaintStatus = complaintStatusFilter ? complaintStatusFilter.value : '';
    const complaintType = complaintTypeFilter ? complaintTypeFilter.value : '';

    // Filter rows based on selected filters
    const rows = document.querySelectorAll('tbody tr');
    rows.forEach(row => {
        const rowStatus = row.querySelector('.status')?.className.split(' ')[1] || '';
        const rowType = row.querySelector('td:nth-child(3)')?.textContent || '';
        
        const statusMatch = !status || rowStatus === status;
        const typeMatch = !userType || rowType === userType;
        const registrationMatch = !registrationStatus || rowStatus === registrationStatus;
        const complaintStatusMatch = !complaintStatus || rowStatus === complaintStatus;
        const complaintTypeMatch = !complaintType || rowType === complaintType;

        row.style.display = statusMatch && typeMatch && registrationMatch && 
                          complaintStatusMatch && complaintTypeMatch ? '' : 'none';
    });
}

// Pagination
function setupPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const pagination = document.querySelector('.pagination');
    if (!pagination) return;

    let html = '';
    for (let i = 1; i <= totalPages; i++) {
        html += `<span class="${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</span>`;
    }

    pagination.innerHTML = html;
}

function changePage(page) {
    currentPage = page;
    loadCurrentSection();
}

// Utility Functions
function showLoading() {
    const loading = document.createElement('div');
    loading.className = 'loading-indicator';
    loading.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    document.body.appendChild(loading);
}

function hideLoading() {
    const loading = document.querySelector('.loading-indicator');
    if (loading) {
        loading.remove();
    }
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

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function getStatusText(status) {
    const statusMap = {
        active: 'Aktif',
        suspended: 'Askıya Alındı',
        banned: 'Yasaklandı',
        pending: 'Beklemede',
        in_progress: 'İşlemde',
        resolved: 'Çözüldü',
        closed: 'Kapandı'
    };
    return statusMap[status] || status;
}

function getActivityIcon(type) {
    const iconMap = {
        user: 'user',
        order: 'shopping-cart',
        complaint: 'exclamation-circle'
    };
    return iconMap[type] || 'info-circle';
}

// View Functions
function showLoginForm() {
    adminLogin.style.display = 'flex';
    adminDashboard.style.display = 'none';
}

function showDashboard() {
    adminLogin.style.display = 'none';
    adminDashboard.style.display = 'flex';
}

// User Actions
function viewUser(userId) {
    // Implement user view functionality
    console.log('Viewing user:', userId);
}

function editUser(userId) {
    // Implement user edit functionality
    console.log('Editing user:', userId);
}

function toggleUserStatus(userId) {
    // Implement user status toggle functionality
    console.log('Toggling user status:', userId);
}

// Registration Actions
function viewRegistration(registrationId) {
    // Implement registration view functionality
    console.log('Viewing registration:', registrationId);
}

function approveRegistration(registrationId) {
    // Implement registration approval functionality
    console.log('Approving registration:', registrationId);
}

function rejectRegistration(registrationId) {
    // Implement registration rejection functionality
    console.log('Rejecting registration:', registrationId);
}

// Complaint Actions
function viewComplaint(complaintId) {
    // Implement complaint view functionality
    console.log('Viewing complaint:', complaintId);
}

function respondToComplaint(complaintId) {
    // Implement complaint response functionality
    console.log('Responding to complaint:', complaintId);
}

function resolveComplaint(complaintId) {
    // Implement complaint resolution functionality
    console.log('Resolving complaint:', complaintId);
} 