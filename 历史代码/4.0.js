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
          return new Response(JSON.stringify({ error: "Please select at least one character type" }), {
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
        return new Response(JSON.stringify({ error: "Invalid request type" }), {
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
        <style>
          body {
            font-family: 'Segoe UI', sans-serif;
            background: #f4f6f8;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
          }
          .container {
            background: #ffffff;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            max-width: 400px;
            width: 100%;
          }
          h1 {
            text-align: center;
            color: #333;
            margin-bottom: 20px;
          }
          label {
            display: block;
            margin-top: 10px;
            font-weight: bold;
            color: #555;
          }
          input[type="number"] {
            width: 100%;
            padding: 10px;
            margin-top: 5px;
            border-radius: 6px;
            border: 1px solid #ccc;
          }
          .checkbox-group {
            display: flex;
            flex-direction: column;
            margin-top: 10px;
          }
          .checkbox-group label {
            font-weight: normal;
            font-size: 14px;
            margin-bottom: 5px;
          }
          button {
            width: 100%;
            padding: 12px;
            margin-top: 20px;
            background-color: #4a90e2;
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 16px;
            cursor: pointer;
          }
          button:hover {
            background-color: #357abD;
          }
          .password, .uuid {
            margin-top: 20px;
            font-size: 1.2em;
            color: #2c3e50;
            text-align: center;
            word-break: break-all;
          }
          .error {
            color: red;
            margin-top: 10px;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Password & UUID Generator</h1>
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

            <button type="submit">Generate</button>
          </form>

          <div class="password" id="output"></div>
          <div class="error" id="errorOutput"></div>
        </div>

        <script>
          const form = document.getElementById('generatorForm');
          const passwordConfig = document.getElementById('passwordConfig');
          const output = document.getElementById('output');
          const errorOutput = document.getElementById('errorOutput');

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
            output.textContent = '';
            errorOutput.textContent = '';
            const formData = new FormData(form);
            const response = await fetch('', {
              method: 'POST',
              body: formData
            });
            const result = await response.json();

            if (result.password) {
              output.textContent = result.password;
              output.classList.add('password');
              output.classList.remove('uuid');
            } else if (result.uuid) {
              output.textContent = result.uuid;
              output.classList.add('uuid');
              output.classList.remove('password');
            } else {
              errorOutput.textContent = result.error;
            }
          });
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
