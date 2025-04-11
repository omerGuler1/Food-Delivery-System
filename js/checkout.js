// Sepet verilerini localStorage'dan al
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Restoran bilgilerini localStorage'dan al
const restaurant = {
    id: 1, // Örnek ID
    name: "Pizza Paradise",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    deliveryTime: "30-45 min"
};

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
    // Sepet boşsa ana sayfaya yönlendir
    if (cart.length === 0) {
        window.location.href = 'index.html';
        return;
    }

    // Restoran bilgilerini göster
    document.getElementById('restaurantImage').src = restaurant.image;
    document.getElementById('restaurantName').textContent = restaurant.name;
    document.getElementById('deliveryTime').textContent = restaurant.deliveryTime;

    // Sipariş öğelerini göster
    displayOrderItems();

    // Form validasyonları
    setupFormValidation();
});

// Sipariş öğelerini göster
function displayOrderItems() {
    const orderItems = document.getElementById('orderItems');
    const subtotal = document.getElementById('subtotal');
    const deliveryFee = document.getElementById('deliveryFee');
    const total = document.getElementById('total');

    orderItems.innerHTML = '';
    let totalAmount = 0;

    cart.forEach(item => {
        const orderItem = document.createElement('div');
        orderItem.className = 'order-item';
        orderItem.innerHTML = `
            <div class="order-item-info">
                <h4>${item.name}</h4>
                <span class="order-item-quantity">${item.quantity} adet</span>
            </div>
            <div class="order-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
        `;

        orderItems.appendChild(orderItem);
        totalAmount += item.price * item.quantity;
    });

    subtotal.textContent = `$${totalAmount.toFixed(2)}`;
    
    const deliveryFeeAmount = 2.99;
    deliveryFee.textContent = `$${deliveryFeeAmount.toFixed(2)}`;
    
    const finalTotal = totalAmount + deliveryFeeAmount;
    total.textContent = `$${finalTotal.toFixed(2)}`;
}

// Form validasyonları
function setupFormValidation() {
    const deliveryForm = document.getElementById('deliveryForm');
    const paymentForm = document.getElementById('paymentForm');
    const paymentMethodInputs = document.querySelectorAll('input[name="paymentMethod"]');
    const cardPaymentDetails = document.getElementById('cardPaymentDetails');
    const cashPaymentDetails = document.getElementById('cashPaymentDetails');

    // Ödeme yöntemi değişikliğini dinle
    paymentMethodInputs.forEach(input => {
        input.addEventListener('change', (e) => {
            if (e.target.value === 'card') {
                cardPaymentDetails.style.display = 'block';
                cashPaymentDetails.style.display = 'none';
            } else {
                cardPaymentDetails.style.display = 'none';
                cashPaymentDetails.style.display = 'block';
            }
        });
    });

    // Kart numarası formatı
    const cardNumber = document.getElementById('cardNumber');
    cardNumber.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '').slice(0, 16);
    });

    // Son kullanma tarihi formatı
    const expiry = document.getElementById('expiry');
    expiry.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.slice(0, 2) + '/' + value.slice(2, 4);
        }
        e.target.value = value;
    });

    // CVV formatı
    const cvv = document.getElementById('cvv');
    cvv.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '').slice(0, 3);
    });

    // Sipariş formu gönderimi
    deliveryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        validateDeliveryForm();
    });

    // Ödeme formu gönderimi
    paymentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (validatePaymentForm()) {
            processOrder();
        }
    });
}

// Teslimat formu validasyonu
function validateDeliveryForm() {
    const fullName = document.getElementById('fullName');
    const phone = document.getElementById('phone');
    const address = document.getElementById('address');

    let isValid = true;

    if (!fullName.value.trim()) {
        showError(fullName, 'Ad Soyad alanı zorunludur');
        isValid = false;
    }

    if (!phone.value.trim()) {
        showError(phone, 'Telefon alanı zorunludur');
        isValid = false;
    }

    if (!address.value.trim()) {
        showError(address, 'Adres alanı zorunludur');
        isValid = false;
    }

    return isValid;
}

// Ödeme formu validasyonu
function validatePaymentForm() {
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    
    if (paymentMethod === 'card') {
        const cardNumber = document.getElementById('cardNumber');
        const expiry = document.getElementById('expiry');
        const cvv = document.getElementById('cvv');
        const cardName = document.getElementById('cardName');

        let isValid = true;

        if (!cardNumber.value.match(/^[0-9]{16}$/)) {
            showError(cardNumber, 'Geçerli bir kart numarası giriniz');
            isValid = false;
        }

        if (!expiry.value.match(/^[0-9]{2}\/[0-9]{2}$/)) {
            showError(expiry, 'Geçerli bir son kullanma tarihi giriniz (AA/YY)');
            isValid = false;
        }

        if (!cvv.value.match(/^[0-9]{3}$/)) {
            showError(cvv, 'Geçerli bir CVV giriniz');
            isValid = false;
        }

        if (!cardName.value.trim()) {
            showError(cardName, 'Kart üzerindeki isim zorunludur');
            isValid = false;
        }

        return isValid;
    }
    
    return true; // Kapıda ödeme için validasyon gerekmez
}

// Hata mesajı göster
function showError(element, message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    const existingError = element.parentElement.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    element.parentElement.appendChild(errorDiv);
    element.classList.add('error');
}

// Siparişi işle
function processOrder() {
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    
    // Sipariş verilerini hazırla
    const orderData = {
        items: cart,
        delivery: {
            fullName: document.getElementById('fullName').value,
            phone: document.getElementById('phone').value,
            address: document.getElementById('address').value,
            instructions: document.getElementById('instructions').value
        },
        payment: {
            method: paymentMethod,
            ...(paymentMethod === 'card' ? {
                cardNumber: document.getElementById('cardNumber').value,
                expiry: document.getElementById('expiry').value,
                cvv: document.getElementById('cvv').value,
                cardName: document.getElementById('cardName').value
            } : {})
        },
        restaurant: restaurant,
        total: parseFloat(document.getElementById('total').textContent.replace('$', '')),
        date: new Date().toISOString()
    };

    // Siparişi localStorage'a kaydet
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push(orderData);
    localStorage.setItem('orders', JSON.stringify(orders));

    // Sepeti temizle
    localStorage.removeItem('cart');

    // Başarılı sipariş sayfasına yönlendir
    window.location.href = 'order-success.html';
} 