let page = 1;
let totalPages = pagination.count;
const defaultSortingOption = 'NameAsc';
let isVegetarian = false;


function parseURLParams(url) {
    const params = new URLSearchParams(url.search);
    const queryParams = {};
    for (const [key, value] of params.entries()) {
        queryParams[key] = value;
    }
    return queryParams;
}


function parseCategoryFilterFromURLAndUpdateUI() {
    const urlParams = new URLSearchParams(window.location.search);
    const categories = urlParams.getAll('categories');
    const categoryItems = document.querySelectorAll('.list-items .item');

    // Uncheck all category items
    categoryItems.forEach(item => {
        item.classList.remove('checked');
    });

    categories.forEach(category => {
        const categoryItem = document.querySelector(`.item-text#${category}`);
        if (categoryItem) {
            categoryItem.parentElement.classList.add('checked');
        }
    });

    updateSelectedCategoriesCount();
}

function updateSelectedCategoriesCount() {
    let checked = document.querySelectorAll(".checked");
    let btnText = document.querySelector(".btn-text");

    if (checked && checked.length > 0) {
        btnText.innerHTML = `${checked.length} selected`;
    } else {
        btnText.innerHTML = "Select";
    }
}

function parseSortingFromURLAndUpdateSelectButton() {
    const urlParams = new URLSearchParams(window.location.search);
    const sortingMethod = urlParams.get('sorting');
    if (sortingMethod) {
        const sortingOption = document.getElementById(sortingMethod);
        if (sortingOption) {
            sortingOption.checked = true;
            const selectButton = document.querySelector('.select-button');
            selectButton.querySelector('.selected-value').textContent = sortingOption.labels[0].textContent;
        }
    }
}

function parsePageNumberFromURLAndUpdatePagination() {
    const urlParams = new URLSearchParams(window.location.search);
    const pageNumber = parseInt(urlParams.get('page'));
    if (!isNaN(pageNumber)) {
        page = pageNumber;
    }
}

function parseVegetarianFilterFromURLAndUpdateUI() {
    const urlParams = new URLSearchParams(window.location.search);
    const isVegetarianParam = urlParams.get('vegetarian');
    if (isVegetarianParam !== null) {
        isVegetarian = isVegetarianParam === 'true';
    }
    document.getElementById('is-vegetarian').checked = isVegetarian;
}


window.addEventListener('DOMContentLoaded', () => {
    parseVegetarianFilterFromURLAndUpdateUI();
    parseSortingFromURLAndUpdateSelectButton();
    parsePageNumberFromURLAndUpdatePagination();
    parseCategoryFilterFromURLAndUpdateUI();
    

    document.querySelector('.filter-btn').addEventListener('click', function() {
        isVegetarian = document.getElementById('is-vegetarian').checked;
        document.getElementById('is-vegetarian').addEventListener('change', function() {
            isVegetarian = this.checked;
        });
    
        const selectedCategories = Array.from(document.querySelectorAll('.list-items .item.checked'))
            .map(item => item.querySelector('.item-text').textContent);
        const isVegetarianSoup = isVegetarian && selectedCategories.length === 1 && selectedCategories[0] === 'Soup';
    
        if (isVegetarianSoup) {
            alert('Sorry, there are no vegetarian soups available.');
        } else {
            page = 1; 
            fetchData(page);
        }
    });

    fetchData(page);
});


