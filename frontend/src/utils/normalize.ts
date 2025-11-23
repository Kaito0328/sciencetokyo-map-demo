export function normalizeJa(input: string | undefined | null): string {
  let s = (input ?? '')
    .normalize('NFKC')
    .toLowerCase()
    .trim();
  s = s.replace(/[\s\u3000]+/g, '');
  s = s.replace(/（[^）]*）/g, '').replace(/\([^\)]*\)/g, '');
  s = s.replace(/[\u30A1-\u30F6]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0x60));
  s = s.replace(/ー/g, '');
  return s;
}

export function normalizeCode(input: string | undefined | null): string {
  const s = (input ?? '')
    .toLowerCase()
    .trim()
    .replace(/[\s\u3000-]+/g, '');
  return s;
}
