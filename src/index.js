// Main entry point for your application
import './styles/main.css';
import { initApp } from './modules/app';

// Initialize your application
document.addEventListener('DOMContentLoaded', initApp);

// Hot Module Replacement for development
if (module.hot) {
  module.hot.accept('./modules/app', () => {
    const newInitApp = require('./modules/app').initApp;
    newInitApp();
  });
}