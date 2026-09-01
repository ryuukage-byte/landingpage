const fs = require('fs');
const path = require('path');

const files = [
  'index.html',
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
<div id="follow-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); background: rgba(10, 10, 10, 0.6); z-index: 9999; display: flex; flex-direction: column; align-items: center; justify-content: center; opacity: 1; transition: opacity 0.5s ease; padding: 20px;">
  <div style="background: var(--surface); padding: 40px; border-radius: 24px; text-align: center; border: 1px solid var(--border); box-shadow: 0 20px 40px rgba(0,0,0,0.5); max-width: 100%; width: 400px; animation: rise 700ms var(--ease) both;">
    <h2 style="font-family: 'Space Grotesk', sans-serif; font-size: 24px; margin-bottom: 16px; color: var(--text);">Unlock Access 🔒</h2>
    <p style="font-family: 'Inter', sans-serif; font-size: 15px; color: var(--text-dim); margin-bottom: 32px; line-height: 1.6;">Follow akun TikTok <b>@kiyotaaaa_</b> untuk membuka akses penuh ke semua fitur dan sistem di web ini.</p>
    <a href="https://www.tiktok.com/@kiyotaaaa_?is_from_webapp=1&sender_device=pc" target="_blank" id="follow-btn" style="display: inline-block; background: #fff; color: #000; font-family: 'Inter', sans-serif; font-weight: 600; font-size: 15px; padding: 14px 28px; border-radius: 12px; text-decoration: none; transition: transform 0.2s ease;">Follow & Unlock &rarr;</a>
  </div>
</div>

<script>
  document.addEventListener('DOMContentLoaded', function() {
    const overlay = document.getElementById('follow-overlay');
    const followBtn = document.getElementById('follow-btn');
    
    if (!overlay || !followBtn) return;
    
    // Check if user already unlocked
    if (localStorage.getItem('hasFollowedKiyota') === 'true') {
      overlay.style.display = 'none';
      return;
    }
    
    // Disable scrolling when overlay is active
    document.body.style.overflow = 'hidden';
    
    followBtn.addEventListener('click', function() {
      // Save to localStorage
      localStorage.setItem('hasFollowedKiyota', 'true');
      
      // Animate out
      overlay.style.opacity = '0';
      setTimeout(() => {
        overlay.style.display = 'none';
        document.body.style.overflow = '';
      }, 500);
    });
  });
</script>
<!-- END FOLLOW OVERLAY -->
`;

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // only inject if not already present
    if (!content.includes('id="follow-overlay"')) {
      // Insert right after <body>
      content = content.replace('<body>', '<body>\n' + overlayHTML);
      fs.writeFileSync(filePath, content);
      console.log('Injected overlay into ' + file);
    } else {
      console.log('Overlay already injected in ' + file);
    }
  }
});
