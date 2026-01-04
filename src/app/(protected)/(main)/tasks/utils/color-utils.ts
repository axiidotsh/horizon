export function addColorOpacity(color: string, opacity: number): string {
  return `${color}${opacity.toString(16).padStart(2, '0')}`;
}
