/* ============================================
   MAIN.JS — Landing interactions
   ============================================ */

// ---------- Scroll reveal (IntersectionObserver) ----------
document.addEventListener('DOMContentLoaded', () => {
  const reveals = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    reveals.forEach((el) => observer.observe(el));
  } else {
    // Fallback: show everything
    reveals.forEach((el) => el.classList.add('visible'));
  }
});

// ---------- FAQ Accordion ----------
function toggleFaq(btn) {
  const item = btn.closest('.faq-item');
  const answer = item.querySelector('.faq-answer');
  const isOpen = item.classList.contains('open');

  // Close all
  document.querySelectorAll('.faq-item.open').forEach((openItem) => {
    openItem.classList.remove('open');
    openItem.querySelector('.faq-answer').style.maxHeight = '0';
  });

  // Toggle current
  if (!isOpen) {
    item.classList.add('open');
    answer.style.maxHeight = answer.scrollHeight + 'px';
  }
}

// ---------- Quiz open/close ----------
function openQuiz() {
  const overlay = document.getElementById('quizOverlay');
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';

  // Reset quiz if needed
  if (typeof resetQuiz === 'function') {
    resetQuiz();
  }
}

function closeQuiz() {
  const overlay = document.getElementById('quizOverlay');
  overlay.classList.remove('active');
  document.body.style.overflow = '';
}

// Close on overlay click (not container)
document.addEventListener('click', (e) => {
  if (e.target.id === 'quizOverlay') {
    closeQuiz();
  }
});

// Close on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeQuiz();
  }
});
