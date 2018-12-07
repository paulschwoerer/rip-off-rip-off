export const easeOutQuad = function (t : number, b : number, c : number, d : number) : number {
  return -c *(t/=d)*(t-2) + b;
};