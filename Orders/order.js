// Function to fetch and display orders
const fetchAndDisplayOrders = async () => {
  // Retrieve token from local storage
  const token = localStorage.getItem('token');

  // Make sure token exists
  if (!token) {
    console.error('No token found in local storage.');
    return;
  }

  try {
    // Make GET request to fetch orders
    const response = await fetch('https://food-delivery.int.kreosoft.space/api/order', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(`Server responded with status ${response.status}: ${errorMessage}`);
    }

    // Parse response JSON
    const orders = await response.json();

    if (orders.length === 0) {
      // If there are no orders, display a message and hide the h1 element
      document.getElementById('orders-container').innerHTML = '<h5>No orders yet...)</h5>';
      document.querySelector('h1').style.display = 'none';
      return;
    }

    // Display orders on the page
    displayOrders(orders);
  } catch (error) {
    console.error('There was a problem fetching orders:', error);
  }
};

// Function to display orders on the page
const displayOrders = (orders) => {
  const ordersContainer = document.getElementById('orders-container');
  ordersContainer.innerHTML = ''; // Clear previous orders

  orders.forEach(order => {
    const orderElement = document.createElement('div');
    orderElement.classList.add('order');

    const orderTime = document.createElement('div');
    orderTime.textContent = `Order Time: ${order.orderTime}`;
    orderTime.classList.add('clickable'); // Add a class for styling and targeting
    orderElement.appendChild(orderTime);

    orderTime.addEventListener('click', async () => {
      window.location.href = `/orderDetails/orderD.html?id=${order.id}`;
    });

  

    const status = document.createElement('div');
    status.textContent = `Status: ${order.status}`;
    orderElement.appendChild(status);

    const showNotification = (message, duration = 1500) => {
      const notification = document.createElement('div');
      notification.textContent = message;
      notification.classList.add('notification');
      document.body.appendChild(notification);
    
      setTimeout(() => {
        notification.remove();
      }, duration);
    };

    // Check if status is "in process"
    if (order.status === 'InProcess') {
      const confirmButton = document.createElement('button');
      confirmButton.textContent = 'Confirm Order';
      orderElement.classList.add('order-with-button');
      confirmButton.addEventListener('click', async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            console.error('No token found in localStorage.');
            return;
          }

          const response = await fetch(`https://food-delivery.int.kreosoft.space/api/order/${order.id}/status`, {
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
          order.status = 'Delivered';
          status.textContent = `Status: ${order.status}`;
          showNotification('Order Confirmed successfully');
          
        } catch (error) {
          console.error('There was a problem confirming the order:', error);
        }
      });
      orderElement.appendChild(confirmButton);
    }

    // Delivery Time
    const deliveryTime = document.createElement('div');
    deliveryTime.textContent = `Expected Delivery Time: ${order.deliveryTime}`;
    orderElement.appendChild(deliveryTime);

    // Price
    const price = document.createElement('div');
    price.textContent = `Total Order Cost: ${order.price} ₽`;
    orderElement.appendChild(price);

    // Append order element to container
    ordersContainer.appendChild(orderElement);
  });
};


function closePopup() {
  // Hide the close button
  document.getElementById('close-popup').style.display = 'none';

  // Close the popup
  const popup = document.getElementById('popup-box');
  popup.style.display = 'none';
}
document.getElementById('close-popup').addEventListener('click', closePopup);


// Call fetchAndDisplayOrders function to fetch and display orders
fetchAndDisplayOrders();






document.getElementById('logout-link').addEventListener('click', function(event) {
  event.preventDefault(); // Prevent default action of the link

  // Retrieve the token from localStorage
  const token = localStorage.getItem('token');

  fetch('https://food-delivery.int.kreosoft.space/api/account/logout', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
      },
  })
  .then(response => {
      if (response.ok) {            
          localStorage.removeItem('token');
          window.location.href = '/Login/login.html';
      } else {
          console.error('Logout failed');
      }
  })
  .catch(error => {
      console.error('Error during logout:', error);
  });
});




// profile icon dropdown
document.querySelector('.select-dropdown1').addEventListener('click', function() {
  const dropdownContent = this.querySelector('.dropdown-content');
  dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
});

// Close dropdown content when clicking outside the dropdown
document.addEventListener('click', function(event) {
  const dropdowns = document.querySelectorAll('.select-dropdown1');
  dropdowns.forEach(function(dropdown) {
    if (!dropdown.contains(event.target)) {
      dropdown.querySelector('.dropdown-content').style.display = 'none';
    }
  });
});