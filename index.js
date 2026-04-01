import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import { getDatabase, ref, push, onValue, remove } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js"

import { 
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDtvtvbbFoyK11uQHsyI4dmuHp-wWi3Jec",
  authDomain: "realtime-database-8ec8d.firebaseapp.com",
  databaseURL: "https://realtime-database-8ec8d-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "realtime-database-8ec8d",
  storageBucket: "realtime-database-8ec8d.appspot.com",
  messagingSenderId: "414125472687",
  appId: "1:414125472687:web:740bdd6033342ccd9bcd5a"
};

const app = initializeApp(firebaseConfig)
const database = getDatabase(app)
const shoppingListInDB = ref(database, "shoppingList")

const inputFieldEl = document.getElementById("input-field")
const addButtonEl = document.getElementById("add-button")
const shoppingListEl = document.getElementById("shopping-list")

// ------==========>> Authentication variables <<==========------
const auth = getAuth(app)
const viewLoggedOut = document.getElementById("logged-out-view")
const viewLoggedIn = document.getElementById("logged-in-view")
const emailInputEl = document.getElementById("email-input")
const passwordInputEl = document.getElementById("password-input")
const signInButtonEl = document.getElementById("sign-in-btn")
const createAccountButtonEl = document.getElementById("create-account-btn")
const signOutButtonEl = document.getElementById("sign-out-btn")
const signInWithGoogleButtonEl = document.getElementById("sign-in-with-google-btn")
const provider = new GoogleAuthProvider();

onAuthStateChanged(auth, (user) => {
  if (user) {
    showLoggedInView()
    onValue(shoppingListInDB, function(snapshot) {
    const loggedInSUerId = auth.currentUser.uid
    if (snapshot.exists()) {
        let itemsArray = Object.entries(snapshot.val())
        clearShoppingListEl()
        for (let i = 0; i < itemsArray.length; i++) {
            let currentItem = itemsArray[i]
            if (currentItem[1][1] === loggedInSUerId) {
                appendItemToShoppingListEl(currentItem)    
            }
        }    
    } else {
        shoppingListEl.innerHTML = "No items here... yet"
    }
})
  } else {
    showLoggedOutView()
  }
});

signInWithGoogleButtonEl.addEventListener("click", authSignInWithGoogle)
signInButtonEl.addEventListener("click", authSignInWithEmail)
createAccountButtonEl.addEventListener("click", authCreateAccountWithEmail)
signOutButtonEl.addEventListener("click", authSignOut)

addButtonEl.addEventListener("click", function() {
    const loggedInSUerId = auth.currentUser.uid
    let inputValue = [inputFieldEl.value, loggedInSUerId]
    push(shoppingListInDB, inputValue)
    clearInputFieldEl()
})

onValue(shoppingListInDB, function(snapshot) {
    const loggedInSUerId = auth.currentUser?.uid;
    if (snapshot.exists()) {
        let itemsArray = Object.entries(snapshot.val())
        clearShoppingListEl()
        for (let i = 0; i < itemsArray.length; i++) {
            let currentItem = itemsArray[i]
            if (currentItem[1][1] === loggedInSUerId) {
                appendItemToShoppingListEl(currentItem)    
            }
        }    
    } else {
        shoppingListEl.innerHTML = "No items here... yet"
    }
})

// ------==========>> Reminder Functinos <<==========------

function appendItemToShoppingListEl(item) {
    let itemID = item[0]
    let itemValue = item[1][0]
    let newEl = document.createElement("li")
    
    newEl.setAttribute("draggable", "true")
    newEl.textContent = itemValue
    
    newEl.addEventListener("dragstart", (ev) => {
        ev.dataTransfer.setData("text/plain", ev.target.id);
    });
    
    newEl.addEventListener("dblclick", function() {
        let exactLocationOfItemInDB = ref(database, `shoppingList/${itemID}`)    
        remove(exactLocationOfItemInDB)
    })
    
    newEl.addEventListener("dragend", function() {
        let exactLocationOfItemInDB = ref(database, `shoppingList/${itemID}`)    
        remove(exactLocationOfItemInDB)
    })
    
    shoppingListEl.append(newEl)
}

function clearShoppingListEl() {
    shoppingListEl.innerHTML = ""
}

function clearInputFieldEl() {
    inputFieldEl.value = ""
}


// ------==========>> Authentication <<==========------

function authSignInWithGoogle() {
    signInWithPopup(auth, provider)
        .then((result) => {
            
        }).catch((error) => {    
            console.error(error.message);
        });
}
function authCreateAccountWithEmail() {
    const email = emailInputEl.value;
    const password = passwordInputEl.value;
    
    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            clearAuthFields()
            console.log(`${email} is successfully registered`)
        })
        .catch((error) => {
            console.error(error.message)
        });
}
function authSignInWithEmail() {
    const email = emailInputEl.value;
    const password = passwordInputEl.value;
    
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            clearAuthFields()
        })
        .catch((error) => {
            console.error(error.message)
        });
}
function authSignOut() {
    signOut(auth).then(() => {
            clearShoppingListEl()
        }).catch((error) => {
            console.error(error.message)
        });
}

// ------==========>> Assistant Functions <<==========------

function showLoggedOutView() {
    viewLoggedIn.style.display = "none"
    viewLoggedOut.style.display = "flex"
}
function showLoggedInView() {
    viewLoggedIn.style.display = "flex"
    viewLoggedOut.style.display = "none"
}
function clearInputField(field) {
	field.value = ""
}
function clearAuthFields() {
	clearInputField(emailInputEl)
	clearInputField(passwordInputEl)
}