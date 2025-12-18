# PPTist 项目架构与功能分析文档

> 本文档用于将 PPTist 项目从 Vue 3 迁移到 React 的参考

## 1. 项目架构分析

### 1.1 技术栈组成

#### 核心框架与构建工具

- **前端框架**: Vue 3.5.17 (Composition API)
- **构建工具**: Vite 5.3.5
- **语言**: TypeScript 5.3.0
- **状态管理**: Pinia 3.0.2
- **样式预处理**: Sass 1.69.6

#### 核心依赖库

- **富文本编辑**: ProseMirror (prosemirror-view, prosemirror-state, prosemirror-model, prosemirror-commands 等)
- **图表**: ECharts 6.0.0
- **拖拽**: vuedraggable 4.1.0
- **工具提示**: tippy.js 6.3.7
- **图标**: @icon-park/vue-next 1.4.2
- **动画**: animate.css 4.1.1
- **工具库**: lodash 4.17.21, nanoid 5.0.7, number-precision 1.6.0
- **本地存储**: Dexie 4.0.11 (IndexedDB 封装)
- **事件总线**: mitt 3.0.1
- **导出功能**:
  - pptxgenjs 3.12.0 (导出 PPTX)
  - html-to-image 1.11.13 (导出图片)
  - file-saver 2.0.5 (文件保存)
- **公式编辑**: hfmath 0.0.2 (LaTeX 渲染)

### 1.2 项目目录结构

```
src/
├── assets/              # 静态资源
│   ├── fonts/          # 字体文件
│   └── styles/         # 全局样式
├── components/         # 通用组件
│   ├── Button.vue
│   ├── ColorPicker/    # 颜色选择器
│   ├── Contextmenu/    # 右键菜单
│   ├── LaTeXEditor/    # LaTeX 编辑器
│   └── ...
├── configs/            # 配置文件
│   ├── animation.ts   # 动画配置
│   ├── chart.ts       # 图表配置
│   ├── element.ts     # 元素配置
│   ├── font.ts        # 字体配置
│   ├── hotkey.ts      # 快捷键配置
│   └── ...
├── hooks/              # Composition API Hooks
│   ├── useAddSlidesOrElements.ts
│   ├── useCreateElement.ts
│   ├── useDeleteElement.ts
│   ├── useHistorySnapshot.ts
│   ├── useExport.ts
│   └── ...
├── plugins/            # Vue 插件
│   ├── directive/     # 自定义指令
│   └── icon.ts        # 图标插件
├── services/           # API 服务
│   ├── axios.ts
│   └── fetch.ts
├── store/              # Pinia 状态管理
│   ├── main.ts        # 主状态（选中元素、画布状态等）
│   ├── slides.ts      # 幻灯片数据
│   ├── snapshot.ts    # 历史快照（撤销/重做）
│   ├── keyboard.ts    # 键盘状态
│   └── screen.ts      # 放映模式状态
├── types/             # TypeScript 类型定义
│   ├── slides.ts      # 幻灯片相关类型
│   ├── edit.ts        # 编辑相关类型
│   └── ...
├── utils/             # 工具函数
│   ├── prosemirror/   # ProseMirror 相关工具
│   ├── htmlParser/    # HTML 解析器
│   ├── database.ts    # IndexedDB 操作
│   └── ...
└── views/             # 页面视图
    ├── Editor/        # 编辑器主界面
    │   ├── Canvas/    # 画布组件
    │   ├── Toolbar/   # 工具栏
    │   ├── Thumbnails/# 缩略图
    │   └── ...
    ├── Screen/        # 放映模式
    └── Mobile/        # 移动端
```

### 1.3 模块划分与组件关系

#### 1.3.1 核心模块架构

```
App.vue
├── Editor (PC端编辑器)
│   ├── EditorHeader (顶部工具栏)
│   ├── Thumbnails (左侧缩略图)
│   ├── Canvas (中央画布)
│   │   ├── ViewportBackground (画布背景)
│   │   ├── EditableElement (可编辑元素)
│   │   │   ├── TextElement (文本元素)
│   │   │   ├── ImageElement (图片元素)
│   │   │   ├── ShapeElement (形状元素)
│   │   │   ├── ChartElement (图表元素)
│   │   │   ├── TableElement (表格元素)
│   │   │   ├── LineElement (线条元素)
│   │   │   ├── LatexElement (公式元素)
│   │   │   ├── VideoElement (视频元素)
│   │   │   └── AudioElement (音频元素)
│   │   ├── Operate (操作手柄)
│   │   ├── MouseSelection (鼠标框选)
│   │   └── AlignmentLine (对齐辅助线)
│   ├── CanvasTool (画布工具)
│   ├── Toolbar (右侧工具栏)
│   └── Remark (备注面板)
├── Screen (放映模式)
└── Mobile (移动端)
```

