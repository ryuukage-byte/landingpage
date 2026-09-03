const fs = require('fs');
const path = require('path');

const files = [
  'ai.html',
  'business.html',
  'financial.html',
  'learning.html',
  'life.html',
  'media.html',
  'utilities.html'
];

const overlayHTML = `
<!-- FOLLOW OVERLAY -->
<div id="follow-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); background: rgba(10, 10, 10, 0.7); z-index: 9999; display: none; opacity: 0; pointer-events: none; transition: opacity 0.3s ease; justify-content: center; align-items: center; padding: 20px;">
  <div class="follow-modal-box" style="position: relative; background: var(--surface); padding: 40px 32px 32px; border-radius: 24px; text-align: center; border: 1px solid var(--border-strong); box-shadow: 0 24px 48px rgba(0,0,0,0.6); max-width: 100%; width: 400px; transform: translateY(12px); transition: transform 0.3s var(--ease);">
    <button id="close-overlay-x" aria-label="Tutup" style="position: absolute; top: 16px; right: 16px; width: 32px; height: 32px; border-radius: 50%; border: 1px solid var(--border); background: var(--surface-2); color: var(--text-dim); display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 16px; line-height: 1; transition: background 0.2s, color 0.2s;">&#x2715;</button>
    <div style="font-size: 36px; margin-bottom: 12px; line-height: 1;">🔒</div>
    <h2 style="font-family: 'Space Grotesk', sans-serif; font-size: 22px; margin-bottom: 12px; color: var(--text);">Unlock Access</h2>
    <p style="font-family: 'Inter', sans-serif; font-size: 14.5px; color: var(--text-dim); margin-bottom: 28px; line-height: 1.6;">Follow akun TikTok <b>@kiyotaaaa_</b> untuk membuka akses ke produk ini.</p>
    <a href="https://www.tiktok.com/@kiyotaaaa_?is_from_webapp=1&sender_device=pc" target="_blank" id="follow-btn" style="display: block; background: #fff; color: #000; font-family: 'Inter', sans-serif; font-weight: 600; font-size: 15px; padding: 14px 28px; border-radius: 12px; text-decoration: none; transition: transform 0.2s ease, opacity 0.2s ease; box-shadow: 0 4px 14px rgba(255,255,255,0.12);">Follow & Unlock &rarr;</a>
    <button id="close-modal-btn" style="background: none; border: none; color: var(--text-faint); font-family: 'Inter', sans-serif; font-size: 13px; margin-top: 14px; cursor: pointer; text-decoration: underline;">Nanti saja</button>
  </div>
</div>

<style>
  #close-overlay-x:hover {
    background: var(--surface-3) !important;
    color: var(--text) !important;
  }
  #follow-btn:hover {
    transform: translateY(-2px);
    opacity: 0.95;
  }
  #close-modal-btn:hover {
    color: var(--text-dim) !important;
  }
</style>

<script>
  (function() {
    const overlay = document.getElementById('follow-overlay');
    const followBtn = document.getElementById('follow-btn');
    const closeBtn = document.getElementById('close-overlay-x');
    const cancelBtn = document.getElementById('close-modal-btn');
    const modalBox = overlay ? overlay.querySelector('.follow-modal-box') : null;
    
    if (!overlay || !followBtn) return;
    
    let pendingUrl = null;
    
    function openModal(url) {
      pendingUrl = url;
      overlay.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(() => {
        overlay.style.opacity = '1';
        overlay.style.pointerEvents = 'auto';
        if (modalBox) modalBox.style.transform = 'translateY(0)';
      });
    }
    
    function closeModal() {
      overlay.style.opacity = '0';
      overlay.style.pointerEvents = 'none';
      if (modalBox) modalBox.style.transform = 'translateY(12px)';
      setTimeout(() => {
        overlay.style.display = 'none';
        document.body.style.overflow = '';
        pendingUrl = null;
      }, 300);
    }
    
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) closeModal();
    });
    
    // Intercept clicks on any product card
    document.addEventListener('click', function(e) {
      const card = e.target.closest('.product-card');
      if (!card) return;
      
      if (localStorage.getItem('hasFollowedKiyota') !== 'true') {
        e.preventDefault();
        openModal(card.href);
      }
    });
    
    // When follow button is clicked
    followBtn.addEventListener('click', function() {
      localStorage.setItem('hasFollowedKiyota', 'true');
      const targetUrl = pendingUrl;
      closeModal();
      if (targetUrl) {
        setTimeout(() => {
          window.location.href = targetUrl;
        }, 500);
      }
    });
  })();
</script>
<!-- END FOLLOW OVERLAY -->
`;

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    if (content.includes('<!-- FOLLOW OVERLAY -->')) {
      // Replace existing overlay
      content = content.replace(/<!-- FOLLOW OVERLAY -->[\s\S]*?<!-- END FOLLOW OVERLAY -->/, overlayHTML.trim());
      fs.writeFileSync(filePath, content);
      console.log('Updated overlay in ' + file);
    } else if (content.includes('<body>')) {
      // Insert right after <body>
      content = content.replace('<body>', '<body>\n' + overlayHTML.trim());
      fs.writeFileSync(filePath, content);
      console.log('Injected overlay into ' + file);
    }
  }
});
