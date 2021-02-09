export const daysToMs = (days: number): number => {
  return days * 24 * 60 * 60 * 1000;
};

export function delKey<T, U>(object: T, key: keyof T): U {
  return Object.keys(object).reduce((acc: any, currentKey: string) => {
    if (currentKey !== key) {
      acc[currentKey] = object[currentKey as keyof T];
    }
    return acc;
  }, {}) as U;
}
