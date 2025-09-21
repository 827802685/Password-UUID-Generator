export default {
  async fetch(request) {
    const url = new URL(request.url);

    // 如果是 POST 请求，处理生成逻辑
    if (request.method === "POST") {
      const formData = await request.formData();
      const type = formData.get("type");

      if (type === "password") {
        // 生成密码逻辑
        const length = parseInt(formData.get("length") || "12", 10);
        const useUppercase = formData.get("uppercase") === "on";
        const useLowercase = formData.get("lowercase") === "on";
        const useNumbers = formData.get("numbers") === "on";
        const useSymbols = formData.get("symbols") === "on";

        let charset = "";
        if (useUppercase) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        if (useLowercase) charset += "abcdefghijklmnopqrstuvwxyz";
        if (useNumbers) charset += "0123456789";
        if (useSymbols) charset += "!@#$%^&*()_+~`-={}|[]:;\"'<>,.?/";

        if (!charset) {
          return new Response(JSON.stringify({ error: getTranslation('errorNoCharset') }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        try {
          const password = generatePassword(length, charset);
          return new Response(JSON.stringify({ password }), {
            headers: { "Content-Type": "application/json" },
          });
        } catch (e) {
          return new Response(JSON.stringify({ error: e.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      } else if (type === "uuid") {
        try {
          const uuid = generateUUID();
          return new Response(JSON.stringify({ uuid }), {
            headers: { "Content-Type": "application/json" },
          });
        } catch (e) {
          return new Response(JSON.stringify({ error: e.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      } else {
        return new Response(JSON.stringify({ error: getTranslation('errorInvalidType') }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    // 默认返回 HTML 页面
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Password & UUID Generator</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet">
        <style>
          :root {
            --primary-color: #4a90e2;
            --secondary-color: #357ABD;
            --success-color: #48bb78;
            --error-color: #e53e3e;
            --light-bg: #f4f6f8;
            --dark-bg: #1a202c;
            --light-text: #333;
            --dark-text: #f7fafc;
            --border-radius: 12px;
            --transition-speed: 0.3s;
          }

          body {
            font-family: 'Inter', sans-serif;
            background: var(--light-bg);
            color: var(--light-text);
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            transition: background var(--transition-speed), color var(--transition-speed);
          }

          .container {
            background: #ffffff;
            padding: 30px;
            border-radius: var(--border-radius);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            max-width: 400px;
            width: 90%;
            position: relative;
            overflow: hidden;
          }

          h1 {
            text-align: center;
            color: #333;
            margin-bottom: 20px;
            font-weight: 600;
          }

          label {
            display: block;
            margin-top: 10px;
            font-weight: 600;
            color: #555;
          }

          input[type="number"] {
            width: 100%;
            padding: 10px;
            margin-top: 5px;
            border-radius: 6px;
            border: 1px solid #ccc;
            transition: border-color var(--transition-speed);
          }

          input[type="number"]:focus {
            border-color: var(--primary-color);
            outline: none;
          }

          .checkbox-group {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-top: 10px;
          }

          .checkbox-group label {
            font-weight: 400;
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 8px;
          }

          button {
            width: 100%;
            padding: 12px;
            margin-top: 20px;
            background-color: var(--primary-color);
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 16px;
            cursor: pointer;
            transition: background-color var(--transition-speed);
          }

          button:hover {
            background-color: var(--secondary-color);
          }

          .password, .uuid {
            margin-top: 20px;
            font-size: 1.2em;
            color: var(--primary-color);
            text-align: center;
            word-break: break-all;
            position: relative;
          }

          .copy-button {
            margin-top: 10px;
            padding: 8px 16px;
            background-color: #e2e8f0;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            transition: background-color var(--transition-speed);
          }

          .copy-button:hover {
            background-color: #cbd5e0;
          }

          .error {
            color: var(--error-color);
            margin-top: 10px;
            text-align: center;
          }

          .theme-toggle {
            display: flex;
            justify-content: center;
            gap: 10px;
            margin-top: 20px;
            flex-wrap: wrap;
          }

          .language-select {
            position: absolute;
            top: 10px;
            right: 10px;
            z-index: 10;
          }

          .language-menu {
            display: none;
            position: absolute;
            top: 30px;
            right: 0;
            background: white;
            border: 1px solid #ccc;
            border-radius: 4px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            z-index: 20;
          }

          .language-menu button {
            display: block;
            width: auto;
            padding: 5px 10px;
            border: none;
            background: none;
            cursor: pointer;
            color: black;
          }

          .language-toggle {
            cursor: pointer;
            background: #e2e8f0;
            padding: 6px 10px;
            border-radius: 50%;
          }

          @media (max-width: 400px) {
            .checkbox-group {
              grid-template-columns: 1fr;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1 id="title">Password & UUID Generator</h1>
          <form id="generatorForm">
            <label><input type="radio" name="type" value="password" checked> Generate Password</label>
            <label><input type="radio" name="type" value="uuid"> Generate UUID</label>

            <!-- 密码配置 -->
            <div id="passwordConfig">
              <label for="length">Password Length:</label>
              <input type="number" id="length" name="length" value="12" min="1" required>

              <div class="checkbox-group">
                <label><input type="checkbox" name="uppercase" checked> Uppercase</label>
                <label><input type="checkbox" name="lowercase" checked> Lowercase</label>
                <label><input type="checkbox" name="numbers" checked> Numbers</label>
                <label><input type="checkbox" name="symbols" checked> Symbols</label>
              </div>
            </div>

            <button type="submit" id="generateButton">Generate</button>
          </form>

          <div class="password" id="output"></div>
          <div class="error" id="errorOutput"></div>
          <div class="theme-toggle">
            <button onclick="setTheme('light')">🌞 Light Mode</button>
            <button onclick="setTheme('dark')">🌙 Dark Mode</button>
            <button onclick="setTheme('auto')">⚙️ Auto</button>
          </div>

          <div class="language-select">
            <button class="language-toggle" onclick="toggleLanguageMenu()">🌐</button>
            <div class="language-menu" id="languageMenu">
              <button onclick="setLanguage('en')">English</button>
              <button onclick="setLanguage('zh')">简体中文</button>
              <button onclick="setLanguage('zh-TW')">繁體中文</button>
              <button onclick="setLanguage('ja')">日本語</button>
            </div>
          </div>
        </div>

        <script>
          const form = document.getElementById('generatorForm');
          const passwordConfig = document.getElementById('passwordConfig');
          const output = document.getElementById('output');
          const errorOutput = document.getElementById('errorOutput');
          const languageMenu = document.getElementById('languageMenu');
          const title = document.getElementById('title');
          const generateButton = document.getElementById('generateButton');

          // 显示/隐藏密码配置
          form.querySelector('input[name="type"]').addEventListener('change', (e) => {
            if (e.target.value === 'uuid') {
              passwordConfig.style.display = 'none';
            } else {
              passwordConfig.style.display = 'block';
            }
          });

          // 表单提交处理
          form.addEventListener('submit', async (e) => {
            e.preventDefault();
            output.innerHTML = '';
            errorOutput.textContent = '';
            const formData = new FormData(form);
            const response = await fetch('', {
              method: 'POST',
              body: formData
            });
            const result = await response.json();

            if (result.password) {
              output.innerHTML = \`
                <div>\${result.password}</div>
                <button class="copy-button" onclick="navigator.clipboard.writeText('\${result.password}').then(() => alert('\${getTranslation('copySuccess')}'));">\${getTranslation('copy')}</button>
              \`;
            } else if (result.uuid) {
              output.innerHTML = \`
                <div>\${result.uuid}</div>
                <button class="copy-button" onclick="navigator.clipboard.writeText('\${result.uuid}').then(() => alert('\${getTranslation('copySuccess')}'));">\${getTranslation('copy')}</button>
              \`;
            } else {
              errorOutput.textContent = result.error;
            }
          });

          // 主题设置
          let currentTheme = localStorage.getItem('theme') || 'auto';
          function setTheme(theme) {
            currentTheme = theme;
            localStorage.setItem('theme', theme);
            applyTheme();
          }

          function applyTheme() {
            if (currentTheme === 'auto') {
              if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                document.body.style.backgroundColor = 'var(--dark-bg)';
                document.body.style.color = 'var(--dark-text)';
              } else {
                document.body.style.backgroundColor = 'var(--light-bg)';
                document.body.style.color = 'var(--light-text)';
              }
            } else {
              document.body.style.backgroundColor = currentTheme === 'dark' ? 'var(--dark-bg)' : 'var(--light-bg)';
              document.body.style.color = currentTheme === 'dark' ? 'var(--dark-text)' : 'var(--light-text)';
            }
          }

          // 语言设置
          let currentLang = localStorage.getItem('lang') || 'en';
          const translations = {
            en: {
              passwordLength: 'Password Length:',
              generatePassword: 'Generate Password',
              generateUUID: 'Generate UUID',
              title: 'Password & UUID Generator',
              copy: 'Copy',
              copySuccess: 'Copied to clipboard!',
              errorNoCharset: 'Please select at least one character type',
              errorInvalidType: 'Invalid request type'
            },
            zh: {
              passwordLength: '密码长度:',
              generatePassword: '生成密码',
              generateUUID: '生成UUID',
              title: '密码与UUID生成器',
              copy: '复制',
              copySuccess: '已复制到剪贴板！',
              errorNoCharset: '请选择至少一种字符类型',
              errorInvalidType: '无效的请求类型'
            },
            'zh-TW': {
              passwordLength: '密碼長度:',
              generatePassword: '生成密碼',
              generateUUID: '生成UUID',
              title: '密碼與UUID產生器',
              copy: '複製',
              copySuccess: '已複製到剪貼簿！',
              errorNoCharset: '請選擇至少一種字元類型',
              errorInvalidType: '無效的請求類型'
            },
            ja: {
              passwordLength: 'パスワード長:',
              generatePassword: 'パスワード生成',
              generateUUID: 'UUID生成',
              title: 'パスワードとUUIDジェネレーター',
              copy: 'コピー',
              copySuccess: 'クリップボードにコピーしました！',
              errorNoCharset: '少なくとも1つの文字種類を選択してください',
              errorInvalidType: '無効なリクエストタイプ'
            }
          };

          function getTranslation(key) {
            return translations[currentLang][key] || key;
          }

          function setLanguage(lang) {
            currentLang = lang;
            localStorage.setItem('lang', lang);
            document.querySelector('label[for="length"]').textContent = getTranslation('passwordLength');
            document.querySelector('button[type="submit"]').textContent = getTranslation('generatePassword');
            title.textContent = getTranslation('title');
            document.querySelectorAll('label input[type="radio"]').forEach(radio => {
              radio.nextSibling.textContent = radio.value === 'password' ? getTranslation('generatePassword') : getTranslation('generateUUID');
            });
          }

          // 切换语言菜单的显示
          function toggleLanguageMenu() {
            languageMenu.style.display = languageMenu.style.display === 'block' ? 'none' : 'block';
          }

          // 初始化
          setLanguage(currentLang);
          applyTheme();
        </script>
      </body>
      </html>
    `;

    return new Response(html, {
      headers: { "Content-Type": "text/html" },
    });
  },
};

// 生成密码
function generatePassword(length, charset) {
  const crypto = globalThis.crypto;
  const len = charset.length;
  const values = crypto.getRandomValues(new Uint32Array(length));
  let result = "";
  for (let i = 0; i < length; i++) {
    result += charset.charAt(values[i] % len);
  }
  return result;
}

// 生成 UUID v4
function generateUUID() {
  const crypto = globalThis.crypto;
  const buffer = new Uint8Array(16);
  crypto.getRandomValues(buffer);

  // Set version to 4 (random)
  buffer[6] = (buffer[6] & 0x0f) | 0x40; // 10xx xxxx
  buffer[8] = (buffer[8] & 0x3f) | 0x80; // 10xx xxxx

  const hex = Array.from(buffer, b => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20,32)}`;
}