function fetchData(pageNumber) {
    const sortingOption = document.querySelector('.select-dropdown input[type="radio"]:checked');
    
    const params = new URLSearchParams();
    if (isVegetarian) params.set('vegetarian', isVegetarian);
    params.set('page', pageNumber);
    
    const selectedCategories = Array.from(document.querySelectorAll('.list-items .item.checked'))
        .map(item => item.querySelector('.item-text').textContent);
    selectedCategories.forEach(category => {
        params.append('categories', category);
    });

    if (sortingOption && sortingOption.id !== "None")
        params.append('sorting', sortingOption.id);
    else params.delete('sorting');

    // Update URL with new parameters
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
    
    const cartDataMap = new Map();

    const getDishes = () => {
    fetch(`https://food-delivery.int.kreosoft.space/api/dish?${params.toString()}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            totalPages = data.pagination.count;
            let cards = document.getElementById("cards");
            cards.innerHTML = '';

            const sortedDishes = data.dishes;

            const filteredDishes = sortedDishes.filter(dish => {
                return selectedCategories.length === 0 || selectedCategories.includes(dish.category);
            });
            

            filteredDishes.forEach((dish) => {
                const card = document.createElement('div');
                card.classList.add("card");
                const image = document.createElement('img');
                image.src = dish.image;
                const container = document.createElement('div');
                container.classList.add('container');
                const name = document.createElement('div');
                name.classList.add('name');
                name.textContent = dish.name;
                const category = document.createElement('div');
                category.classList.add('category');
                category.textContent = `Category: ${dish.category}`;

                const ratingFieldset = document.createElement('div');
                ratingFieldset.classList.add('rate');
                // Use dish ID as part of the rating elements' IDs
                ratingFieldset.setAttribute('data-dish-id', dish.id);

                for (let i = 20; i > 0; i--) {
                    const ratingInput = document.createElement('input');
                    ratingInput.setAttribute('type', 'radio');
                    ratingInput.setAttribute('id', `rating${i}-${dish.id}`); // Include dish ID
                    ratingInput.setAttribute('name', `${dish.id}-rating`);
                    const value = i % 2 === 0 ? i / 2 : (i + 1) / 2;
                    ratingInput.setAttribute('value', `${value}`);

                    const ratingLabel = document.createElement('label');
                    ratingLabel.setAttribute('for', `rating${i}-${dish.id}`); // Include dish ID
                    ratingLabel.setAttribute('title', `${value} stars`);
                    if (i % 2 !== 0) {
                        ratingLabel.classList.add('half');
                    }

                    ratingFieldset.appendChild(ratingInput);
                    ratingFieldset.appendChild(ratingLabel);
                }

                const fullStars = Math.floor(dish.rating);
                const halfStar = dish.rating - fullStars >= 0.5;

                const ratingInputs = ratingFieldset.querySelectorAll('input');

                const fullStarIndex = 20 - fullStars * 2;

                // console.log(ratingInputs[fullStarIndex].checked)
                if(ratingInputs[fullStarIndex])ratingInputs[fullStarIndex].checked = true;

                if (halfStar) {
                    if(ratingInputs[fullStarIndex])ratingInputs[fullStarIndex - 1].checked = true;
                }

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


                const description = document.createElement('div');
                description.classList.add('Description');
                description.textContent = dish.description;
                const price = document.createElement('div');
                price.classList.add('price');
                price.textContent = `Price - ${dish.price} ₽`;


                card.addEventListener('click', (event) => {
                    // Check if the clicked element or any of its ancestors have the class 'rate'
                    if (!event.target.closest('.rate')) {
                        window.location.href = `/dish-info/dish-info.html?id=${dish.id}`;
                    }
                });


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
                      console.log(responseData);
                      return responseData;
                    } catch (error) {
                      console.error('There was a problem checking rating permission:', error);
                      return null;
                    }
                  };
            
                  checkRatingPermission(dish.id)
                    .then(responseData => {
                        // Check if user can rate the dish
                        if (responseData) {
                            // Enable rating inputs
                            ratingInputs.forEach(input => {
                                input.disabled = false;
                            });

                            // Add event listener to each rating input
                            ratingInputs.forEach(ratingInput => {
                                ratingInput.addEventListener('click', (event) => {
                                    const selectedRating = parseFloat(event.target.value);
                                    setRatingScore(dish.id, selectedRating);
                                });
                            });
                        } else {
                            // User cannot rate the dish, make rating inputs read-only
                            ratingInputs.forEach(input => {
                                input.disabled = true;
                            });
                        }
                    })
                    .catch(error => {
                        console.error('There was a problem checking rating permission:', error);
                    });

            
                // Add to Cart Button
                const addToCartButton = document.createElement('button');
                addToCartButton.classList.add('add-to-cart-button');
                addToCartButton.textContent = 'Add';
            
                // Numeric Input with Buttons
                const numericInput = document.createElement('div');
                numericInput.classList.add('numeric-input');
                numericInput.style.display = 'none';
                const minusButton = document.createElement('button');
                minusButton.innerHTML = '<i class="fa-solid fa-minus"></i>';
                const numericDisplay = document.createElement('span');
                numericDisplay.classList.add('numeric-display');
                numericDisplay.textContent = cartDataMap.get(dish.name) || '0';
                const plusButton = document.createElement('button');
                plusButton.innerHTML = '<i class="fa-solid fa-plus"></i>';

            
                const toggleVisibility = () => {
                    if (numericDisplay.textContent === '0') {
                        addToCartButton.style.display = 'inline-block';
                        numericInput.style.display = 'none';
                    } else {
                        addToCartButton.style.display = 'none';
                        numericInput.style.display = 'flex';
                    }
                };
            
                plusButton.addEventListener('click', (event) => {
                    event.stopPropagation();
                    let value = parseInt(numericDisplay.textContent);
                    value++;
                    numericDisplay.textContent = value;
                    addToCart(dish.id);
                    toggleVisibility();
                });
                
                minusButton.addEventListener('click', (event) => {
                    event.stopPropagation(); 
                    let value = parseInt(numericDisplay.textContent);
                    value = Math.max(value - 1, 0);
                    numericDisplay.textContent = value;
                    decreaseQuantity(dish.id);
                    toggleVisibility();
                });
            
                numericInput.appendChild(minusButton);
                numericInput.appendChild(numericDisplay);
                numericInput.appendChild(plusButton);
            
                const addToCart = (dishId) => {
                    const token = localStorage.getItem('token');
                    if (!token) {
                      console.error('No token found in localStorage.');
                      return;
                    }
                  
                    fetch(`https://food-delivery.int.kreosoft.space/api/basket/dish/${dishId}`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                      }
                    })
                    .then(response => {
                      if (!response.ok) {
                        throw new Error('Network response was not ok');
                      }else{
                        console.log("a7a");
                        console.log(dish.id)
                      }
                      
                    })
                    .catch(error => {
                      console.error('There was a problem adding the dish to the cart:', error);
                    });
                  };

                  const decreaseQuantity = (dishId) => {
                    const token = localStorage.getItem('token');
                    if (!token) {
                      console.error('No token found in localStorage.');
                      return;
                    }

                    fetch(`https://food-delivery.int.kreosoft.space/api/basket/dish/${dishId}?increase=true`, {
                      method: 'DELETE',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                      }
                    })
                    .then(response => {
                      if (!response.ok) {
                        throw new Error('Network response was not ok');
                      }else{
                        console.log('a7a -');
                      }
                    })
                    .catch(error => {
                      console.error('There was a problem decreasing the quantity of the dish:', error);
                    });
                  };
                  
                  
                  addToCartButton.addEventListener('click', () => {
                    numericDisplay.textContent = '1';
                    event.stopPropagation();
                    toggleVisibility();
                    addToCart(dish.id);
                  });

                if (cartDataMap.has(dish.name)) {
                    numericDisplay.textContent = cartDataMap.get(dish.name);
                    toggleVisibility();
                }
            
                price.appendChild(addToCartButton);
                price.appendChild(numericInput);
            
                container.appendChild(name);
                container.appendChild(category);
                container.appendChild(ratingFieldset);
                container.appendChild(description);
                container.appendChild(price);
            
                card.appendChild(image);
                card.appendChild(container);
            
                cards.appendChild(card);
            });
            

            updatePagination();
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
    }
    
    const getCartData = () => {
        const token = localStorage.getItem('token');
        // if (!token) {
        //   console.error('No token found in localStorage.');
        //   return;
        // }
      
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
          for (let i = 0; i < data.length; i++) {
            cartDataMap.set(data[i].name, data[i].amount);
          }
        })
        .catch(error => {
          console.error('There was a problem fetching cart data:', error);
        })
        .finally(() => {
            getDishes();
        })
      };
      
      getCartData();
}