#### 1.3.2 状态管理架构

**Pinia Store 模块**:

1. **mainStore** (`store/main.ts`)

   - 管理当前选中的元素 (`activeElementIdList`, `handleElementId`)
   - 画布状态 (`canvasScale`, `canvasPercentage`, `canvasDragged`)
   - UI 状态 (`toolbarState`, `showSelectPanel`, `showSearchPanel` 等)
   - 编辑状态 (`creatingElement`, `richTextAttrs`, `textFormatPainter` 等)

2. **slidesStore** (`store/slides.ts`)

   - 幻灯片数据 (`slides`, `slideIndex`)
   - 主题配置 (`theme`)
   - 模板数据 (`templates`)
   - 提供元素 CRUD 操作

3. **snapshotStore** (`store/snapshot.ts`)

   - 历史快照管理 (`snapshotCursor`, `snapshotLength`)
   - 撤销/重做功能
   - 使用 IndexedDB 存储快照

4. **keyboardStore** (`store/keyboard.ts`)

   - 键盘按键状态 (`ctrlKeyState`, `shiftKeyState`, `spaceKeyState`)

5. **screenStore** (`store/screen.ts`)
   - 放映模式状态

#### 1.3.3 数据流

```
用户操作
  ↓
Hooks (useXXX.ts)
  ↓
Store Actions
  ↓
State 更新
  ↓
组件响应式更新
  ↓
UI 渲染
```

## 2. 功能实现分析

### 2.1 画布渲染系统

#### 2.1.1 画布结构

**核心组件**: `views/Editor/Canvas/index.vue`

- **viewport-wrapper**: 视口包装器，控制画布位置和大小
- **viewport**: 实际画布区域，通过 `transform: scale()` 实现缩放
- **operates**: 操作层，渲染选中元素的控制手柄
- **元素层**: 渲染所有幻灯片元素

#### 2.1.2 画布缩放与移动

**实现位置**: `hooks/useScaleCanvas.ts`, `Canvas/hooks/useViewportSize.ts`

- **缩放**: 通过 `canvasScale` 状态控制 `transform: scale(canvasScale)`
- **移动**: 按住空格键拖拽画布，通过 `viewportStyles.left/top` 控制位置
- **缩放控制**:
  - Ctrl + 鼠标滚轮
  - 工具栏缩放按钮
  - 默认缩放比例: 90%

#### 2.1.3 元素渲染机制

**元素类型枚举** (`types/slides.ts`):

```typescript
enum ElementTypes {
  TEXT = "text",
  IMAGE = "image",
  SHAPE = "shape",
  LINE = "line",
  CHART = "chart",
  TABLE = "table",
  LATEX = "latex",
  VIDEO = "video",
  AUDIO = "audio",
}
```

**元素渲染流程**:

1. `EditableElement.vue` 根据元素类型动态加载对应组件
2. 每种元素类型有独立的组件实现
3. 元素通过 `zIndex` 控制层级关系
4. 元素位置通过 `left`, `top`, `width`, `height` 绝对定位

### 2.2 元素操作系统

#### 2.2.1 元素选择

**实现位置**: `hooks/useSelectElement.ts`, `Canvas/hooks/useSelectElement.ts`

- **单击选择**: 点击元素选中
- **多选**:
  - Ctrl/Shift + 点击
  - 鼠标框选 (`useMouseSelection.ts`)
- **全选**: Ctrl + A

**选择状态管理**:

- `activeElementIdList`: 所有选中元素的 ID 数组
- `handleElementId`: 当前操作的元素 ID（单选时）

#### 2.2.2 元素拖拽移动

**实现位置**: `Canvas/hooks/useDragElement.ts`

- 监听 `mousedown` 事件
- 计算鼠标移动距离
- 更新元素 `left`, `top` 属性
- 支持对齐辅助线 (`alignmentLines`)

#### 2.2.3 元素缩放

**实现位置**: `Canvas/hooks/useScaleElement.ts`

