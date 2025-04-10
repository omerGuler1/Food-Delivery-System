// Uygulama başlangıç kontrolü
function initializeApp() {
    console.log('HUFDS uygulaması başlatılıyor...');

    // Oturum durumunu kontrol et
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    // Kullanıcı giriş yapmamışsa navbar'ı güncelle
    if (!isLoggedIn) {
        console.log('Kullanıcı giriş yapmamış, navbar güncelleniyor...');
        updateNavbarForGuest();
    } else {
        console.log('Kullanıcı giriş yapmış, navbar güncelleniyor...');
        updateNavbarForUser();
    }
}

// Giriş yapmamış kullanıcı için navbar
function updateNavbarForGuest() {
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) {
        navLinks.innerHTML = `
            <a href="index.html" class="active">Home</a>
            <a href="restaurants.html">Restaurants</a>
            <a href="login.html">Login</a>
            <a href="signup.html">Sign Up</a>
        `;
    }
}

// Giriş yapmış kullanıcı için navbar
function updateNavbarForUser() {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) {
        navLinks.innerHTML = `
            <a href="index.html" class="active">Home</a>
            <a href="restaurants.html">Restaurants</a>
            <a href="cart.html" class="cart-icon">
                <i class="fas fa-shopping-cart"></i>
                <span class="cart-count">0</span>
            </a>
            <div class="user-menu">
                <img src="${userData.avatar || 'https://via.placeholder.com/40'}" alt="User Avatar" class="user-avatar">
                <div class="dropdown-menu">
                    <a href="profile.html">Profile</a>
                    <a href="orders.html">My Orders</a>
                    <a href="favorites.html">Favorites</a>
                    <a href="#" id="logoutBtn">Logout</a>
                </div>
            </div>
        `;

        // Çıkış işlemi için event listener
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', handleLogout);
        }
    }
}

// Çıkış işlemi
function handleLogout(e) {
    e.preventDefault();
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userData');
    window.location.reload(); // Sayfayı yenile
}

// Sayfa yüklendiğinde uygulamayı başlat
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});
