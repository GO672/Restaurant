// URLParams value object to encapsulate URL parameter parsing and access
class URLParams {
  constructor(url = window.location.href) {
    this.url = url;
    this.params = new URLSearchParams((new URL(url)).search);
  }

  // Get a parameter as a string (null if not present)
  getString(name) {
    const value = this.params.get(name);
    return value !== null ? value : null;
  }

  // Get a parameter as an integer (null if not present or invalid)
  getInt(name) {
    const value = this.getString(name);
    if (value === null) return null;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? null : parsed;
  }

  // Get a parameter as a boolean (false if not present)
  getBool(name) {
    const value = this.getString(name);
    return value === 'true';
  }

  // Get all values for a parameter (for arrays)
  getAll(name) {
    return this.params.getAll(name);
  }
}

// Initialize URLParams instance
const urlParams = new URLParams();

// Get the order ID from the URL parameter
const orderId = urlParams.getString('id');

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
