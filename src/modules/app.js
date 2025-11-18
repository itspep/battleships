// Example module structure
export function initApp() {
    console.log('Application initialized');
    
    // Your application logic here
    setupEventListeners();
    loadInitialData();
  }
  
  function setupEventListeners() {
    // Set up your event listeners
  }
  
  function loadInitialData() {
    // Load initial data for your app
  }
  
  // Export for testing and HMR
  export { setupEventListeners, loadInitialData };