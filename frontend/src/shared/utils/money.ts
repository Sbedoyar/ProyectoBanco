/** Accepts positive COP amounts with up to two decimals and at most 17 integer digits. */
export function validAmount(value: string): boolean {
  return /^\d{1,17}(\.\d{1,2})?$/.test(value) && /[1-9]/.test(value);
}
/** Formats an exact decimal string without converting balances to binary floating point. */
export function money(value: string): string {
  const [integer, decimal = '00'] = value.split('.');
  return `$ ${integer.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${decimal.padEnd(2, '0')} COP`;
}
