// Initialize Firebase
// const firebaseConfig = {
//     apiKey: "YOUR_API_KEY",
//     authDomain: "YOUR_AUTH_DOMAIN",
//     projectId: "YOUR_PROJECT_ID",
//     storageBucket: "YOUR_STORAGE_BUCKET",
//     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
//     appId: "YOUR_APP_ID"
// };
const firebaseConfig = {
    apiKey: "AIzaSyD2lun6Fle6g_No3vd50Ser6lp4l7yxxXw",
    authDomain: "movieapp-d4e7b.firebaseapp.com",
    databaseURL: "https://movieapp-d4e7b-default-rtdb.firebaseio.com",
    projectId: "movieapp-d4e7b",
    storageBucket: "movieapp-d4e7b.appspot.com",
    messagingSenderId: "456049902625",
    appId: "1:456049902625:web:7f7cfe094ac660d5230f60",
    measurementId: "G-BKTH5DMHGB"
};

const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth(app);
let currentUser = null;

// Google Sign-In
document.getElementById('googleSignIn').addEventListener('click', () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
        .then((result) => {
            currentUser = result.user;
            console.log('User signed in:', currentUser);
            updateUI();
        })
        .catch((error) => {
            console.error("Error signing in:", error);
            alert("Failed to sign in. Please try again.");
        });
});

// Sign-Out
document.getElementById('signOut').addEventListener('click', () => {
    auth.signOut()
        .then(() => {
            currentUser = null;
            console.log('User signed out');
            updateUI();
        })
        .catch((error) => {
            console.error("Error signing out:", error);
        });
});

// Track Auth State Changes
auth.onAuthStateChanged((user) => {
    currentUser = user;
    updateUI();
});

// Update UI Based on Auth State
function updateUI() {
    const googleSignInBtn = document.getElementById('googleSignIn');
    const signOutBtn = document.getElementById('signOut');

    if (currentUser) {
        googleSignInBtn.classList.add('d-none');
        signOutBtn.classList.remove('d-none');
        alert(`Welcome, ${currentUser.displayName}!`);
        // Load user-specific data (e.g., cycle history)
        loadCycleHistory();
    } else {
        googleSignInBtn.classList.remove('d-none');
        signOutBtn.classList.add('d-none');
    }
}

// Log Period Data
document.getElementById('periodForm').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!currentUser) {
        alert("Please sign in first.");
        return;
    }

    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const symptoms = document.getElementById('symptoms').value;

    db.collection("periods").add({
        userId: currentUser.uid,
        startDate: startDate,
        endDate: endDate,
        symptoms: symptoms,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        alert("Period logged successfully!");
        document.getElementById('periodForm').reset();
        loadCycleHistory();
    }).catch((error) => {
        console.error("Error logging period:", error);
    });
});

// Load Cycle History
function loadCycleHistory() {
    const cycleHistory = document.getElementById('cycleHistory');
    cycleHistory.innerHTML = '';

    db.collection("periods")
        .where("userId", "==", currentUser.uid)
        .orderBy("timestamp", "desc")
        .get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const li = document.createElement('li');
                li.className = 'list-group-item';
                li.textContent = `${data.startDate} to ${data.endDate}: ${data.symptoms || 'No symptoms logged'}`;
                cycleHistory.appendChild(li);
            });
        })
        .catch((error) => {
            console.error("Error loading history:", error);
        });
} 