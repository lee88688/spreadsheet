// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ObjectStringKeys = { [key: string]: any };

function cloneDeep<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj)) as T;
}

const mergeDeep = (obj: ObjectStringKeys = {}, ...sources: ObjectStringKeys[]) => {
  sources.forEach((source) => {
    Object.keys(source).forEach((key) => {
      const v = source[key];
      // console.log('k:', key, ', v:', source[key], typeof v, v instanceof Object);
      if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
        obj[key] = v;
      } else if (typeof v !== 'function' && !Array.isArray(v) && v instanceof Object) {
        obj[key] = obj[key] || {};
        mergeDeep(obj[key], v);
      } else {
        obj[key] = v;
      }
    });
  });
  // console.log('::', obj);
  return obj;
};

function equals(obj1: ObjectStringKeys, obj2: ObjectStringKeys) {
  const keys = Object.keys(obj1);
  if (keys.length !== Object.keys(obj2).length) return false;
  for (let i = 0; i < keys.length; i += 1) {
    const k = keys[i];
    const v1 = obj1[k];
    const v2 = obj2[k];
    if (v2 === undefined) return false;
    if (typeof v1 === 'string' || typeof v1 === 'number' || typeof v1 === 'boolean') {
      if (v1 !== v2) return false;
    } else if (Array.isArray(v1)) {
      // if (v1.length !== v2.length) return false;
      if (!Array.isArray(v2)) return false;
      for (let ai = 0; ai < v1.length; ai += 1) {
        if (!equals(v1[ai], v2[ai])) return false;
      }
    } else if (typeof v1 !== 'function' && !Array.isArray(v1) && v1 instanceof Object) {
      if (!equals(v1, v2)) return false;
    }
  }
  return true;
}

/*
  objOrAry: obejct or Array
  cb: (value, index | key) => { return value }
*/
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sum = (objOrAry: any, cb: (value: any, key: string | number) => number = n => n) => {
  let total = 0;
  let size = 0;
  Object.keys(objOrAry).forEach((key) => {
    total += cb(objOrAry[key], key);
    size += 1;
  });
  return [total, size];
};

function deleteProperty(obj: ObjectStringKeys, property: string) {
  const oldv = obj[`${property}`];
  delete obj[`${property}`];
  return oldv;
}

function rangeReduceIf(min: number, max: number, inits: number, initv: number, ifv: number, getv: (n: number) => number) {
  let s = inits;
  let v = initv;
  let i = min;
  for (; i < max; i += 1) {
    if (s > ifv) break;
    v = getv(i);
    s += v;
  }
  return [i, s - v, v];
}

function rangeSum(min: number, max: number, getv: (n: number) => number) {
  let s = 0;
  for (let i = min; i < max; i += 1) {
    s += getv(i);
  }
  return s;
}

function rangeEach(min: number, max: number, cb: (n: number) => void) {
  for (let i = min; i < max; i += 1) {
    cb(i);
  }
}

function arrayEquals<T>(a1: T[], a2: T[]) {
  if (a1.length === a2.length) {
    for (let i = 0; i < a1.length; i += 1) {
      if (a1[i] !== a2[i]) return false;
    }
  } else return false;
  return true;
}

function digits(a: number) {
  const v = `${a}`;
  let ret = 0;
  let flag = false;
  for (let i = 0; i < v.length; i += 1) {
    if (flag) ret += 1;
    if (v.charAt(i) === '.') flag = true;
  }
  return ret;
}

export function numberCalc(type: '-' | '+' | '*' | '/', a1: number, a2: number) {
  if (Number.isNaN(a1) || Number.isNaN(a2)) {
    return a1 + type + a2;
  }
  const al1 = digits(a1);
  const al2 = digits(a2);
  const num1 = Number(a1);
  const num2 = Number(a2);
  let ret = 0;
  if (type === '-') {
    ret = num1 - num2;
  } else if (type === '+') {
    ret = num1 + num2;
  } else if (type === '*') {
    ret = num1 * num2;
  } else if (type === '/') {
    ret = num1 / num2;
    if (digits(ret) > 5) return ret.toFixed(2);
    return ret;
  }
  return ret.toFixed(Math.max(al1, al2));
}

export default {
  cloneDeep,
  merge: (...sources: ObjectStringKeys[]) => mergeDeep({}, ...sources),
  equals,
  arrayEquals,
  sum,
  rangeEach,
  rangeSum,
  rangeReduceIf,
  deleteProperty,
  numberCalc,
};
