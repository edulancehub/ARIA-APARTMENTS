/* ============================================================================
   ARIA APARTMENTS — main.js
   All interactive behaviors for the luxury apartment website
   ============================================================================ */

/* ============================================================
   1. PRELOADER
   ============================================================ */
(function() {
  var preloader = document.getElementById('preloader');
  var fill      = document.querySelector('.preloader-fill');
  var pct       = document.querySelector('.preloader-percent');
  if (!preloader) return;
  var progress = 0;
  var interval = setInterval(function() {
    progress += Math.random() * 18;
    if (progress >= 100) { progress = 100; clearInterval(interval); }
    if (fill) fill.style.width = progress + '%';
    if (pct) pct.textContent = Math.floor(progress) + '%';
    if (progress === 100) {
      setTimeout(function() {
        preloader.classList.add('hidden');
        document.body.style.overflow = '';
        AOS.init({ duration: 800, easing: 'ease-out-cubic', once: true, offset: 80 });
      }, 400);
    }
  }, 80);
  document.body.style.overflow = 'hidden';
})();

/* ============================================================
   2. CUSTOM CURSOR
   ============================================================ */
(function() {
  var dot    = document.querySelector('.cursor-dot');
  var circle = document.querySelector('.cursor-circle');
  if (!dot || !circle || window.matchMedia('(pointer:coarse)').matches) return;
  var mx = 0, my = 0, cx = 0, cy = 0;
  document.addEventListener('mousemove', function(e) {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px'; dot.style.top = my + 'px';
  });
  (function lerp() {
    cx += (mx - cx) * .12; cy += (my - cy) * .12;
    circle.style.left = cx + 'px'; circle.style.top = cy + 'px';
    requestAnimationFrame(lerp);
  })();
  document.querySelectorAll('a, button, [role="button"], .fp-card, .gallery-item').forEach(function(el) {
    el.addEventListener('mouseenter', function() { circle.classList.add('hover'); });
    el.addEventListener('mouseleave', function() { circle.classList.remove('hover'); });
  });
})();

/* ============================================================
   3. NAVBAR — scroll effect + hamburger + active link
   ============================================================ */
(function() {
  var navbar    = document.querySelector('.navbar');
  var hamburger = document.querySelector('.hamburger');
  var navLinks  = document.querySelector('.nav-links');
  var progress  = document.querySelector('.header-progress');
  var links     = document.querySelectorAll('.nav-link[href^="#"]');

  // Scroll effect
  function onScroll() {
    var scrolled = window.scrollY;
    if (navbar) navbar.classList.toggle('scrolled', scrolled > 60);
    // Header progress bar
    if (progress) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (max > 0 ? (scrolled / max * 100) : 0) + '%';
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  // Hamburger
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', function() {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('open');
    });
    navLinks.querySelectorAll('.nav-link').forEach(function(link) {
      link.addEventListener('click', function() {
        hamburger.classList.remove('active');
        navLinks.classList.remove('open');
      });
    });
  }

  // Active nav on scroll (IntersectionObserver)
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          links.forEach(function(l) {
            l.classList.remove('active');
            if (l.getAttribute('href') === '#' + entry.target.id) l.classList.add('active');
          });
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    document.querySelectorAll('section[id]').forEach(function(s) { observer.observe(s); });
  }
})();

/* ============================================================
   4. HERO SLIDESHOW
   ============================================================ */
(function() {
  var slides = document.querySelectorAll('.hero-slide');
  var dots   = document.querySelectorAll('.hero-dot');
  if (!slides.length) return;
  var current = 0;
  var timer;

  function goTo(n) {
    slides[current].classList.remove('active');
    dots[current] && dots[current].classList.remove('active');
    current = (n + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current] && dots[current].classList.add('active');
  }

  function start() { timer = setInterval(function() { goTo(current + 1); }, 6000); }

  dots.forEach(function(dot, i) {
    dot.addEventListener('click', function() { clearInterval(timer); goTo(i); start(); });
  });

  // Init
  slides[0] && slides[0].classList.add('active');
  dots[0]   && dots[0].classList.add('active');
  start();
})();

/* ============================================================
   5. COUNTER ANIMATIONS
   ============================================================ */
