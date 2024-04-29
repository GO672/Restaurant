// Function to set the rating score for a dish
const setRatingScore = async (dishId, ratingScore) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found in localStorage.');
    }

    const response = await fetch(`https://food-delivery.int.kreosoft.space/api/dish/${dishId}/rating?ratingScore=${ratingScore}`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    console.log(ratingScore);
    console.log('Rating score set successfully.');
  } catch (error) {
    console.error('There was a problem setting the rating score:', error);
  }
};

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

// Get the dish ID from the URL parameter
const dishId = getParameterByName('id');

fetch(`https://food-delivery.int.kreosoft.space/api/dish/${dishId}`)
  .then(response => {
      if (!response.ok) {
          throw new Error('Network response was not ok');
      }
      return response.json();
  })
  .then(data => {
      // Update HTML elements with dish details
      document.getElementById('dish-name').textContent = data.name;
      document.getElementById('dish-image').src = data.image;
      document.getElementById('dish-image').alt = data.name;
      document.getElementById('dish-category').textContent = `Category: ${data.category}`;
      document.getElementById('dish-price').textContent = `Price: ${data.price} ₽`;
      document.getElementById('dish-description').textContent = `Description: ${data.description}`;
      document.getElementById('dish-vegetarin').textContent = `${data.vegetarian ? 'Vegetarian' : 'Not Vegetarian'}`;

      // Generate rating input dynamically
      const ratingFieldset = document.createElement('div');
      ratingFieldset.classList.add('rate');
      ratingFieldset.setAttribute('data-dish-id', data.id);

      for (let i = 20; i > 0; i--) {
        const ratingInput = document.createElement('input');
        ratingInput.setAttribute('type', 'radio');
        ratingInput.setAttribute('id', `rating${i}-${data.id}`); // Include dish ID
        ratingInput.setAttribute('name', `${data.id}-rating`);
        ratingInput.disabled = true; // Initially disable the rating inputs
        const value = i % 2 === 0 ? i / 2 : (i + 1) / 2;
        ratingInput.setAttribute('value', `${value}`);

        const ratingLabel = document.createElement('label');
        ratingLabel.setAttribute('for', `rating${i}-${data.id}`); // Include dish ID
        ratingLabel.setAttribute('title', `${value} stars`);
        if (i % 2 !== 0) {
            ratingLabel.classList.add('half');
        }

        ratingFieldset.appendChild(ratingInput);
        ratingFieldset.appendChild(ratingLabel);
      }
       console.log(data.rating);
      const fullStars = Math.floor(data.rating);
      const halfStar = data.rating - fullStars >= 0.5;

      const ratingInputs = ratingFieldset.querySelectorAll('input');

      const fullStarIndex = 20 - fullStars * 2;

      // console.log(ratingInputs[fullStarIndex].checked)
      if(ratingInputs[fullStarIndex]) ratingInputs[fullStarIndex].checked = true;

      // If there's a half star, adjust index for half star
      if (halfStar) {
          if(ratingInputs[fullStarIndex]) ratingInputs[fullStarIndex - 1].checked = true;
      }

      const priceElement = document.getElementById('dish-price');
      priceElement.parentNode.insertBefore(ratingFieldset, priceElement);

      // Function to check if the user can rate the dish
      const checkRatingPermission = async (dishId) => {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            throw new Error('No token found in localStorage.');
          }

          const response = await fetch(`https://food-delivery.int.kreosoft.space/api/dish/${dishId}/rating/check`, {
            method: 'GET',
            headers: {
              'accept': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });

          if (!response.ok) {
            throw new Error('Network response was not ok');
          }

          const responseData = await response.json();
          return responseData;
        } catch (error) {
          console.error('There was a problem checking rating permission:', error);
          return null;
        }
      };

      checkRatingPermission(dishId)
        .then(responseData => {
          if (responseData) {
            ratingInputs.forEach(input => {
              input.disabled = false;
            });

            ratingFieldset.addEventListener('change', () => {
              const selectedRating = parseFloat(document.querySelector('input[name="' + data.id + '-rating"]:checked').value);
              setRatingScore(data.id, selectedRating);
              console.log(selectedRating);
            });
          }
        })
        .catch(error => {
          console.error('There was a problem checking rating permission:', error);
        });
  })
  .catch(error => {
      console.error('There was a problem fetching dish details:', error);
  });
