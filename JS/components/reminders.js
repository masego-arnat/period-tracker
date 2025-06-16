import { db } from '../services/firebase.js';
import { showNotification } from '../utils/notifications.js';
import { getCurrentUser } from './auth.js';

export function initializeReminders() {
    document.getElementById('enableReminders').addEventListener('change', handleReminderToggle);
    document.getElementById('reminderSettings').addEventListener('submit', saveReminderSettings);
}

function handleReminderToggle() {
    const reminderSettings = document.getElementById('reminderSettings');
    if (this.checked) {
        reminderSettings.classList.remove('d-none');
        // Request notification permission
        if (Notification.permission !== 'granted') {
            Notification.requestPermission();
        }
    } else {
        reminderSettings.classList.add('d-none');
    }
}

export function saveReminderSettings() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        showNotification("Please sign in first.", 'error');
        return;
    }

    const settings = {
        enabled: document.getElementById('enableReminders').checked,
        daysBefore: document.getElementById('reminderDays').value,
        reminderTime: document.getElementById('reminderTime').value,
        remindEndDate: document.getElementById('remindEndDate').checked
    };

    db.collection("users").doc(currentUser.uid).set({
        reminderSettings: settings
    }, { merge: true })
    .then(() => {
        showNotification("Reminder settings saved!", 'success');
        scheduleReminders(settings);
    })
    .catch(error => {
        console.error("Error saving reminder settings:", error);
        showNotification("Error saving settings", 'error');
    });
}

function scheduleReminders(settings) {
    if (!settings.enabled) return;

    // Clear existing reminders
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(registration => {
            registration.getNotifications().then(notifications => {
                notifications.forEach(notification => notification.close());
            });
        });
    }

    // Schedule new reminders based on predictions
    const nextPeriod = document.getElementById('nextPeriodPrediction').textContent;
    if (nextPeriod && nextPeriod !== 'Need more data') {
        const predictedDate = new Date(nextPeriod.split('around ')[1]);
        const reminderDate = new Date(predictedDate);
        reminderDate.setDate(predictedDate.getDate() - parseInt(settings.daysBefore));

        const [hours, minutes] = settings.reminderTime.split(':');
        reminderDate.setHours(parseInt(hours), parseInt(minutes), 0);

        if (reminderDate > new Date()) {
            const timeUntilReminder = reminderDate.getTime() - new Date().getTime();
            setTimeout(() => {
                if (Notification.permission === 'granted') {
                    new Notification('Period Reminder', {
                        body: 'Your period is expected to start soon. Don\'t forget to prepare!',
                        icon: '🌸'
                    });
                }
            }, timeUntilReminder);
        }
    }
}

export function loadReminderSettings() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    db.collection("users").doc(currentUser.uid).get()
        .then(doc => {
            if (doc.exists && doc.data().reminderSettings) {
                const settings = doc.data().reminderSettings;
                document.getElementById('enableReminders').checked = settings.enabled;
                if (settings.enabled) {
                    document.getElementById('reminderSettings').classList.remove('d-none');
                    document.getElementById('reminderDays').value = settings.daysBefore;
                    document.getElementById('reminderTime').value = settings.reminderTime;
                    document.getElementById('remindEndDate').checked = settings.remindEndDate;
                }
            }
        })
        .catch(error => {
            console.error("Error loading reminder settings:", error);
        });
} 