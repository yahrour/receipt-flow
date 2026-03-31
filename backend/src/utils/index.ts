// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isValidId(val: any): boolean {
  const num = Number(val);

  return (
    !isNaN(num) && // Must be a number
    Number.isInteger(num) && // Must not be a decimal (e.g., 1.5)
    num > 0
  );
}
