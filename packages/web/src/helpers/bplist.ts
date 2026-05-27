type PlistValue = string | number | boolean | PlistValue[] | Record<string, PlistValue>;

export function encodeBplist(root: PlistValue): Uint8Array {
  const objects: PlistValue[] = [];
  const arrayChildren = new Map<number, number[]>();
  const dictChildren = new Map<number, { keys: number[]; vals: number[] }>();

  function collect(val: PlistValue): number {
    const idx = objects.length;
    objects.push(val);
    if (Array.isArray(val)) {
      arrayChildren.set(idx, val.map(item => collect(item)));
    } else if (val !== null && typeof val === 'object') {
      const keys: number[] = [];
      const vals: number[] = [];
      for (const [k, v] of Object.entries(val)) {
        keys.push(collect(k));
        vals.push(collect(v));
      }
      dictChildren.set(idx, { keys, vals });
    }
    return idx;
  }

  collect(root);

  const numObjects = objects.length;
  const refSize = numObjects <= 0xff ? 1 : 2;

  function writeRef(ref: number): number[] {
    return refSize === 1 ? [ref & 0xff] : [(ref >> 8) & 0xff, ref & 0xff];
  }

  function encodeInt(n: number): number[] {
    if (n < 0x100) return [0x10, n];
    if (n < 0x10000) return [0x11, (n >> 8) & 0xff, n & 0xff];
    if (n < 0x100000000)
      return [0x12, (n >>> 24) & 0xff, (n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff];
    const hi = Math.floor(n / 0x100000000);
    const lo = n >>> 0;
    return [
      0x13,
      (hi >>> 24) & 0xff,
      (hi >>> 16) & 0xff,
      (hi >>> 8) & 0xff,
      hi & 0xff,
      (lo >>> 24) & 0xff,
      (lo >>> 16) & 0xff,
      (lo >>> 8) & 0xff,
      lo & 0xff,
    ];
  }

  function encodeStr(s: string): number[] {
    const chars = [...s];
    const isAscii = chars.every(c => c.charCodeAt(0) < 128);
    const len = chars.length;
    if (isAscii) {
      const header = len < 15 ? [0x50 | len] : [0x5f, ...encodeInt(len)];
      return [...header, ...chars.map(c => c.charCodeAt(0))];
    }
    const header = len < 15 ? [0x60 | len] : [0x6f, ...encodeInt(len)];
    const body: number[] = [];
    for (const c of chars) {
      const code = c.charCodeAt(0);
      body.push((code >> 8) & 0xff, code & 0xff);
    }
    return [...header, ...body];
  }

  function encodeObj(idx: number): number[] {
    const obj = objects[idx];
    if (typeof obj === 'boolean') return [obj ? 0x09 : 0x08];
    if (typeof obj === 'number') return encodeInt(obj);
    if (typeof obj === 'string') return encodeStr(obj);
    if (Array.isArray(obj)) {
      const refs = arrayChildren.get(idx)!;
      const header = refs.length < 15 ? [0xa0 | refs.length] : [0xaf, ...encodeInt(refs.length)];
      return [...header, ...refs.flatMap(r => writeRef(r))];
    }
    const { keys, vals } = dictChildren.get(idx)!;
    const header = keys.length < 15 ? [0xd0 | keys.length] : [0xdf, ...encodeInt(keys.length)];
    return [...header, ...[...keys, ...vals].flatMap(r => writeRef(r))];
  }

  const serialized: number[][] = [];
  const offsets: number[] = [];
  let pos = 8;
  for (let i = 0; i < numObjects; i++) {
    offsets.push(pos);
    const bytes = encodeObj(i);
    serialized.push(bytes);
    pos += bytes.length;
  }

  const offsetTableOffset = pos;
  const offsetSize =
    pos < 0x100 ? 1 : pos < 0x10000 ? 2 : pos < 0x1000000 ? 3 : 4;

  function writeOff(off: number): number[] {
    const r: number[] = [];
    for (let i = offsetSize - 1; i >= 0; i--) r.push((off >> (i * 8)) & 0xff);
    return r;
  }

  function w64(n: number): number[] {
    const hi = Math.floor(n / 0x100000000);
    const lo = n >>> 0;
    return [
      (hi >>> 24) & 0xff,
      (hi >>> 16) & 0xff,
      (hi >>> 8) & 0xff,
      hi & 0xff,
      (lo >>> 24) & 0xff,
      (lo >>> 16) & 0xff,
      (lo >>> 8) & 0xff,
      lo & 0xff,
    ];
  }

  const all = [
    0x62, 0x70, 0x6c, 0x69, 0x73, 0x74, 0x30, 0x30, // "bplist00"
    ...serialized.flat(),
    ...offsets.flatMap(o => writeOff(o)),
    0, 0, 0, 0, 0, 0, // padding
    offsetSize,
    refSize,
    ...w64(numObjects),
    ...w64(0), // top object index
    ...w64(offsetTableOffset),
  ];

  return new Uint8Array(all);
}