function updatePagination() {
    const scrollPosition = window.scrollY;
    let pagination = document.getElementById("pagination");
    pagination.innerHTML = '';

    const queryParams = parseURLParams(window.location);

    page = parseInt(queryParams.page) || 1;

    let prevButton = document.createElement('a');
    prevButton.href = "#";
    prevButton.textContent = '«';
    if (page > 1) {
        prevButton.addEventListener('click', function(event) {
            event.preventDefault();
            page--;
            fetchData(page);
            window.scrollTo(0, 0);
        });
        pagination.appendChild(prevButton);
    }

    let startPage = Math.max(1, page - 1);
    let endPage = Math.min(totalPages, startPage + 2);
    if (endPage === totalPages) {
        startPage = Math.max(1, endPage - 2);
    }

    for (let i = startPage; i <= endPage; i++) {
        let link = document.createElement('a');
        link.href = `#${i}`;
        link.textContent = i;
        if (i === page) {
            link.classList.add('active');
        }
        link.addEventListener('click', function(event) {
            event.preventDefault();
            page = i;
            fetchData(page);
            window.scrollTo(0, 0);
        });
        pagination.appendChild(link);
    }

    let nextButton = document.createElement('a');
    nextButton.href = "#";
    nextButton.textContent = '»';
    if (page < totalPages) {
        nextButton.addEventListener('click', function(event) {
            event.preventDefault();
            page++;
            fetchData(page);
            window.scrollTo(0, 0);
        });
        pagination.appendChild(nextButton);
    }

    window.scrollTo(0, scrollPosition);
}

