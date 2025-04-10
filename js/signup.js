// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    checkAuthStatus();
});
// Event listener'ları ayarla
function setupEventListeners() {
    // Form gönderimi
    const signupForm = document.getElementById('signupForm');
    signupForm.addEventListener('submit', handleSignup);
}
// Oturum durumunu kontrol et
function checkAuthStatus() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (isLoggedIn) {
        window.location.href = 'index.html';
    }
}
// Kayıt işlemi
async function handleSignup(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const terms = document.getElementById('terms').checked;
    
    // Form doğrulama
    if (!validateForm(name, email, phone, password, confirmPassword, terms)) {
        return;
    }
    
    try {
        // API çağrısı simülasyonu
        await simulateSignup(name, email, phone, password);
        
        // Kullanıcı verilerini kaydet
        const userData = {
            name,
            email,
            phone
        };
        
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userData', JSON.stringify(userData));
        
        // Ana sayfaya yönlendir
        window.location.href = 'index.html';
    } catch (error) {
        showError('Kayıt olurken bir hata oluştu. Lütfen tekrar deneyin.');
    }
}
// Form doğrulama
function validateForm(name, email, phone, password, confirmPassword, terms) {
    let isValid = true;
    
    // İsim doğrulama
    if (!name) {
        showFieldError('name', 'Ad Soyad gereklidir');
        isValid = false;
    } else if (name.length < 3) {
        showFieldError('name', 'Ad Soyad en az 3 karakter olmalıdır');
        isValid = false;
    } else {
        clearFieldError('name');
    }
    
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
    
    // Telefon doğrulama
    if (!phone) {
        showFieldError('phone', 'Telefon numarası gereklidir');
        isValid = false;
    } else if (!isValidPhone(phone)) {
        showFieldError('phone', 'Geçerli bir telefon numarası giriniz');
        isValid = false;
    } else {
        clearFieldError('phone');
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
    
    // Şifre tekrar doğrulama
    if (!confirmPassword) {
        showFieldError('confirmPassword', 'Şifre tekrarı gereklidir');
        isValid = false;
    } else if (password !== confirmPassword) {
        showFieldError('confirmPassword', 'Şifreler eşleşmiyor');
        isValid = false;
    } else {
        clearFieldError('confirmPassword');
    }
    
    // Kullanım koşulları doğrulama
    if (!terms) {
        showFieldError('terms', 'Kullanım koşullarını kabul etmelisiniz');
        isValid = false;
    } else {
        clearFieldError('terms');
    }
    
    return isValid;
}
// E-posta formatı kontrolü
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
// Telefon formatı kontrolü
function isValidPhone(phone) {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
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
function simulateSignup(name, email, phone, password) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Örnek kayıt kontrolü
            if (email === 'test@example.com') {
                reject(new Error('Bu e-posta adresi zaten kullanımda'));
            } else {
                resolve();
            }
        }, 1000);
    });
} 