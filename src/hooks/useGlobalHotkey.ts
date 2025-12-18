import { useEffect } from "react";
import { useMainStore, useSlidesStore, useKeyboardStore } from "@/store";
import { ElementOrderCommands } from "@/types/edit";
import { KEYS } from "@/configs/hotkey";

import useSlideHandler from "./useSlideHandler";
import useDeleteElement from "./useDeleteElement";
import useCombineElement from "./useCombineElement";
import useCopyAndPasteElement from "./useCopyAndPasteElement";
import useSelectElement from "./useSelectElement";
import useMoveElement from "./useMoveElement";
import useOrderElement from "./useOrderElement";
import useHistorySnapshot from "./useHistorySnapshot";
import useScaleCanvas from "./useScaleCanvas";

export default () => {
  const {
    activeElementIdList,
    disableHotkeys,
    handleElementId,
    editorAreaFocus,
    thumbnailsFocus,
    setCreatingElement,
    setActiveElementIdList,
  } = useMainStore();
  
  const { currentSlide } = useSlidesStore();
  
  const { ctrlKeyState, shiftKeyState, spaceKeyState, setCtrlKeyState, setShiftKeyState, setSpaceKeyState } = useKeyboardStore();

  const {
    updateSlideIndex,
    copySlide,
    createSlide,
    deleteSlide,
    cutSlide,
    copyAndPasteSlide,
    selectAllSlide,
  } = useSlideHandler();

  const { combineElements, uncombineElements } = useCombineElement();
  const { deleteElement } = useDeleteElement();
  const { copyElement, cutElement, quickCopyElement } = useCopyAndPasteElement();
  const { selectAllElements } = useSelectElement();
  const { moveElement } = useMoveElement();
  const { orderElement } = useOrderElement();
  const { redo, undo } = useHistorySnapshot();
  const { scaleCanvas, resetCanvas } = useScaleCanvas();

  const copy = () => {
    if (activeElementIdList.length) copyElement();
    else if (thumbnailsFocus) copySlide();
  };

  const cut = () => {
    if (activeElementIdList.length) cutElement();
    else if (thumbnailsFocus) cutSlide();
  };

  const quickCopy = () => {
    if (activeElementIdList.length) quickCopyElement();
    else if (thumbnailsFocus) copyAndPasteSlide();
  };

  const selectAll = () => {
    if (editorAreaFocus) selectAllElements();
    if (thumbnailsFocus) selectAllSlide();
  };

  const combine = () => {
    if (!editorAreaFocus) return;
    combineElements();
  };

  const uncombine = () => {
    if (!editorAreaFocus) return;
    uncombineElements();
  };

  const remove = () => {
    if (activeElementIdList.length) deleteElement();
    else if (thumbnailsFocus) deleteSlide();
  };

  const move = (key: string) => {
    if (activeElementIdList.length) moveElement(key);
    else if (key === KEYS.UP || key === KEYS.DOWN) updateSlideIndex(key);
  };

  const moveSlide = (key: string) => {
    if (key === KEYS.PAGEUP) updateSlideIndex(KEYS.UP);
    else if (key === KEYS.PAGEDOWN) updateSlideIndex(KEYS.DOWN);
  };

  const order = (command: ElementOrderCommands) => {
    const handleElement = currentSlide?.elements.find(el => el.id === handleElementId)
    if (!handleElement) return;
    orderElement(handleElement, command);
  };

  const create = () => {
    if (!thumbnailsFocus) return;
    createSlide();
  };

  const tabActiveElement = () => {
    if (!currentSlide || !currentSlide.elements.length) return;
    if (!handleElementId) {
      const firstElement = currentSlide.elements[0];
      setActiveElementIdList([firstElement.id]);
      return;
    }
    const currentIndex = currentSlide.elements.findIndex(
      (el) => el.id === handleElementId
    );
    const nextIndex =
      currentIndex >= currentSlide.elements.length - 1
        ? 0
        : currentIndex + 1;
    const nextElementId = currentSlide.elements[nextIndex].id;

    setActiveElementIdList([nextElementId]);
  };

  useEffect(() => {
    const keydownListener = (e: KeyboardEvent) => {
      const { ctrlKey, shiftKey, altKey, metaKey } = e;
      const ctrlOrMetaKeyActive = ctrlKey || metaKey;

      const key = e.key.toUpperCase();

      if (ctrlOrMetaKeyActive && !ctrlKeyState) {
        setCtrlKeyState(true);
      }
      if (shiftKey && !shiftKeyState) setShiftKeyState(true);
      if (!disableHotkeys && key === KEYS.SPACE) {
        setSpaceKeyState(true);
      }

      if (ctrlKey && key === KEYS.MINUS) {
        e.preventDefault();
        scaleCanvas("-");
        return;
      }
      if (ctrlKey && key === KEYS.EQUAL) {
        e.preventDefault();
        scaleCanvas("+");
        return;
      }
      if (ctrlKey && key === KEYS.DIGIT_0) {
        e.preventDefault();
        resetCanvas();
        return;
      }

      if (!editorAreaFocus && !thumbnailsFocus) return;

      if (ctrlOrMetaKeyActive && key === KEYS.C) {
        if (disableHotkeys) return;
        e.preventDefault();
        copy();
      }
      if (ctrlOrMetaKeyActive && key === KEYS.X) {
        if (disableHotkeys) return;
        e.preventDefault();
        cut();
      }
      if (ctrlOrMetaKeyActive && key === KEYS.D) {
        if (disableHotkeys) return;
        e.preventDefault();
        quickCopy();
      }
      if (ctrlOrMetaKeyActive && key === KEYS.Z) {
        if (disableHotkeys) return;
        e.preventDefault();
        undo();
      }
      if (ctrlOrMetaKeyActive && key === KEYS.Y) {
        if (disableHotkeys) return;
        e.preventDefault();
        redo();
      }
      if (ctrlOrMetaKeyActive && key === KEYS.A) {
        if (disableHotkeys) return;
        e.preventDefault();
        selectAll();
      }
      if (!shiftKey && ctrlOrMetaKeyActive && key === KEYS.G) {
        if (disableHotkeys) return;
        e.preventDefault();
        combine();
      }
      if (shiftKey && ctrlOrMetaKeyActive && key === KEYS.G) {
        if (disableHotkeys) return;
        e.preventDefault();
        uncombine();
      }
      if (altKey && key === KEYS.F) {
        if (disableHotkeys) return;
        e.preventDefault();
        order(ElementOrderCommands.TOP);
      }
      if (altKey && key === KEYS.B) {
        if (disableHotkeys) return;
        e.preventDefault();
        order(ElementOrderCommands.BOTTOM);
      }
      if (key === KEYS.DELETE || key === KEYS.BACKSPACE) {
        if (disableHotkeys) return;
        e.preventDefault();
        remove();
      }
      if (key === KEYS.UP) {
        if (disableHotkeys) return;
        e.preventDefault();
        move(KEYS.UP);
      }
      if (key === KEYS.DOWN) {
        if (disableHotkeys) return;
        e.preventDefault();
        move(KEYS.DOWN);
      }
      if (key === KEYS.LEFT) {
        if (disableHotkeys) return;
        e.preventDefault();
        move(KEYS.LEFT);
      }
      if (key === KEYS.RIGHT) {
        if (disableHotkeys) return;
        e.preventDefault();
        move(KEYS.RIGHT);
      }
      if (key === KEYS.PAGEUP) {
        if (disableHotkeys) return;
        e.preventDefault();
        moveSlide(KEYS.PAGEUP);
      }
      if (key === KEYS.PAGEDOWN) {
        if (disableHotkeys) return;
        e.preventDefault();
        moveSlide(KEYS.PAGEDOWN);
      }
      if (key === KEYS.ENTER) {
        if (disableHotkeys) return;
        e.preventDefault();
        create();
      }
      if (key === KEYS.TAB) {
        if (disableHotkeys) return;
        e.preventDefault();
        tabActiveElement();
      }
      if (
        editorAreaFocus &&
        !shiftKey &&
        !ctrlOrMetaKeyActive &&
        !disableHotkeys
      ) {
        if (key === KEYS.T) {
          setCreatingElement({ type: "text" });
        } else if (key === KEYS.R) {
          setCreatingElement({
            type: "shape",
            data: {
              viewBox: [200, 200],
              path: "M 0 0 L 200 0 L 200 200 L 0 200 Z",
            },
          });
        } else if (key === KEYS.O) {
          setCreatingElement({
            type: "shape",
            data: {
              viewBox: [200, 200],
              path: "M 100 0 A 50 50 0 1 1 100 200 A 50 50 0 1 1 100 0 Z",
            },
          });
        } else if (key === KEYS.L) {
          setCreatingElement({
            type: "line",
            data: {
              path: "M 0 0 L 20 20",
              style: "solid",
              points: ["", ""],
            },
          });
        }
      }
    };

    const keyupListener = () => {
      if (ctrlKeyState) setCtrlKeyState(false);
      if (shiftKeyState) setShiftKeyState(false);
      if (spaceKeyState) setSpaceKeyState(false);
    };

    document.addEventListener("keydown", keydownListener);
    document.addEventListener("keyup", keyupListener);
    window.addEventListener("blur", keyupListener);

    return () => {
      document.removeEventListener("keydown", keydownListener);
      document.removeEventListener("keyup", keyupListener);
      window.removeEventListener("blur", keyupListener);
    };
  }); // Remove dependency array to ensure listener always has latest closures
};
