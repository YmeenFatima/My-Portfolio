/* ============================================================
   Portfolio – Main Script
   Vanilla ES6+ · No external dependencies
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ----------------------------------------------------------
     UTILITY HELPERS
  ---------------------------------------------------------- */

  /** Clamp a number between min and max */
  const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

  /** Ease-out quad for smooth counter / bar animations */
  const easeOutQuad = (t) => t * (2 - t);

  /** Get sticky navbar height for scroll-offset calculations */
  const getNavHeight = () => {
    const nav = document.querySelector('.navbar');
    return nav ? nav.offsetHeight : 0;
  };

  /* ----------------------------------------------------------
     1. NAVBAR
  ---------------------------------------------------------- */

  const navbar = document.querySelector('.navbar');
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  const navLinkItems = document.querySelectorAll('.nav-links a');

  // --- Sticky scroll class ---
  const handleNavbarScroll = () => {
    if (!navbar) return;
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', handleNavbarScroll, { passive: true });
  handleNavbarScroll(); // initial check

  // --- Hamburger toggle ---
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('active');
    });
  }

  // --- Close mobile menu on link click ---
  navLinkItems.forEach((link) => {
    link.addEventListener('click', () => {
      if (hamburger) hamburger.classList.remove('active');
      if (navLinks) navLinks.classList.remove('active');
    });
  });

  // --- Active nav-link highlighting (IntersectionObserver) ---
  const sections = document.querySelectorAll('section[id]');

  const activateLinkForSection = (id) => {
    navLinkItems.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${id}`) {
        link.classList.add('active');
      }
    });
  };

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          activateLinkForSection(entry.target.id);
        }
      });
    },
    {
      rootMargin: `-${getNavHeight() + 10}px 0px -40% 0px`,
      threshold: 0.15,
    }
  );

  sections.forEach((section) => sectionObserver.observe(section));

  /* ----------------------------------------------------------
     11. SMOOTH SCROLL (anchor links)
  ---------------------------------------------------------- */

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      const offset = getNavHeight();
      const top = target.getBoundingClientRect().top + window.scrollY - offset;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ----------------------------------------------------------
     2. SCROLL-TRIGGERED ANIMATIONS (master IntersectionObserver)
  ---------------------------------------------------------- */

  const animationClasses = [
    '.fade-in-up',
    '.pop-in',
    '.slide-in-left',
    '.flip-in',
    '.drop-in',
    '.slide-in-blur',
    '.fade-in-delay',
    '.scale-in',
    '.cascade-in',
    '.zoom-in-bounce',
    '.slide-in-angle-left',
    '.slide-in-angle-right',
  ];

  const animatedElements = document.querySelectorAll(animationClasses.join(','));

  const masterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          masterObserver.unobserve(entry.target); // animate only once
        }
      });
    },
    { threshold: 0.15 }
  );

  animatedElements.forEach((el) => masterObserver.observe(el));

  // --- Staggered children inside containers ---
  const staggerContainers = document.querySelectorAll('[data-stagger]');

  staggerContainers.forEach((container) => {
    const children = container.children;
    Array.from(children).forEach((child, idx) => {
      child.style.transitionDelay = `${idx * 0.1}s`;
    });
  });

  /* ----------------------------------------------------------
     3. LANDING PAGE ANIMATIONS
  ---------------------------------------------------------- */

  const heroElements = [
    { selector: '.hero-greeting', delay: 0 },
    { selector: '.hero-name', delay: 200 },
    { selector: '.hero-designations', delay: 400 },
    { selector: '.hero-intro', delay: 600 },
    { selector: '.hero-cta', delay: 800 },
  ];

  setTimeout(() => {
    heroElements.forEach(({ selector, delay }) => {
      const el = document.querySelector(selector);
      if (el) {
        setTimeout(() => el.classList.add('visible'), delay);
      }
    });

    // Social icons — pop-in one-by-one
    const socialIcons = document.querySelectorAll('.hero-social a, .hero-social .social-icon');
    socialIcons.forEach((icon, idx) => {
      setTimeout(() => icon.classList.add('visible'), 1000 + idx * 150);
    });
  }, 300);

  /* ----------------------------------------------------------
     4. ABOUT SECTION (handled by master observer + CSS classes)
     Profile image → .slide-in-left
     Mission card  → .flip-in (delay 0)
     Vision card   → .flip-in (delay 0.2s — set in CSS or inline)
  ---------------------------------------------------------- */

  const visionCard = document.querySelector('.vision-card.flip-in');
  if (visionCard && !visionCard.style.transitionDelay) {
    visionCard.style.transitionDelay = '0.2s';
  }

  /* ----------------------------------------------------------
     5. EDUCATION SECTION – GPA bars & key highlights
  ---------------------------------------------------------- */

  const gpaData = [
    { semester: 1, gpa: 3.64, max: 4.0 },
    { semester: 2, gpa: 3.40, max: 4.0 },
    { semester: 3, gpa: 3.78, max: 4.0 },
    { semester: 4, gpa: 0, max: 4.0, pending: true },
  ];

  const educationSection = document.querySelector('#education');

  const animateGPABars = () => {
    const bars = document.querySelectorAll('.gpa-bar-fill');

    bars.forEach((bar, idx) => {
      const data = gpaData[idx];
      if (!data) return;

      if (data.pending) {
        bar.style.width = '0%';
        bar.classList.add('pending');
        const label = bar.querySelector('.gpa-label') || bar.parentElement.querySelector('.gpa-label');
        if (label) label.textContent = 'Pending';
        return;
      }

      const percent = (data.gpa / data.max) * 100;
      // Use rAF to trigger after paint for smooth transition
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          bar.style.width = `${percent}%`;
        });
      });
    });
  };

  if (educationSection) {
    const eduObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateGPABars();
            eduObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    eduObserver.observe(educationSection);
  }

  /* ----------------------------------------------------------
     6. PROJECTS SECTION
     Animations driven by CSS classes on each project card:
       .project-left  → .slide-in-blur
       .project-right → .fade-in-delay
       .outcome-item  → staggered .fade-in-up
       .tech-pill     → staggered pop-in

     We set stagger delays programmatically.
  ---------------------------------------------------------- */

  const projectCards = document.querySelectorAll('.project-card');

  projectCards.forEach((card) => {
    // Stagger outcome items
    const outcomes = card.querySelectorAll('.outcome-item');
    outcomes.forEach((item, idx) => {
      item.style.transitionDelay = `${0.3 + idx * 0.15}s`;
    });

    // Stagger tech pills
    const pills = card.querySelectorAll('.tech-pill');
    pills.forEach((pill, idx) => {
      pill.style.transitionDelay = `${0.3 + idx * 0.1}s`;
    });
  });

  /* ----------------------------------------------------------
     7. SKILLS SECTION – progress bars + percentage counters
  ---------------------------------------------------------- */

  const skillsSection = document.querySelector('#skills');

  /** Animate a single skill bar + its counter label */
  const animateSkillBar = (barFill) => {
    const target = parseFloat(barFill.getAttribute('data-percent')) || 0;
    const counter = barFill.querySelector('.percent-label') ||
                    barFill.parentElement.querySelector('.percent-label');

    const duration = 1000; // ms
    const start = performance.now();

    const step = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutQuad(progress);
      const current = eased * target;

      barFill.style.width = `${current}%`;
      if (counter) counter.textContent = `${Math.round(current)}%`;

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  };

  // Stagger category cards by position (grid wave)
  const categoryCards = document.querySelectorAll('.skill-category, .category-card');
  categoryCards.forEach((card, idx) => {
    card.style.transitionDelay = `${idx * 0.1}s`;
  });

  if (skillsSection) {
    const skillObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const fills = skillsSection.querySelectorAll('.skill-bar-fill');
            fills.forEach((fill) => animateSkillBar(fill));
            skillObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    skillObserver.observe(skillsSection);
  }

  /* ----------------------------------------------------------
     8. CERTIFICATIONS SECTION – mouse-follow tilt
  ---------------------------------------------------------- */

  const certCards = document.querySelectorAll('.cert-card, .certification-card');

  // Assign random initial rotation
  certCards.forEach((card, idx) => {
    const randomRot = (Math.random() * 4 - 2).toFixed(2); // -2° to +2°
    card.style.setProperty('--initial-rotation', `${randomRot}deg`);
    // Stagger cascade
    card.style.transitionDelay = `${idx * 0.1}s`;
  });

  // Mouse-follow tilt
  certCards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;

      // Normalise to -1 … 1 and clamp tilt to ±4°
      const tiltX = clamp((deltaX / (rect.width / 2)) * 4, -4, 4);
      const tiltY = clamp((-deltaY / (rect.height / 2)) * 4, -4, 4);

      card.style.transform = `perspective(1000px) rotateX(${tiltY}deg) rotateY(${tiltX}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.4s ease';
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
      // Remove inline transition after reset so it doesn't interfere with mousemove
      setTimeout(() => {
        card.style.transition = '';
      }, 400);
    });
  });

  /* ----------------------------------------------------------
     9. ACHIEVEMENTS SECTION – stat counters
  ---------------------------------------------------------- */

  const achievementsSection = document.querySelector('#achievements');

  const animateCounter = (el) => {
    const target = parseInt(el.getAttribute('data-target'), 10) || 0;
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 2000; // ms
    const start = performance.now();

    const step = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutQuad(progress);
      const current = Math.round(eased * target);

      el.textContent = `${current}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  };

  if (achievementsSection) {
    const achObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const counters = achievementsSection.querySelectorAll('[data-target]');
            counters.forEach((counter) => animateCounter(counter));

            // Badge glow
            const badges = achievementsSection.querySelectorAll('.badge, .achievement-badge');
            badges.forEach((badge) => badge.classList.add('glow'));

            achObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    achObserver.observe(achievementsSection);
  }

  /* ----------------------------------------------------------
     10. CONTACT SECTION – form handler
  ---------------------------------------------------------- */

  const contactForm = document.querySelector('#contact-form, .contact-form');

  // Stagger form field underline draws
  if (contactForm) {
    const fields = contactForm.querySelectorAll('.form-field, .form-group, input, textarea');
    fields.forEach((field, idx) => {
      field.style.transitionDelay = `${idx * 0.2}s`;
    });
  }

  // Send button pulse after form renders
  const sendBtn = document.querySelector('.contact-form .send-btn, #contact-form button[type="submit"], #contact-form .btn-submit');
  if (sendBtn) {
    setTimeout(() => sendBtn.classList.add('pulse'), 1500);
  }

  // Form submission
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = contactForm.querySelector('[name="name"]');
      const email = contactForm.querySelector('[name="email"]');
      const subject = contactForm.querySelector('[name="subject"]');
      const message = contactForm.querySelector('[name="message"]');

      // Collect all relevant fields
      const fieldEls = [name, email, subject, message].filter(Boolean);

      // Validate non-empty
      let valid = true;
      fieldEls.forEach((field) => {
        if (!field.value.trim()) {
          valid = false;
          field.classList.add('error');
          // Remove error class after a moment
          setTimeout(() => field.classList.remove('error'), 2000);
        }
      });

      if (!valid) return;

      // Build mailto link
      const subjectText = subject ? subject.value.trim() : 'Portfolio Contact';
      const bodyParts = [];
      if (name) bodyParts.push(`Name: ${name.value.trim()}`);
      if (email) bodyParts.push(`Email: ${email.value.trim()}`);
      if (message) bodyParts.push(`\n${message.value.trim()}`);

      const mailtoLink =
        `mailto:ymeenf2310@gmail.com` +
        `?subject=${encodeURIComponent(subjectText)}` +
        `&body=${encodeURIComponent(bodyParts.join('\n'))}`;

      window.open(mailtoLink, '_self');

      // Brief feedback
      const feedback = document.createElement('div');
      feedback.className = 'form-feedback';
      feedback.textContent = 'Message sent!';
      contactForm.appendChild(feedback);

      setTimeout(() => {
        feedback.remove();
      }, 3000);

      contactForm.reset();
    });
  }

  /* ----------------------------------------------------------
     12. BACK TO TOP BUTTON
  ---------------------------------------------------------- */

  // Create button dynamically
  const backToTopBtn = document.createElement('button');
  backToTopBtn.className = 'back-to-top';
  backToTopBtn.setAttribute('aria-label', 'Back to top');
  backToTopBtn.innerHTML = '&#8593;'; // ↑
  document.body.appendChild(backToTopBtn);

  const toggleBackToTop = () => {
    const firstSection = document.querySelector('section');
    if (!firstSection) return;

    const threshold = firstSection.offsetTop + firstSection.offsetHeight;
    if (window.scrollY > threshold) {
      backToTopBtn.classList.add('show');
    } else {
      backToTopBtn.classList.remove('show');
    }
  };

  window.addEventListener('scroll', toggleBackToTop, { passive: true });
  toggleBackToTop();

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ----------------------------------------------------------
     INJECT MINIMAL BACK-TO-TOP STYLES (keeps JS self-contained)
  ---------------------------------------------------------- */

  const injectStyles = () => {
    const style = document.createElement('style');
    style.textContent = `
      .back-to-top {
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        width: 44px;
        height: 44px;
        border-radius: 50%;
        border: none;
        background: linear-gradient(135deg, #d4a843, #c7934a);
        color: #fff;
        font-size: 1.25rem;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transform: translateY(10px);
        transition: opacity 0.3s ease, visibility 0.3s ease, transform 0.3s ease, background 0.3s ease;
        z-index: 9999;
        box-shadow: 0 4px 14px rgba(0,0,0,0.25);
      }
      .back-to-top.show {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
      }
      .back-to-top:hover {
        background: linear-gradient(135deg, #e0b94e, #d4a843);
        transform: translateY(-3px);
      }
      .form-feedback {
        margin-top: 1rem;
        padding: 0.75rem 1.25rem;
        background: rgba(76, 175, 80, 0.15);
        color: #4caf50;
        border-radius: 8px;
        font-weight: 600;
        text-align: center;
        animation: feedbackIn 0.4s ease;
      }
      @keyframes feedbackIn {
        from { opacity: 0; transform: translateY(8px); }
        to   { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(style);
  };

  injectStyles();

}); // end DOMContentLoaded