- 通过操作手柄 (`ResizeHandler`) 控制
- 支持 8 个方向的缩放
- 支持固定宽高比 (`fixedRatio`)
- 实时更新元素 `width`, `height`

#### 2.2.4 元素旋转

**实现位置**: `Canvas/hooks/useRotateElement.ts`

- 通过旋转手柄控制
- 使用 `transform: rotate()` 实现
- 更新元素 `rotate` 属性

#### 2.2.5 元素对齐

**实现位置**: `hooks/useAlignElementToCanvas.ts`, `hooks/useAlignActiveElement.ts`

- **对齐到画布**: 左对齐、右对齐、水平居中、顶部对齐、底部对齐、垂直居中
- **元素间对齐**: 基于选中元素的边界框对齐
- **对齐辅助线**: 拖拽时显示对齐参考线

### 2.3 富文本编辑系统

#### 2.3.1 ProseMirror 集成

**核心文件**:

- `utils/prosemirror/index.ts`: 编辑器初始化
- `views/components/element/ProsemirrorEditor.vue`: 编辑器组件
- `utils/prosemirror/schema/`: Schema 定义
- `utils/prosemirror/plugins/`: 插件配置

**Schema 结构**:

- **Nodes**: paragraph, heading, bulletList, orderedList, blockquote, codeBlock, horizontalRule
- **Marks**: bold, em, underline, strikethrough, code, link, color, backcolor, fontsize, fontname

**功能特性**:

- 富文本格式（加粗、斜体、下划线、删除线等）
- 列表（有序、无序）
- 文本对齐
- 字体、字号、颜色设置
- 超链接
- 行高、字间距、段间距

#### 2.3.2 文本元素编辑

**实现位置**: `views/components/element/TextElement/index.vue`

- 双击进入编辑模式
- 使用 ProseMirror 编辑器
- 编辑完成后同步 HTML 内容到元素 `content` 属性
- 支持格式刷功能 (`textFormatPainter`)

### 2.4 历史快照系统（撤销/重做）

#### 2.4.1 快照存储

**实现位置**: `store/snapshot.ts`, `utils/database.ts`

- 使用 IndexedDB (Dexie) 存储快照
- 每个快照包含完整的幻灯片数据 (`slides`) 和当前页索引 (`index`)
- 快照数量限制: 20 个

#### 2.4.2 快照管理

**核心逻辑**:

1. **添加快照**:

   - 操作后通过 `useHistorySnapshot.ts` 的 `addHistorySnapshot` 添加快照
   - 使用 `debounce` 防抖，300ms 延迟
   - 如果当前不在最后位置，删除后续快照

2. **撤销** (`unDo`):

   - 快照指针前移
   - 恢复对应快照的数据
   - 清空选中状态

3. **重做** (`reDo`):
   - 快照指针后移
   - 恢复对应快照的数据

**使用场景**:

- 元素增删改
- 幻灯片操作
- 样式修改
- 文本编辑（通过 `ignore` 参数控制是否记录快照）

### 2.5 元素创建系统

#### 2.5.1 元素创建流程

**实现位置**: `hooks/useCreateElement.ts`

**创建方式**:

1. **工具栏插入**: 点击工具栏按钮，通过 `creatingElement` 状态控制
2. **拖拽创建**: 从工具栏拖拽到画布
3. **双击创建**: 双击画布空白处创建文本
4. **粘贴创建**: 从剪贴板粘贴

#### 2.5.2 元素类型创建

每种元素类型都有对应的创建函数:

- `createTextElement`: 创建文本元素
- `createImageElement`: 创建图片元素
- `createShapeElement`: 创建形状元素
- `createLineElement`: 创建线条元素
- `createChartElement`: 创建图表元素
- `createTableElement`: 创建表格元素
- `createLatexElement`: 创建公式元素
- `createVideoElement`: 创建视频元素
- `createAudioElement`: 创建音频元素

### 2.6 元素类型详细实现

#### 2.6.1 文本元素 (TextElement)

**数据结构**: `PPTTextElement`

- `content`: HTML 字符串
- `defaultFontName`, `defaultColor`: 默认字体和颜色
- `lineHeight`, `wordSpace`, `paragraphSpace`: 排版属性
- `outline`, `fill`, `shadow`: 样式属性
- `vertical`: 竖向文本

**组件结构**:

- `BaseTextElement.vue`: 静态展示
- `TextElement/index.vue`: 可编辑版本，集成 ProseMirror

