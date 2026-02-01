// DOM Elements
const openingScreen = document.getElementById('opening-screen');
const mainInvitation = document.getElementById('main-invitation');
const openInvitationBtn = document.getElementById('open-invitation');
const musicToggle = document.getElementById('music-toggle');
const musicStatus = document.getElementById('music-status');
const backgroundMusic = document.getElementById('background-music');
const commentForm = document.getElementById('comment-form');
const commentsList = document.getElementById('comments-list');

// Gallery Variables (Opening Screen)
const gallerySlides = document.querySelectorAll('.gallery-slide');
const galleryDots = document.querySelectorAll('.dot');
const galleryPrev = document.querySelector('.gallery-prev');
const galleryNext = document.querySelector('.gallery-next');
let currentSlide = 0;

// Countdown Variables
const daysElement = document.getElementById('days');
const hoursElement = document.getElementById('hours');
const minutesElement = document.getElementById('minutes');
const secondsElement = document.getElementById('seconds');

// Wedding date (Programmer dapat mengubah tanggal ini)
const weddingDate = new Date('Februari 15, 2026 10:14:46').getTime();

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Initialize gallery
    initGallery();
    
    // Initialize countdown
    updateCountdown();
    setInterval(updateCountdown, 1000);
    
    // Load comments from localStorage
    loadComments();
    
    // Try to autoplay music with user interaction
    document.body.addEventListener('click', initAudio, { once: true });
    
    // Initialize floating nav functionality
    initFloatingNav();
});

// Open invitation button
openInvitationBtn.addEventListener('click', function() {
    openingScreen.classList.remove('active');
    mainInvitation.classList.add('active');
    
    // Start music when invitation is opened
    if (backgroundMusic.paused) {
        backgroundMusic.play().then(() => {
            musicStatus.textContent = 'Musik: ON';
        }).catch(error => {
            console.log('Autoplay prevented:', error);
        });
    }
    
    // Smooth scroll to top of main invitation
    window.scrollTo({top: 0, behavior: 'smooth'});
});

// Music toggle functionality
musicToggle.addEventListener('click', function() {
    if (backgroundMusic.paused) {
        backgroundMusic.play();
        musicStatus.textContent = 'Musik: ON';
    } else {
        backgroundMusic.pause();
        musicStatus.textContent = 'Musik: OFF';
    }
});

// Initialize audio with user interaction
function initAudio() {
    // Try to play audio after user interaction
    backgroundMusic.volume = 0.5;
    
    // If the invitation is already open, play music
    if (mainInvitation.classList.contains('active')) {
        backgroundMusic.play().then(() => {
            musicStatus.textContent = 'Musik: ON';
        }).catch(error => {
            console.log('Audio play prevented:', error);
        });
    }
}

// Gallery functionality for opening screen
function initGallery() {
    // Show first slide
    showSlide(currentSlide);
    
    // Next slide button
    galleryNext.addEventListener('click', function() {
        currentSlide = (currentSlide + 1) % gallerySlides.length;
        showSlide(currentSlide);
    });
    
    // Previous slide button
    galleryPrev.addEventListener('click', function() {
        currentSlide = (currentSlide - 1 + gallerySlides.length) % gallerySlides.length;
        showSlide(currentSlide);
    });
    
    // Dot indicators
    galleryDots.forEach((dot, index) => {
        dot.addEventListener('click', function() {
            currentSlide = index;
            showSlide(currentSlide);
        });
    });
    
    // Auto advance slides every 5 seconds
    setInterval(function() {
        currentSlide = (currentSlide + 1) % gallerySlides.length;
        showSlide(currentSlide);
    }, 5000);
}

function showSlide(index) {
    // Hide all slides
    gallerySlides.forEach(slide => {
        slide.classList.remove('active');
    });
    
    // Remove active class from all dots
    galleryDots.forEach(dot => {
        dot.classList.remove('active');
    });
    
    // Show current slide and activate corresponding dot
    gallerySlides[index].classList.add('active');
    galleryDots[index].classList.add('active');
}

