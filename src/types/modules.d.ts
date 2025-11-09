declare module 'express' {
  export interface Request {
    body?: any;
    [key: string]: any;
    user?: {
      userId: number;
      email: string;
    };
    headers?: Record<string, string | undefined>;
  }
  export interface Response {
    json: (body: unknown) => Response;
    status: (code: number) => Response;
    header: (name: string, value: string) => Response;
    send: (body?: unknown) => Response;
  }
  export interface NextFunction {
    (err?: unknown): void;
  }
  export interface RequestHandler {
    (req: Request, res: Response, next: NextFunction): void | Promise<void>;
  }
  export interface ErrorRequestHandler {
    (err: any, req: Request, res: Response, next: NextFunction): void;
  }
  export interface Router {
    use: (...handlers: any[]) => Router;
    get: (...handlers: any[]) => Router;
    post: (...handlers: any[]) => Router;
  }
  export interface Express extends Router {
    listen: (port: number, callback?: () => void) => void;
  }
  export interface ExpressInstance extends Express {
    use: (...handlers: any[]) => ExpressInstance;
  }
  export interface ExpressFactory {
    (): ExpressInstance;
    json: () => RequestHandler;
    urlencoded: (options: { extended: boolean }) => RequestHandler;
  }
  export function Router(): Router;
  const express: ExpressFactory;
  export default express;
}

declare module 'cors' {
  const cors: (...args: any[]) => any;
  export default cors;
}

declare module 'helmet' {
  const helmet: (...args: any[]) => any;
  export default helmet;
}

declare module 'morgan' {
  const morgan: (...args: any[]) => any;
  export default morgan;
}

declare module 'multer' {
  interface MulterInstance {
    none: () => any;
  }
  const multer: (...args: any[]) => MulterInstance;
  export default multer;
}

declare module 'jsonwebtoken' {
  export function sign(payload: any, secret: string, options?: any): string;
  export function verify(token: string, secret: string): any;
}
