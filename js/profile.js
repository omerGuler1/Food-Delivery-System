// Get user data from localStorage
const userData = JSON.parse(localStorage.getItem('userData') || '{}');
const addresses = JSON.parse(localStorage.getItem('addresses') || '[]');
const orders = JSON.parse(localStorage.getItem('orders') || '[]');
const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');

// DOM Elements
const profileNav = document.querySelector('.profile-nav');
const profileSections = document.querySelectorAll('.profile-section');
const personalInfoForm = document.getElementById('personalInfoForm');
const settingsForm = document.getElementById('settingsForm');
const addressForm = document.getElementById('addressForm');
const addAddressBtn = document.getElementById('addAddressBtn');
const addressModal = document.getElementById('addressModal');
const closeModalBtn = document.querySelector('.close-modal');

// Mock Data (Replace with actual API calls)
const mockUserData = {
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 234 567 8900',
    birthDate: '1990-01-01',
    addresses: [
        {
            id: 1,
            title: 'Home',
            streetAddress: '123 Main St',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            country: 'USA',
            isDefault: true
        }
    ],
    orders: [
        {
            id: 1,
            date: '2024-03-15',
            restaurant: 'Pizza Place',
            items: ['Margherita Pizza', 'Coke'],
            total: 25.99,
            status: 'Delivered'
        }
    ],
    favorites: [
        {
            id: 1,
            name: 'Pizza Place',
            image: 'https://via.placeholder.com/150',
            rating: 4.5
        }
    ],
    settings: {
        emailNotifications: true,
        smsNotifications: false
    }
};

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
    // Kullanıcı bilgilerini göster
    displayUserInfo();
    
    // Adresleri göster
    displayAddresses();
    
    // Siparişleri göster
    displayOrders();
    
    // Favorileri göster
    displayFavorites();
    
    // Event listener'ları ekle
    setupEventListeners();
});

// Kullanıcı bilgilerini göster
function displayUserInfo() {
    // Kullanıcı adı ve e-posta
    document.getElementById('profileName').textContent = userData.name || 'User Name';
    document.getElementById('profileEmail').textContent = userData.email || 'user@email.com';
    
    // Form alanlarını doldur
    document.getElementById('name').value = userData.name || '';
    document.getElementById('email').value = userData.email || '';
    document.getElementById('phone').value = userData.phone || '';
}

// Adresleri göster
function displayAddresses() {
    const addressesList = document.querySelector('.addresses-list');
    if (!addressesList) return;
    
    // Mevcut adresleri temizle
    const existingCards = addressesList.querySelectorAll('.address-card');
    existingCards.forEach(card => card.remove());
    
    // Adresleri listele
    addresses.forEach((address, index) => {
        const addressCard = createAddressCard(address, index);
        addressesList.insertBefore(addressCard, addressesList.querySelector('.add-address-btn'));
    });
}

// Adres kartı oluştur
function createAddressCard(address, index) {
    const card = document.createElement('div');
    card.className = 'address-card';
    card.innerHTML = `
        <div class="address-header">
            <h4>${address.title}</h4>
            <div class="address-actions">
                <button class="edit-btn" data-index="${index}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-btn" data-index="${index}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
        <p class="address-text">${address.address}</p>
        <p class="address-city">${address.city} / ${address.district}</p>
    `;
    return card;
}

// Siparişleri göster
function displayOrders() {
    const ordersList = document.querySelector('.orders-list');
    if (!ordersList) return;
    
    // Siparişleri tarihe göre sırala
    const sortedOrders = [...orders].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Siparişleri listele
    sortedOrders.forEach(order => {
        const orderCard = createOrderCard(order);
        ordersList.appendChild(orderCard);
    });
}

