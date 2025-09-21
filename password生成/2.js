export default {
  async fetch(request) {
    try {
      // 解析URL参数
      const url = new URL(request.url);
      const type = url.searchParams.get('type') || 'password'; // 新增类型参数
      
      if (type === 'password') {
        // ========== 密码生成逻辑 ==========
        const length = parseInt(url.searchParams.get('length') || '12', 10);
        const includeUppercase = url.searchParams.get('uppercase') !== 'false';
        const includeLowercase = url.searchParams.get('lowercase') !== 'false';
        const includeNumbers = url.searchParams.get('numbers') !== 'false';
        const includeSymbols = url.searchParams.get('symbols') !== 'false';

        // 参数验证
        if (isNaN(length) || length < 4 || length > 128) {
          throw new Error('Length must be between 4 and 128');
        }

        // 构建字符集
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

        // 安全随机生成
        const crypto = globalThis.crypto;
        const array = new Uint32Array(length);
        crypto.getRandomValues(array);
        
        // 生成密码
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
        // ========== UUID生成逻辑 ==========
        const crypto = globalThis.crypto;
        const uuid = crypto.randomUUID(); // 生成RFC 4122 v4格式UUID
        
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
