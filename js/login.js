// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    checkAuthStatus();
});

// Event listener'ları ayarla
function setupEventListeners() {
    // Şifre göster/gizle
    const togglePasswordBtn = document.querySelector('.toggle-password');
    const passwordInput = document.getElementById('password');
    
    togglePasswordBtn.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        togglePasswordBtn.querySelector('i').classList.toggle('fa-eye');
        togglePasswordBtn.querySelector('i').classList.toggle('fa-eye-slash');
    });
    
    // Form gönderimi
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', handleLogin);
    
    // Sosyal medya girişleri
    document.querySelector('.social-btn.google').addEventListener('click', handleGoogleLogin);
    document.querySelector('.social-btn.facebook').addEventListener('click', handleFacebookLogin);
}

// Oturum durumunu kontrol et
function checkAuthStatus() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (isLoggedIn) {
        window.location.href = 'index.html';
    }
}

// Giriş işlemi
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // Form doğrulama
    if (!validateForm(email, password)) {
        return;
    }
    
    try {
        // API çağrısı simülasyonu
        await simulateLogin(email, password);
        
        // Kullanıcı verilerini kaydet
        const userData = {
            email,
            name: email.split('@')[0], // Örnek kullanıcı adı
            avatar: `https://ui-avatars.com/api/?name=${email.split('@')[0]}&background=random`
        };
        
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userData', JSON.stringify(userData));
        
        if (rememberMe) {
            localStorage.setItem('rememberMe', 'true');
        }
        
        // Ana sayfaya yönlendir
        window.location.href = 'index.html';
    } catch (error) {
        showError('Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.');
    }
}

// Form doğrulama
function validateForm(email, password) {
    let isValid = true;
    
    // E-posta doğrulama
    if (!email) {
        showFieldError('email', 'E-posta adresi gereklidir');
        isValid = false;
    } else if (!isValidEmail(email)) {
        showFieldError('email', 'Geçerli bir e-posta adresi giriniz');
        isValid = false;
    } else {
        clearFieldError('email');
    }
    
    // Şifre doğrulama
    if (!password) {
        showFieldError('password', 'Şifre gereklidir');
        isValid = false;
    } else if (password.length < 6) {
        showFieldError('password', 'Şifre en az 6 karakter olmalıdır');
        isValid = false;
    } else {
        clearFieldError('password');
    }
    
    return isValid;
}

// E-posta formatı kontrolü
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Alan hata mesajı göster
function showFieldError(fieldId, message) {
    const errorElement = document.getElementById(`${fieldId}Error`);
    errorElement.textContent = message;
    document.getElementById(fieldId).classList.add('error');
}

// Alan hata mesajını temizle
function clearFieldError(fieldId) {
    const errorElement = document.getElementById(`${fieldId}Error`);
    errorElement.textContent = '';
    document.getElementById(fieldId).classList.remove('error');
}

// Genel hata mesajı göster
function showError(message) {
    alert(message); // Daha gelişmiş bir hata gösterimi için modal kullanılabilir
}

// API çağrısı simülasyonu
function simulateLogin(email, password) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Örnek kullanıcı kontrolü
            if (email === 'test@example.com' && password === '123456') {
                resolve();
            } else {
                reject(new Error('Geçersiz e-posta veya şifre'));
            }
        }, 1000);
    });
}

// Google ile giriş
function handleGoogleLogin() {
    alert('Google ile giriş özelliği yakında eklenecek!');
}

// Facebook ile giriş
function handleFacebookLogin() {
    alert('Facebook ile giriş özelliği yakında eklenecek!');
} 