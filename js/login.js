// When page loads
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    checkAuthStatus();
});

// Setup event listeners
function setupEventListeners() {
    // Password show/hide
    const togglePasswordBtn = document.querySelector('.toggle-password');
    const passwordInput = document.getElementById('password');
    
    togglePasswordBtn.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        togglePasswordBtn.querySelector('i').classList.toggle('fa-eye');
        togglePasswordBtn.querySelector('i').classList.toggle('fa-eye-slash');
    });
    
    // Form submission
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', handleLogin);
    
    // Social media logins
    document.querySelector('.social-btn.google').addEventListener('click', handleGoogleLogin);
    document.querySelector('.social-btn.facebook').addEventListener('click', handleFacebookLogin);
}

// Check authentication status
function checkAuthStatus() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userType = localStorage.getItem('userType');
    
    if (isLoggedIn) {
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
    }
}

// Login process
async function handleLogin(e) {
    e.preventDefault();
    
    const userType = document.querySelector('input[name="userType"]:checked').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // Form validation
    if (!validateForm(email, password)) {
        return;
    }
    
    try {
        // API call simulation
        await simulateLogin(email, password);
        
        // Save user data
        const userData = {
            email,
            name: email.split('@')[0], // Example username
            avatar: `https://ui-avatars.com/api/?name=${email.split('@')[0]}&background=random`,
            type: userType
        };
        
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userData', JSON.stringify(userData));
        localStorage.setItem('userType', userType);
        
        if (rememberMe) {
            localStorage.setItem('rememberMe', 'true');
        }
        
        // Redirect based on user type
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
    } catch (error) {
        showError('An error occurred while logging in. Please try again.');
    }
}

// Form validation
function validateForm(email, password) {
    let isValid = true;
    
    // Email validation
    if (!email) {
        showFieldError('email', 'Email address is required');
        isValid = false;
    } else if (!isValidEmail(email)) {
        showFieldError('email', 'Please enter a valid email address');
        isValid = false;
    } else {
        clearFieldError('email');
    }
    
    // Password validation
    if (!password) {
        showFieldError('password', 'Password is required');
        isValid = false;
    } else if (password.length < 6) {
        showFieldError('password', 'Password must be at least 6 characters long');
        isValid = false;
    } else {
        clearFieldError('password');
    }
    
    return isValid;
}

// Email format check
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Show field error message
function showFieldError(fieldId, message) {
    const errorElement = document.getElementById(`${fieldId}Error`);
    errorElement.textContent = message;
    document.getElementById(fieldId).classList.add('error');
}

// Clear field error message
function clearFieldError(fieldId) {
    const errorElement = document.getElementById(`${fieldId}Error`);
    errorElement.textContent = '';
    document.getElementById(fieldId).classList.remove('error');
}

// Show general error message
function showError(message) {
    alert(message); // A modal can be used for more advanced error display
}

// API call simulation
function simulateLogin(email, password) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Example user check
            if (email === 'test@example.com' && password === '123456') {
                resolve();
            } else {
                reject(new Error('Invalid email or password'));
            }
        }, 1000);
    });
}

// Google login
function handleGoogleLogin() {
    alert('Google login feature coming soon!');
}

// Facebook login
function handleFacebookLogin() {
    alert('Facebook login feature coming soon!');
} 