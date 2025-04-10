// Form doğrulama fonksiyonları
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const validatePassword = (password) => {
    return password.length >= 6;
};

const validatePhone = (phone) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone);
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

// Şifre göster/gizle fonksiyonu
const togglePassword = (input, button) => {
    const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
    input.setAttribute('type', type);
    button.querySelector('i').classList.toggle('fa-eye');
    button.querySelector('i').classList.toggle('fa-eye-slash');
};

// Form gönderme işlemi
const handleSubmit = async (form, endpoint) => {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (response.ok) {
            // Başarılı işlem
            localStorage.setItem('user', JSON.stringify(result.user));
            window.location.href = '/';
        } else {
            // Hata durumu
            const errorElement = form.querySelector('.error-message');
            showError(errorElement, result.message);
        }
    } catch (error) {
        console.error('Bir hata oluştu:', error);
        const errorElement = form.querySelector('.error-message');
        showError(errorElement, 'Bir hata oluştu. Lütfen tekrar deneyin.');
    }
};

// DOM Elements
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const forgotPasswordForm = document.getElementById('forgotPasswordForm');
const togglePasswordButtons = document.querySelectorAll('.toggle-password');

// Toggle Password Visibility
togglePasswordButtons.forEach(button => {
    button.addEventListener('click', function() {
        const input = this.previousElementSibling;
        const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
        input.setAttribute('type', type);
        this.classList.toggle('fa-eye');
        this.classList.toggle('fa-eye-slash');
    });
});

// Login Form Handler
if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe').checked;
        const userType = document.querySelector('input[name="userType"]:checked').value;

        try {
            // Show loading state
            const submitButton = this.querySelector('.btn-submit');
            submitButton.classList.add('loading');
            submitButton.disabled = true;

            // Simulate API call
            await simulateLogin(email, password);

            // Store user data if remember me is checked
            if (rememberMe) {
                localStorage.setItem('userEmail', email);
                localStorage.setItem('rememberMe', 'true');
            }

            // Store user type
            localStorage.setItem('userType', userType);

            // Show success message
            showMessage('Login successful! Redirecting...', 'success');

            // Redirect based on user type
            setTimeout(() => {
                switch(userType) {
                    case 'customer':
                        window.location.href = 'index.html';
                        break;
                    case 'courier':
                        window.location.href = 'courier-dashboard.html';
                        break;
                    case 'restaurant':
                        window.location.href = 'restaurant-dashboard.html';
                        break;
                    default:
                        window.location.href = 'index.html';
                }
            }, 1500);

        } catch (error) {
            showMessage(error.message, 'error');
        } finally {
            // Remove loading state
            submitButton.classList.remove('loading');
            submitButton.disabled = false;
        }
    });
}

// Signup Form Handler
if (signupForm) {
    signupForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const fullName = document.getElementById('fullName').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Validate passwords match
        if (password !== confirmPassword) {
            showMessage('Passwords do not match', 'error');
            return;
        }

        try {
            // Show loading state
            const submitButton = this.querySelector('.btn-submit');
            submitButton.classList.add('loading');
            submitButton.disabled = true;

            // Simulate API call
            await simulateSignup(fullName, email, phone, password);

            // Show success message
            showMessage('Account created successfully! Redirecting to login...', 'success');

            // Redirect to login page
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);

        } catch (error) {
            showMessage(error.message, 'error');
        } finally {
            // Remove loading state
            submitButton.classList.remove('loading');
            submitButton.disabled = false;
        }
    });
}

// Forgot Password Form Handler
if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;

        try {
            // Show loading state
            const submitButton = this.querySelector('.btn-submit');
            submitButton.classList.add('loading');
            submitButton.disabled = true;

            // Simulate API call
            await simulateForgotPassword(email);

            // Show success message
            showMessage('Password reset instructions sent to your email', 'success');

            // Redirect to login page
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);

        } catch (error) {
            showMessage(error.message, 'error');
        } finally {
            // Remove loading state
            submitButton.classList.remove('loading');
            submitButton.disabled = false;
        }
    });
}

// Utility Functions
function showMessage(message, type) {
    // Remove existing messages
    const existingMessage = document.querySelector('.success-message, .error-message');
    if (existingMessage) {
        existingMessage.remove();
    }

    // Create new message element
    const messageElement = document.createElement('div');
    messageElement.className = `${type}-message`;
    messageElement.textContent = message;

    // Insert message before the form
    const form = document.querySelector('.auth-form');
    form.parentNode.insertBefore(messageElement, form);

    // Remove message after 3 seconds
    setTimeout(() => {
        messageElement.remove();
    }, 3000);
}

// Simulated API Calls
function simulateLogin(email, password) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Simulate validation
            if (email && password) {
                resolve({ success: true });
            } else {
                reject(new Error('Invalid email or password'));
            }
        }, 1000);
    });
}

function simulateSignup(fullName, email, phone, password) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Simulate validation
            if (fullName && email && phone && password) {
                resolve({ success: true });
            } else {
                reject(new Error('Please fill in all fields'));
            }
        }, 1000);
    });
}

function simulateForgotPassword(email) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Simulate validation
            if (email) {
                resolve({ success: true });
            } else {
                reject(new Error('Please enter your email'));
            }
        }, 1000);
    });
}

// Check for remembered email on login page
document.addEventListener('DOMContentLoaded', () => {
    if (loginForm && localStorage.getItem('rememberMe') === 'true') {
        const emailInput = document.getElementById('email');
        const rememberMeCheckbox = document.getElementById('rememberMe');
        
        if (emailInput && rememberMeCheckbox) {
            emailInput.value = localStorage.getItem('userEmail');
            rememberMeCheckbox.checked = true;
        }
    }
});

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
    // Form elementlerini seç
    const forms = document.querySelectorAll('.auth-form');
    const passwordToggles = document.querySelectorAll('.toggle-password');

    // Şifre göster/gizle butonları için event listener
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const input = toggle.previousElementSibling;
            togglePassword(input, toggle);
        });
    });

    // Formlar için event listener
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Form doğrulama
            const email = form.querySelector('input[type="email"]');
            const password = form.querySelector('input[type="password"]');
            const phone = form.querySelector('input[type="tel"]');
            const name = form.querySelector('input[name="name"]');
            const errorElement = form.querySelector('.error-message');

            let isValid = true;

            if (email && !validateEmail(email.value)) {
                showError(errorElement, 'Geçerli bir e-posta adresi giriniz.');
                isValid = false;
            }

            if (password && !validatePassword(password.value)) {
                showError(errorElement, 'Şifre en az 6 karakter olmalıdır.');
                isValid = false;
            }

            if (phone && !validatePhone(phone.value)) {
                showError(errorElement, 'Geçerli bir telefon numarası giriniz.');
                isValid = false;
            }

            if (name && name.value.trim().length < 2) {
                showError(errorElement, 'İsim en az 2 karakter olmalıdır.');
                isValid = false;
            }

            if (isValid) {
                hideError(errorElement);
                const endpoint = form.getAttribute('data-endpoint');
                handleSubmit(form, endpoint);
            }
        });

        // Input değişikliklerinde hata mesajlarını temizle
        form.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', () => {
                const errorElement = form.querySelector('.error-message');
                hideError(errorElement);
            });
        });
    });
}); 