// Sipariş kartı oluştur
function createOrderCard(order) {
    const card = document.createElement('div');
    card.className = 'order-card';
    card.innerHTML = `
        <div class="order-header">
            <div class="order-info">
                <span class="order-number">#${order.orderNumber}</span>
                <span class="order-date">${formatDate(order.date)}</span>
            </div>
            <span class="order-status ${order.status.toLowerCase()}">${getStatusText(order.status)}</span>
        </div>
        <div class="order-restaurant">
            <img src="${order.restaurant.image}" alt="${order.restaurant.name}">
            <div class="restaurant-info">
                <h4>${order.restaurant.name}</h4>
                <p>${order.items.length} items</p>
            </div>
        </div>
        <div class="order-total">
            <span>Total:</span>
            <span>$${order.total.toFixed(2)}</span>
        </div>
    `;
    return card;
}

// Favorileri göster
function displayFavorites() {
    const favoritesList = document.querySelector('.favorites-list');
    if (!favoritesList) return;
    
    // Favorileri listele
    favorites.forEach(restaurant => {
        const favoriteCard = createFavoriteCard(restaurant);
        favoritesList.appendChild(favoriteCard);
    });
}

// Favori kartı oluştur
function createFavoriteCard(restaurant) {
    const card = document.createElement('div');
    card.className = 'favorite-card';
    card.innerHTML = `
        <img src="${restaurant.image}" alt="${restaurant.name}">
        <div class="favorite-info">
            <h4>${restaurant.name}</h4>
            <div class="favorite-meta">
                <span class="rating">
                    <i class="fas fa-star"></i>
                    ${restaurant.rating}
                </span>
                <span class="delivery-time">
                    <i class="fas fa-clock"></i>
                    ${restaurant.deliveryTime} dk
                </span>
            </div>
        </div>
    `;
    return card;
}

// Event listener'ları ekle
function setupEventListeners() {
    // Profil formu gönderimi
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileUpdate);
    }
    
    // Profil resmi değiştirme
    const changeAvatarBtn = document.querySelector('.change-avatar-btn');
    if (changeAvatarBtn) {
        changeAvatarBtn.addEventListener('click', handleAvatarChange);
    }
    
    // Yeni adres ekleme
    const addAddressBtn = document.querySelector('.add-address-btn');
    if (addAddressBtn) {
        addAddressBtn.addEventListener('click', handleAddAddress);
    }
    
    // Adres düzenleme ve silme
    document.addEventListener('click', (e) => {
        if (e.target.closest('.edit-btn')) {
            const index = e.target.closest('.edit-btn').dataset.index;
            handleEditAddress(index);
        }
        if (e.target.closest('.delete-btn')) {
            const index = e.target.closest('.delete-btn').dataset.index;
            handleDeleteAddress(index);
        }
    });
    
    // Hesap silme
    const deleteAccountBtn = document.querySelector('.delete-account-btn');
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', handleDeleteAccount);
    }
}

// Profil güncelleme
function handleProfileUpdate(e) {
    e.preventDefault();
    
    // Form verilerini al
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        currentPassword: document.getElementById('currentPassword').value,
        newPassword: document.getElementById('newPassword').value,
        confirmPassword: document.getElementById('confirmPassword').value
    };
    
    // Validasyon
    if (!validateProfileForm(formData)) {
        return;
    }
    
    // Kullanıcı verilerini güncelle
    userData.name = formData.name;
    userData.email = formData.email;
    userData.phone = formData.phone;
    
    // Şifre değişikliği varsa
    if (formData.newPassword) {
        // Şifre kontrolü
        if (formData.currentPassword !== userData.password) {
            showError('currentPasswordError', 'Mevcut şifre yanlış');
            return;
        }
        userData.password = formData.newPassword;
    }
    
    // LocalStorage'ı güncelle
    localStorage.setItem('userData', JSON.stringify(userData));
    
    // Başarı mesajı göster
    showSuccess('Profil bilgileriniz güncellendi');
    
    // Formu temizle
    e.target.reset();
}

