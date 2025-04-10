// Siparişleri localStorage'dan al
let orders = JSON.parse(localStorage.getItem('orders') || '[]');

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
    // Siparişleri göster
    displayOrders();

    // Filtreleri ayarla
    setupFilters();
});

// Siparişleri göster
function displayOrders(filteredOrders = orders) {
    const ordersList = document.getElementById('ordersList');
    const noOrders = document.getElementById('noOrders');

    // Sipariş yoksa mesaj göster
    if (filteredOrders.length === 0) {
        ordersList.style.display = 'none';
        noOrders.style.display = 'block';
        return;
    }

    // Sipariş varsa listeyi göster
    ordersList.style.display = 'flex';
    noOrders.style.display = 'none';

    // Siparişleri tarihe göre sırala (en yeniden en eskiye)
    filteredOrders.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Sipariş kartlarını oluştur
    ordersList.innerHTML = filteredOrders.map(order => `
        <div class="order-card">
            <div class="order-header">
                <div class="order-info">
                    <img src="${order.restaurant.image}" alt="${order.restaurant.name}">
                    <div>
                        <h3>${order.restaurant.name}</h3>
                        <span class="order-date">${formatDate(order.date)}</span>
                    </div>
                </div>
                <span class="order-status status-${getOrderStatus(order)}">${getStatusText(order)}</span>
            </div>
            <div class="order-content">
                <div class="order-items">
                    ${order.items.map(item => `
                        <div class="order-item">
                            <div class="order-item-info">
                                <h4>${item.name}</h4>
                                <span class="order-item-quantity">${item.quantity} adet</span>
                            </div>
                            <div class="order-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
                        </div>
                    `).join('')}
                </div>
                <div class="order-total">
                    <span class="total-amount">Toplam: $${order.total.toFixed(2)}</span>
                    <div class="order-actions">
                        ${getOrderActions(order)}
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    // Sipariş aksiyonlarını ayarla
    setupOrderActions();
}

// Filtreleri ayarla
function setupFilters() {
    const statusFilter = document.getElementById('statusFilter');
    const dateFilter = document.getElementById('dateFilter');

    statusFilter.addEventListener('change', filterOrders);
    dateFilter.addEventListener('change', filterOrders);
}

// Siparişleri filtrele
function filterOrders() {
    const statusFilter = document.getElementById('statusFilter').value;
    const dateFilter = document.getElementById('dateFilter').value;

    let filteredOrders = orders;

    // Durum filtresi
    if (statusFilter !== 'all') {
        filteredOrders = filteredOrders.filter(order => getOrderStatus(order) === statusFilter);
    }

    // Tarih filtresi
    if (dateFilter !== 'all') {
        const today = new Date();
        const orderDate = new Date();

        filteredOrders = filteredOrders.filter(order => {
            orderDate.setTime(new Date(order.date).getTime());
            const diffTime = Math.abs(today - orderDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            switch (dateFilter) {
                case 'today':
                    return diffDays === 0;
                case 'week':
                    return diffDays <= 7;
                case 'month':
                    return diffDays <= 30;
                case 'year':
                    return diffDays <= 365;
                default:
                    return true;
            }
        });
    }

    displayOrders(filteredOrders);
}

// Sipariş durumunu al
function getOrderStatus(order) {
    // Örnek olarak rastgele durum atıyoruz
    const statuses = ['pending', 'preparing', 'delivering', 'delivered', 'cancelled'];
    return statuses[Math.floor(Math.random() * statuses.length)];
}

// Durum metnini al
function getStatusText(order) {
    const status = getOrderStatus(order);
    const statusTexts = {
        pending: 'Beklemede',
        preparing: 'Hazırlanıyor',
        delivering: 'Yolda',
        delivered: 'Teslim Edildi',
        cancelled: 'İptal Edildi'
    };
    return statusTexts[status];
}

// Sipariş aksiyonlarını al
function getOrderActions(order) {
    const status = getOrderStatus(order);
    let actions = '';

    if (status === 'pending' || status === 'preparing') {
        actions += `<button class="cancel-btn" data-order-id="${order.id}">İptal Et</button>`;
    }

    if (status === 'delivered') {
        actions += `<button class="reorder-btn" data-order-id="${order.id}">Tekrar Sipariş Ver</button>`;
    }

    return actions;
}

// Sipariş aksiyonlarını ayarla
function setupOrderActions() {
    // İptal butonu
    document.querySelectorAll('.cancel-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const orderId = e.target.dataset.orderId;
            if (confirm('Bu siparişi iptal etmek istediğinizden emin misiniz?')) {
                cancelOrder(orderId);
            }
        });
    });

    // Tekrar sipariş ver butonu
    document.querySelectorAll('.reorder-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const orderId = e.target.dataset.orderId;
            reorder(orderId);
        });
    });
}

// Siparişi iptal et
function cancelOrder(orderId) {
    // Gerçek uygulamada burada API çağrısı yapılır
    console.log('Sipariş iptal edildi:', orderId);
    alert('Siparişiniz iptal edildi.');
}

// Tekrar sipariş ver
function reorder(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (order) {
        // Sepeti temizle
        localStorage.removeItem('cart');
        
        // Siparişi sepete ekle
        localStorage.setItem('cart', JSON.stringify(order.items));
        
        // Restoran sayfasına yönlendir
        window.location.href = `restaurant.html?id=${order.restaurant.id}`;
    }
}

// Tarihi formatla
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
} 