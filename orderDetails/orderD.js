// Function to get the value of a URL parameter
const getParameterByName = (name, url) => {
    if (!url) url = window.location.href;
    name = name.replace(/[[\]]/g, '\\$&');
    const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
};

// Get the order ID from the URL parameter
const orderId = getParameterByName('id');

// Fetch order details based on the order ID
fetch(`https://food-delivery.int.kreosoft.space/api/order/${orderId}`, {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
})
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(orderDetails => {
        document.getElementById('order-time').textContent = `Order Time: ${orderDetails.orderTime}`;
        document.getElementById('order-status').textContent = `Status: ${orderDetails.status}`;
        document.getElementById('expected-delivery-time').textContent = `Expected Delivery Time: ${orderDetails.deliveryTime}`;
        document.getElementById('total-order-cost').textContent = `Total Order Cost: ${orderDetails.price} ₽`;
        document.getElementById('address').textContent = `Address: ${orderDetails.address}`;

        const dishesList = document.getElementById('dishes-list');
        dishesList.innerHTML = orderDetails.dishes.map(dish => `
            <li style="display: flex; align-items: center;">
                <img src="${dish.image}" alt="${dish.name}">
                <span style="margin-left: 10px;">
                    ${dish.name} <div class="repo"> ${dish.amount} x ${dish.price} ₽ </div>  <div class="a7aa"> Total Price ${dish.totalPrice} ₽</div>
                </span>
            </li>
        `).join('');


        const showNotification = (message, duration = 1500) => {
            const notification = document.createElement('div');
            notification.textContent = message;
            notification.classList.add('notification');
            document.body.appendChild(notification);
          
            setTimeout(() => {
              notification.remove();
              window.location.href = `/Orders/order.html`;
            }, duration);
          };

        if (orderDetails.status === 'InProcess') {
            const confirmButton = document.createElement('button');
            confirmButton.textContent = 'Confirm Order';
            confirmButton.addEventListener('click', async () => {
              try {
                const token = localStorage.getItem('token');
                if (!token) {
                  console.error('No token found in localStorage.');
                  return;
                }
      
                const response = await fetch(`https://food-delivery.int.kreosoft.space/api/order/${orderDetails.id}/status`, {
                  method: 'POST',
                  headers: {
                    'accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                  body: ''
                });
      
                if (!response.ok) {
                  throw new Error('Network response was not ok');
                }
                confirmButton.style.visibility = 'hidden';
                orderDetails.status = 'Delivered';
                showNotification('Order Confirmed successfully');
                
              } catch (error) {
                console.error('There was a problem confirming the order:', error);
              }
            });
            document.body.appendChild(confirmButton);
          }
    })
    .catch(error => {
        console.error('There was a problem fetching order details:', error);
    });
