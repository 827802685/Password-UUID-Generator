export default {
  async fetch(request) {
    const url = new URL(request.url);

    // 如果是 API 请求（POST），则处理密码生成逻辑
    if (request.method === "POST") {
      const formData = await request.formData();
      const length = parseInt(formData.get("length") || "12", 10);
      const chars = formData.get("chars") || 
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+~`-={}|[]:;\"'<>,.?/";

      if (isNaN(length) || length <= 0) {
        return new Response(JSON.stringify({ error: "Length must be a positive integer" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (chars.length === 0) {
        return new Response(JSON.stringify({ error: "Characters set cannot be empty" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      try {
        const password = generatePassword(length, chars);
        return new Response(JSON.stringify({ password }), {
          headers: { "Content-Type": "application/json" },
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: 500,
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
        <title>Secure Password Generator</title>
        <style>
          body {
            font-family: 'Segoe UI', sans-serif;
            background: #f0f2f5;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
          }
          .container {
            background: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            max-width: 400px;
            width: 100%;
          }
          h1 {
            text-align: center;
            color: #333;
          }
          label {
            display: block;
            margin-top: 15px;
            font-weight: bold;
            color: #555;
          }
          input[type="number"], input[type="text"] {
            width: 100%;
            padding: 10px;
            margin-top: 5px;
            border-radius: 6px;
            border: 1px solid #ccc;
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
            background-color: #357ABD;
          }
          .password {
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
          <h1>Secure Password Generator</h1>
          <form id="passwordForm">
            <label for="length">Password Length:</label>
            <input type="number" id="length" name="length" value="12" min="1" required>

            <label for="chars">Custom Characters (optional):</label>
            <input type="text" id="chars" name="chars" placeholder="e.g., abc123!@#">

            <button type="submit">Generate Password</button>
          </form>
          <div class="password" id="passwordOutput"></div>
          <div class="error" id="errorOutput"></div>
        </div>

        <script>
          const form = document.getElementById('passwordForm');
          const output = document.getElementById('passwordOutput');
          const errorOutput = document.getElementById('errorOutput');

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
