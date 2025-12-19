import React, { useMemo } from 'react'
import clsx from 'clsx'
import type { ContextmenuItem, Axis } from './types'
import './index.scss'

interface MenuContentProps {
  menus: ContextmenuItem[];
  handleClickMenuItem: (item: ContextmenuItem) => void;
}

const MenuContent: React.FC<MenuContentProps> = ({
  menus,
  handleClickMenuItem,
}) => {
  return (
    <ul className="menu-content">
      {menus.map((menu, index) => {
        if (menu.hide) return null

        return (
          <li
            key={menu.text || index}
            className={clsx('menu-item', {
              divider: menu.divider,
              disable: menu.disable,
            })}
            onClick={(e) => {
              e.stopPropagation()
              handleClickMenuItem(menu)
            }}
          >
            {!menu.divider && (
              <div
                className={clsx('menu-item-content', {
                  'has-children': menu.children && menu.children.length > 0,
                  'has-handler': !!menu.handler,
                })}
              >
                <span className="text">{menu.text}</span>
                {menu.subText &&
                  (!menu.children || menu.children.length === 0) && (
                  <span className="sub-text">{menu.subText}</span>
                )}

                {menu.children && menu.children.length > 0 && (
                  <div className="sub-menu">
                    <MenuContent
                      menus={menu.children}
                      handleClickMenuItem={handleClickMenuItem}
                    />
                  </div>
                )}
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}

interface ContextmenuProps {
  axis: Axis;
  el?: HTMLElement | SVGPathElement;
  menus: ContextmenuItem[];
  removeContextmenu: () => void;
}

const Contextmenu: React.FC<ContextmenuProps> = ({
  axis,
  el,
  menus,
  removeContextmenu,
}) => {
  const style = useMemo(() => {
    const MENU_WIDTH = 180
    const MENU_HEIGHT = 30
    const DIVIDER_HEIGHT = 11
    const PADDING = 5

    const { x, y } = axis
    const menuCount = menus.filter(
      (menu) => !(menu.divider || menu.hide)
    ).length
    const dividerCount = menus.filter((menu) => menu.divider).length

    const menuWidth = MENU_WIDTH
    const menuHeight =
      menuCount * MENU_HEIGHT + dividerCount * DIVIDER_HEIGHT + PADDING * 2

    const screenWidth = document.body.clientWidth
    const screenHeight = document.body.clientHeight

    return {
      left: screenWidth <= x + menuWidth ? x - menuWidth : x,
      top: screenHeight <= y + menuHeight ? y - menuHeight : y,
    }
  }, [axis, menus])

  const handleClickMenuItem = (item: ContextmenuItem) => {
    if (item.disable) return
    if (item.children && !item.handler) return
    if (item.handler) item.handler(el)
    removeContextmenu()
  }

  return (
    <>
      <div
        className="contextmenu-mask"
        onContextMenu={(e) => {
          e.preventDefault()
          removeContextmenu()
        }}
        onMouseDown={(e) => {
          if (e.button === 0) removeContextmenu()
        }}
      />

      <div
        className="contextmenu"
        style={{
          left: style.left,
          top: style.top,
        }}
        onContextMenu={(e) => e.preventDefault()}
      >
        <MenuContent menus={menus} handleClickMenuItem={handleClickMenuItem} />
      </div>
    </>
  )
}

export default Contextmenu
