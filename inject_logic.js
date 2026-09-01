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

const scriptToInject = `
<script>
  // Mobile back button logic: if arrived from outside, force back button to go to home page
  if (!document.referrer || !document.referrer.includes(window.location.hostname)) {
    window.history.pushState({ intercept: true }, "", window.location.href);
    window.addEventListener("popstate", function () {
      window.location.href = "index.html";
    });
  }
</script>
`;

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    // only inject if not already present
    if (!content.includes('intercept: true')) {
      content = content.replace('</body>', scriptToInject + '</body>');
      fs.writeFileSync(filePath, content);
      console.log('Injected into ' + file);
    } else {
      console.log('Already injected in ' + file);
    }
  }
});
