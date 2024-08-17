import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-analytics.js";
import {
    getAuth,
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js";
import {
    getFirestore,
    collection, addDoc, getDocs, getDoc, doc, query, deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
//   Firebase config here 
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth();
const db = getFirestore();


const blogId = localStorage.getItem('blogId')
console.log(blogId);


let getBlog = async (blogId) => {
    try {
        // Create a reference to the document
        const docRef = doc(db, "blogs", blogId);

        // Fetch the document
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            // Document data
            console.log("Blog data:", docSnap.data());
            const blog = docSnap.data();

            // Example: Render product details on the page
            renderBlog(blog);
        } else {
            // No document found
            console.log("No such document!");
        }
    } catch (error) {
        console.error("Error fetching document:", error.message);
    }
};

getBlog(blogId)

function renderBlog(blog) {
    let blogContainer = document.getElementById('blogContainer')
    blogContainer.innerHTML = ''
    blogContainer.innerHTML += `<!-- Blog Title -->
            <div class="flex justify-around items-center">
                <h1 class="text-4xl font-bold mb-6 text-gray-900">${blog.title}</h1>
                <div class="">
                    <button onclick="editBlog('${blog.id}')" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Edit</button>
                    <button onclick="deleteBlog('${blog.id}')" class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Delete</button>
                </div>
            </div>
            
            <!-- Blog Image -->
            <div class="mb-6">
                <img src="${blog.image}" alt="${blog.title}" class="w-full h-auto rounded-lg">
            </div>
            
            <!-- Blog Meta Information -->
            <div class="flex items-center text-sm text-gray-500 mb-6">
                <span class="mr-4">
                    <strong>By:</strong> ${blog.userName}
                </span>
                <span class="mr-4">
                    <strong>Date:</strong> ${blog.date}
                </span>
                <span>
                    <strong>Category:</strong> ${blog.category}
                </span>
            </div>
            
            <!-- Blog Content -->
            <div class="blog-content leading-relaxed text-gray-700">
                ${blog.content}
            </div>`
}



let comments = [];

// Handle review submission
const commentForm = document.getElementById('commentForm');
commentForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    let name = document.getElementById("name")
    let email = document.getElementById("email")
    let comment = document.getElementById("comment")
    const date = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format

    const newReview = {
        name: name.value,
        email: email.value,
        comment: comment.value,
        date: date,
    };

    try {
        // Assume productId is obtained from URL or elsewhere
        const id = blogId;

        // Add a new document to the reviews subcollection for this product
        const docRef = await addDoc(collection(db, 'blogs', id, 'comments'), newReview);

        console.log('Comment added with ID:', docRef.id);

        // Add the new review to the reviews array and re-render
        comments.push(newReview);
        console.log(newReview);
        renderComments();

        // Show the notification
        showNotification();

        // Clear form fields
        name.value = ''
        email.value = ''
        comment.value = ''

    } catch (error) {
        console.error('Error adding comment:', error);
    }
});

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


// Function to render comments
function renderComments() {
    const commentsList = document.getElementById('commentsList');
    commentsList.innerHTML = '';

    comments.forEach((review) => {
        const reviewItem = document.createElement('div');
        reviewItem.className = 'bg-gray-300 p-4 rounded-lg my-4';

        reviewItem.innerHTML = `
      <p class="text-lg font-semibold">${review.name} <span class="text-sm text-gray-500">(${review.date})</span></p>
      <p class="text-gray-700">${review.comment}</p>
    `;

        commentsList.appendChild(reviewItem);
    });
}

// Funtion to Delete the blog
window.deleteBlog = async (id) => {
    const confirmation = confirm("Are you sure you want to delete this blog?");
    if (confirmation) {
        try {
            const reference = doc(db, 'blogs', id);
            console.log("Document reference:", reference);

            await deleteDoc(reference);
            console.log("Blog deleted");

            alert("Blog deleted successfully!");
            location.reload(); // Refresh to update the list of blogs
        } catch (error) {
            console.error("Error deleting blog:", error.message);
            alert("Error deleting blog: " + error.message);
        }
    }
}


// Funtion to Edit the blog
window.editBlog = async (id) => {
    const reference = doc(db, 'blogs', id);
    const docSnap = await getDoc(reference);

    if (docSnap.exists()) {
        const blogData = docSnap.data();
        
        // Populate form fields with the blog data
        title.value = blogData.title;
        category.value = blogData.category;
        content.value = blogData.content;

        // Update the form submission to save changes instead of creating a new blog
        window.submitBlog = async () => {
            if (!user || !user.username) {
                alert("You must be logged in to update a blog.");
                return;
            }

            try {
                await updateDoc(reference, {
                    title: title.value,
                    category: category.value,
                    content: content.value,
                    date: `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`,
                });

                alert("Blog updated successfully!");
                location.reload(); // Refresh to update the list of blogs
            } catch (error) {
                alert("Error updating blog: " + error.message);
            }
        }
    } else {
        alert("No such blog found!");
    }
}



// Load reviews from Firestore on page load
window.addEventListener('load', async () => {

    try {
        let q = query(collection(db, 'blogs', blogId, 'comments'));
        let querySnapshot = await getDocs(q);

        comments = querySnapshot.docs.map(doc => doc.data());
        renderComments();
    } catch (error) {
        console.error('Error fetching reviews:', error);
    }
});


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


