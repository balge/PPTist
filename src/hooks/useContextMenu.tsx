import React, { useEffect, type RefObject } from 'react';
import { createRoot } from 'react-dom/client';
import Contextmenu from '@/components/Contextmenu';
import { ContextmenuItem } from '@/components/Contextmenu/types';

export default function useContextMenu(
  ref: RefObject<HTMLElement>,
  menusOrGenerator: ContextmenuItem[] | ((el: HTMLElement) => ContextmenuItem[] | null),
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled) return;
    
    const element = ref.current;
    if (!element) return;

    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();

      const menus = typeof menusOrGenerator === 'function' 
        ? menusOrGenerator(element) 
        : menusOrGenerator;

      if (!menus || menus.length === 0) return;

      // Remove existing context menu if any
      const existingContainer = document.getElementById('global-contextmenu-container');
      if (existingContainer) {
        // Need to clean up the React root if we could, but DOM removal is forceful.
        // Ideally we should keep track of the root.
        // For simplicity in this migration, direct DOM removal is acceptable as it triggers cleanup.
        document.body.removeChild(existingContainer);
      }

      const container = document.createElement('div');
      container.id = 'global-contextmenu-container';
      document.body.appendChild(container);

      const root = createRoot(container);

      const removeContextmenu = () => {
        // Use setTimeout to allow click events to propagate if needed before unmounting
        setTimeout(() => {
          root.unmount();
          if (document.body.contains(container)) {
            document.body.removeChild(container);
          }
          element.classList.remove('contextmenu-active');
          document.body.removeEventListener('scroll', removeContextmenu);
          window.removeEventListener('resize', removeContextmenu);
        }, 0);
      };

      root.render(
        <Contextmenu
          axis={{ x: event.clientX, y: event.clientY }}
          el={element}
          menus={menus}
          removeContextmenu={removeContextmenu}
        />
      );

      element.classList.add('contextmenu-active');
      document.body.addEventListener('scroll', removeContextmenu);
      window.addEventListener('resize', removeContextmenu);
    };

    element.addEventListener('contextmenu', handleContextMenu);

    return () => {
      element.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [ref, menusOrGenerator, enabled]);
}
