/** Nối class có điều kiện, bỏ falsy — không cần thêm dependency. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