(function() {
  var counters = document.querySelectorAll('.counter');
  if (!counters.length) return;

  function animateCounter(el) {
    var target  = parseFloat(el.getAttribute('data-target')) || 0;
    var suffix  = el.getAttribute('data-suffix') || '';
    var prefix  = el.getAttribute('data-prefix') || '';
    var decimals = (target % 1 !== 0) ? 1 : 0;
    var start = 0;
    var duration = 1800;
    var startTime = null;

    function step(ts) {
      if (!startTime) startTime = ts;
      var progress = Math.min((ts - startTime) / duration, 1);
      var ease = 1 - Math.pow(1 - progress, 3);
      var val = start + (target - start) * ease;
      el.textContent = prefix + val.toFixed(decimals) + suffix;
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = prefix + target.toFixed(decimals) + suffix;
    }
    requestAnimationFrame(step);
  }

  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function(entries, o) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) { animateCounter(entry.target); o.unobserve(entry.target); }
      });
    }, { threshold: .5 });
    counters.forEach(function(c) { obs.observe(c); });
  } else {
    counters.forEach(animateCounter);
  }
})();

/* ============================================================
   6. FLOOR PLAN FILTER
   ============================================================ */
(function() {
  var btns  = document.querySelectorAll('.fp-filter-btn');
  var cards = document.querySelectorAll('.fp-card');
  if (!btns.length) return;

  btns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      btns.forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var filter = btn.getAttribute('data-filter');
      cards.forEach(function(card) {
        var type = card.getAttribute('data-type');
        var show = (filter === 'all' || type === filter);
        card.style.display = show ? '' : 'none';
      });
    });
  });
})();

/* ============================================================
   7. GALLERY FILTER
   ============================================================ */
(function() {
  var btns  = document.querySelectorAll('.gallery-filter');
  var items = document.querySelectorAll('.gallery-item');
  if (!btns.length) return;

  btns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      btns.forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var filter = btn.getAttribute('data-cat');
      items.forEach(function(item) {
        var cat = item.getAttribute('data-cat');
        item.style.display = (filter === 'all' || cat === filter) ? '' : 'none';
      });
    });
  });
})();

/* ============================================================
   8. TESTIMONIALS SLIDER
   ============================================================ */
(function() {
  var track   = document.querySelector('.testimonial-track');
  var cards   = document.querySelectorAll('.testimonial-card');
  var dotsWrap = document.querySelector('.slider-dots');
  var prevBtn  = document.querySelector('.slider-btn.prev');
  var nextBtn  = document.querySelector('.slider-btn.next');
  if (!track || !cards.length) return;

  var current = 0;
  var dots = [];

  // Build dots
  if (dotsWrap) {
    cards.forEach(function(_, i) {
      var d = document.createElement('button');
      d.className = 'slider-dot' + (i === 0 ? ' active' : '');
      d.setAttribute('aria-label', 'Slide ' + (i + 1));
      d.addEventListener('click', function() { goTo(i); });
      dotsWrap.appendChild(d);
      dots.push(d);
    });
  }

  function goTo(n) {
    current = (n + cards.length) % cards.length;
    track.style.transform = 'translateX(-' + (current * 100) + '%)';
    dots.forEach(function(d, i) { d.classList.toggle('active', i === current); });
  }

  if (prevBtn) prevBtn.addEventListener('click', function() { goTo(current - 1); });
  if (nextBtn) nextBtn.addEventListener('click', function() { goTo(current + 1); });

  // Auto-advance
  setInterval(function() { goTo(current + 1); }, 7000);
})();

/* ============================================================
   9. STICKY CTA BAR
   ============================================================ */
(function() {
  var bar = document.getElementById('stickyCta');
  if (!bar) return;
  window.addEventListener('scroll', function() {
    bar.classList.toggle('visible', window.scrollY > 300);
  }, { passive: true });
})();

/* ============================================================
   10. FORMS → TOAST
   ============================================================ */
function showToast(msg) {
  var toast = document.getElementById('toast');
  if (!toast) return;
  toast.querySelector('span') && (toast.querySelector('span').textContent = msg);
  toast.classList.add('show');
  setTimeout(function() { toast.classList.remove('show'); }, 4500);
}

(function() {
  var formMap = [
    { id: 'availabilityForm', msg: 'Thank you! We\'ll reach out shortly with matching options.' },
    { id: 'tourForm',         msg: 'Tour request received! We\'ll confirm your details within 24 hours.' },
    { id: 'applyForm',        msg: 'Application submitted! Our team will review and contact you soon.' },
    { id: 'contactForm',      msg: 'Message sent! We\'ll respond within one business day.' },
  ];
  formMap.forEach(function(item) {
    var form = document.getElementById(item.id);
    if (!form) return;
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      showToast(item.msg);
      form.reset();
    });
  });
  // Portal login
  var portalForm = document.getElementById('portalForm');
  if (portalForm) {
    portalForm.addEventListener('submit', function(e) {
      e.preventDefault();
      showToast('Sign-in request sent. Redirecting to resident portal...');
    });
  }
})();

