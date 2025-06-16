import { auth } from '../services/firebase.js';
import { showNotification } from '../utils/notifications.js';

let currentUser = null;

export function initializeAuth() {
    // Google Sign-In
    document.getElementById('googleSignIn').addEventListener('click', () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope('email');
        provider.addScope('profile');

        auth.signInWithPopup(provider)
            .then((result) => {
                currentUser = result.user;
                console.log('User signed in:', currentUser);
                showNotification(`Welcome, ${currentUser.displayName}!`, 'success');
                updateUI();
            })
            .catch((error) => {
                console.error("Error signing in:", error);
                showNotification("Failed to sign in. Please try again.", 'error');
            });
    });

    // Sign-Out
    document.getElementById('signOut').addEventListener('click', () => {
        auth.signOut()
            .then(() => {
                currentUser = null;
                console.log('User signed out');
                showNotification('Successfully signed out', 'success');
                updateUI();
            })
            .catch((error) => {
                console.error("Error signing out:", error);
                showNotification("Error signing out", 'error');
            });
    });

    // Track Auth State Changes
    auth.onAuthStateChanged((user) => {
        currentUser = user;
        updateUI();
    });
}

export function getCurrentUser() {
    return currentUser;
}

function updateUI() {
    const googleSignInBtn = document.getElementById('googleSignIn');
    const signOutBtn = document.getElementById('signOut');
    const userInfo = document.getElementById('userInfo');
    const cycleHistory = document.getElementById('cycleHistoryTable');
    const analyticsContent = document.getElementById('analyticsContent');

    if (currentUser) {
        googleSignInBtn.classList.add('d-none');
        signOutBtn.classList.remove('d-none');
        userInfo.innerHTML = `
            <div class="text-success">
                <small>Signed in as: ${currentUser.displayName}</small>
            </div>
        `;
        loadCycleHistory();
        analyticsContent.innerHTML = '<p>Click "View Analytics" to see your cycle trends.</p>';
        initializeCalendar();
        loadReminderSettings();
    } else {
        googleSignInBtn.classList.remove('d-none');
        signOutBtn.classList.add('d-none');
        userInfo.innerHTML = '';
        cycleHistory.innerHTML = '<li class="list-group-item text-muted">Sign in to view your cycle history</li>';
        analyticsContent.innerHTML = '<p class="text-muted">Sign in to view your cycle analytics.</p>';
    }
} 