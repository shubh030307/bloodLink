declare module 'express' {
  export interface Request {
    [key: string]: any;
    body: any;
    params: any;
    query: any;
    headers: any;
    user?: any;
    file?: any;
    get: (name: string) => string | undefined;
  }
  export interface Response {
    [key: string]: any;
    status: (code: number) => this;
    json: (data: any) => this;
    send: (data: any) => this;
    setHeader: (key: string, value: string) => this;
  }
  export type NextFunction = () => void;
}