// Profil formu validasyonu
function validateProfileForm(formData) {
    let isValid = true;
    
    // İsim kontrolü
    if (!formData.name.trim()) {
        showError('nameError', 'Name field is required');
        isValid = false;
    }
    
    // E-posta kontrolü
    if (!formData.email.trim()) {
        showError('emailError', 'Email field is required');
        isValid = false;
    } else if (!isValidEmail(formData.email)) {
        showError('emailError', 'Please enter a valid email address');
        isValid = false;
    }
    
    // Telefon kontrolü
    if (!formData.phone.trim()) {
        showError('phoneError', 'Phone field is required');
        isValid = false;
    }
    
    // Şifre değişikliği varsa kontrol et
    if (formData.newPassword) {
        if (!formData.currentPassword) {
            showError('currentPasswordError', 'Please enter your current password');
            isValid = false;
        }
        
        if (formData.newPassword.length < 6) {
            showError('newPasswordError', 'New password must be at least 6 characters');
            isValid = false;
        }
        
        if (formData.newPassword !== formData.confirmPassword) {
            showError('confirmPasswordError', 'Passwords do not match');
            isValid = false;
        }
    }
    
    return isValid;
}

// Profil resmi değiştirme
function handleAvatarChange() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const avatarUrl = e.target.result;
                userData.avatar = avatarUrl;
                localStorage.setItem('userData', JSON.stringify(userData));
                
                // Profil resimlerini güncelle
                document.getElementById('profileAvatar').src = avatarUrl;
                document.getElementById('userAvatar').src = avatarUrl;
                
                showSuccess('Profil resminiz güncellendi');
            };
            reader.readAsDataURL(file);
        }
    };
    
    input.click();
}

// Yeni adres ekleme
function handleAddAddress() {
    // Adres ekleme modalını göster
    showAddressModal();
}

// Adres düzenleme
function handleEditAddress(index) {
    // Adres düzenleme modalını göster
    showAddressModal(addresses[index], index);
}

// Adres silme
function handleDeleteAddress(index) {
    if (confirm('Are you sure you want to delete this address?')) {
        addresses.splice(index, 1);
        localStorage.setItem('addresses', JSON.stringify(addresses));
        displayAddresses();
        showSuccess('Address deleted');
    }
}

// Hesap silme
function handleDeleteAccount() {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        // Kullanıcı verilerini temizle
        localStorage.removeItem('userData');
        localStorage.removeItem('addresses');
        localStorage.removeItem('orders');
        localStorage.removeItem('favorites');
        
        // Ana sayfaya yönlendir
        window.location.href = 'index.html';
    }
}

// Yardımcı fonksiyonlar
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function getStatusText(status) {
    const statusMap = {
        'PENDING': 'Pending',
        'PREPARING': 'Preparing',
        'DELIVERING': 'On the Way',
        'DELIVERED': 'Delivered',
        'CANCELLED': 'Cancelled'
    };
    return statusMap[status] || status;
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

function showSuccess(message) {
    alert(message); // Daha sonra daha güzel bir bildirim sistemi eklenebilir
}

// Navigation
profileNav.addEventListener('click', (e) => {
    e.preventDefault();
    const target = e.target.closest('a');
    if (!target) return;

    // Update active state
    profileNav.querySelectorAll('a').forEach(link => link.classList.remove('active'));
    target.classList.add('active');

    // Show target section
    const sectionId = target.getAttribute('href').substring(1);
    profileSections.forEach(section => {
        section.classList.remove('active');
        if (section.id === sectionId) {
            section.classList.add('active');
        }
    });
});

// Personal Information Form
if (personalInfoForm) {
    // Load user data
    const { fullName, email, phone, birthDate } = mockUserData;
    personalInfoForm.querySelector('#fullName').value = fullName;
    personalInfoForm.querySelector('#email').value = email;
    personalInfoForm.querySelector('#phone').value = phone;
    personalInfoForm.querySelector('#birthDate').value = birthDate;

    personalInfoForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = personalInfoForm.querySelector('.btn-submit');
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Update mock data
            mockUserData.fullName = personalInfoForm.querySelector('#fullName').value;
            mockUserData.email = personalInfoForm.querySelector('#email').value;
            mockUserData.phone = personalInfoForm.querySelector('#phone').value;
            mockUserData.birthDate = personalInfoForm.querySelector('#birthDate').value;

            showSuccess('Personal information updated successfully');
        } catch (error) {
            showError('Failed to update personal information');
        } finally {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    });
}

