// Avoid const enum under isolatedModules: re-declare minimal used codes
export const Key = {
  Shift: 'Shift',
} as const;

export const KeyCode = {
  Space: 32,
  A: 65,
  Z: 90,
  ClosedParen: 48,
  OpenParen: 57,
  Numpad0: 96,
  Numpad9: 105,
  SemiColon: 186,
  Tilde: 192,
  OpenBracket: 219,
  Quote: 222,
  Multiply: 106,
  Divide: 111,
} as const;

export const isPrintableKey = (event: KeyboardEvent) => {
  const { keyCode } = event;
  const { metaKey, ctrlKey } = event;

  if (metaKey || ctrlKey || keyCode === KeyCode.Space) return false;
  return (
    (keyCode >= KeyCode.A && keyCode <= KeyCode.Z) ||
    (keyCode >= KeyCode.ClosedParen && keyCode <= KeyCode.OpenParen) ||
    (keyCode >= KeyCode.Numpad0 && keyCode <= KeyCode.Numpad9) ||
    (keyCode >= KeyCode.SemiColon && keyCode <= KeyCode.Tilde) ||
    (keyCode >= KeyCode.OpenBracket && keyCode <= KeyCode.Quote) ||
    (keyCode >= KeyCode.Multiply && keyCode <= KeyCode.Divide) ||
    keyCode === KeyCode.Space ||
    keyCode === 61 ||
    keyCode === 173 ||
    ((keyCode === 229 || keyCode === 0) && event.key !== Key.Shift)
  );
};

export const isNumberKey = (keyCode: number) => {
  return (
    (keyCode >= KeyCode.ClosedParen && keyCode <= KeyCode.OpenParen) ||
    (keyCode >= KeyCode.Numpad0 && keyCode <= KeyCode.Numpad9)
  );
};
