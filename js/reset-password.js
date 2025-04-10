// Form doğrulama fonksiyonları
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Hata mesajı gösterme fonksiyonu
const showError = (element, message) => {
    element.textContent = message;
    element.style.display = 'block';
};

const hideError = (element) => {
    element.textContent = '';
    element.style.display = 'none';
};

// Başarı mesajı gösterme fonksiyonu
const showSuccess = (message) => {
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.textContent = message;

    const form = document.querySelector('.auth-form');
    form.parentNode.insertBefore(successMessage, form);

    setTimeout(() => {
        successMessage.remove();
    }, 3000);
};

// Form gönderme işlemi
const handleResetPassword = async (email) => {
    try {
        // API çağrısı simülasyonu
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Email doğrulama
        if (!validateEmail(email)) {
            throw new Error('Please enter a valid email address');
        }

        // Başarılı işlem simülasyonu
        showSuccess('Password reset instructions have been sent to your email');
        
        // 2 saniye sonra login sayfasına yönlendir
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);

    } catch (error) {
        showError(document.querySelector('.error-message'), error.message);
    }
};

// DOM Elements
const resetPasswordForm = document.getElementById('resetPasswordForm');
const emailInput = document.getElementById('email');

// Form submit event listener
if (resetPasswordForm) {
    resetPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        const submitButton = resetPasswordForm.querySelector('.btn-submit');
        
        // Loading durumunu göster
        submitButton.classList.add('loading');
        submitButton.disabled = true;

        try {
            await handleResetPassword(email);
        } finally {
            // Loading durumunu kaldır
            submitButton.classList.remove('loading');
            submitButton.disabled = false;
        }
    });
}

// Input değişikliklerinde hata mesajını temizle
if (emailInput) {
    emailInput.addEventListener('input', () => {
        hideError(document.querySelector('.error-message'));
    });
}

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
    // Form elementlerini seç
    const form = document.querySelector('.auth-form');
    const errorElement = form.querySelector('.error-message');

    // Form doğrulama
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        let isValid = true;

        if (!validateEmail(email)) {
            showError(errorElement, 'Please enter a valid email address');
            isValid = false;
        }

        if (isValid) {
            hideError(errorElement);
            handleResetPassword(email);
        }
    });
}); 