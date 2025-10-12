// Development configuration for Momentum app
// Set DEVELOPMENT_MODE to true to bypass authentication for UI testing

export const DEV_CONFIG = {
  // Set to true to bypass authentication and enable UI-only mode
  DEVELOPMENT_MODE: false, // Changed to true for testing all screens
  
  // Development scenario - choose which flow to test
  // 'new-user' - Shows: Index → Welcome → Onboarding → Home
  // 'returning-user' - Shows: Index → Home (skips Welcome & Onboarding)
  // 'onboarding-only' - Shows: Index → Onboarding → Home (skips Welcome)
  DEV_SCENARIO: 'new-user', // Change this to test different flows
  
  // Mock user data for development mode
  MOCK_USER: {
    id: 'dev-user-123',
    email: 'rajbeersaha.me@gmail.com',
    display_name: 'Developer User'
  }
};

// Helper function to check if we're in development mode
export const isDevelopmentMode = () => DEV_CONFIG.DEVELOPMENT_MODE;

// Helper function to get mock user data
export const getMockUser = () => DEV_CONFIG.MOCK_USER;

// Helper function to get development scenario
export const getDevScenario = () => DEV_CONFIG.DEV_SCENARIO;

// Helper function to get mock user with appropriate metadata based on scenario
export const getMockUserWithScenario = () => {
  const scenario = getDevScenario();
  const baseUser = getMockUser();
  
  switch (scenario) {
    case 'new-user':
      return {
        ...baseUser,
        user_metadata: {
          display_name: baseUser.display_name,
          welcome_seen: false,
          onboarding_completed: false
        }
      };
    case 'returning-user':
      return {
        ...baseUser,
        user_metadata: {
          display_name: baseUser.display_name,
          welcome_seen: true,
          onboarding_completed: true
        }
      };
    case 'onboarding-only':
      return {
        ...baseUser,
        user_metadata: {
          display_name: baseUser.display_name,
          welcome_seen: true,
          onboarding_completed: false
        }
      };
    default:
      return {
        ...baseUser,
        user_metadata: {
          display_name: baseUser.display_name,
          welcome_seen: false,
          onboarding_completed: false
        }
      };
  }
};