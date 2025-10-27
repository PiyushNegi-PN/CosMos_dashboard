import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore, setDoc, doc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCTuZD5H2nvTKA4-iTLCPsyl0DJ7Gan1zI",
  authDomain: "roshan-3139a.firebaseapp.com",
  projectId: "roshan-3139a",
  storageBucket: "roshan-3139a.firebasestorage.app",
  messagingSenderId: "920064613682",
  appId: "1:920064613682:web:e5e504cc49445e33434b2b",
  measurementId: "G-JVYTER2243",
};

//intializing firebase
const app = initializeApp(firebaseConfig);

function showMessage(message, divId) {
  const messageDiv = document.getElementById(divId);
  messageDiv.style.display = "block";
  messageDiv.innerHTML = message;
  messageDiv.style.opacity = 1;
  setTimeout(() => {
    messageDiv.style.opacity = 0;
  }, 5000);
}

const auth = getAuth();
const db = getFirestore();

const signUp = document.getElementById("submitSignUp");
signUp.addEventListener("click", (event) => {
  event.preventDefault();

  const email = document.getElementById("rEmail").value;
  const password = document.getElementById("rPassword").value;
  const firstName = document.getElementById("fName").value;
  const lastName = document.getElementById("lName").value;

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;

      sendEmailVerification(user)
        .then(() => {
          showMessage(
            "Account created! Verification email sent. Check your inbox.",
            "signUpMessage"
          );
        })
        .catch((error) => {
          console.error("Error sending verification email:", error);
          showMessage("Error sending verification email.", "signUpMessage");
        });

      const userData = { email, firstName, lastName };
      const docRef = doc(db, "users", user.uid);
      setDoc(docRef, userData)
        .then(() => {
          console.log("User data saved in Firestore");
        })
        .catch((error) => console.error("Error writing document", error));

      document.getElementById("rEmail").value = "";
      document.getElementById("rPassword").value = "";
      document.getElementById("fName").value = "";
      document.getElementById("lName").value = "";
    })
    .catch((error) => {
      const errorCode = error.code;
      if (errorCode === "auth/email-already-in-use") {
        showMessage("Email Address Already Exists !!!", "signUpMessage");
      } else {
        showMessage("Unable to create User", "signUpMessage");
      }
    });
});

const signIn = document.getElementById("submitSignIn");
signIn.addEventListener("click", (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;

      if (!user.emailVerified) {
        showMessage(
          "Please verify your email before signing in. Check your inbox.",
          "signInMessage"
        );
        return;
      }

      showMessage("Login successful", "signInMessage");
      localStorage.setItem("loggedInUserId", user.uid);
      window.location.href = "homepage/main.html";
    })
    .catch((error) => {
      const errorCode = error.code;
      if (errorCode === "auth/invalid-credential") {
        showMessage("Incorrect Email or Password", "signInMessage");
      } else if (errorCode === "auth/user-not-found") {
        showMessage("Account does not exist", "signInMessage");
      } else {
        showMessage("Login failed. Try again.", "signInMessage");
      }
    });
});
