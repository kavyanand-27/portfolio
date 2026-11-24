/**
 * KAVYANAND J - CODESPOT THEME INTERACTION SCRIPT
 * Handles live plagiarism simulator, copy-to-clipboard,
 * contact mailto routing, and smooth navigation.
 */

document.addEventListener('DOMContentLoaded', () => {

  // 1. ACTIVE NAV SPY & SMOOTH SCROLL
  const navLinks = document.querySelectorAll('.pill-nav-link');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    let currentId = '';
    sections.forEach(sec => {
      const top = sec.offsetTop - 120;
      const height = sec.offsetHeight;
      if (window.scrollY >= top && window.scrollY < top + height) {
        currentId = sec.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      }
    });
  });

  // 2. LIVE IN-BROWSER PLAGIARISM SIMULATOR
  const docAInput = document.getElementById('text-doc-a');
  const docBInput = document.getElementById('text-doc-b');
  const runCheckBtn = document.getElementById('run-check-btn');
  const loadSampleBtn = document.getElementById('load-sample-btn');
  const clearDemoBtn = document.getElementById('clear-demo-btn');
  const demoResult = document.getElementById('demo-result');
  const meterScore = document.getElementById('meter-score');
  const meterCircle = document.getElementById('meter-circle');
  const resultStatusTitle = document.getElementById('result-status-title');
  const resultStatusDesc = document.getElementById('result-status-desc');
  const tokenStats = document.getElementById('token-stats');

  const sampleDocA = `Computer Science and Engineering is an academic discipline combining computer engineering and computer science principles. It equips students with deep foundational knowledge in algorithmic analysis, data structures, and Linux system administration.`;

  const sampleDocB = `Computer Science and Engineering is a recognized discipline integrating software engineering and computer science concepts. It prepares students with solid knowledge in algorithmic analysis, data structures, and Linux system administration.`;

  if (loadSampleBtn) {
    loadSampleBtn.addEventListener('click', () => {
      docAInput.value = sampleDocA;
      docBInput.value = sampleDocB;
      showToast('Sample documents loaded for analysis');
    });
  }

  if (clearDemoBtn) {
    clearDemoBtn.addEventListener('click', () => {
      docAInput.value = '';
      docBInput.value = '';
      if (demoResult) demoResult.style.display = 'none';
    });
  }

  if (runCheckBtn) {
    runCheckBtn.addEventListener('click', () => {
      const textA = (docAInput.value || '').trim();
      const textB = (docBInput.value || '').trim();

      if (!textA || !textB) {
        showToast('Please enter text in both Document A and Document B');
        return;
      }

      // Algorithm: Tokenization & Jaccard Overlap
      const tokensA = cleanAndTokenize(textA);
      const tokensB = cleanAndTokenize(textB);

      if (tokensA.length === 0 || tokensB.length === 0) {
        showToast('Text too brief for similarity assessment');
        return;
      }

      const setA = new Set(tokensA);
      const setB = new Set(tokensB);
      const intersection = new Set([...setA].filter(x => setB.has(x)));
      const union = new Set([...setA, ...setB]);

      let similarity = Math.round((intersection.size / union.size) * 100);

      // Bi-gram matching
      const bigramsA = getBigrams(tokensA);
      const bigramsB = getBigrams(tokensB);
      if (bigramsA.size > 0 && bigramsB.size > 0) {
        const biInter = new Set([...bigramsA].filter(x => bigramsB.has(x)));
        const biUnion = new Set([...bigramsA, ...bigramsB]);
        const biScore = Math.round((biInter.size / biUnion.size) * 100);
        similarity = Math.round(similarity * 0.5 + biScore * 0.5);
      }

      similarity = Math.min(100, Math.max(0, similarity));

      // Display result
      demoResult.style.display = 'block';
      meterScore.textContent = `${similarity}%`;

      if (similarity >= 65) {
        meterCircle.style.borderColor = '#ef4444';
        meterScore.style.color = '#ef4444';
        resultStatusTitle.textContent = 'High Similarity Detected ⚠️';
        resultStatusTitle.style.color = '#ef4444';
        resultStatusDesc.textContent = 'Substantial sequence and vocabulary overlap detected between Document A and B.';
      } else if (similarity >= 30) {
        meterCircle.style.borderColor = '#f59e0b';
        meterScore.style.color = '#f59e0b';
        resultStatusTitle.textContent = 'Moderate Similarity Detected 🔍';
        resultStatusTitle.style.color = '#f59e0b';
        resultStatusDesc.textContent = 'Partial overlap in phrasing and terminology identified.';
      } else {
        meterCircle.style.borderColor = '#00ff66';
        meterScore.style.color = '#00ff66';
        resultStatusTitle.textContent = 'Original Content / Low Similarity ✅';
        resultStatusTitle.style.color = '#00ff66';
        resultStatusDesc.textContent = 'Documents appear largely distinct and independent.';
      }

      tokenStats.innerHTML = `Tokens Doc A: <strong>${tokensA.length}</strong> | Tokens Doc B: <strong>${tokensB.length}</strong> | Shared Terms: <strong>${intersection.size}</strong>`;

      showToast(`Similarity calculated: ${similarity}%`);
    });
  }

  function cleanAndTokenize(str) {
    return str
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 2);
  }

  function getBigrams(arr) {
    const bigrams = new Set();
    for (let i = 0; i < arr.length - 1; i++) {
      bigrams.add(`${arr[i]}_${arr[i + 1]}`);
    }
    return bigrams;
  }

  // 3. COPY TO CLIPBOARD
  const copyButtons = document.querySelectorAll('.c-copy-btn');
  copyButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const text = btn.getAttribute('data-copy');
      if (text) {
        navigator.clipboard.writeText(text).then(() => {
          showToast(`Copied to clipboard: ${text}`);
          const original = btn.innerHTML;
          btn.innerHTML = '<i class="fa-solid fa-check" style="color:#00ff66;"></i>';
          setTimeout(() => {
            btn.innerHTML = original;
          }, 2000);
        });
      }
    });
  });

  // 4. CONTACT FORM HANDLER
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const subject = document.getElementById('subject').value;
      const message = document.getElementById('message').value;

      const mailtoUrl = `mailto:jkavyanand27@gmail.com?subject=${encodeURIComponent(subject + ' - ' + name)}&body=${encodeURIComponent("From: " + name + " (" + email + ")\n\n" + message)}`;
      showToast('Opening email client...');
      window.location.href = mailtoUrl;
      contactForm.reset();
    });
  }

  // 5. DYNAMIC YEAR
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // 6. TOAST UTILITY
  function showToast(msg) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fa-solid fa-circle-check" style="color:#00ff66;"></i> <span>${msg}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
});
