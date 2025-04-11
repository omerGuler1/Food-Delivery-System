// Form validation functions
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

// Error message display function
const showError = (element, message) => {
    element.textContent = message;
    element.style.display = 'block';
};

const hideError = (element) => {
    element.textContent = '';
    element.style.display = 'none';
};

// Password show/hide function
const togglePassword = (input, button) => {
    const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
    input.setAttribute('type', type);
    button.querySelector('i').classList.toggle('fa-eye');
    button.querySelector('i').classList.toggle('fa-eye-slash');
};

// Form submission process
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
            // Successful operation
            localStorage.setItem('user', JSON.stringify(result.user));
            window.location.href = '/';
        } else {
            // Error case
            const errorElement = form.querySelector('.error-message');
            showError(errorElement, result.message);
        }
    } catch (error) {
        console.error('An error occurred:', error);
        const errorElement = form.querySelector('.error-message');
        showError(errorElement, 'An error occurred. Please try again.');
    }
};

// DOM Elements
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const forgotPasswordForm = document.getElementById('forgotPasswordForm');
const togglePasswordButtons = document.querySelectorAll('.toggle-password');
const userTypeRadios = document.querySelectorAll('input[name="userType"]');
const userIdInput = document.getElementById('userId');
const passwordInput = document.getElementById('password');
const rememberMeCheckbox = document.getElementById('rememberMe');

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

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Check for saved credentials
    const savedUserId = localStorage.getItem('userId');
    const savedPassword = localStorage.getItem('password');
    const savedUserType = localStorage.getItem('userType');

    if (savedUserId && savedPassword && savedUserType) {
        userIdInput.value = savedUserId;
        passwordInput.value = savedPassword;
        document.querySelector(`input[name="userType"][value="${savedUserType}"]`).checked = true;
        rememberMeCheckbox.checked = true;
    }
});

loginForm.addEventListener('submit', handleLogin);

// Functions
function handleLogin(event) {
    event.preventDefault();
    
    const userId = document.getElementById('userId').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;

    // Validate credentials (this is just a mock implementation)
    if (userId && password) {
        // Store user data in localStorage
        const userData = {
            id: userId,
            name: userId, // In a real app, this would come from the server
            type: 'customer' // Default to customer type
        };

        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userData', JSON.stringify(userData));
        localStorage.setItem('userType', 'customer');

        if (rememberMe) {
            localStorage.setItem('rememberMe', 'true');
        }

        // Redirect to index.html
        window.location.href = 'index.html';
    } else {
        alert('Please enter valid credentials');
    }
}

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

// When page loads
document.addEventListener('DOMContentLoaded', () => {
    // Select form elements
    const forms = document.querySelectorAll('.auth-form');
    const passwordToggles = document.querySelectorAll('.toggle-password');

    // Event listener for password show/hide buttons
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const input = toggle.previousElementSibling;
            togglePassword(input, toggle);
        });
    });

    // Event listener for forms
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Form validation
            const email = form.querySelector('input[type="email"]');
            const password = form.querySelector('input[type="password"]');
            const phone = form.querySelector('input[type="tel"]');
            const name = form.querySelector('input[name="name"]');
            const errorElement = form.querySelector('.error-message');

            let isValid = true;

            if (email && !validateEmail(email.value)) {
                showError(errorElement, 'Please enter a valid email address.');
                isValid = false;
            }

            if (password && !validatePassword(password.value)) {
                showError(errorElement, 'Password must be at least 6 characters long.');
                isValid = false;
            }

            if (phone && !validatePhone(phone.value)) {
                showError(errorElement, 'Please enter a valid phone number.');
                isValid = false;
            }

            if (name && name.value.trim().length < 2) {
                showError(errorElement, 'Name must be at least 2 characters long.');
                isValid = false;
            }

            if (isValid) {
                hideError(errorElement);
                const endpoint = form.getAttribute('data-endpoint');
                handleSubmit(form, endpoint);
            }
        });

        // Clear error messages on input changes
        form.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', () => {
                const errorElement = form.querySelector('.error-message');
                hideError(errorElement);
            });
        });
    });
}); 