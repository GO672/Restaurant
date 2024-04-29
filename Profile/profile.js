document.addEventListener('DOMContentLoaded', function () {
  const token = localStorage.getItem('token');
  if (token) {
    fetchUserProfile(token);
  } else {
    console.error('Token not found');
  }

  const updateProfileBtn = document.getElementById('updateProfileBtn');
  updateProfileBtn.addEventListener('click', updateProfile);
});

function fetchUserProfile(token) {
  fetch('https://food-delivery.int.kreosoft.space/api/account/profile', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Failed to fetch profile data');
    }
    return response.json();
  })
  .then(profileData => {
    updateProfileUI(profileData);
  })
  .catch(error => {
    console.error('Error fetching profile data:', error);
  });
}

function updateProfileUI(profileData) {
  document.getElementById('fullName').value = profileData.fullName;
  document.getElementById('birthDate').value = profileData.birthDate.split('T')[0];
  document.getElementById('address').value = profileData.address;
  document.getElementById('phoneNumber').value = profileData.phoneNumber;

  // Set value for gender and email inputs
  document.getElementById('gender').value = profileData.gender;
  document.getElementById('email').value = profileData.email;


  const fullNameSpans = document.querySelectorAll('.fullName');
  fullNameSpans.forEach(span => {
    span.textContent = profileData.fullName;
  });

  // Disable gender and email inputs
  document.getElementById('gender').disabled = true;
  document.getElementById('email').disabled = true;
}



function updateProfile() {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('Token not found');
    return;
  }

  const fullName = document.getElementById('fullName').value;
  const birthDate = document.getElementById('birthDate').value;
  const address = document.getElementById('address').value;
  const phoneNumber = document.getElementById('phoneNumber').value;

  const profileData = {
    fullName: fullName,
    birthDate: birthDate,
    address: address,
    phoneNumber: phoneNumber
  };

  fetch('https://food-delivery.int.kreosoft.space/api/account/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(profileData)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Failed to update profile data');
    } else {
      alert('Profile information updated successfully!');
    }
  })
  .catch(error => {
    console.error('Error updating profile data:', error);
  });
}




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