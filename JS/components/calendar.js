import { db } from '../services/firebase.js';
import { getCurrentUser } from './auth.js';

let calendar = null;

export function initializeCalendar() {
    const calendarEl = document.getElementById('calendar');
    if (!calendarEl) return;

    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek'
        },
        events: function(info, successCallback, failureCallback) {
            const currentUser = getCurrentUser();
            if (!currentUser) {
                successCallback([]);
                return;
            }

            db.collection("periods")
                .where("userId", "==", currentUser.uid)
                .get()
                .then(querySnapshot => {
                    const events = querySnapshot.docs.map(doc => {
                        const data = doc.data();
                        return {
                            title: 'Period',
                            start: data.startDate,
                            end: data.endDate || data.startDate,
                            backgroundColor: '#ff6b9d',
                            borderColor: '#c44569'
                        };
                    });
                    successCallback(events);
                })
                .catch(error => {
                    console.error("Error fetching calendar events:", error);
                    failureCallback(error);
                });
        }
    });

    calendar.render();
}

export function syncWithCalendar() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        showNotification("Please sign in first.", 'error');
        return;
    }

    // Here you would implement calendar sync logic
    // This is a placeholder for the actual implementation
    showNotification("Calendar sync feature coming soon!", 'success');
} 