#### 2.6.2 图片元素 (ImageElement)

**数据结构**: `PPTImageElement`

- `src`: 图片地址
- `fixedRatio`: 固定宽高比
- `filters`: 滤镜效果（模糊、亮度、对比度等）
- `clip`: 裁剪信息
- `flipH`, `flipV`: 翻转
- `radius`: 圆角
- `colorMask`: 颜色蒙版

**功能**:

- 图片裁剪 (`ImageClipHandler.vue`)
- 滤镜应用 (`useFilter.ts`)
- 替换图片
- 设置为背景

#### 2.6.3 形状元素 (ShapeElement)

**数据结构**: `PPTShapeElement`

- `path`: SVG path 路径
- `viewBox`: SVG viewBox
- `fill`: 填充色
- `gradient`: 渐变填充
- `pattern`: 图案填充
- `text`: 形状内文本
- `keypoints`: 关键点（用于自定义形状编辑）

**功能**:

- 形状替换
- 渐变/图案填充
- 形状内文本编辑
- 自定义形状绘制 (`ShapeCreateCanvas.vue`)

#### 2.6.4 图表元素 (ChartElement)

**数据结构**: `PPTChartElement`

- `chartType`: 图表类型（bar, column, line, pie, ring, area, radar, scatter）
- `data`: 图表数据 (`labels`, `legends`, `series`)
- `options`: 图表选项（平滑、堆叠等）
- `themeColors`: 主题色

**实现**:

- 使用 ECharts 渲染
- 支持数据编辑 (`ChartDataEditor.vue`)
- 支持图表类型转换
- 支持主题色设置

#### 2.6.5 表格元素 (TableElement)

**数据结构**: `PPTTableElement`

- `data`: 二维数组，每个单元格包含 `id`, `colspan`, `rowspan`, `text`, `style`
- `colWidths`: 列宽比例数组
- `theme`: 表格主题（标题行、汇总行等）

**功能**:

- 单元格合并
- 单元格样式设置
- 行列增删
- 主题应用

#### 2.6.6 线条元素 (LineElement)

**数据结构**: `PPTLineElement`

- `start`, `end`: 起点和终点坐标
- `style`: 线条样式（实线、虚线、点线）
- `points`: 端点样式（箭头、圆点）
- `broken`, `broken2`: 折线控制点
- `curve`: 二次曲线控制点
- `cubic`: 三次曲线控制点

**功能**:

- 直线、折线、曲线绘制
- 端点样式设置
- 线条拖拽编辑

### 2.7 幻灯片管理

#### 2.7.1 幻灯片操作

**实现位置**: `hooks/useSlideHandler.ts`

- **添加幻灯片**: `addSlide()`
- **删除幻灯片**: `deleteSlide()`
- **复制幻灯片**: `copySlide()`
- **移动幻灯片**: 拖拽缩略图调整顺序
- **创建节**: `createSection()`

#### 2.7.2 幻灯片背景

**数据结构**: `SlideBackground`

- `type`: 背景类型（solid, image, gradient）
- `color`: 纯色背景
- `image`: 图片背景（支持 cover, contain, repeat）
- `gradient`: 渐变背景

**实现位置**: `hooks/useSlideBackgroundStyle.ts`

### 2.8 动画系统

#### 2.8.1 元素动画

**数据结构**: `PPTAnimation`

- `type`: 动画类型（in, out, attention）
- `effect`: 动画效果名称
- `duration`: 持续时间
- `trigger`: 触发方式（click, meantime, auto）

**动画配置**: `configs/animation.ts`

- 入场动画: fadeIn, slideIn, zoomIn 等
- 退场动画: fadeOut, slideOut, zoomOut 等
- 强调动画: pulse, shake, bounce 等

**实现**:

- 使用 `animate.css` 库
- 动画序列管理 (`formatedAnimations` getter)
- 放映时按序列执行动画

#### 2.8.2 幻灯片切换动画

**数据结构**: `TurningMode`

- 切换方式: fade, slideX, slideY, rotate, scale 等

### 2.9 导出功能

#### 2.9.1 导出类型

**实现位置**: `hooks/useExport.ts`, `views/Editor/ExportDialog/`

- **PPTX**: 使用 `pptxgenjs` 库
- **PDF**: 使用 `html-to-image` 转换为图片后生成 PDF
- **图片**: PNG/JPG，使用 `html-to-image`
- **JSON**: 导出项目数据

#### 2.9.2 导出流程

