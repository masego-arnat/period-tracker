import { db } from '../services/firebase.js';
import { showNotification } from '../utils/notifications.js';
import { getCurrentUser } from './auth.js';
import { calculateHealthInsights } from './health-insights.js';

export function initializePeriodTracker() {
    document.getElementById('periodForm').addEventListener('submit', handlePeriodSubmit);
    setDefaultStartDate();
}

function handlePeriodSubmit(e) {
    e.preventDefault();
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
        showNotification("Please sign in first.", 'error');
        return;
    }

    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const symptoms = document.getElementById('symptoms').value;
    const flowIntensity = document.getElementById('flowIntensity').value;
    const mood = document.getElementById('mood').value;
    const medications = document.getElementById('medications').value;

    if (!startDate) {
        showNotification("Please enter a start date.", 'error');
        return;
    }

    db.collection("periods").add({
        userId: currentUser.uid,
        startDate: startDate,
        endDate: endDate || null,
        symptoms: symptoms || '',
        flowIntensity: flowIntensity,
        mood: mood,
        medications: medications || '',
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        showNotification("Period logged successfully!", 'success');
        document.getElementById('periodForm').reset();
        loadCycleHistory();
    }).catch((error) => {
        console.error("Error logging period:", error);
        showNotification("Error logging period. Please try again.", 'error');
    });
}

function setDefaultStartDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('startDate').value = today;
}

export function loadCycleHistory() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    $('#cycleHistoryTable').DataTable({
        ajax: function (data, callback, settings) {
            db.collection("periods")
                .where("userId", "==", currentUser.uid)
                .orderBy("timestamp", "desc")
                .get()
                .then(querySnapshot => {
                    const rows = querySnapshot.docs.map(doc => {
                        const data = doc.data();
                        return {
                            startDate: data.startDate,
                            endDate: data.endDate || 'Ongoing',
                            symptoms: data.symptoms || 'None',
                            actions: `
                                <button class="btn btn-sm btn-outline-primary me-2" onclick="openEditModal('${doc.id}', '${data.startDate}', '${data.endDate || ''}', '${data.symptoms || ''}')">
                                    ✏️ 
                                </button>
                                <button class="btn btn-sm btn-outline-danger" onclick="deletePeriod('${doc.id}')">
                                    🗑️ 
                                </button>
                            `
                        };
                    });
                    callback({ data: rows });
                })
                .catch(error => {
                    console.error("Error fetching data from Firestore:", error);
                    callback({ data: [] });
                });
        },
        columns: [
            { data: 'startDate' },
            { data: 'endDate' },
            { data: 'symptoms' },
            { data: 'actions', orderable: false }
        ],
        responsive: true,
        destroy: true
    });

    calculateHealthInsights();
}

export function deletePeriod(docId) {
    if (confirm('Are you sure you want to delete this period entry?')) {
        const deleteButton = document.querySelector(`button[onclick="deletePeriod('${docId}')"]`);
        if (deleteButton) {
            deleteButton.disabled = true;
            deleteButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Deleting...';
        }

        db.collection("periods").doc(docId).delete()
            .then(() => {
                showNotification("Period entry deleted", 'success');
                loadCycleHistory();
            })
            .catch((error) => {
                console.error("Error deleting period:", error);
                showNotification("Error deleting entry", 'error');
                if (deleteButton) {
                    deleteButton.disabled = false;
                    deleteButton.innerHTML = '🗑️';
                }
            });
    }
} 