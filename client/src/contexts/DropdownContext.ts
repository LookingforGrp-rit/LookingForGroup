import { createContext, createRef, RefObject } from 'react';

type DropdownContextProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  buttonRef: RefObject<HTMLButtonElement | null>;
};

/**
 * Contains info on whether the dropdown is open or not
 */
export const DropdownContext = createContext<DropdownContextProps>({
  open: false,
  setOpen: () => {},
  buttonRef: createRef<HTMLButtonElement | null>(),
});