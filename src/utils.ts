export const reverseCurry = <T>(f: any): T =>
  ((a: any, b: any) => (b ? f(a, b) : (val: any) => f(val, a))) as any;

export const returnSelf = (a: any) => a;
