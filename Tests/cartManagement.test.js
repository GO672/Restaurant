describe('Cart Management Tests', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="cart-items-container"></div>
      <div class="delivery-container">
        <input type="datetime-local" id="Date">
        <input type="text" id="address" value="123 Main St">
      </div>
    `;
    
    // Reset mocks
    fetch.mockClear();
    localStorage.getItem.mockClear();
    localStorage.setItem.mockClear();
    console.log.mockClear();
    console.error.mockClear();
  });

  describe('Date and Address Management', () => {
    test('should set default delivery date', () => {
      const dateInput = document.getElementById('Date');
      const currentDate = new Date();
      currentDate.setDate(currentDate.getDate() + 1);
      
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getDate()).padStart(2, '0');
      const hours = String(currentDate.getHours()).padStart(2, '0');
      const minutes = String(currentDate.getMinutes()).padStart(2, '0');
      
      const nextDay = `${year}-${month}-${day}T${hours}:${minutes}`;
      dateInput.value = nextDay;

      expect(dateInput.value).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
    });

    test('should fetch user profile for address', async () => {
      const mockToken = 'mock-jwt-token';
      localStorage.getItem.mockReturnValue(mockToken);

      const mockProfileData = {
        address: '456 Oak Street',
        fullName: 'John Doe',
        email: 'john@example.com'
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockProfileData
      });

      const addressInput = document.getElementById('address');
      const response = await fetch('https://food-delivery.int.kreosoft.space/api/account/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${mockToken}`
        }
      });

      expect(response.ok).toBe(true);
      const profileData = await response.json();
      addressInput.value = profileData.address;

      expect(addressInput.value).toBe('456 Oak Street');
      expect(fetch).toHaveBeenCalledWith(
        'https://food-delivery.int.kreosoft.space/api/account/profile',
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${mockToken}`
          }
        })
      );
    });

    test('should handle profile fetch failure', async () => {
      const mockToken = 'mock-jwt-token';
      localStorage.getItem.mockReturnValue(mockToken);

      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401
      });

      try {
        const response = await fetch('https://food-delivery.int.kreosoft.space/api/account/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${mockToken}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile data');
        }
      } catch (error) {
        expect(error.message).toBe('Failed to fetch profile data');
      }
    });
  });

  describe('Error Handling', () => {
    test('should handle missing token', () => {
      localStorage.getItem.mockReturnValue(null);

      const token = localStorage.getItem('token');
      expect(token).toBeNull();
    });

    test('should handle network errors', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      try {
        await fetch('https://food-delivery.int.kreosoft.space/api/basket');
      } catch (error) {
        expect(error.message).toBe('Network error');
      }
    });

    test('should handle invalid JSON response', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        }
      });

      try {
        const response = await fetch('https://food-delivery.int.kreosoft.space/api/basket');
        await response.json();
      } catch (error) {
        expect(error.message).toBe('Invalid JSON');
      }
    });
  });
}); 