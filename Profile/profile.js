// API Service to centralize HTTP requests and eliminate data clumps
class ProfileApiService {
  constructor() {
    this.baseUrl = 'https://food-delivery.int.kreosoft.space/api';
  }

  // Get authentication token
  getAuthToken() {
    return localStorage.getItem('token');
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.getAuthToken();
  }

  // Get common headers for authenticated requests
  getAuthHeaders() {
    const token = this.getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }
    return {
      'Authorization': `Bearer ${token}`
    };
  }

  // Get common headers for JSON requests
  getJsonHeaders() {
    return {
      'Content-Type': 'application/json'
    };
  }

  // Get authenticated JSON headers
  getAuthJsonHeaders() {
    return {
      ...this.getJsonHeaders(),
      ...this.getAuthHeaders()
    };
  }

  // Fetch user profile
  async fetchUserProfile() {
    try {
      const response = await fetch(`${this.baseUrl}/account/profile`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile data');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching profile data:', error);
      throw error;
    }
  }

  // Update user profile
  async updateUserProfile(profileData) {
    try {
      const response = await fetch(`${this.baseUrl}/account/profile`, {
        method: 'PUT',
        headers: this.getAuthJsonHeaders(),
        body: JSON.stringify(profileData)
      });

      if (!response.ok) {
        throw new Error('Failed to update profile data');
      }

      return true;
    } catch (error) {
      console.error('Error updating profile data:', error);
      throw error;
    }
  }

  // Logout user
  async logout() {
    try {
      const response = await fetch(`${this.baseUrl}/account/logout`, {
        method: 'POST',
        headers: this.getAuthJsonHeaders()
      });

      if (!response.ok) {
        throw new Error('Logout failed');
      }

      localStorage.removeItem('token');
      return true;
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  }
}

// Profile UI Service to handle DOM manipulations
class ProfileUIService {
  constructor(apiService) {
    this.apiService = apiService;
  }

  // Update profile UI with user data
  updateProfileUI(profileData) {
    // Update form fields
    document.getElementById('fullName').value = profileData.fullName;
    document.getElementById('birthDate').value = profileData.birthDate.split('T')[0];
    document.getElementById('address').value = profileData.address;
    document.getElementById('phoneNumber').value = profileData.phoneNumber;
    document.getElementById('gender').value = profileData.gender;
    document.getElementById('email').value = profileData.email;

    // Update display spans
    const fullNameSpans = document.querySelectorAll('.fullName');
    fullNameSpans.forEach(span => {
      span.textContent = profileData.fullName;
    });

    // Disable non-editable fields
    document.getElementById('gender').disabled = true;
    document.getElementById('email').disabled = true;
  }

  // Get profile data from form
  getProfileDataFromForm() {
    return {
      fullName: document.getElementById('fullName').value,
      birthDate: document.getElementById('birthDate').value,
      address: document.getElementById('address').value,
      phoneNumber: document.getElementById('phoneNumber').value
    };
  }

  // Show notification
  showNotification(message, isSuccess = true) {
    if (isSuccess) {
      alert('Profile information updated successfully!');
    } else {
      alert(`Error: ${message}`);
    }
  }
}

// Profile Controller to orchestrate profile operations
class ProfileController {
  constructor() {
    this.apiService = new ProfileApiService();
    this.uiService = new ProfileUIService(this.apiService);
    this.init();
  }

  // Initialize the profile page
  init() {
    if (!this.apiService.isAuthenticated()) {
      console.error('Token not found');
      return;
    }

    this.loadUserProfile();
    this.setupEventListeners();
  }

  // Load user profile data
  async loadUserProfile() {
    try {
      const profileData = await this.apiService.fetchUserProfile();
      this.uiService.updateProfileUI(profileData);
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  }

  // Update user profile
  async updateProfile() {
    try {
      const profileData = this.uiService.getProfileDataFromForm();
      await this.apiService.updateUserProfile(profileData);
      this.uiService.showNotification('Profile updated successfully', true);
    } catch (error) {
      this.uiService.showNotification(error.message, false);
    }
  }

  // Handle logout
  async handleLogout(event) {
    event.preventDefault();
    
    try {
      await this.apiService.logout();
      window.location.href = '/Login/login.html';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  // Setup event listeners
  setupEventListeners() {
    // Update profile button
    const updateProfileBtn = document.getElementById('updateProfileBtn');
    if (updateProfileBtn) {
      updateProfileBtn.addEventListener('click', () => this.updateProfile());
    }

    // Logout link
    const logoutLink = document.getElementById('logout-link');
    if (logoutLink) {
      logoutLink.addEventListener('click', (event) => this.handleLogout(event));
    }

    // Profile dropdown
    this.setupDropdownHandlers();
  }

  // Setup dropdown functionality
  setupDropdownHandlers() {
    const dropdown = document.querySelector('.select-dropdown1');
    if (dropdown) {
      dropdown.addEventListener('click', function() {
        const dropdownContent = this.querySelector('.dropdown-content');
        dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
      });
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', function(event) {
      const dropdowns = document.querySelectorAll('.select-dropdown1');
      dropdowns.forEach(function(dropdown) {
        if (!dropdown.contains(event.target)) {
          const dropdownContent = dropdown.querySelector('.dropdown-content');
          if (dropdownContent) {
            dropdownContent.style.display = 'none';
          }
        }
      });
    });
  }
}

// Initialize profile controller when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
  new ProfileController();
});
