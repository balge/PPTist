import type { App } from 'vue'

import Contextmenu from './contextmenu'
import ClickOutside from './clickOutside'

export default {
  /**
   * 安装指令，仅注册必要指令
   * - contextmenu：右键菜单
   * - click-outside：点击元素外部触发回调
   */
  install(app: App) {
    app.directive('contextmenu', Contextmenu)
    app.directive('click-outside', ClickOutside)
  }
}
