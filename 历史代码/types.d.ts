// types.d.ts (类型声明文件，解决TS报错)
interface Crypto {
    randomUUID(): string;
    getRandomValues<T extends ArrayBufferView>(array: T): T;
}

interface GlobalThis {
    crypto: Crypto;
}

declare var globalThis: GlobalThis;