// Countdown timer
function updateCountdown() {
    const now = new Date().getTime();
    const timeRemaining = weddingDate - now;
    
    // If wedding date has passed
    if (timeRemaining < 0) {
        daysElement.textContent = '00';
        hoursElement.textContent = '00';
        minutesElement.textContent = '00';
        secondsElement.textContent = '00';
        return;
    }
    
    // Calculate days, hours, minutes, seconds
    const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
    
    // Update display
    daysElement.textContent = days.toString().padStart(2, '0');
    hoursElement.textContent = hours.toString().padStart(2, '0');
    minutesElement.textContent = minutes.toString().padStart(2, '0');
    secondsElement.textContent = seconds.toString().padStart(2, '0');
}

// Comment form submission
commentForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const nameInput = document.getElementById('comment-name');
    const messageInput = document.getElementById('comment-message');
    
    const name = nameInput.value.trim();
    const message = messageInput.value.trim();
    const date = new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    
    if (name && message) {
        // Save comment to localStorage
        saveComment(name, message, date);
        
        // Add comment to display
        addCommentToDisplay(name, message, date);
        
        // Reset form
        nameInput.value = '';
        messageInput.value = '';
        
        // Show success message
        showNotification('Ucapan Anda berhasil dikirim! Terima kasih.');
    }
});

// Save comment to localStorage
function saveComment(name, message, date) {
    let comments = JSON.parse(localStorage.getItem('weddingComments')) || [];
    
    // Add new comment
    comments.unshift({
        name: name,
        message: message,
        date: date
    });
    
    // Keep only last 50 comments
    if (comments.length > 50) {
        comments = comments.slice(0, 50);
    }
    
    localStorage.setItem('weddingComments', JSON.stringify(comments));
}

// Load comments from localStorage
function loadComments() {
    const comments = JSON.parse(localStorage.getItem('weddingComments')) || [];
    
    // If no comments, show message
    if (comments.length === 0) {
        commentsList.innerHTML = '<p class="no-comments">Belum ada ucapan. Jadilah yang pertama mengucapkan selamat!</p>';
        return;
    }
    
    // Display comments
    comments.forEach(comment => {
        addCommentToDisplay(comment.name, comment.message, comment.date);
    });
}

// Add comment to display
function addCommentToDisplay(name, message, date) {
    // Remove "no comments" message if present
    const noCommentsMsg = commentsList.querySelector('.no-comments');
    if (noCommentsMsg) {
        noCommentsMsg.remove();
    }
    
    // Create comment element
    const commentElement = document.createElement('div');
    commentElement.className = 'comment-item';
    commentElement.innerHTML = `
        <div class="comment-header">
            <div class="comment-name">${escapeHtml(name)}</div>
            <div class="comment-date">${date}</div>
        </div>
        <div class="comment-text">${escapeHtml(message)}</div>
    `;
    
    // Add to top of list
    commentsList.prepend(commentElement);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Show notification
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background-color: var(--secondary-color);
        color: white;
        padding: 15px 30px;
        border-radius: 50px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: fadeInOut 3s ease;
    `;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Remove after animation
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Add CSS for notification animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInOut {
        0% { opacity: 0; top: 0; }
        10% { opacity: 1; top: 20px; }
        90% { opacity: 1; top: 20px; }
        100% { opacity: 0; top: 0; }
    }
`;
document.head.appendChild(style);

// Floating navigation functionality
function initFloatingNav() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.querySelector(`.${targetId}-section`);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 20,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Handle images that fail to load
document.addEventListener('error', function(e) {
    if (e.target.tagName === 'IMG') {
        console.log('Image failed to load:', e.target.src);
        // Already handled with onerror attribute in HTML
    }
}, true);

// Make music autoplay work better on mobile
document.addEventListener('touchstart', function() {
    if (backgroundMusic.paused && mainInvitation.classList.contains('active')) {
        backgroundMusic.play().then(() => {
            musicStatus.textContent = 'Musik: ON';
        }).catch(e => console.log('Touch autoplay prevented:', e));
    }
}, { once: true });