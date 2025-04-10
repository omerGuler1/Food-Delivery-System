// Sepet verisi
let cart = JSON.parse(localStorage.getItem('cart') || '[]');
let promoDiscount = 0;

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
    displayCart();
    setupEventListeners();
});

// Sepeti göster
function displayCart() {
    const cartItemsContainer = document.getElementById('cartItems');
    const cartSubtotalElement = document.getElementById('cartSubtotal');
    const cartTotalElement = document.getElementById('cartTotal');
    const checkoutBtn = document.getElementById('checkoutBtn');
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <h2>Sepetiniz Boş</h2>
                <p>Lezzetli yemekler için hemen sipariş verin!</p>
                <a href="restaurants.html" class="continue-shopping">Alışverişe Başla</a>
            </div>
        `;
        cartSubtotalElement.textContent = '$0.00';
        cartTotalElement.textContent = '$0.00';
        checkoutBtn.disabled = true;
        return;
    }
    
    cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item" data-item-id="${item.id}">
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-info">
                <h3>${item.name}</h3>
                <p>${item.description}</p>
                <div class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
                <div class="cart-item-actions">
                    <div class="quantity-controls">
                        <button class="quantity-btn minus" data-item-id="${item.id}">-</button>
                        <span class="quantity" data-item-id="${item.id}">${item.quantity}</span>
                        <button class="quantity-btn plus" data-item-id="${item.id}">+</button>
                    </div>
                    <button class="remove-item" data-item-id="${item.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    updateCartSummary();
}

// Sepet özetini güncelle
function updateCartSummary() {
    const cartSubtotalElement = document.getElementById('cartSubtotal');
    const cartTotalElement = document.getElementById('cartTotal');
    const checkoutBtn = document.getElementById('checkoutBtn');
    
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const deliveryFee = 2.00;
    const discount = subtotal * promoDiscount;
    const total = subtotal + deliveryFee - discount;
    
    cartSubtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    cartTotalElement.textContent = `$${total.toFixed(2)}`;
    checkoutBtn.disabled = subtotal < 10; // Minimum sipariş tutarı kontrolü
}

// Event listener'ları ayarla
function setupEventListeners() {
    // Miktar artırma/azaltma
    document.querySelectorAll('.quantity-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const itemId = e.target.dataset.itemId;
            const item = cart.find(item => item.id === parseInt(itemId));
            const quantityElement = document.querySelector(`.quantity[data-item-id="${itemId}"]`);
            
            if (e.target.classList.contains('plus')) {
                item.quantity++;
            } else if (item.quantity > 1) {
                item.quantity--;
            }
            
            quantityElement.textContent = item.quantity;
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartSummary();
            updateCartCount();
        });
    });
    
    // Ürün silme
    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const itemId = e.target.closest('.remove-item').dataset.itemId;
            if (confirm('Bu ürünü sepetten kaldırmak istediğinizden emin misiniz?')) {
                cart = cart.filter(item => item.id !== parseInt(itemId));
                localStorage.setItem('cart', JSON.stringify(cart));
                displayCart();
                updateCartCount();
            }
        });
    });
    
    // Promosyon kodu uygulama
    document.getElementById('applyPromo').addEventListener('click', () => {
        const promoInput = document.getElementById('promoCode');
        const promoCode = promoInput.value.trim().toUpperCase();
        
        // Örnek promosyon kodları
        const promoCodes = {
            'WELCOME10': 0.10, // %10 indirim
            'SPECIAL20': 0.20, // %20 indirim
            'SUMMER30': 0.30  // %30 indirim
        };
        
        if (promoCodes[promoCode]) {
            promoDiscount = promoCodes[promoCode];
            updateCartSummary();
            alert('Promosyon kodu başarıyla uygulandı!');
            promoInput.value = '';
            promoInput.disabled = true;
            document.getElementById('applyPromo').disabled = true;
        } else {
            alert('Geçersiz promosyon kodu!');
        }
    });
    
    // Siparişi tamamlama
    document.getElementById('checkoutBtn').addEventListener('click', () => {
        window.location.href = 'checkout.html';
    });
}

// Sepet sayısını güncelle
function updateCartCount() {
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    document.querySelector('.cart-count').textContent = cartCount;
} 