1. 用户选择导出类型和选项
2. 遍历所有幻灯片
3. 将每个幻灯片转换为目标格式
4. 使用 `file-saver` 保存文件

### 2.10 快捷键系统

**实现位置**: `hooks/useGlobalHotkey.ts`, `configs/hotkey.ts`

**快捷键分类**:

- **编辑操作**: Ctrl+C, Ctrl+V, Ctrl+X, Delete
- **元素操作**: Ctrl+G (组合), Ctrl+L (锁定), Ctrl+A (全选)
- **历史操作**: Ctrl+Z (撤销), Ctrl+Y (重做)
- **幻灯片操作**: Ctrl+D (复制), Delete (删除)
- **放映**: F5 (从头开始), Esc (退出)

**快捷键管理**:

- 通过 `keyboardStore` 管理按键状态
- `disableHotkeys` 控制是否禁用快捷键（如富文本编辑时）

### 2.11 右键菜单系统

**实现位置**: `components/Contextmenu/`

**菜单类型**:

- **画布右键菜单**: 粘贴、全选、标尺、网格线等
- **元素右键菜单**: 剪切、复制、对齐、组合、锁定、删除等
- **动态菜单**: 根据上下文显示不同菜单项

### 2.12 移动端支持

**实现位置**: `views/Mobile/`

**功能**:

- 基础编辑功能（增删改元素）
- 元素移动、缩放、旋转
- 基础样式设置
- 预览模式

**适配**:

- 触摸事件处理
- 响应式布局
- 简化的工具栏

## 3. 关键技术点

### 3.1 响应式设计

- 使用 Vue 3 Composition API 的响应式系统
- Pinia Store 自动响应式更新
- `watchEffect` 用于自动依赖追踪

### 3.2 性能优化

- **防抖/节流**: 历史快照使用 `debounce`，快捷键使用 `throttle`
- **虚拟滚动**: 缩略图列表可能使用（需确认）
- **懒加载**: 图片元素懒加载
- **快照限制**: 历史快照最多保存 20 个

### 3.3 数据持久化

- **IndexedDB**: 使用 Dexie 存储历史快照
- **LocalStorage**: 存储配置信息
- **导出/导入**: JSON 格式的项目文件

### 3.4 事件系统

- **事件总线**: 使用 `mitt` 实现跨组件通信
- **自定义事件**: 元素操作通过事件传递
- **DOM 事件**: 鼠标、键盘、触摸事件处理

## 4. 迁移到 React 的关键考虑点

### 4.1 状态管理迁移

**Vue Pinia → React Zustand/Redux Toolkit**

- `mainStore` → 全局状态管理
- `slidesStore` → 幻灯片数据管理
- `snapshotStore` → 历史快照管理
- `keyboardStore` → 键盘状态管理

### 4.2 组件迁移

**Vue SFC → React Component**

- `.vue` 文件 → `.tsx` 文件
- `<template>` → JSX
- `<script setup>` → React Hooks
- `<style scoped>` → CSS Modules/styled-components

### 4.3 Hooks 迁移

**Vue Composition API → React Hooks**

- `useXXX.ts` → `useXXX.ts` (保持相同命名)
- `ref` → `useState`
- `computed` → `useMemo`
- `watch` → `useEffect`
- `onMounted` → `useEffect(() => {}, [])`

### 4.4 响应式系统

**Vue 响应式 → React 状态更新**

- Vue 的自动响应式更新需要手动触发 React 重渲染
- 使用状态管理库的 `setState` 或 `dispatch`

### 4.5 ProseMirror 集成

- ProseMirror 是框架无关的，可以直接复用
- 需要适配 React 的组件生命周期
- 使用 `useEffect` 管理编辑器实例

### 4.6 事件处理

- Vue 的事件系统 → React 的合成事件系统
- 自定义指令 → React Hooks 或 HOC
- 事件总线 → Context API 或状态管理

### 4.7 样式处理

- Vue Scoped CSS → CSS Modules 或 styled-components
- SCSS 变量和混入 → CSS Variables 或 Theme Provider

## 5. 核心文件清单

### 5.1 必须迁移的核心文件

1. **类型定义**: `types/slides.ts`, `types/edit.ts`
2. **状态管理**: `store/*.ts`
3. **Hooks**: `hooks/*.ts`
4. **工具函数**: `utils/*.ts`
5. **配置文件**: `configs/*.ts`
6. **组件**: `views/**/*.vue` → `views/**/*.tsx`
7. **ProseMirror**: `utils/prosemirror/**/*.ts`

