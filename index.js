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
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_DATABASE_URL,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID
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


// ------==========>> Dynamic Background & Image <<==========------

const reminderImageEl = document.querySelector(".reminder-image")

const TOTAL_ASSETS = 9

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function getRandomIntervalMs() {
    // Random interval between 4 and 10 seconds
    return getRandomInt(4000, 10000)
}

function setRandomBackground() {
    const index = getRandomInt(1, TOTAL_ASSETS)
    document.body.style.backgroundImage = `url("/assets/background/background${index}.png")`
}

function setRandomReminderImage() {
    const index = getRandomInt(1, TOTAL_ASSETS)
    reminderImageEl.src = `/assets/list_icon/icon${index}.png`
}

// function scheduleBackgroundChange() {
//     const delay = getRandomIntervalMs()
//     setTimeout(() => {
//         setRandomBackground()
//         scheduleBackgroundChange()
//     }, delay)
// }

// function scheduleReminderImageChange() {
//     const delay = getRandomIntervalMs()
//     setTimeout(() => {
//         setRandomReminderImage()
//         scheduleReminderImageChange()
//     }, delay)
// }

// Set initial random assets on load
setRandomBackground()
setRandomReminderImage()

// Start the dynamic change loops
// scheduleBackgroundChange()
// scheduleReminderImageChange()