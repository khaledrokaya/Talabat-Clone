// Global type declarations

declare global {
  var Buffer: typeof Buffer;
  namespace NodeJS {
    interface Global {
      Buffer: typeof Buffer;
    }
  }
}

// Make sure Buffer is available
declare const Buffer: {
  new(size: number): Buffer;
  new(array: number[]): Buffer;
  new(str: string, encoding?: string): Buffer;
  from(value: any, encoding?: string): Buffer;
  isBuffer(obj: any): obj is Buffer;
  alloc(size: number, fill?: any, encoding?: string): Buffer;
  concat(list: Buffer[], totalLength?: number): Buffer;
};

interface Buffer {
  length: number;
  toString(encoding?: string, start?: number, end?: number): string;
  toJSON(): { type: 'Buffer'; data: number[] };
  slice(start?: number, end?: number): Buffer;
}

// Mongoose ObjectId type
declare namespace mongoose {
  namespace Types {
    type ObjectId = any;
  }
}

export { };
