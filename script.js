// Add imports at the top
import { 
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    updateProfile,
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import { 
    collection,
    doc,
    setDoc,
    getDoc,
    addDoc,
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";
import { ref, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-storage.js";

// Remove Firebase config since it's now in index.html

// Use the global Firebase services
const auth = window.auth;
const db = window.db;
const storage = window.storage;

// DOM Elements
const preloader = document.querySelector('.preloader');
const navbar = document.getElementById('navbar');
const menuToggle = document.getElementById('menu-toggle');
const navLinks = document.querySelector('.nav-links');

const loginNavBtn = document.getElementById('login-nav-btn');
const signupNavBtn = document.getElementById('signup-nav-btn');
const getStartedBtn = document.getElementById('get-started-btn');
const learnMoreBtn = document.getElementById('learn-more-btn');

const authModal = document.getElementById('auth-modal');
const closeModal = document.querySelector('.close-modal');
const loginTab = document.getElementById('login-tab');
const signupTab = document.getElementById('signup-tab');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const switchToSignup = document.getElementById('switch-to-signup');
const switchToLogin = document.getElementById('switch-to-login');
const forgotPassword = document.querySelector('.forgot-password');


const dashboardSection = document.getElementById('dashboard');
const userNameSpan = document.getElementById('user-name');
const logoutBtn = document.getElementById('logout-btn');

const contactForm = document.getElementById('contact-form');

const year1Subjects = document.getElementById('year1-subjects');
const year2Subjects = document.getElementById('year2-subjects');
const yearBtns = document.querySelectorAll('.year-btn');

const toast = document.getElementById('toast');
const toastMessage = document.querySelector('.toast-message');
const toastProgress = document.querySelector('.toast-progress');

// Helper Functions

function showToast(message, type = 'default', duration = 5000) {
    toast.className = 'toast show';
    toast.classList.add(type); // 'success' or 'error'
    toastMessage.textContent = message;

    // Restart animation on each call
    toastProgress.style.animation = 'none';
    setTimeout(() => {
        toastProgress.style.animation = `progress ${duration / 1000}s linear`;
    }, 10); // Small delay to reset animation

    // Hide toast after duration
    setTimeout(() => {
        hideToast();
    }, duration);
}

function hideToast() {
    toast.className = 'toast';  // Remove 'show' and type classes
}

function showDashboard() {
    dashboardSection.classList.remove('hidden');
}

function hideDashboard() {
    dashboardSection.classList.add('hidden');
}

function showModal() {
    authModal.style.display = 'flex';
}

function hideModal() {
    authModal.style.display = 'none';
}

function activateTab(tabId) {
    const tabs = document.querySelectorAll('.auth-tab');
    const forms = document.querySelectorAll('.auth-form');

    tabs.forEach(tab => tab.classList.remove('active'));
    forms.forEach(form => form.classList.remove('active'));

    document.getElementById(tabId + '-tab').classList.add('active');
    document.getElementById(tabId + '-form').classList.add('active');
}

// Event Listeners

// Preloader
window.addEventListener('load', () => {
    setTimeout(() => {
        preloader.style.opacity = '0';
        preloader.style.visibility = 'hidden';
    }, 500);
});


// Navbar scrolling effect
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Mobile Menu Toggle
menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

// Authentication Modal
loginNavBtn.addEventListener('click', () => {
    showModal();
    activateTab('login');
});

signupNavBtn.addEventListener('click', () => {
    showModal();
    activateTab('signup');
});

getStartedBtn.addEventListener('click', () => {
    showModal();
    activateTab('signup');
});

learnMoreBtn.addEventListener('click', () => {
    // Redirect or scroll to the features section
    window.location.href = "#features";
});

closeModal.addEventListener('click', hideModal);

switchToSignup.addEventListener('click', () => activateTab('signup'));
switchToLogin.addEventListener('click', () => activateTab('login'));

// Year Selector
yearBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        yearBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        const year = this.dataset.year;

        if (year === 'year1') {
            year1Subjects.classList.remove('hidden');
            year2Subjects.classList.add('hidden');
        } else if (year === 'year2') {
            year1Subjects.classList.add('hidden');
            year2Subjects.classList.remove('hidden');
        }
    });
});


// Firebase Authentication

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log("Logged in:", user);

        hideModal();
        showDashboard();
        userNameSpan.textContent = user.email.split('@')[0];

        showToast('Login successful!', 'success');

    } catch (error) {
        console.error("Login error:", error);
        showToast('Login failed: ' + error.message, 'error');
    }
});

signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('signup-username').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm').value;

    if (password !== confirmPassword) {
        showToast("Passwords don't match!", 'error');
        return;
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Update profile with username
        await updateProfile(user, {
            displayName: username
        });

        // Store user data in Firestore
        await setDoc(doc(db, 'users', user.uid), {
            username: username,
            email: email
        });

        console.log("Signed up:", user);
        hideModal();
        showDashboard();
        userNameSpan.textContent = username;

        showToast('Signup successful!', 'success');
    } catch (error) {
        console.error("Signup error:", error);
        showToast('Signup failed: ' + error.message, 'error');
    }
});

logoutBtn.addEventListener('click', async () => {
    try {
        await signOut(auth);
        console.log("Logged out");
        hideDashboard();
        userNameSpan.textContent = 'Student';
        showToast('Logged out successfully!');
    } catch (error) {
        console.error("Logout error:", error);
        showToast('Logout failed: ' + error.message, 'error');
    }
});

// Contact Form Submission

contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;

    try {
        await addDoc(collection(db, 'contact'), {
            name: name,
            email: email,
            message: message,
            timestamp: serverTimestamp()
        });

        console.log("Contact form submitted");
        contactForm.reset();
        showToast('Message sent successfully!', 'success');

    } catch (error) {
        console.error("Contact form error:", error);
        showToast('Failed to send message: ' + error.message, 'error');
    }
});

// Download Button Functionality
document.querySelectorAll('.download-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
        e.preventDefault();
        const subject = btn.dataset.subject;
        const unit = btn.dataset.unit;
        const type = btn.dataset.type || 'unit';

        let filePath;
        if (type === 'unit') {
            filePath = `study_materials/${subject}/unit_${unit}.pdf`;
        } else if (type === 'model') {
            filePath = `model_papers/${subject}_model.pdf`;
        } else {
            showToast('Invalid file type!', 'error');
            return;
        }

        try {
            const storageRef = ref(storage, filePath);
            const downloadURL = await getDownloadURL(storageRef);
            window.open(downloadURL, '_blank');
            showToast('Downloading...', 'success');
        } catch (error) {
            console.error("Download error:", error);
            showToast('Download failed: ' + error.message, 'error');
        }
    });
});

// Authentication State Listener
onAuthStateChanged(auth, async user => {
    if (user) {
        showDashboard();
        hideModal();

        if (user.displayName) {
            userNameSpan.textContent = user.displayName;
        } else {
            try {
                const docSnap = await getDoc(doc(db, 'users', user.uid));
                if (docSnap.exists()) {
                    userNameSpan.textContent = docSnap.data().username;
                } else {
                    userNameSpan.textContent = user.email.split('@')[0];
                }
            } catch (error) {
                console.error("Error fetching username:", error);
                userNameSpan.textContent = user.email.split('@')[0];
            }
        }
    } else {
        hideDashboard();
        userNameSpan.textContent = 'Student';
    }
});