// REMOVE THIS ENTIRE SECTION:
const selectbtn = document.querySelector(".select-btn");
const items = document.querySelectorAll(".item");

selectbtn.addEventListener("click", (e) => {
    e.stopPropagation();
    selectbtn.classList.toggle("open");
});

items.forEach((item) => {
    item.addEventListener("click", (e) => {
        e.stopPropagation();
        if (!e.target.classList.contains("checkbox")) {
            item.classList.toggle("checked");
        }

        let checked = document.querySelectorAll(".checked");
        let btnText = document.querySelector(".btn-text");

        if (checked && checked.length > 0) {
            btnText.innerHTML = `${checked.length} selected`;
        } else {
            btnText.innerHTML = "Select";
        }
    });
});

document.addEventListener("click", function (e) {
    if (!selectbtn.contains(e.target)) {
        selectbtn.classList.remove("open");
    }
});

const customSelect = document.querySelector(".custom-select");
const selectBtn = document.querySelector(".select-button");

const selectedValue = document.querySelector(".selected-value");
const optionsList = document.querySelectorAll(".select-dropdown li");

selectBtn.addEventListener("click", () => {
    customSelect.classList.toggle("active");
    selectBtn.setAttribute(
        "aria-expanded",
        selectBtn.getAttribute("aria-expanded") === "true" ? "false" : "true"
    );
});

optionsList.forEach((option) => {
    function handler(e) {
        if (e.type === "click" && e.clientX !== 0 && e.clientY !== 0) {
            const labelText = this.querySelector("label").textContent;
            selectedValue.textContent = labelText;
            e.stopPropagation();
        }
        if (e.key === "Enter") {
            selectedValue.textContent = this.textContent;
            e.stopPropagation();
        }
    }

    option.addEventListener("keyup", handler);
    option.addEventListener("click", handler);
});

document.addEventListener("click", function (e) {
    if (!customSelect.contains(e.target)) {
        customSelect.classList.remove("active");
        selectBtn.setAttribute("aria-expanded", "false");
    }
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

  document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');
    const profileDropdown = document.querySelector('.select-dropdown1');
    const signUpLink = document.querySelector('header nav ul li:nth-child(4)');
    const loginLink = document.querySelector('header nav ul li:nth-child(5)');

    if (token) {
        // User is logged in
        profileDropdown.style.display = 'block';
        signUpLink.style.display = 'none';
        loginLink.style.display = 'none';
    } else {
        // User is not logged in
        profileDropdown.style.display = 'none';
        signUpLink.style.display = 'block';
        loginLink.style.display = 'block';
    }
});

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



  
  
