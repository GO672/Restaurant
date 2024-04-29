const displayCartItems = (cartData) => {
  const cartItemsContainer = document.getElementById('cart-items-container');
  const deliveryContainer = document.querySelector('.delivery-container');
  
  cartItemsContainer.innerHTML = '';

  if (cartData.length === 0) {
    // If cart is empty, display a message and hide the delivery container
    cartItemsContainer.innerHTML = '<h5>Cart is empty...)</h5>';
    deliveryContainer.style.display = 'none';
    return; // Exit the function
  }

  
  cartData.forEach(item => {
    const cartItem = document.createElement('div');
    cartItem.classList.add('cart-item');

    // Image
    const image = document.createElement('img');
    image.src = item.image;
    cartItem.appendChild(image);

    // Name
    const name = document.createElement('div');
    name.textContent = item.name;
    cartItem.appendChild(name);

    // Price
    const price = document.createElement('div');
    price.textContent = `Price: ${item.price} ₽`;
    cartItem.appendChild(price);

    // Numeric Input with Buttons
    const numericInput = document.createElement('div');
    numericInput.classList.add('numeric-input');
    const minusButton = document.createElement('button');
    minusButton.innerHTML = '<i class="fa-solid fa-minus"></i>';
    const numericDisplay = document.createElement('span');
    numericDisplay.classList.add('numeric-display');
    numericDisplay.textContent = item.amount;
    const plusButton = document.createElement('button');
    plusButton.innerHTML = '<i class="fa-solid fa-plus"></i>';

    minusButton.addEventListener('click', () => {
      let value = parseInt(numericDisplay.textContent);
      value = Math.max(value - 1, 0);
      numericDisplay.textContent = value;
      if (parseInt(numericDisplay.textContent) === 1) {
        minusButton.disabled = true;
      }
        decreaseQuantity(item.id);
    });
    
    if (parseInt(numericDisplay.textContent) === 1) {
      minusButton.disabled = true;
    }

    plusButton.addEventListener('click', () => {
      let value = parseInt(numericDisplay.textContent);
      value++;
      numericDisplay.textContent = value;
      if (parseInt(numericDisplay.textContent) !== 1) {
        minusButton.disabled = false;
      }
      addToCart(item.id);
    });
    

    cartItem.addEventListener('mouseenter', () => {
      cartItem.hoverTimeout = setTimeout(() => {
        cartItem.classList.add('show-trash');
      }, 100); // Add the class after a 0.3-second delay (300 milliseconds)
    });
    
    cartItem.addEventListener('mouseleave', () => {
      clearTimeout(cartItem.hoverTimeout); // Cancel the timeout if the mouse leaves before the timeout occurs
      cartItem.classList.remove('show-trash');
    });
    

    numericInput.appendChild(minusButton);
    numericInput.appendChild(numericDisplay);
    numericInput.appendChild(plusButton);
    cartItem.appendChild(numericInput);

    const totalPrice = document.createElement('div');
    totalPrice.textContent = `Total Price: ${item.totalPrice} ₽`;
    cartItem.appendChild(totalPrice);
    
    // Trash Icon
    const trashIcon = document.createElement('i');
    trashIcon.classList.add('fa-solid', 'fa-trash');
    trashIcon.addEventListener('click', () => {
      removeItemFromCart(item.id, cartItem);
    });
    cartItem.appendChild(trashIcon);

    cartItemsContainer.appendChild(cartItem);
  });
};

const removeItemFromCart = (dishId, cartItemElement) => {
  const token = localStorage.getItem('token');
  if (!token) {
      console.error('No token found in localStorage.');
      return;
  }

  fetch(`https://food-delivery.int.kreosoft.space/api/basket/dish/${dishId}?increase=false`, {
      method: 'DELETE',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
      }
  })
  .then(response => {
      if (!response.ok) {
          throw new Error('Network response was not ok');
      }
      // Remove the cart item from the DOM
      cartItemElement.remove();
      // Check if the cart is empty after removing the item
      const cartItems = document.querySelectorAll('.cart-item');
      if (cartItems.length === 0) {
          window.location.reload();
      }
  })
  .catch(error => {
      console.error('There was a problem removing the item from the cart:', error);
  });
};




let debounceTimer;

const debouncedFunction = async () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(async () => {
    await getCartData();
  }, 210);
};

const addToCart = async (dishId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found in localStorage.');
      return;
    }

    const response = await fetch(`https://food-delivery.int.kreosoft.space/api/basket/dish/${dishId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    console.log('Item added to cart successfully');
    debouncedFunction();
  } catch (error) {
    console.error('There was a problem adding the dish to the cart:', error);
  }
};


const decreaseQuantity = async (dishId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found in localStorage.');
      return;
    }

    const response = await fetch(`https://food-delivery.int.kreosoft.space/api/basket/dish/${dishId}?increase=true`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    console.log('Quantity decreased successfully');
    debouncedFunction();
  } catch (error) {
    console.error('There was a problem decreasing the quantity of the dish:', error);
  }
};


// Retrieve input values
const deliveryDateInput = document.getElementById('Date');
const addressInput = document.getElementById('address');
const createOrderButton = document.querySelector('.delivery-container button');

// Function to display a temporary notification
const showNotification = (message, duration = 1500) => {
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.classList.add('notification');
  document.body.appendChild(notification);

  // Automatically remove the notification after the specified duration
  setTimeout(() => {
    notification.remove();
    window.location.reload();
  }, duration);
};

// Event listener for create order button
createOrderButton.addEventListener('click', async () => {
  // Get delivery date and address values
  const deliveryTime = deliveryDateInput.value;
  const address = addressInput.value;

  // Create order object
  const orderData = {
    deliveryTime: deliveryTime,
    address: address
  };

  // Convert order data to JSON
  const jsonData = JSON.stringify(orderData);

  // Retrieve token from local storage
  const token = localStorage.getItem('token');

  // Make sure token exists
  if (!token) {
    console.error('No token found in local storage.');
    return;
  }

  try {
    // Make POST request to create order
    const response = await fetch('https://food-delivery.int.kreosoft.space/api/order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: jsonData
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    // Display notification on successful order creation
    showNotification('Order created successfully');
  } catch (error) {
    console.error('There was a problem creating the order:', error);
  }
});



// const increaseQuantity = () => {
//   const token = localStorage.getItem('token');
//   if (!token) {
//     console.error('No token found in localStorage.');
//     return;
//   }

//   fetch('https://food-delivery.int.kreosoft.space/api/basket', {
//     method: 'GET',
//     headers: {
//       'Authorization': `Bearer ${token}`
//     }
//   })
//   .then(response => {
//     if (!response.ok) {
//       throw new Error('Network response was not ok');
//     }
//     return response.json();
//   })
//   .then(data => {
//     // Process the cart data received from the server
//     console.log('Cart Data:', data);
//     displayCartItems(data);
//   })
//   .catch(error => {
//     console.error('There was a problem fetching cart data:', error);
//   });
// };

const getCartData = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('No token found in localStorage.');
    return;
  }

  fetch('https://food-delivery.int.kreosoft.space/api/basket', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    console.log('Cart Data:', data);
    displayCartItems(data);
  })
  .catch(error => {
    console.error('There was a problem fetching cart data:', error);
  });
};

getCartData();

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