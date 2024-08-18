import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-analytics.js";
import {
    getAuth,
    signOut,
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js";
import {
    getFirestore,
    doc,
    getDocs,
    collection
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
// your firebase config here
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth();
const db = getFirestore();

let allBlogs = []


function main(){
    let user = JSON.parse(localStorage.getItem('user'))
    console.log(user);

    let LoginLink = document.getElementById("LoginLink")
    let SignupLink = document.getElementById("SignupLink")
    let logoutBtn = document.getElementById("logoutBtn")
    
    let LoginLinkMob = document.getElementById("LoginLinkMob")
    let SignupLinkMob = document.getElementById("SignupLinkMob")
    let logoutBtnMob = document.getElementById("logoutBtnMob")
    
    if(user){
        LoginLink.style.display = "none"
        SignupLink.style.display = "none"
        logoutBtn.classList.remove("hidden")
        
        
        LoginLinkMob.style.display = "none"
        SignupLinkMob.style.display = "none"
        logoutBtnMob.classList.remove("hidden")
    }
}

main()



window.toggleMenu = () => {
    const menu = document.getElementById('mobile-menu');
    menu.classList.toggle('hidden');
}


window.logout = () => {
    signOut(auth)
        .then(() => {
            main();
            localStorage.removeItem("user")
            localStorage.removeItem("blogId")
            window.location.reload()
        })
        .catch((err) => {
            alert(err.message)
        })
}

const getBlogs = async () => {
    const reference = collection(db, "blogs");
    const dt = await getDocs(reference);

    dt.forEach(item => {
        let obj = {
            id: item.id,
            ...item.data(),
        }
        allBlogs.push(obj)
    })

    // console.log(latestBlogs);
    renderBlogs()

}
getBlogs()

const renderBlogs = () => {
    let blogList = document.getElementById("blogList")

    allBlogs.forEach(obj => {
        // console.log(obj.id); 
        
        blogList.innerHTML += `<div class="bg-white shadow-lg overflow-hidden">
                <img src="${obj.image}" alt="${obj.title, obj.catogory}" class="w-full h-48 object-cover">
                <div class="p-6">
                    <div class="flex justify-between items-center">
                        <h3 class="font-bold text-xl mb-2">${obj.title}</h3>
                        <p>Author: <span class="font-semibold text-gray-700">${obj.userName.toUpperCase()}</span></p>
                    </div>
                    <p class="text-gray-700 mb-4">${obj.content.substring(0,70)}..</p>
                    <a href="./pages/Blogs/BlogPage/page.html" onclick="getId('${obj.id}')" class="text-indigo-500 hover:text-indigo-700 font-semibold">Read More</a>
                </div>
            </div>`
    })
}

window.getId = (id) => {
    localStorage.setItem('blogId', id);
    console.log(id);
}