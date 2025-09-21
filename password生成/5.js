// worker.js
export default {
  async fetch(request) {
    try {
      const url = new URL(request.url);
      
      // 获取语言参数
      const lang = url.searchParams.get('lang') || 'zh-CN';
      
      // 获取类型参数
      const type = url.searchParams.get('type') || 'password';
      
      if (type === 'password') {
        // ========== 密码生成逻辑 ==========
        const length = parseInt(url.searchParams.get('length') || '12', 10);
        const includeUppercase = url.searchParams.get('uppercase') !== 'false';
        const includeLowercase = url.searchParams.get('lowercase') !== 'false';
        const includeNumbers = url.searchParams.get('numbers') !== 'false';
        const includeSymbols = url.searchParams.get('symbols') !== 'false';

        // 参数验证
        if (isNaN(length) || length < 4 || length > 128) {
          throw new Error(this.getTranslation(lang, 'errors.lengthInvalid'));
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
          throw new Error(this.getTranslation(lang, 'errors.noCharType'));
        }

        // 安全随机生成
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
          timestamp: new Date().toISOString(),
          metadata: {
            length,
            options: {
              uppercase: includeUppercase,
              lowercase: includeLowercase,
              numbers: includeNumbers,
              symbols: includeSymbols
            }
          }
        }, null, 2), {
          headers: { 
            'Content-Type': 'application/json',
            'X-Language': lang
          }
        });

      } else if (type === 'uuid') {
        // ========== UUID生成逻辑 ==========
        const uuid = crypto.randomUUID();
        
        return new Response(JSON.stringify({
          success: true,
          result: uuid,
          type: 'uuid',
          timestamp: new Date().toISOString()
        }, null, 2), {
          headers: { 
            'Content-Type': 'application/json',
            'X-Language': lang
          }
        });

      } else {
        throw new Error(this.getTranslation(lang, 'errors.invalidType'));
      }

    } catch (error) {
      const url = new URL(request.url);
      const lang = url.searchParams.get('lang') || 'zh-CN';
      
      return new Response(JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }, null, 2), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'X-Language': lang
        }
      });
    }
  },
  
  // 多语言翻译函数
  getTranslation(lang, key) {
    const translations = {
      'zh-CN': {
        errors: {
          lengthInvalid: '长度必须在4到128之间',
          noCharType: '至少需要选择一种字符类型',
          invalidType: '无效类型。请使用 "password" 或 "uuid"'
        }
      },
      'zh-TW': {
        errors: {
          lengthInvalid: '長度必須在4到128之間',
          noCharType: '至少需要選擇一種字符類型',
          invalidType: '無效類型。請使用 "password" 或 "uuid"'
        }
      },
      'ja': {
        errors: {
          lengthInvalid: '長さは4から128の間でなければなりません',
          noCharType: '少なくとも1つの文字タイプを選択する必要があります',
          invalidType: '無効なタイプです。"password" または "uuid" を使用してください'
        }
      },
      'en': {
        errors: {
          lengthInvalid: 'Length must be between 4 and 128',
          noCharType: 'At least one character type must be selected',
          invalidType: 'Invalid type. Use "password" or "uuid"'
        }
      }
    };
    
    return translations[lang]?.[key] || translations['zh-CN'][key];
  }
};