// Settings Form
if (settingsForm) {
    // Load settings
    const { emailNotifications, smsNotifications } = mockUserData.settings;
    settingsForm.querySelector('#emailNotifications').checked = emailNotifications;
    settingsForm.querySelector('#smsNotifications').checked = smsNotifications;

    settingsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = settingsForm.querySelector('.btn-submit');
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Update mock data
            mockUserData.settings.emailNotifications = settingsForm.querySelector('#emailNotifications').checked;
            mockUserData.settings.smsNotifications = settingsForm.querySelector('#smsNotifications').checked;

            showSuccess('Settings updated successfully');
        } catch (error) {
            showError('Failed to update settings');
        } finally {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    });
}

// Address Management
if (addAddressBtn && addressModal) {
    addAddressBtn.addEventListener('click', () => {
        addressModal.classList.add('active');
    });

    closeModalBtn.addEventListener('click', () => {
        addressModal.classList.remove('active');
    });

    addressModal.addEventListener('click', (e) => {
        if (e.target === addressModal) {
            addressModal.classList.remove('active');
        }
    });

    if (addressForm) {
        addressForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = addressForm.querySelector('.btn-submit');
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;

            try {
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Add new address to mock data
                const newAddress = {
                    id: mockUserData.addresses.length + 1,
                    title: addressForm.querySelector('#addressTitle').value,
                    streetAddress: addressForm.querySelector('#streetAddress').value,
                    city: addressForm.querySelector('#city').value,
                    state: addressForm.querySelector('#state').value,
                    zipCode: addressForm.querySelector('#zipCode').value,
                    country: addressForm.querySelector('#country').value,
                    isDefault: addressForm.querySelector('#defaultAddress').checked
                };

                mockUserData.addresses.push(newAddress);
                addressForm.reset();
                addressModal.classList.remove('active');
                showSuccess('Address added successfully');
                updateAddressesList();
            } catch (error) {
                showError('Failed to add address');
            } finally {
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
            }
        });
    }
}

// Update Lists
function updateAddressesList() {
    const addressesList = document.querySelector('.addresses-list');
    if (!addressesList) return;

    addressesList.innerHTML = mockUserData.addresses.map(address => `
        <div class="address-card">
            <div class="address-header">
                <h3>${address.title}</h3>
                ${address.isDefault ? '<span class="default-badge">Default</span>' : ''}
            </div>
            <p>${address.streetAddress}</p>
            <p>${address.city}, ${address.state} ${address.zipCode}</p>
            <p>${address.country}</p>
            <div class="address-actions">
                <button class="btn-edit">Edit</button>
                <button class="btn-delete">Delete</button>
            </div>
        </div>
    `).join('');
}

function updateOrdersList() {
    const ordersList = document.querySelector('.orders-list');
    if (!ordersList) return;

    ordersList.innerHTML = mockUserData.orders.map(order => `
        <div class="order-card">
            <div class="order-header">
                <h3>Order #${order.id}</h3>
                <span class="order-date">${new Date(order.date).toLocaleDateString()}</span>
            </div>
            <p class="restaurant-name">${order.restaurant}</p>
            <ul class="order-items">
                ${order.items.map(item => `<li>${item}</li>`).join('')}
            </ul>
            <div class="order-footer">
                <span class="order-total">$${order.total.toFixed(2)}</span>
                <span class="order-status ${order.status.toLowerCase()}">${order.status}</span>
            </div>
        </div>
    `).join('');
}

function updateFavoritesList() {
    const favoritesList = document.querySelector('.favorites-list');
    if (!favoritesList) return;

    favoritesList.innerHTML = mockUserData.favorites.map(restaurant => `
        <div class="favorite-card">
            <img src="${restaurant.image}" alt="${restaurant.name}">
            <h3>${restaurant.name}</h3>
            <div class="rating">
                <i class="fas fa-star"></i>
                <span>${restaurant.rating}</span>
            </div>
        </div>
    `).join('');
} 