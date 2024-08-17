import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-analytics.js";
import {
    getAuth, signOut
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-storage.js";
import {
    getFirestore,
    collection, addDoc, getDocs
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    // Firebase config here
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth();
const db = getFirestore();
const storage = getStorage()

let title = document.getElementById('title')
let category = document.getElementById('category')
let content = document.getElementById('content')
let file_upload = document.getElementById("file_upload")
let user = JSON.parse(localStorage.getItem('user'))

const date = new Date()
let allBlogs = []

const getBlogs = async () => {
    const reference = collection(db, "blogs");
    const dt = await getDocs(reference);

    dt.forEach(item => {
        let obj = {
            id: item.id,
            ...item.data(),
        }
        // Filter blogs by the logged-in user
        if (obj.userName === user.username) {
            allBlogs.push(obj);
        }
    })

    console.log(allBlogs);
    renderBlogs()

}
getBlogs()

// const renderBlogs = () => {
//     let blogList = document.getElementById("blogList")

//     allBlogs.forEach(obj => {
//         // console.log(obj.id);

//         blogList.innerHTML += `<div onclick="getId('${obj.id}')" class="bg-white rounded-lg shadow-lg flex flex-col md:flex-row items-center p-5 mb-6 hover:shadow-2xl transition">
//         <!-- Blog Content -->
//         <div class="md:w-2/3 w-full md:pr-6">
//                     <h2 class="text-3xl font-bold text-gray-900 mb-2">${obj.title}</h2>
//                     <p class="text-gray-600 mb-4">by <span class="font-semibold">${obj.userName}</span> on <span class="font-semibold">${obj.date}</span></p>
//                     <p class="mb-2">Category <span class="text-red-500 font-semibold">${obj.category}</span></p>
//                     <p class="text-gray-700">${obj.content.substring(0, 150)} <a href="./BlogPage/page.html" class="text-indigo-500 hover:text-indigo-700 font-semibold">Continue reading...</a></p>
//                 </div>
//                 <!-- Blog Image -->
//                 <div class="md:w-1/3 w-full mt-4 md:mt-0">
//                     <img src="${obj.image}" alt="Blog Image" class="rounded-lg object-cover w-full h-full">
//                 </div>
//                  </div>`
//     })
// }

const renderBlogs = () => {
    let blogList = document.getElementById("blogList");
    blogList.innerHTML = ''; // Clear the list before rendering

    allBlogs.forEach(obj => {
        blogList.innerHTML += `
            <div class="bg-white rounded-lg shadow-lg flex flex-col md:flex-row items-center p-5 mb-6 hover:shadow-2xl transition" onclick="getId('${obj.id}')">
                <!-- Blog Content -->
                <div class="md:w-2/3 w-full md:pr-6">
                    <h2 class="text-3xl font-bold text-gray-900 mb-2">${obj.title}</h2>
                    <p class="text-gray-600 mb-4">by <span class="font-semibold">${obj.userName}</span> on <span class="font-semibold">${obj.date}</span></p>
                    <p class="mb-2">Category <span class="text-red-500 font-semibold">${obj.category}</span></p>
                    <p class="text-gray-700">${obj.content.substring(0, 150)} <a href="./BlogPage/page.html" class="text-indigo-500 hover:text-indigo-700 font-semibold">Continue reading...</a></p>
                </div>
                <!-- Blog Image -->
                <div class="md:w-1/3 w-full mt-4 md:mt-0">
                    <img src="${obj.image}" alt="Blog Image" class="rounded-lg object-cover w-full h-full">
                </div>
            </div>`;
    });
}



window.getId = (id) => {
    localStorage.setItem('blogId', id)
    window.location.replace('./BlogPage/page.html')
    console.log(id);
}

window.submitBlog = () => {
    // Check if user is logged in
    if (!user || !user.username) {
        alert("You must be logged in to write a blog.");
        return;
    }

    let blog = {
        title: title.value,
        category: category.value,
        content: content.value,
        date: `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`,
        userName: user.username,
    }

    // console.log(blog);
    // console.log(user);
    uploadFile()
        .then(async (url) => {
            blog.image = url
            const reference = collection(db, 'blogs');
            const res = await addDoc(reference, blog)
            console.log(res);
            showNotification();
        })
        .catch((e) => {
            alert(e.message)
        })

    title.value = ''
    content.value = ''
    category.innerHTML = ''
    file_upload.innerHTML = ''
}

// Function to upload images on firebase storage
window.uploadFile = () => {
    return new Promise((resolve, reject) => {
        let files = file_upload.files[0]
        console.log(files)
        const randomNum = Math.random().toString().slice(2);

        const storageRef = ref(storage, `images/${randomNum}`)
        var uploadTask = uploadBytesResumable(storageRef, files)

        uploadTask.on('state_changed',
            (snapshot) => {
                // Observe state change events such as progress, pause, and resume
                // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress + '% done');
                switch (snapshot.state) {
                    case 'paused': // or 'paused'
                        console.log('Upload is paused');
                        break;
                    case 'running': // or 'running'
                        console.log('Upload is running');
                        break;
                }
            },
            (error) => {
                // Handle unsuccessful uploads
                alert(error.message)
                reject(error)
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    console.log('Files is available at', downloadURL);
                    resolve(downloadURL)
                })
            }
        );
    });

}

// Function to toggle hamburger
window.toggleMenu = () => {
    const menu = document.getElementById('mobile-menu');
    menu.classList.toggle('hidden');
}

// Function to show the blog notification
function showNotification() {
    const notification = document.getElementById('blogNotification');
    notification.style.opacity = '1';
    notification.style.visibility = 'visible';

    // Hide the notification after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.visibility = 'hidden';
    }, 3000);
}



function main() {
    // let user = JSON.parse(localStorage.getItem('user'))
    renderBlogs()
    console.log(user);

    let LoginLink = document.getElementById("LoginLink")
    let SignupLink = document.getElementById("SignupLink")
    let logoutBtn = document.getElementById("logoutBtn")

    let LoginLinkMob = document.getElementById("LoginLinkMob")
    let SignupLinkMob = document.getElementById("SignupLinkMob")
    let logoutBtnMob = document.getElementById("logoutBtnMob")

    if (user) {
        LoginLink.style.display = "none"
        SignupLink.style.display = "none"
        logoutBtn.classList.remove("hidden")


        LoginLinkMob.style.display = "none"
        SignupLinkMob.style.display = "none"
        logoutBtnMob.classList.remove("hidden")
    }
}

main()


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

