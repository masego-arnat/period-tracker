// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();



if (firebase.auth().currentUser) {
    db.collection("KitNumbers").doc(firebase.auth().currentUser.uid).get()
        .then(document => {
            console.log(document.data());
        })
        .catch(error => console.error(error));
}
else {

    console.log("damn nigga ")
}
