var form = document.getElementById('registration-form');
    
      form.addEventListener('submit', function(event) {
        event.preventDefault();
    
        var fullName = document.getElementById("fullName").value;
        var gender = document.querySelector('input[name="Male-Female"]:checked').value;
        var phoneNumber= document.getElementById("phoneNumber").value;
        var birthDate = document.getElementById("birthDate").value;
        var address = document.getElementById("address").value;
        var email = document.getElementById("email").value;
        var password = document.getElementById("new-password").value;
    
        var formData = {
          fullName: fullName,
          gender: gender,
          phoneNumber: phoneNumber,
          birthDate: birthDate,
          address: address,
          email: email,
          password: password
        };
    
        fetch("https://food-delivery.int.kreosoft.space/api/account/register", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        })
        .then(response => {
          if (response.ok) {
            console.log(formData);
            console.log('Network response was  ok');
      
          }
          else{
            console.log('Network response a7a error');
          }
          
          return response.json();
          
        })
        .then(data => {
          console.log('Registration successful:', data);
          var token = data.token;
          localStorage.setItem('token', token);
          window.location.href = '/Almoúra.html';
        })
        .catch(error => {
          console.error('Registration failed:', error);
        });
      });