### 5.2 可以复用的第三方库

- ProseMirror (框架无关)
- ECharts (框架无关)
- Dexie (框架无关)
- lodash, nanoid 等工具库
- animate.css

### 5.3 需要重写的部分

- Vue 组件 → React 组件
- Pinia Store → Zustand/Redux Toolkit
- Vue 指令 → React Hooks
- Vue 插件系统 → React Context/Hooks

## 6. 关键功能实现细节

### 6.1 元素拖拽实现

**核心文件**: `Canvas/hooks/useDragElement.ts`

**实现要点**:

1. **事件处理**:

   - 监听 `mousedown` 和 `touchstart` 事件
   - 在 `document` 上监听 `mousemove` 和 `mouseup` 事件（避免鼠标移出元素区域）

2. **误操作检测**:

   - 鼠标移动距离小于 5px 时判定为误操作
   - 防止点击时意外触发拖拽

3. **对齐吸附**:

   - 收集画布内所有元素的边界线（上下左右、中心线）
   - 收集画布边界线
   - 拖拽时检测目标位置与对齐线的距离
   - 距离小于 5px 时自动吸附对齐
   - 显示对齐辅助线

4. **Shift 键约束**:

   - 按住 Shift 键时，限制移动方向为水平或垂直

5. **多选拖拽**:

   - 计算所有选中元素的整体边界
   - 保持元素间的相对位置关系

6. **旋转元素处理**:
   - 旋转后的元素需要重新计算边界框
   - 使用 `getRectRotatedRange` 函数计算旋转后的范围

### 6.2 元素组合实现

**核心文件**: `hooks/useCombineElement.ts`

**实现逻辑**:

1. **组合**:

   - 为选中的多个元素分配相同的 `groupId`
   - `groupId` 使用 `nanoid` 生成唯一 ID
   - 组合后，选中状态保持为组合内的所有元素

2. **取消组合**:

   - 移除选中元素的 `groupId` 属性
   - 重置选中状态

3. **组合内元素操作**:
   - 通过 `activeGroupElementId` 标识组合内正在操作的元素
   - 组合内的元素可以独立移动、缩放

### 6.3 复制粘贴实现

**核心文件**: `hooks/useCopyAndPasteElement.ts`, `utils/clipboard.ts`, `utils/crypto.ts`

**实现流程**:

1. **复制**:

   - 将选中元素序列化为 JSON
   - 使用加密算法加密数据（`crypto-js`）
   - 写入剪贴板（`clipboard` 库）

2. **粘贴**:

   - 读取剪贴板内容
   - 解密数据
   - 解析 JSON 获取元素数据
   - 为新元素生成新的 ID
   - 调整元素位置（避免重叠）
   - 添加到当前幻灯片

3. **跨页面粘贴**:
   - 支持在不同幻灯片间复制粘贴
   - 支持跨项目粘贴（通过 JSON 格式）

### 6.4 IndexedDB 快照管理

**核心文件**: `utils/database.ts`, `store/snapshot.ts`

**数据库结构**:

- 使用 Dexie 封装 IndexedDB
- 数据库命名: `PPTist_{databaseId}_{timestamp}`
- 表结构:
  - `snapshots`: 历史快照表
  - `writingBoardImgs`: 画板图片表

**快照管理策略**:

1. **快照添加**:

   - 操作后延迟 300ms 添加快照（防抖）
   - 如果当前不在最后位置，删除后续快照
   - 快照数量限制为 20 个，超出时删除最旧的

2. **数据库清理**:
   - 应用关闭时记录数据库 ID 到 localStorage
   - 应用启动时删除失效的数据库
   - 删除超过 12 小时的数据库

### 6.5 对齐辅助线实现

**核心文件**: `Canvas/AlignmentLine.vue`, `utils/element.ts`

**实现逻辑**:

1. **对齐线收集**:

   - 收集画布内所有元素的边界线
   - 包括: 顶部、底部、左侧、右侧、水平中心、垂直中心
   - 收集画布边界线

2. **对齐线去重**:

   - 相同位置的对齐线合并
   - 使用 `uniqAlignLines` 函数去重

3. **对齐检测**:

   - 拖拽时实时检测目标位置
   - 计算与对齐线的距离
   - 距离小于阈值时自动吸附

