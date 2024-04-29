document.addEventListener('DOMContentLoaded', function () {
  const signInForm = document.getElementById('Sign-in');

  signInForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('new-password').value;

    const formData = {
      email: email,
      password: password
    };

    fetch('https://food-delivery.int.kreosoft.space/api/account/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Login failed');
        }
      })
      .then(data => {
        console.log('Login successful:', data);

        const token = data.token; 

        localStorage.setItem('token', token);

        // Redirect to the main page
        window.location.href = '/Almoúra.html';
      })
      .catch(error => {
        console.error('Login failed:', error);
      });
  });
});