/* ============================================================
   11. PASSWORD TOGGLE
   ============================================================ */
(function() {
  document.querySelectorAll('.pass-toggle').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var input = btn.previousElementSibling;
      if (!input) return;
      var isText = input.type === 'text';
      input.type = isText ? 'password' : 'text';
      btn.querySelector('i').className = isText ? 'fas fa-eye' : 'fas fa-eye-slash';
    });
  });
})();

/* ============================================================
   12. GROQ AI CHAT — Aria Apartments Leasing Assistant
   ============================================================ */
(function() {
  /* ---- DOM refs ---- */
  var toggle     = document.getElementById('aiChatToggle');
  var panel      = document.getElementById('aiChatPanel');
  var closeBtn   = document.getElementById('aiChatClose');
  var messages   = document.getElementById('aiChatMessages');
  var form       = document.getElementById('aiChatForm');
  var input      = document.getElementById('aiChatInput');
  var sendBtn    = document.getElementById('aiChatSend');
  var typing     = document.getElementById('aiTypingIndicator');
  var quickWrap  = document.getElementById('aiQuickReplies');
  if (!toggle || !panel) return;

  /* ---- Conversation history ---- */
  var history = [];

  /* ==================================================
     SYSTEM PROMPT — All Aria Apartments Data
     ================================================== */
  var SYSTEM_PROMPT = [
    'You are Aria Assistant, the AI-powered leasing expert and virtual concierge for Aria Apartments.',
    'You are friendly, warm, knowledgeable, and professional — like a luxury resort concierge.',
    'Always respond in a helpful, conversational tone. Keep answers concise unless details are requested.',
    'Never fabricate information. If unsure, offer to connect the user with the leasing team.',
    '',
    '=== ARIA APARTMENTS — COMPLETE PROPERTY GUIDE ===',
    '',
    '--- PROPERTY OVERVIEW ---',
    'Name: Aria Apartments',
    'Tagline: Where Luxury Meets Lifestyle',
    'Address: 4500 Kentsfield Lane, Columbia, Missouri 65201',
    'Phone: +1 573-815-7300',
    'Email: info@arialuxuryapts.com',
    'Website: https://arialuxuryapts.com',
    'Facebook: https://web.facebook.com/ariaaptscomo/',
    'Instagram: https://www.instagram.com/ariaapts',
    'Google Rating: 4.8 / 5.0 stars',
    '',
    '--- LEASING OFFICE HOURS ---',
    'Monday–Friday: 9:00 AM – 6:00 PM',
    'Saturday: 10:00 AM – 5:00 PM',
    'Sunday: Closed (self-guided tours available by appointment)',
    '',
    '--- FLOOR PLANS & PRICING ---',
    '1. Capri Studio | Studio | 1 Bath | 520 sq ft | From $1,075/mo | Available Now',
    '   Features: Open concept layout, designer kitchen, in-unit washer/dryer hookup, large windows',
    '',
    '2. Presto One-Bedroom | 1 Bed | 1 Bath | 742 sq ft | From $1,175/mo | Available Now',
    '   Features: Separate bedroom, chef kitchen, walk-in closet, private patio/balcony',
    '',
    '3. Aria Classic (MOST POPULAR) | 1 Bed | 1 Bath | 865 sq ft | From $1,295/mo | Limited Availability',
    '   Features: Spacious layout, quartz countertops, luxury vinyl plank flooring, spa bath, in-unit laundry',
    '',
    '4. Duetto Two-Bedroom | 2 Bed | 2 Bath | 1,100 sq ft | From $1,595/mo | Available Now',
    '   Features: Dual master suites, open living area, ss appliances, private balcony, two walk-in closets',
    '',
    '5. Duetto Grande | 2 Bed | 2 Bath | 1,280 sq ft | From $1,795/mo | Available Now',
    '   Features: Premium upgraded version of Duetto, extra storage, premium appliances, larger balcony',
    '',
    '6. Trio Three-Bedroom (FEATURED) | 3 Bed | 2 Bath | 1,520 sq ft | From $2,195/mo | Limited Availability',
    '   Features: Three full bedrooms, entertainer kitchen, two full baths, large private patio, den/office area',
    '',
    'Price Range Summary: $1,075 – $2,900/mo depending on unit, floor, and availability.',
    'All floor plans include: stainless steel appliances, quartz countertops, luxury vinyl plank flooring, digital smart locks.',
    '',
    '--- COMMUNITY AMENITIES ---',
    '• Resort-style swimming pool with sundeck and lounge chairs',
    '• Second relaxation pool and hot tub',
    '• 3,000+ sq ft state-of-the-art fitness center (24/7 access)',
    '• Yoga and spin studio',
    '• 40-acre private lake with walking/jogging trails and fishing dock',
    '• Resident clubhouse with kitchen, bar, and entertainment area',
    '• Co-working lounge and private meeting pods',
    '• Outdoor grilling pavilions and fire pit patio',
    '• Car wash station',
    '• Package lockers',
    '• Electric vehicle charging stations',
    '• Controlled-access gated entry',
    '• On-site professional management team',
    '• 24/7 emergency maintenance',
    '',
    '--- IN-APARTMENT FEATURES ---',
    '• Gourmet kitchen with quartz countertops and tile backsplash',
    '• Stainless steel appliances (refrigerator, dishwasher, range, microwave)',
    '• In-unit full-size washer and dryer',
    '• Luxury vinyl plank flooring throughout',
    '• Designer light fixtures and ceiling fans',
    '• Private balcony or patio in most units',
    '• Spa-inspired bathrooms with soaking tubs and walk-in showers',
    '• Walk-in closets with custom shelving',
    '• Smart thermostat and USB outlets',
    '• High-speed fiber internet ready',
    '',
    '--- PET POLICY ---',
    'Aria Apartments is proudly pet-friendly!',
    '• Maximum 2 pets per apartment',
    '• Weight limit: 75 lbs per pet',
    '• Dog breeds restrictions may apply (contact leasing for list)',
    '• Pet deposit: $300 refundable per pet',
    '• Pet rent: $35/month per pet',
    '• On-site dog park with agility equipment',
    '• Pet washing station',
    '• Walking trails around the 40-acre lake — perfect for dogs',
    '• Nearby pet-friendly parks and veterinary clinics',
    '',
    '--- NEIGHBORHOOD & LOCATION ---',
    'Located in Columbia, Missouri — home of the University of Missouri (Mizzou).',
    '',
    'Nearby Education (3–8 min drive):',
    '• University of Missouri — 4.2 miles',
    '• Columbia College — 3.1 miles',
    '• Stephens College — 3.5 miles',
    '',
    'Dining & Shopping (2–6 min):',
    '• Tiger Town Shopping Center — 1.2 miles',
    '• Downtown Columbia restaurants & bars — 4 miles',
    '• Hy-Vee Grocery, Walmart Supercenter — 2 miles',
    '• Schnucks, Target, Kohl\'s — 3 miles',
    '',
    'Parks & Outdoor (5–15 min):',
    '• Cosmo Park — 5 miles',
    '• Rock Bridge Memorial State Park — 7 miles',
    '• MKT Nature and Fitness Trail — 3 miles',
    '',
    'Healthcare:',
    '• University of Missouri Health Care — 4.5 miles',
    '• Boone Hospital Center — 3.2 miles',
    '',
    '--- LEASING PROCESS ---',
    '1. Explore floor plans on the website or contact leasing office',
    '2. Schedule an in-person or self-guided virtual tour',
    '3. Complete the online rental application',
    '4. Application review & approval (typically 24–48 hours)',
    '5. Sign lease agreement and pay move-in fees',
    'Move-in fees: First month + security deposit (equal to one month\'s rent) + any pet deposits.',
    'Application fee: $50 per adult (non-refundable)',
    'Lease terms: 6, 9, or 12-month leases available',
    '',
    '--- EVENTS & COMMUNITY ---',
    'Aria hosts regular resident events including:',
    '• Monthly Resident Appreciation Breakfasts',
    '• Poolside Summer BBQ parties',
    '• Yoga & Wellness mornings',
    '• Holiday celebrations and themed mixers',
    '• Dog park meetups',
    '• Game nights and wine tastings',
    '',
    '--- RESIDENT PORTAL ---',
    'Residents can use the online portal to: pay rent, submit maintenance requests,',
    'view lease documents, book amenity spaces, and communicate with management.',
    '',
    '--- VIRTUAL TOUR & SCHEDULING ---',
    'In-person tours available Mon–Sat. Self-guided tours available daily.',
    'Virtual tours available via video call — contact leasing office.',
    'Call +1 573-815-7300 or email info@arialuxuryapts.com to schedule.',
    '',
    '=== RESPONSE GUIDELINES ===',
    '- When asked about pricing, always mention "starting from" and note availability may change.',
    '- For applications, direct users to the Apply Online section on the website.',
    '- For tours, provide the phone number and encourage them to scroll to the Schedule a Tour section.',
    '- Always end with a helpful call-to-action when appropriate.',
    '- Use a warm, welcoming luxury tone — never robotic or overly formal.',
    '- If asked something completely unrelated to Aria Apartments, politely redirect.',
  ].join('\n');

  /* ---- Groq API call ---- */
  function callGroq(userMessages, callback) {
    var payload = {
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'system', content: SYSTEM_PROMPT }].concat(userMessages),
      max_tokens: 500,
      temperature: 0.72,
      stream: false
    };

    fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
       'Authorization': 'Bearer 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',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    .then(function(res) {
      if (!res.ok) throw new Error('API error ' + res.status);
      return res.json();
    })
    .then(function(data) {
      var reply = data.choices && data.choices[0] && data.choices[0].message
        ? data.choices[0].message.content
        : 'I\'m having trouble responding right now. Please call us at +1 573-815-7300.';
      callback(null, reply);
    })
    .catch(function(err) {
      callback(err, null);
    });
  }

  /* ---- UI helpers ---- */
  function timeNow() {
    var d = new Date();
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function addMessage(text, role, isError) {
    var div = document.createElement('div');
    div.className = 'ai-msg ai-msg-' + role + (isError ? ' ai-msg-error' : '');
    var bubble = document.createElement('div');
    bubble.className = 'ai-msg-bubble';
    // Allow basic line breaks and bold
    bubble.innerHTML = text
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
    var time = document.createElement('div');
    time.className = 'ai-msg-time';
    time.textContent = timeNow();
    div.appendChild(bubble);
    div.appendChild(time);
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
    return div;
  }

  function setTyping(show) {
    if (typing) typing.hidden = !show;
    if (show) messages.scrollTop = messages.scrollHeight;
  }

  function setInputLocked(locked) {
    input.disabled = locked;
    sendBtn.disabled = locked;
  }

  /* ---- Process a user message ---- */
  function sendMessage(text) {
    if (!text.trim()) return;
    // Hide quick replies after first interaction
    if (quickWrap) quickWrap.style.display = 'none';

    addMessage(text, 'user');
    input.value = '';
    setInputLocked(true);
    setTyping(true);

    history.push({ role: 'user', content: text });

    callGroq(history, function(err, reply) {
      setTyping(false);
      setInputLocked(false);
      if (err || !reply) {
        addMessage('Sorry, I\'m having connection trouble. Please call our leasing team directly at **+1 573-815-7300** or email **info@arialuxuryapts.com**.', 'bot', true);
      } else {
        history.push({ role: 'assistant', content: reply });
        addMessage(reply, 'bot');
      }
      input.focus();
    });
  }

  /* ---- Panel open / close ---- */
  function openPanel() {
    panel.classList.add('open');
    toggle.querySelector('i').className = 'fas fa-times';
    toggle.querySelector('.chat-badge') && (toggle.querySelector('.chat-badge').style.display = 'none');
    setTimeout(function() { input.focus(); }, 420);
  }
  function closePanel() {
    panel.classList.remove('open');
    toggle.querySelector('i').className = 'fas fa-comments';
    toggle.querySelector('.chat-badge') && (toggle.querySelector('.chat-badge').style.display = 'flex');
  }

  toggle.addEventListener('click', function() {
    panel.classList.contains('open') ? closePanel() : openPanel();
  });
  if (closeBtn) closeBtn.addEventListener('click', closePanel);

  /* ---- Form submit ---- */
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      sendMessage(input.value);
    });
  }

  /* ---- Quick reply chips ---- */
  if (quickWrap) {
    quickWrap.querySelectorAll('.ai-quick-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        sendMessage(btn.getAttribute('data-q'));
      });
    });
  }

  /* ---- Close on outside click ---- */
  document.addEventListener('click', function(e) {
    if (panel.classList.contains('open') && !panel.contains(e.target) && !toggle.contains(e.target)) {
      closePanel();
    }
  });
})();

/* ============================================================
   13. SMOOTH SCROLL for anchor links
   ============================================================ */
(function() {
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      var target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      var navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 78;
      var top  = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });
})();

/* ============================================================
   14. AOS FALLBACK (in case preloader doesn't fire)
   ============================================================ */
window.addEventListener('load', function() {
  if (typeof AOS !== 'undefined' && !AOS._initialized) {
    AOS.init({ duration: 800, easing: 'ease-out-cubic', once: true, offset: 80 });
  }
});
