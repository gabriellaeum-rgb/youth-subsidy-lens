import * as React from 'react';

/**
 * Multi-select where one option (`exclusiveValue`, e.g. '제한없음') clears all others when
 * picked, and picking any other option removes it. The array is never allowed to become empty —
 * deselecting the last item silently re-adds the exclusive value.
 */
export function useExclusiveMultiSelect<T extends string>(
  initial: T[],
  exclusiveValue: T,
): [T[], (value: T) => void] {
  const [selected, setSelected] = React.useState<T[]>(initial);

  const toggle = React.useCallback(
    (value: T) => {
      setSelected((prev) => {
        if (value === exclusiveValue) return [exclusiveValue];
        const withoutExclusive = prev.filter((v) => v !== exclusiveValue);
        const next = withoutExclusive.includes(value)
          ? withoutExclusive.filter((v) => v !== value)
          : [...withoutExclusive, value];
        return next.length === 0 ? [exclusiveValue] : next;
      });
    },
    [exclusiveValue],
  );

  return [selected, toggle];
}
