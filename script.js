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

const signupPassword = document.getElementById('signup-password');
const signupConfirm = document.getElementById('signup-confirm');

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

// Improve toast function
function showToast(message, type = 'default', duration = 5000) {
    // Clear any existing toasts
    hideToast();
    
    // Small delay to ensure animation works
    setTimeout(() => {
        toast.className = 'toast show ' + type;
        toastMessage.textContent = message;
        toastProgress.style.animation = `progress ${duration / 1000}s linear`;
        
        setTimeout(() => {
            hideToast();
        }, duration);
    }, 100);
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
    document.body.classList.add('modal-open');
}

function hideModal() {
    authModal.style.display = 'none';
    document.body.classList.remove('modal-open');
}

// Update the activateTab function
function activateTab(tabId) {
    // Remove active class from all tabs and forms
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.auth-form').forEach(form => {
        form.classList.remove('active');
    });

    // Add active class to selected tab and form
    document.getElementById(`${tabId}-tab`).classList.add('active');
    document.getElementById(`${tabId}-form`).classList.add('active');
}

// Add tab click handlers
loginTab.addEventListener('click', () => activateTab('login'));
signupTab.addEventListener('click', () => activateTab('signup'));

// Update switch handlers
switchToSignup.addEventListener('click', (e) => {
    e.preventDefault();
    activateTab('signup');
});

switchToLogin.addEventListener('click', (e) => {
    e.preventDefault();
    activateTab('login');
}); // Add missing closing parenthesis

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

// Add click-outside functionality for modal
authModal.addEventListener('click', (e) => {
    if (e.target === authModal) {
        hideModal();
    }
});

// Prevent modal close when clicking inside the modal content
document.querySelector('.modal-content').addEventListener('click', (e) => {
    e.stopPropagation();
});

// Add ESC key support to close modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && authModal.style.display === 'flex') {
        hideModal();
    }
});

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
    
    // Get values and validate
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    
    if (!email || !password) {
        showToast('Please fill in all fields', 'error');
        return;
    }

    try {
        // Show loading state
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Logging in...';

        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        hideModal();
        showDashboard();
        userNameSpan.textContent = user.displayName || user.email.split('@')[0];
        showToast('Login successful!', 'success');

    } catch (error) {
        console.error("Login error:", error);
        let errorMessage = 'Login failed: ';
        
        switch (error.code) {
            case 'auth/invalid-email':
                errorMessage += 'Invalid email address';
                break;
            case 'auth/user-not-found':
                errorMessage += 'No account found with this email';
                break;
            case 'auth/wrong-password':
                errorMessage += 'Incorrect password';
                break;
            default:
                errorMessage += error.message;
        }
        
        showToast(errorMessage, 'error');
    } finally {
        // Reset button state
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Login';
    }
});

// Fix the validatePasswords function
function validatePasswords() {
    const password = signupPassword.value;
    const confirm = signupConfirm.value;
    const hasLettersAndNumbers = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password);

    // Reset styles
    signupPassword.style.borderColor = '#ddd';
    signupConfirm.style.borderColor = '#ddd';

    // Validate main password
    if (password.length >= 8 && hasLettersAndNumbers) {
        signupPassword.style.borderColor = 'var(--success-color)';
    } else if (password.length > 0) {
        signupPassword.style.borderColor = 'var(--error-color)';
    }

    // Validate confirm password
    if (confirm.length > 0) {
        if (password === confirm) {
            signupConfirm.style.borderColor = 'var(--success-color)';
            return true;
        } else {
            signupConfirm.style.borderColor = 'var(--error-color)';
        }
    }

    return password.length >= 8 && hasLettersAndNumbers && password === confirm;
}

// Real-time validation
signupPassword.addEventListener('input', validatePasswords);
signupConfirm.addEventListener('input', validatePasswords);

// Clean up event listeners
signupPassword.addEventListener('input', validatePasswords);
signupConfirm.addEventListener('input', validatePasswords);

signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('signup-username').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = signupPassword.value;
    const confirmPassword = signupConfirm.value;

    // Validate username
    if (username.length < 3 || username.length > 20) {
        showToast('Username must be between 3 and 20 characters', 'error');
        return;
    }

    // Validate email
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        showToast('Please enter a valid email address', 'error');
        return;
    }

    // Validate password and confirmation
    if (!validatePasswords()) {
        showToast('Please meet the password requirements', 'error');
        return;
    }

    try {
        // Show loading state
        const submitBtn = signupForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Signing up...';

        // Create user account
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Update profile
        await updateProfile(user, {
            displayName: username
        });

        // Store in Firestore
        await setDoc(doc(db, 'users', user.uid), {
            username: username,
            email: email,
            createdAt: serverTimestamp()
        });

        // Success actions
        hideModal();
        showDashboard();
        userNameSpan.textContent = username;
        showToast('Account created successfully!', 'success');
        
    } catch (error) {
        console.error("Signup error:", error);
        
        // Handle Firebase-specific errors
        let errorMessage = '';
        switch (error.code) {
            case 'auth/email-already-in-use':
                errorMessage = 'This email is already registered';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Please enter a valid email address';
                break;
            case 'auth/operation-not-allowed':
                errorMessage = 'Signup is currently disabled';
                break;
            case 'auth/weak-password':
                errorMessage = 'Password is too weak';
                break;
            default:
                errorMessage = error.message;
        }
        
        showToast(errorMessage, 'error');
    } finally {
        // Reset button state
        const submitBtn = signupForm.querySelector('button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign Up';
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

// Clear validation styles when switching forms
function clearValidationStyles() {
    signupPassword.style.borderColor = '#ddd';
    signupConfirm.style.borderColor = '#ddd';
    signupForm.reset();
    loginForm.reset();
}

// Add to your existing tab switching code
switchToLogin.addEventListener('click', () => {
    clearValidationStyles();
    activateTab('login');
});

switchToSignup.addEventListener('click', () => {
    clearValidationStyles();
    activateTab('signup');
});

document.addEventListener('DOMContentLoaded', () => {
    // Password toggle functionality
    const setupPasswordToggles = () => {
        document.querySelectorAll('.toggle-password').forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                const passwordField = e.target.closest('.password-field').querySelector('input');
                const type = passwordField.type === 'password' ? 'text' : 'password';
                passwordField.type = type;
                toggle.classList.toggle('fa-eye');
                toggle.classList.toggle('fa-eye-slash');
            });
        });
    };

    // Password strength checker
    const checkPasswordStrength = (password) => {
        let strength = 0;
        const requirements = {
            length: password.length >= 8,
            lowercase: /[a-z]/.test(password),
            uppercase: /[A-Z]/.test(password),
            number: /\d/.test(password),
            special: /[!@#$%^&*]/.test(password)
        };

        Object.values(requirements).forEach(req => {
            if (req) strength++;
        });

        return {
            score: strength,
            requirements
        };
    };

    // Update password strength indicators
    const updatePasswordStrength = (password, strengthEl, requirementsEl) => {
        const requirements = {
            length: password.length >= 8,
            lowercase: /[a-z]/.test(password),
            uppercase: /[A-Z]/.test(password),
            number: /\d/.test(password),
            special: /[!@#$%^&*]/.test(password)
        };

        let strength = Object.values(requirements).filter(Boolean).length;

        // Update strength bar
        strengthEl.className = 'password-strength';
        if (strength >= 5) strengthEl.classList.add('strong');
        else if (strength >= 3) strengthEl.classList.add('medium');
        else if (strength >= 1) strengthEl.classList.add('weak');

        // Update requirement list items
        const reqList = requirementsEl.querySelectorAll('li');
        reqList.forEach(item => {
            const requirement = item.dataset.requirement;
            const icon = item.querySelector('i');
            
            if (requirements[requirement]) {
                item.classList.remove('invalid');
                item.classList.add('valid');
                icon.className = 'fas fa-check';
            } else {
                item.classList.remove('valid');
                item.classList.add('invalid');
                icon.className = 'fas fa-times';
            }
        });

        // Return overall validation status
        return strength === 5;
    };

    // Form validation
    const validateForm = (formEl) => {
        const inputs = formEl.querySelectorAll('input[required]');
        let isValid = true;

        inputs.forEach(input => {
            const group = input.closest('.form-group');
            group.classList.remove('success', 'error');

            if (input.type === 'email') {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(input.value)) {
                    group.classList.add('error');
                    isValid = false;
                } else {
                    group.classList.add('success');
                }
            } else if (input.type === 'password') {
                const strengthScore = checkPasswordStrength(input.value).score;
                if (strengthScore < 3) {
                    group.classList.add('error');
                    isValid = false;
                } else {
                    group.classList.add('success');
                }
            } else if (!input.value.trim()) {
                group.classList.add('error');
                isValid = false;
            } else {
                group.classList.add('success');
            }
        });

        return isValid;
    };

    // Setup form handlers
    const setupForms = () => {
        const forms = document.querySelectorAll('.auth-form');
        forms.forEach(form => {
            const passwordField = form.querySelector('input[type="password"]');
            if (passwordField) {
                const strengthEl = form.querySelector('.password-strength');
                const requirementsEl = form.querySelector('.password-requirements');
                
                passwordField.addEventListener('input', () => {
                    updatePasswordStrength(passwordField.value, strengthEl, requirementsEl);
                });
            }

            form.addEventListener('submit', (e) => {
                e.preventDefault();
                if (validateForm(form)) {
                    // Proceed with form submission
                    console.log('Form is valid, proceeding with submission');
                }
            });
        });
    };

    // Add real-time password validation
    const passwordField = document.getElementById('signup-password');
    const strengthEl = document.querySelector('.password-strength');
    const requirementsEl = document.querySelector('.password-requirements');

    passwordField.addEventListener('input', (e) => {
        const isValid = updatePasswordStrength(e.target.value, strengthEl, requirementsEl);
        const formGroup = e.target.closest('.form-group');
        
        if (e.target.value.length > 0) {
            if (isValid) {
                formGroup.classList.add('success');
                formGroup.classList.remove('error');
            } else {
                formGroup.classList.add('error');
                formGroup.classList.remove('success');
            }
        } else {
            formGroup.classList.remove('success', 'error');
        }
    });

    // Initialize
    setupPasswordToggles();
    setupForms();
});