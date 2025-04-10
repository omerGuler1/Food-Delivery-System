// Son siparişi localStorage'dan al
const orders = JSON.parse(localStorage.getItem('orders') || '[]');
const lastOrder = orders[orders.length - 1];

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
    // Sipariş yoksa ana sayfaya yönlendir
    if (!lastOrder) {
        window.location.href = 'index.html';
        return;
    }

    // Restoran bilgilerini göster
    document.getElementById('restaurantImage').src = lastOrder.restaurant.image;
    document.getElementById('restaurantName').textContent = lastOrder.restaurant.name;
    document.getElementById('deliveryTime').textContent = lastOrder.restaurant.deliveryTime;

    // Sipariş öğelerini göster
    displayOrderItems();

    // Teslimat bilgilerini göster
    displayDeliveryInfo();
});

// Sipariş öğelerini göster
function displayOrderItems() {
    const orderItems = document.getElementById('orderItems');
    const subtotal = document.getElementById('subtotal');
    const deliveryFee = document.getElementById('deliveryFee');
    const total = document.getElementById('total');

    orderItems.innerHTML = '';
    let totalAmount = 0;

    lastOrder.items.forEach(item => {
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

// Teslimat bilgilerini göster
function displayDeliveryInfo() {
    document.getElementById('fullName').textContent = lastOrder.delivery.fullName;
    document.getElementById('phone').textContent = lastOrder.delivery.phone;
    document.getElementById('address').textContent = lastOrder.delivery.address;
    document.getElementById('instructions').textContent = lastOrder.delivery.instructions || 'Not bulunmuyor';
} 