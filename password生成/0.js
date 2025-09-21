export default {
  async fetch(request) {
    const url = new URL(request.url);
    const lengthParam = url.searchParams.get("length") || "12";
    const chars = url.searchParams.get("chars") || 
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+~`-={}|[]:;\"'<>,.?/";

    let length = parseInt(lengthParam, 10);
    if (isNaN(length) || length <= 0) {
      length = 12;
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
