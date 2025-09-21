export default {
  async fetch(request) {
    const url = new URL(request.url);
    
    // 返回HTML界面
    if (url.pathname === '/generator') {
      return new Response(htmlContent, {
        headers: {
          'Content-Type': 'text/html',
          'Cache-Control': 'no-cache'
        }
      });
    }

    // 处理API请求
    try {
      const type = url.searchParams.get('type') || 'password';
      
      if (type === 'password') {
        const length = parseInt(url.searchParams.get('length') || '12', 10);
        const includeUppercase = url.searchParams.get('uppercase') !== 'false';
        const includeLowercase = url.searchParams.get('lowercase') !== 'false';
        const includeNumbers = url.searchParams.get('numbers') !== 'false';
        const includeSymbols = url.searchParams.get('symbols') !== 'false';

        if (isNaN(length) || length < 4 || length > 128) {
          throw new Error('Length must be between 4 and 128');
        }

        const charSets = {
          uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
          lowercase: 'abcdefghijklmnopqrstuvwxyz',
          numbers: '0123456789',
          symbols: '!@#$%^&*()-_=+[]{}|;:,.<>/?`~'
        };

        let chars = '';
        if (includeUppercase) chars += charSets.uppercase;
        if (includeLowercase) chars += charSets.lowercase;
        if (includeNumbers) chars += charSets.numbers;
        if (includeSymbols) chars += charSets.symbols;

        if (!chars.length) {
          throw new Error('At least one character type must be selected');
        }

        const crypto = globalThis.crypto;
        const array = new Uint32Array(length);
        crypto.getRandomValues(array);
        
        let password = '';
        for (let i = 0; i < length; i++) {
          password += chars[array[i] % chars.length];
        }

        return new Response(JSON.stringify({
          success: true,
          result: password,
          type: 'password',
          timestamp: new Date().toISOString()
        }), {
          headers: { 'Content-Type': 'application/json' }
        });

      } else if (type === 'uuid') {
        const crypto = globalThis.crypto;
        const uuid = crypto.randomUUID();
        
        return new Response(JSON.stringify({
          success: true,
          result: uuid,
          type: 'uuid',
          timestamp: new Date().toISOString()
        }), {
          headers: { 'Content-Type': 'application/json' }
        });

      } else {
        throw new Error('Invalid type. Use "password" or "uuid"');
      }

    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
};

// HTML内容模板
const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Secure Generator</title>
  <style>
    body {
      font-family: 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #1e3c72, #2a5298);
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 0;
      padding: 20px;
      color: #fff;
    }
    .container {
      background: #ffffff1a;
      backdrop-filter: blur(10px);
      border-radius: 15px;
      padding: 30px;
      width: 100%;
      max-width: 500px;
      box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
    }
    h1 {
      text-align: center;
      margin-bottom: 25px;
      font-size: 24px;
      color: #fff;
    }
    .tab-buttons {
      display: flex;
      justify-content: center;
      margin-bottom: 20px;
    }
    .tab-button {
      padding: 10px 20px;
      margin: 0 5px;
      border: none;
      border-radius: 20px;
      background: #fff3;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    .tab-button.active {
      background: #fff;
      color: #1e3c72;
    }
    .form-group {
      margin-bottom: 15px;
    }
    label {
      display: block;
      margin-bottom: 5px;
      font-weight: 600;
    }
    input[type="number"] {
      width: 100%;
      padding: 10px;
      border: none;
      border-radius: 8px;
      background: #fff3;
      font-size: 16px;
    }
    .checkbox-group {
      display: flex;
      gap: 15px;
      flex-wrap: wrap;
    }
    .checkbox-group label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
    }
    .checkbox-group input {
      accent-color: #1e3c72;
    }
    button {
      width: 100%;
      padding: 15px;
      background: #1e3c72;
      border: none;
      border-radius: 8px;
      color: white;
      font-size: 16px;
      cursor: pointer;
      transition: background 0.3s ease;
    }
    button:hover {
      background: #2a5298;
    }
    .result {
      margin-top: 25px;
      padding: 20px;
      background: #fff3;
      border-radius: 8px;
      font-family: monospace;
      white-space: pre-wrap;
      word-break: break-all;
    }
    .timestamp {
      margin-top: 10px;
      font-size: 12px;
      color: #ccc;
      text-align: right;
    }
    @media (max-width: 500px) {
      .container {
        padding: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Secure Generator</h1>
    <div class="tab-buttons">
      <button class="tab-button active" onclick="switchTab('password')">Password</button>
      <button class="tab-button" onclick="switchTab('uuid')">UUID</button>
    </div>
    
    <form id="passwordForm" class="form-group">
      <div>
        <label>Length (4-128):</label>
        <input type="number" id="length" value="12" min="4" max="128">
      </div>
      <div class="checkbox-group">
        <label><input type="checkbox" checked> Include Uppercase</label>
        <label><input type="checkbox" checked> Include Lowercase</label>
        <label><input type="checkbox" checked> Include Numbers</label>
        <label><input type="checkbox" checked> Include Symbols</label>
      </div>
    </form>
    
    <form id="uuidForm" class="form-group" style="display:none;">
      <p>Generates a secure UUID v4</p>
    </form>
    
    <button type="button" onclick="generate()">Generate</button>
    
    <div class="result" id="result"></div>
    <div class="timestamp" id="timestamp"></div>
  </div>

  <script>
    let currentMode = 'password';

    function switchTab(mode) {
      currentMode = mode;
      document.querySelectorAll('.tab-button').forEach(btn => 
        btn.classList.toggle('active', btn.textContent.toLowerCase() === mode));
      
      document.getElementById('passwordForm').style.display = mode === 'password' ? 'block' : 'none';
      document.getElementById('uuidForm').style.display = mode === 'uuid' ? 'block' : 'none';
      
      document.getElementById('result').textContent = '';
      document.getElementById('timestamp').textContent = '';
    }

    async function generate() {
      const resultDiv = document.getElementById('result');
      const timestampDiv = document.getElementById('timestamp');
      resultDiv.textContent = 'Generating...';
      timestampDiv.textContent = '';
      
      try {
        const params = new URLSearchParams();
        params.append('type', currentMode);
        
        if (currentMode === 'password') {
          const length = parseInt(document.getElementById('length').value);
          params.append('length', length);
          params.append('uppercase', document.querySelectorAll('.checkbox-group input')[0].checked);
          params.append('lowercase', document.querySelectorAll('.checkbox-group input')[1].checked);
          params.append('numbers', document.querySelectorAll('.checkbox-group input')[2].checked);
          params.append('symbols', document.querySelectorAll('.checkbox-group input')[3].checked);
        }

        const response = await fetch('/generator?' + params);
        const data = await response.json();
        
        if (data.success) {
          resultDiv.textContent = data.result;
          timestampDiv.textContent = 'Generated: ' + new Date(data.timestamp).toLocaleString();
        } else {
          throw new Error(data.error);
        }
      } catch (error) {
        resultDiv.textContent = 'Error: ' + error.message;
        timestampDiv.textContent = '';
      }
    }
  </script>
</body>
</html>
`;
