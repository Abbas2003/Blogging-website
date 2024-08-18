import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-analytics.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  // Your firebase config here
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth();
const db = getFirestore();


let username = document.getElementById("username")
let email = document.getElementById("email")
let password = document.getElementById("password")


window.signup = () => {
  let obj = {
    username: username.value,
    email: email.value,
    password: password.value,
  }

  console.log(obj);

  createUserWithEmailAndPassword(auth, obj.email, obj.password)
  .then((res) => {
    obj.id = res.user.uid;

    const reference = doc(db, 'users', obj.id);
    setDoc(reference, obj)
    .then(()=>{
      console.log("data sended successfully");
      setTimeout(() => {
        window.location.replace('../login/login.html');
      }, 3000);
    })
    .catch((e)=>{
      console.log(e.message);
    })

     
  })
  .catch((e) => {
    alert(e.message)
  })
}