// Type declarations for external modules

declare module 'dotenv' {
  export function config(options?: any): any;
  export default { config };
}

declare module 'express' {
  export interface Request {
    body?: any;
    params?: any;
    query?: any;
    headers?: any;
    cookies?: any;
    user?: any;
    originalUrl?: string;
    method?: string;
    ip?: string;
    get?(name: string): string | undefined;
  }
  export interface Response {
    status(code: number): Response;
    json(data: any): Response;
    send(data: any): Response;
    cookie(name: string, value: any, options?: any): Response;
    clearCookie(name: string, options?: any): Response;
  }
  export interface NextFunction {
    (error?: any): void;
  }
  export interface Application {
    use(...args: any[]): Application;
    get(path: string, ...handlers: any[]): Application;
    post(path: string, ...handlers: any[]): Application;
    put(path: string, ...handlers: any[]): Application;
    patch(path: string, ...handlers: any[]): Application;
    delete(path: string, ...handlers: any[]): Application;
    listen(port: number, callback?: () => void): any;
  }
  export interface Router {
    get(path: string, ...handlers: any[]): Router;
    post(path: string, ...handlers: any[]): Router;
    put(path: string, ...handlers: any[]): Router;
    patch(path: string, ...handlers: any[]): Router;
    delete(path: string, ...handlers: any[]): Router;
    use(...args: any[]): Router;
  }
  namespace express {
    function json(options?: any): any;
    function urlencoded(options?: any): any;
    function static(root: string, options?: any): any;
  }
  function express(): Application;
  export = express;
  export function Router(): Router;
}

declare module 'cors' {
  function cors(options?: any): any;
  export = cors;
}

declare module 'helmet' {
  function helmet(options?: any): any;
  export = helmet;
}

declare module 'morgan' {
  function morgan(format: string, options?: any): any;
  export = morgan;
}

declare module 'cookie-parser' {
  function cookieParser(secret?: string, options?: any): any;
  export = cookieParser;
}

declare module 'express-rate-limit' {
  function rateLimit(options: any): any;
  export = rateLimit;
}

declare module 'swagger-ui-express' {
  export function setup(swaggerSpec: any, options?: any): any;
  export function serve(): any;
}

declare module 'swagger-jsdoc' {
  interface Options {
    definition: any;
    apis: string[];
  }
  function swaggerJsdoc(options: Options): any;
  namespace swaggerJsdoc {
    interface Options {
      definition: any;
      apis: string[];
    }
  }
  export = swaggerJsdoc;
}

declare module 'mongoose' {
  export interface Document {
    _id?: any;
    save(): Promise<this>;
  }
  export interface Schema {
    pre(hook: string, fn: Function): void;
    post(hook: string, fn: Function): void;
    index(fields: any, options?: any): void;
    virtual(path: string): any;
    methods: any;
    statics: any;
  }
  export interface Model<T extends Document> {
    new(doc?: any): T;
    find(filter?: any): any;
    findOne(filter?: any): any;
    findById(id: any): any;
    create(doc: any): Promise<T>;
    findByIdAndUpdate(id: any, update: any, options?: any): any;
    findByIdAndDelete(id: any): any;
    findOneAndDelete(filter: any): any;
    deleteOne(filter: any): any;
    deleteMany(filter: any): any;
    updateOne(filter: any, update: any): any;
    countDocuments(filter?: any): any;
    distinct(field: string, filter?: any): any;
    aggregate(pipeline: any[]): any;
    discriminator<U extends Document>(name: string, schema: any): Model<U>;
  }
  export interface Connection {
    host: string;
    on(event: string, callback: Function): void;
    close(): Promise<void>;
  }
  export function model<T extends Document>(name: string, schema: any): Model<T>;
  export function connect(uri: string, options?: any): Promise<any>;
  export class Schema {
    constructor(definition?: any, options?: any);
    index(fields: any, options?: any): void;
    virtual(path: string): any;
    methods: any;
    statics: any;
    static Types: {
      ObjectId: any;
    };
  }
  export const Types: {
    ObjectId: any;
  };
  const mongoose: {
    connect(uri: string, options?: any): Promise<any>;
    model<T extends Document>(name: string, schema: any): Model<T>;
    Schema: typeof Schema;
    Types: typeof Types;
    connection: Connection;
  };
  export = mongoose;
}

declare module 'bcryptjs' {
  export function hash(data: string, saltOrRounds: number): Promise<string>;
  export function compare(data: string, encrypted: string): Promise<boolean>;
  export function genSalt(rounds?: number): Promise<string>;
  export function hashSync(data: string, saltOrRounds: number): string;
  export function compareSync(data: string, encrypted: string): boolean;
}

declare module 'jsonwebtoken' {
  export interface SignOptions {
    expiresIn?: string | number;
    algorithm?: string;
    issuer?: string;
    audience?: string;
  }
  export function sign(payload: any, secretOrPrivateKey: string, options?: SignOptions): string;
  export function verify(token: string, secretOrPublicKey: string): any;
  export function decode(token: string): any;
}

declare module 'crypto' {
  export function randomBytes(size: number): Buffer;
  export function createHash(algorithm: string): any;
}

declare module 'nodemailer' {
  export interface Transporter {
    sendMail(mailOptions: any): Promise<any>;
  }
  export function createTransporter(options: any): Transporter;
  export function createTransport(options: any): Transporter;
  const nodemailer: {
    createTransport(options: any): Transporter;
  };
  export = nodemailer;
}

declare module 'express-validator' {
  export function body(field?: string): ValidationChain;
  export function param(field?: string): ValidationChain;
  export function query(field?: string): ValidationChain;
  export function validationResult(req: any): any;
  export interface ValidationChain {
    isEmail(): ValidationChain;
    isLength(options: any): ValidationChain;
    optional(): ValidationChain;
    notEmpty(): ValidationChain;
    isString(): ValidationChain;
    isNumeric(): ValidationChain;
    isMongoId(): ValidationChain;
    isIn(values: any[]): ValidationChain;
    withMessage(message: string): ValidationChain;
    custom(validator: Function): ValidationChain;
    run(req: any): Promise<any>;
    normalizeEmail(): ValidationChain;
    matches(pattern: RegExp): ValidationChain;
    isFloat(options?: any): ValidationChain;
    isArray(options?: any): ValidationChain;
    isInt(options?: any): ValidationChain;
    isURL(): ValidationChain;
    isBoolean(): ValidationChain;
    trim(): ValidationChain;
    isISO8601(): ValidationChain;
    toLowerCase(): ValidationChain;
  }
}
