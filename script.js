document.addEventListener('DOMContentLoaded', () => {
    /* --- Mobile Menu Toggle (TOP PRIORITY) --- */
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinksContainer = document.querySelector('.nav-links');
    
    if (menuToggle && navLinksContainer) {
        menuToggle.addEventListener('click', () => {
            navLinksContainer.classList.toggle('active');
        });

        // Close menu when any link inside is clicked
        navLinksContainer.addEventListener('click', (e) => {
            if (e.target.tagName === 'A' || e.target.parentElement.tagName === 'A') {
                navLinksContainer.classList.remove('active');
            }
        });
    }

    /* --- Preloader Handling --- */
    window.addEventListener('load', () => {
        const preloader = document.getElementById('preloader');
        if (preloader) {
            setTimeout(() => {
                preloader.classList.add('preloader-finish');
            }, 500); // 500ms delay for ultra-smooth transition
        }
    });

    /* --- Custom Cursor --- */
    const dot = document.querySelector('.cursor-dot');
    const outline = document.querySelector('.cursor-outline');

    window.addEventListener('mousemove', (e) => {
        const posX = e.clientX;
        const posY = e.clientY;

        // Immediate follow for dot
        dot.style.left = `${posX}px`;
        dot.style.top = `${posY}px`;

        // Smooth follow for outline with requestAnimationFrame
        outline.animate({
            left: `${posX}px`,
            top: `${posY}px`
        }, { duration: 500, fill: "forwards" });
    });

    // Cursor interaction with links/buttons
    const interactiveElements = document.querySelectorAll('a, button, .timeline-dot, .image-wrapper');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            outline.style.transform = 'translate(-50%, -50%) scale(1.5)';
            outline.style.borderColor = 'var(--accent-blue)';
            outline.style.backgroundColor = 'rgba(0, 242, 255, 0.1)';
        });
        el.addEventListener('mouseleave', () => {
            outline.style.transform = 'translate(-50%, -50%) scale(1)';
            outline.style.borderColor = 'var(--accent-violet)';
            outline.style.backgroundColor = 'transparent';
        });
    });

    /* --- Navbar Scroll Effect --- */
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    /* --- Typed Text Effect --- */
    const roles = ["BCA Student", "Frontend Developer", "Tech Enthusiast"];
    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const typedTarget = document.getElementById('typed-role');

    function typeEffect() {
        const currentRole = roles[roleIndex];
        
        if (isDeleting) {
            typedTarget.textContent = currentRole.substring(0, charIndex - 1);
            charIndex--;
        } else {
            typedTarget.textContent = currentRole.substring(0, charIndex + 1);
            charIndex++;
        }

        let typeSpeed = isDeleting ? 100 : 200;

        if (!isDeleting && charIndex === currentRole.length) {
            typeSpeed = 2000; // Pause at end
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            typeSpeed = 500;
        }

        setTimeout(typeEffect, typeSpeed);
    }

    typeEffect();

    /* --- Reveal Animations (Intersection Observer) --- */
    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                // Optional: stop observing once revealed
                // revealObserver.unobserve(entry.target);
            }
        });
    }, revealOptions);

    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => revealObserver.observe(el));

    /* --- Active Navigation Highlight --- */
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= sectionTop - 150) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    });

    /* --- Contact Form Handling with EmailJS --- */
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');
    
    // Initialize EmailJS
    (function() {
        emailjs.init("clbJL25I2d5G4pba4");
    })();

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('.submit-btn');
            const originalText = btn.innerHTML;
            
            btn.innerHTML = '<span>Sending...</span>';
            btn.disabled = true;
            formStatus.textContent = '';
            formStatus.className = 'form-status';

            const serviceID = 'service_2vz4hg8';
            const templateID = 'template_x9877us';

            const templateParams = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                message: document.getElementById('message').value,
                title: "Portfolio Message"
            };

            try {
                const response = await emailjs.send(serviceID, templateID, templateParams);
                if (response.status === 200) {
                    btn.innerHTML = '<span>Sent Successfully!</span> <i class="fa-solid fa-check"></i>';
                    btn.style.background = 'var(--accent-blue)';
                    formStatus.textContent = 'Message sent successfully! I will get back to you soon.';
                    formStatus.className = 'form-status success';
                    contactForm.reset();
                } else {
                    throw new Error('EmailJS failed');
                }
            } catch (error) {
                btn.innerHTML = '<span>Error! Try Again</span>';
                btn.style.background = '#ff4b2b';
                formStatus.textContent = 'Oops! Something went wrong. Please try again.';
                formStatus.className = 'form-status error';
                console.error('EmailJS Error:', error);
            } finally {
                btn.disabled = false;
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.style.background = '';
                }, 4000);
            }
        });
    }

    /* --- Scroll Progress Bar --- */
    const progressBar = document.querySelector('.scroll-progress-bar');
    window.addEventListener('scroll', () => {
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (window.pageYOffset / totalHeight) * 100;
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
    });

    /* --- Timeline Progress Animation --- */
    const journeySection = document.getElementById('journey');
    const timelineLine = document.querySelector('.timeline-line');
    
    if (journeySection && timelineLine) {
        window.addEventListener('scroll', () => {
            const sectionRect = journeySection.getBoundingClientRect();
            const sectionHeight = sectionRect.height;
            const scrollDistance = -sectionRect.top + (window.innerHeight / 2);
            
            let progress = (scrollDistance / sectionHeight) * 100;
            progress = Math.max(0, Math.min(progress, 100)); // Clamp between 0 and 100
            
            document.documentElement.style.setProperty('--timeline-progress', `${progress}%`);
        });
    }

    /* --- Bento Card Glow Effect --- */
    const bentoCards = document.querySelectorAll('.bento-card');
    bentoCards.forEach(card => {
        const glow = card.querySelector('.glow');
        if (glow) {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                glow.style.left = `${x}px`;
                glow.style.top = `${y}px`;
            });
        }
    });
});