4. **对齐线渲染**:
   - 使用 `AlignmentLine` 组件渲染
   - 显示水平和垂直两种类型的对齐线

### 6.6 元素层级管理

**核心文件**: `hooks/useOrderElement.ts`

**实现逻辑**:

1. **层级调整**:

   - 置于顶层: 移动到数组最后
   - 置于底层: 移动到数组最前
   - 上移一层: 与后一个元素交换位置
   - 下移一层: 与前一个元素交换位置

2. **组合元素处理**:
   - 组合内的元素作为一个整体移动
   - 保持组合内元素的相对顺序

### 6.7 元素锁定实现

**核心文件**: `hooks/useLockElement.ts`

**实现逻辑**:

1. **锁定元素**:

   - 设置元素的 `lock` 属性为 `true`
   - 清空选中状态
   - 锁定后无法选中和操作

2. **解锁元素**:
   - 移除 `lock` 属性
   - 如果是组合元素，解锁整个组合
   - 解锁后自动选中该元素

### 6.8 鼠标框选实现

**核心文件**: `Canvas/hooks/useMouseSelection.ts`, `Canvas/MouseSelection.vue`

**实现逻辑**:

1. **框选开始**:

   - 在画布空白区域按下鼠标
   - 记录起始位置

2. **框选过程**:

   - 鼠标移动时更新框选区域
   - 计算框选区域与元素的交集
   - 实时更新选中元素列表

3. **框选结束**:

   - 鼠标抬起时确定最终选中元素
   - 隐藏框选框

4. **象限处理**:
   - 根据拖拽方向确定象限
   - 不同象限显示不同的框选框样式

## 7. 总结

PPTist 是一个功能完整的在线 PPT 编辑器，核心功能包括：

1. **画布系统**: 缩放、移动、网格、标尺
2. **元素系统**: 9 种元素类型，完整的 CRUD 操作
3. **编辑系统**: 拖拽、缩放、旋转、对齐、组合
4. **富文本**: ProseMirror 集成，完整的文本编辑功能
5. **历史系统**: IndexedDB 存储的撤销/重做
6. **动画系统**: 元素动画和幻灯片切换动画
7. **导出功能**: PPTX、PDF、图片、JSON
8. **快捷键**: 完整的快捷键支持
9. **移动端**: 基础编辑和预览功能

### 7.1 关键技术亮点

1. **高性能拖拽**: 使用防抖和节流优化，支持大量元素的流畅拖拽
2. **智能对齐**: 自动吸附对齐，提升用户体验
3. **组合系统**: 支持元素组合和组合内独立操作
4. **历史快照**: IndexedDB 存储，支持大量历史记录
5. **富文本编辑**: ProseMirror 深度集成，功能完整

### 7.2 迁移到 React 的关键考虑点

1. **状态管理迁移**:

   - Pinia → Zustand 或 Redux Toolkit
   - 保持相同的状态结构
   - 注意响应式更新的差异

2. **组件生命周期**:

   - Vue 的 `onMounted` → React 的 `useEffect`
   - Vue 的 `watch` → React 的 `useEffect` + 依赖数组
   - Vue 的 `computed` → React 的 `useMemo`

3. **事件处理**:

   - Vue 的事件系统 → React 的合成事件
   - 自定义指令 → React Hooks 或 HOC
   - 事件总线 → Context API 或状态管理

4. **性能优化**:

   - React.memo 优化组件渲染
   - useMemo 和 useCallback 优化计算和函数
   - 虚拟滚动（如果需要）

5. **第三方库集成**:

   - ProseMirror: 框架无关，可直接复用
   - ECharts: 框架无关，可直接复用
   - Dexie: 框架无关，可直接复用

6. **样式处理**:
   - Vue Scoped CSS → CSS Modules 或 styled-components
   - SCSS 变量 → CSS Variables 或 Theme Provider

### 7.3 迁移优先级建议

**高优先级**（核心功能）:

1. 类型定义 (`types/`)
2. 状态管理 (`store/`)
3. 工具函数 (`utils/`)
4. 画布组件 (`Canvas/`)
5. 元素组件 (`element/`)

**中优先级**（重要功能）:

1. Hooks (`hooks/`)
2. 工具栏 (`Toolbar/`)
3. 导出功能 (`ExportDialog/`)
4. ProseMirror 集成

**低优先级**（辅助功能）:

1. 移动端支持
2. 放映模式
3. 动画系统
4. 快捷键系统
