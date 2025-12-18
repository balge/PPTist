import { create } from "zustand";

export interface KeyboardState {
  ctrlKeyState: boolean;
  shiftKeyState: boolean;
  spaceKeyState: boolean;

  // Computed
  ctrlOrShiftKeyActive: boolean;

  // Actions
  setCtrlKeyState: (active: boolean) => void;
  setShiftKeyState: (active: boolean) => void;
  setSpaceKeyState: (active: boolean) => void;
}

export const useKeyboardStore = create<KeyboardState>((set) => ({
  ctrlKeyState: false,
  shiftKeyState: false,
  spaceKeyState: false,
  ctrlOrShiftKeyActive: false,

  setCtrlKeyState: (active: boolean) =>
    set((state) => ({
      ctrlKeyState: active,
      ctrlOrShiftKeyActive: active || state.shiftKeyState,
    })),
  setShiftKeyState: (active: boolean) =>
    set((state) => ({
      shiftKeyState: active,
      ctrlOrShiftKeyActive: state.ctrlKeyState || active,
    })),
  setSpaceKeyState: (active: boolean) => set({ spaceKeyState: active }),
}));

// Helper hook for getter (optional, if components prefer this)
export const useCtrlOrShiftKeyActive = () =>
  useKeyboardStore((state) => state.ctrlOrShiftKeyActive);
