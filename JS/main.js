import { initializeAuth } from './components/auth.js';
import { initializePeriodTracker } from './components/period-tracker.js';
import { initializeCalendar } from './components/calendar.js';
import { initializeReminders } from './components/reminders.js';

// Initialize all components when the DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Initialize auth first since other components depend on it
        await initializeAuth();
        
        // Initialize other components
        initializePeriodTracker();
        initializeCalendar();
        initializeReminders();
    } catch (error) {
        console.error('Error initializing application:', error);
    }
}); 