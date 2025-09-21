export default {
  async fetch(request) {
    const url = new URL(request.url);

    // 如果是 POST 请求，处理生成逻辑
    if (request.method === "POST") {
      const formData = await request.formData();
      const type = formData.get("type");
      const lang = formData.get("lang") || "en";

      if (type === "password") {
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
          return new Response(JSON.stringify({ error: translations[lang].error_no_char }), {
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
          return new Response(JSON.stringify({ error: translations[lang].error_unknown }), {
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
          return new Response(JSON.stringify({ error: translations[lang].error_unknown }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      } else {
        return new Response(JSON.stringify({ error: translations[lang].error_invalid_type }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    // 默认返回 HTML 页面
    const translations = {
      en: {
        title: "Password & UUID Generator",
        gen_password: "Generate Password",
        gen_uuid: "Generate UUID",
        length: "Password Length:",
        uppercase: "Uppercase",
        lowercase: "Lowercase",
        numbers: "Numbers",
        symbols: "Symbols",
        error_no_char: "Please select at least one character type",
        error_invalid_type: "Invalid request type",
        error_unknown: "An unknown error occurred",
      },
      zh: {
        title: "密码与UUID生成器",
        gen_password: "生成密码",
        gen_uuid: "生成UUID",
        length: "密码长度：",
        uppercase: "大写字母",
        lowercase: "小写字母",
        numbers: "数字",
        symbols: "符号",
        error_no_char: "请至少选择一种字符类型",
        error_invalid_type: "无效请求类型",
        error_unknown: "发生未知错误",
      },
      zh_tw: {
        title: "密碼與UUID產生器",
        gen_password: "生成密碼",
        gen_uuid: "生成UUID",
        length: "密碼長度：",
        uppercase: "大寫字母",
        lowercase: "小寫字母",
        numbers: "數字",
        symbols: "符號",
        error_no_char: "請至少選擇一種字符類型",
        error_invalid_type: "無效請求類型",
        error_unknown: "發生未知錯誤",
      },
      ja: {
        title: "パスワードとUUIDジェネレータ",
        gen_password: "パスワードを生成",
        gen_uuid: "UUIDを生成",
        length: "パスワードの長さ：",
        uppercase: "大文字",
        lowercase: "小文字",
        numbers: "数字",
        symbols: "記号",
        error_no_char: "少なくとも1つの文字タイプを選択してください",
        error_invalid_type: "無効なリクエストタイプ",
        error_unknown: "不明なエラーが発生しました",
      },
    };

    const defaultLang = localStorage.getItem("lang") || "en";
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
          .lang-select {
            position: absolute;
            top: 20px;
            right: 20px;
            z-index: 10;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1 id="title">${translations[defaultLang].title}</h1>
          <div class="lang-select">
            <select id="langSelect">
              <option value="en" ${defaultLang === "en" ? "selected" : ""}>English</option>
              <option value="zh" ${defaultLang === "zh" ? "selected" : ""}>简体中文</option>
              <option value="zh_tw" ${defaultLang === "zh_tw" ? "selected" : ""}>繁體中文</option>
              <option value="ja" ${defaultLang === "ja" ? "selected" : ""}>日本語</option>
            </select>
          </div>

          <form id="generatorForm">
            <label><input type="radio" name="type" value="password" checked> ${translations[defaultLang].gen_password}</label>
            <label><input type="radio" name="type" value="uuid"> ${translations[defaultLang].gen_uuid}</label>

            <div id="passwordConfig">
              <label for="length">${translations[defaultLang].length}</label>
              <input type="number" id="length" name="length" value="12" min="1" required>

              <div class="checkbox-group">
                <label><input type="checkbox" name="uppercase" checked> ${translations[defaultLang].uppercase}</label>
                <label><input type="checkbox" name="lowercase" checked> ${translations[defaultLang].lowercase}</label>
                <label><input type="checkbox" name="numbers" checked> ${translations[defaultLang].numbers}</label>
                <label><input type="checkbox" name="symbols" checked> ${translations[defaultLang].symbols}</label>
              </div>
            </div>

            <button type="submit">${translations[defaultLang].gen_password}</button>
          </form>

          <input type="hidden" name="lang" value="${defaultLang}">

          <div class="password" id="output"></div>
          <div class="error" id="errorOutput"></div>
        </div>

        <script>
          const translations = ${JSON.stringify(translations)};
          const defaultLang = localStorage.getItem("lang") || "en";
          const langSelect = document.getElementById("langSelect");

          // 初始化语言选择
          langSelect.value = defaultLang;

          // 语言切换事件
          langSelect.addEventListener("change", (e) => {
            const lang = e.target.value;
            localStorage.setItem("lang", lang);
            updateLanguage(lang);
          });

          function updateLanguage(lang) {
            const title = document.getElementById("title");
            const form = document.getElementById("generatorForm");
            const labels = form.querySelectorAll("label");
            const submitBtn = form.querySelector("button");

            title.textContent = translations[lang].title;
            submitBtn.textContent = translations[lang].gen_password;

            labels.forEach(label => {
              if (label.textContent.includes(translations["en"].gen_password)) {
                label.textContent = translations[lang].gen_password;
              } else if (label.textContent.includes(translations["en"].gen_uuid)) {
                label.textContent = translations[lang].gen_uuid;
              } else if (label.textContent.includes(translations["en"].length)) {
                label.textContent = translations[lang].length;
              } else if (label.textContent.includes(translations["en"].uppercase)) {
                label.textContent = translations[lang].uppercase;
              } else if (label.textContent.includes(translations["en"].lowercase)) {
                label.textContent = translations[lang].lowercase;
              } else if (label.textContent.includes(translations["en"].numbers)) {
                label.textContent = translations[lang].numbers;
              } else if (label.textContent.includes(translations["en"].symbols)) {
                label.textContent = translations[lang].symbols;
              }
            });
          }

          const form = document.getElementById("generatorForm");
          const output = document.getElementById("output");
          const errorOutput = document.getElementById("errorOutput");

          // 显示/隐藏密码配置
          form.querySelector("input[name='type']").addEventListener("change", (e) => {
            if (e.target.value === "uuid") {
              document.getElementById("passwordConfig").style.display = "none";
            } else {
              document.getElementById("passwordConfig").style.display = "block";
            }
          });

          // 表单提交处理
          form.addEventListener("submit", async (e) => {
            e.preventDefault();
            output.textContent = "";
            errorOutput.textContent = "";
            const lang = langSelect.value;
            const formData = new FormData(form);
            formData.set("lang", lang);

            const response = await fetch("", {
              method: "POST",
              body: formData
            });
            const result = await response.json();

            if (result.password) {
              output.textContent = result.password;
              output.classList.add("password");
              output.classList.remove("uuid");
            } else if (result.uuid) {
              output.textContent = result.uuid;
              output.classList.add("uuid");
              output.classList.remove("password");
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
