// Development configuration for Momentum app
// Set DEVELOPMENT_MODE to true to bypass authentication for UI testing

export const DEV_CONFIG = {
  // Set to true to bypass authentication and enable UI-only mode
  DEVELOPMENT_MODE: false, // Change this to true when you want to test UI without auth
  
  // Mock user data for development mode
  MOCK_USER: {
    id: 'dev-user-123',
    email: 'dev@momentum.app',
    display_name: 'Developer User'
  }
};

// Helper function to check if we're in development mode
export const isDevelopmentMode = () => DEV_CONFIG.DEVELOPMENT_MODE;

// Helper function to get mock user data
export const getMockUser = () => DEV_CONFIG.MOCK_USER;