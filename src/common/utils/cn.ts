type ClassValue = string | undefined | null | false | 0 | ClassValue[];

const toClass = (value: ClassValue): string => {
  if (!value) return '';
  if (Array.isArray(value)) return value.map(toClass).filter(Boolean).join(' ');
  return value;
};

export const cn = (...classes: ClassValue[]): string =>
  classes.map(toClass).filter(Boolean).join(' ');
