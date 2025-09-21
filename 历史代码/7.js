// ==/worker.js==
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const html = `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Password & UUID Generator</title>
    <style>
      :root {
        --bg-color: #ffffff;
        --text-color: #000000;
        --card-bg: #f9f9f9;
        --btn-primary: #3b82f6;
        --btn-hover: #2563eb;
      }

      .dark {
        --bg-color: #1a202c;
        --text-color: #f7fafc;
        --card-bg: #2d3748;
        --btn-primary: #4fd1c5;
        --btn-hover: #38b2ac;
      }

      body {
        min-height: 100vh;
        margin: 0;
        padding: 2rem;
        background-color: var(--bg-color);
        color: var(--text-color);
        font-family: 'Segoe UI', sans-serif;
        transition: background-color 0.3s, color 0.3s;
      }

      .container {
        max-width: 600px;
        margin: 0 auto;
        background-color: var(--card-bg);
        padding: 2rem;
        border-radius: 1rem;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      }

      h1 {
        text-align: center;
        margin-bottom: 2rem;
      }

      .form-group {
        margin-bottom: 1.5rem;
      }

      label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
      }

      input[type="number"] {
        width: 100%;
        padding: 0.5rem;
        margin-bottom: 1rem;
        border: 1px solid #ccc;
        border-radius: 0.375rem;
      }

      .checkbox-group {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
      }

      .checkbox-group label {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: normal;
      }

      .checkbox-group input {
        transform: scale(1.2);
      }

      .btn {
        display: inline-block;
        padding: 0.75rem 1.5rem;
        margin-top: 1rem;
        background-color: var(--btn-primary);
        color: white;
        border: none;
        border-radius: 0.375rem;
        cursor: pointer;
        transition: background-color 0.3s;
      }

      .btn:hover {
        background-color: var(--btn-hover);
      }

      .result {
        margin-top: 1.5rem;
        padding: 1rem;
        background-color: #e2e8f0;
        border-radius: 0.5rem;
        font-family: monospace;
        white-space: pre-wrap;
      }

      .dark .result {
        background-color: #2d3748;
      }

      .language-btn {
        margin: 1rem 0;
        display: flex;
        gap: 0.5rem;
        justify-content: center;
      }

      .theme-toggle {
        position: fixed;
        top: 1rem;
        right: 1rem;
        display: flex;
        gap: 0.5rem;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1 id="title">Password & UUID Generator</h1>
      
      <div class="language-btn">
        <button onclick="setLanguage('en')">English</button>
        <button onclick="setLanguage('zh')">简体中文</button>
        <button onclick="setLanguage('zh-TW')">繁體中文</button>
        <button onclick="setLanguage('ja')">日本語</button>
      </div>

      <form id="passwordForm" class="form-group">
        <label for="length">${getTranslation('passwordLength')}</label>
        <input type="number" id="length" name="length" min="4" max="128" value="12" required>
        
        <div class="checkbox-group">
          <label><input type="checkbox" id="uppercase" checked> ${getTranslation('includeUppercase')}</label>
          <label><input type="checkbox" id="lowercase" checked> ${getTranslation('includeLowercase')}</label>
          <label><input type="checkbox" id="numbers" checked> ${getTranslation('includeNumbers')}</label>
          <label><input type="checkbox" id="symbols"> ${getTranslation('includeSymbols')}</label>
        </div>
        
        <button type="submit" class="btn">${getTranslation('generatePassword')}</button>
      </form>

      <div class="result" id="passwordResult"></div>

      <button onclick="generateUUID()" class="btn">${getTranslation('generateUUID')}</button>
      <div class="result" id="uuidResult"></div>
    </div>

    <div class="theme-toggle">
      <button onclick="setTheme('auto')">☀️</button>
      <button onclick="setTheme('light')">🌞</button>
      <button onclick="setTheme('dark')">🌙</button>
    </div>

    <script>
      const translations = {
        en: {
          passwordLength: 'Password Length:',
          includeUppercase: 'Include Uppercase',
          includeLowercase: 'Include Lowercase',
          includeNumbers: 'Include Numbers',
          includeSymbols: 'Include Symbols',
          generatePassword: 'Generate Password',
          generatedPassword: 'Generated Password:',
          generateUUID: 'Generate UUID',
          title: 'Password & UUID Generator'
        },
        zh: {
          passwordLength: '密码长度:',
          includeUppercase: '包含大写字母',
          includeLowercase: '包含小写字母',
          includeNumbers: '包含数字',
          includeSymbols: '包含符号',
          generatePassword: '生成密码',
          generatedPassword: '生成的密码:',
          generateUUID: '生成UUID',
          title: '密码与UUID生成器'
        },
        'zh-TW': {
          passwordLength: '密碼長度:',
          includeUppercase: '包含大寫字母',
          includeLowercase: '包含小寫字母',
          includeNumbers: '包含數字',
          includeSymbols: '包含符號',
          generatePassword: '生成密碼',
          generatedPassword: '生成的密碼:',
          generateUUID: '生成UUID',
          title: '密碼與UUID產生器'
        },
        ja: {
          passwordLength: 'パスワード長:',
          includeUppercase: '大文字を含む',
          includeLowercase: '小文字を含む',
          includeNumbers: '数字を含む',
          includeSymbols: '記号を含む',
          generatePassword: 'パスワード生成',
          generatedPassword: '生成されたパスワード:',
          generateUUID: 'UUID生成',
          title: 'パスワードとUUIDジェネレーター'
        }
      };

      let currentLang = localStorage.getItem('lang') || 'en';
      let currentTheme = localStorage.getItem('theme') || 'auto';

      function getTranslation(key) {
        return translations[currentLang][key] || key;
      }

      function setLanguage(lang) {
        currentLang = lang;
        localStorage.setItem('lang', lang);
        document.getElementById('title').textContent = getTranslation('title');
        document.querySelector('#passwordForm label[for="length"]').textContent = getTranslation('passwordLength');
        document.querySelector('#passwordForm label[for="uppercase"]').lastChild.textContent = getTranslation('includeUppercase');
        document.querySelector('#passwordForm label[for="lowercase"]').lastChild.textContent = getTranslation('includeLowercase');
        document.querySelector('#passwordForm label[for="numbers"]').lastChild.textContent = getTranslation('includeNumbers');
        document.querySelector('#passwordForm label[for="symbols"]').lastChild.textContent = getTranslation('includeSymbols');
        document.querySelector('#passwordForm button').textContent = getTranslation('generatePassword');
        document.querySelector('.btn[onclick="generateUUID()"]').textContent = getTranslation('generateUUID');
      }

      function setTheme(theme) {
        currentTheme = theme;
        localStorage.setItem('theme', theme);
        applyTheme();
      }

      function applyTheme() {
        if (currentTheme === 'auto') {
          if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.body.classList.add('dark');
          } else {
            document.body.classList.remove('dark');
          }
        } else {
          document.body.classList.toggle('dark', currentTheme === 'dark');
        }
      }

      function generatePassword() {
        const length = parseInt(document.getElementById('length').value);
        const includeUppercase = document.getElementById('uppercase').checked;
        const includeLowercase = document.getElementById('lowercase').checked;
        const includeNumbers = document.getElementById('numbers').checked;
        const includeSymbols = document.getElementById('symbols').checked;

        const chars = {
          uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
          lowercase: 'abcdefghijklmnopqrstuvwxyz',
          numbers: '0123456789',
          symbols: '!@#$%^&*()_+{}[]<>?/|\\'
        };

        let allowedChars = '';
        if (includeUppercase) allowedChars += chars.uppercase;
        if (includeLowercase) allowedChars += chars.lowercase;
        if (includeNumbers) allowedChars += chars.numbers;
        if (includeSymbols) allowedChars += chars.symbols;

        if (allowedChars.length === 0) {
          alert(getTranslation('noCharSelected'));
          return;
        }

        const array = new Uint8Array(length);
        window.crypto.getRandomValues(array);
        let password = '';
        for (let i = 0; i < length; i++) {
          password += allowedChars[array[i] % allowedChars.length];
        }
        document.getElementById('passwordResult').textContent = password;
      }

      function generateUUID() {
        const uuid = window.crypto.randomUUID();
        document.getElementById('uuidResult').textContent = uuid;
      }

      document.getElementById('passwordForm').addEventListener('submit', function(e) {
        e.preventDefault();
        generatePassword();
      });

      // Initialize
      setLanguage(currentLang);
      applyTheme();
    </script>
  </body>
  </html>`;
  
  return new Response(html, {
    headers: { 
      'Content-Type': 'text/html',
      'Cache-Control': 'no-cache'
    }
  });
}
