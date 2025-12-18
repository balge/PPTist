import { create } from 'zustand'
import { omit } from 'lodash'
import type { Slide, SlideTheme, PPTElement, SlideTemplate } from '@/types/slides'

interface RemovePropData {
  id: string
  propName: string | string[]
}

interface UpdateElementData {
  id: string | string[]
  props: Partial<PPTElement>
  slideId?: string
}

export interface SlidesState {
  title: string
  theme: SlideTheme
  slides: Slide[]
  slideIndex: number
  viewportSize: number
  viewportRatio: number
  templates: SlideTemplate[]

  // Computed properties
  currentSlide: Slide | null

  // Actions
  setTitle: (title: string) => void
  setTheme: (themeProps: Partial<SlideTheme>) => void
  setViewportSize: (size: number) => void
  setViewportRatio: (viewportRatio: number) => void
  setSlides: (slides: Slide[]) => void
  setTemplates: (templates: SlideTemplate[]) => void
  addSlide: (slide: Slide | Slide[]) => void
  updateSlide: (props: Partial<Slide>, slideId?: string) => void
  removeSlideProps: (data: RemovePropData) => void
  deleteSlide: (slideId: string | string[]) => void
  updateSlideIndex: (index: number) => void
  addElement: (element: PPTElement | PPTElement[]) => void
  deleteElement: (elementId: string | string[]) => void
  updateElement: (data: UpdateElementData) => void
  removeElementProps: (data: RemovePropData) => void
}

// Helper to update computed properties
const updateComputed = (state: Partial<SlidesState>): Partial<SlidesState> => {
  const slides = state.slides || []
  const slideIndex = state.slideIndex !== undefined ? state.slideIndex : 0
  const currentSlide = slides[slideIndex] || null
  return { currentSlide }
}

export const useSlidesStore = create<SlidesState>((set, get) => ({
  title: '未命名演示文稿',
  theme: {
    themeColors: ['#5b9bd5', '#ed7d31', '#a5a5a5', '#ffc000', '#4472c4', '#70ad47'],
    fontColor: '#333',
    fontName: '',
    backgroundColor: '#fff',
    shadow: {
      h: 3,
      v: 3,
      blur: 2,
      color: '#808080',
    },
    outline: {
      width: 2,
      color: '#525252',
      style: 'solid',
    },
  },
  slides: [],
  slideIndex: 0,
  viewportSize: 1000,
  viewportRatio: 0.5625,
  templates: [
    { name: '山河映红', id: 'template_1', cover: './imgs/template_1.webp', origin: '官方制作' },
    { name: '都市蓝调', id: 'template_2', cover: './imgs/template_2.webp', origin: '官方制作' },
    { name: '智感几何', id: 'template_3', cover: './imgs/template_3.webp', origin: '官方制作' },
    { name: '柔光莫兰迪', id: 'template_4', cover: './imgs/template_4.webp', origin: '官方制作' },
    { name: '简约绿意', id: 'template_5', cover: './imgs/template_5.webp', origin: '社区贡献+官方深度完善优化' },
    { name: '暖色复古', id: 'template_6', cover: './imgs/template_6.webp', origin: '社区贡献+官方深度完善优化' },
    { name: '深邃沉稳', id: 'template_7', cover: './imgs/template_7.webp', origin: '社区贡献+官方深度完善优化' },
    { name: '浅蓝小清新', id: 'template_8', cover: './imgs/template_8.webp', origin: '社区贡献+官方深度完善优化' },
  ],
  currentSlide: null,

  setTitle: (title: string) => set({ title: title || '未命名演示文稿' }),

  setTheme: (themeProps: Partial<SlideTheme>) => set((state) => ({ theme: { ...state.theme, ...themeProps } })),

  setViewportSize: (size: number) => set({ viewportSize: size }),

  setViewportRatio: (viewportRatio: number) => set({ viewportRatio: viewportRatio }),

  setSlides: (slides: Slide[]) => set((state) => {
    const nextState = { ...state, slides }
    return { ...nextState, ...updateComputed(nextState) }
  }),

  setTemplates: (templates: SlideTemplate[]) => set({ templates }),

  addSlide: (slide: Slide | Slide[]) => set((state) => {
    const slidesToAdd = Array.isArray(slide) ? slide : [slide]
    const newSlides = [...state.slides]
    // clean sectionTag
    const cleanedSlides = slidesToAdd.map(s => {
      const copy = { ...s }
      if (copy.sectionTag) delete copy.sectionTag
      return copy
    })
    
    const addIndex = state.slideIndex + 1
    newSlides.splice(addIndex, 0, ...cleanedSlides)
    
    const nextState = { ...state, slides: newSlides, slideIndex: addIndex }
    return { ...nextState, ...updateComputed(nextState) }
  }),

  updateSlide: (props: Partial<Slide>, slideId?: string) => set((state) => {
    const slideIndex = slideId ? state.slides.findIndex(item => item.id === slideId) : state.slideIndex
    if (slideIndex === -1) return {}
    
    const newSlides = [...state.slides]
    newSlides[slideIndex] = { ...newSlides[slideIndex], ...props }
    
    const nextState = { ...state, slides: newSlides }
    return { ...nextState, ...updateComputed(nextState) }
  }),

  removeSlideProps: (data: RemovePropData) => set((state) => {
    const { id, propName } = data
    const newSlides = state.slides.map(slide => {
      return slide.id === id ? omit(slide, propName) : slide
    }) as Slide[]
    
    const nextState = { ...state, slides: newSlides }
    return { ...nextState, ...updateComputed(nextState) }
  }),

  deleteSlide: (slideId: string | string[]) => set((state) => {
    const slidesId = Array.isArray(slideId) ? slideId : [slideId]
    const slides = JSON.parse(JSON.stringify(state.slides)) as Slide[]
    
    const deleteSlidesIndex = []
    for (const deletedId of slidesId) {
      const index = slides.findIndex(item => item.id === deletedId)
      if (index === -1) continue
      deleteSlidesIndex.push(index)

      const deletedSlideSection = slides[index].sectionTag
      if (deletedSlideSection) {
        const handleSlideNext = slides[index + 1]
        if (handleSlideNext && !handleSlideNext.sectionTag) {
          delete slides[index].sectionTag
          slides[index + 1].sectionTag = deletedSlideSection
        }
      }
      slides.splice(index, 1)
    }
    
    if (slides.length === 0) {
      const nextState = { ...state, slides: [], slideIndex: 0 }
      return { ...nextState, ...updateComputed(nextState) }
    }
    
    let newIndex = Math.min(...deleteSlidesIndex)
    const maxIndex = slides.length - 1
    if (newIndex > maxIndex) newIndex = maxIndex
    
    const nextState = { ...state, slides, slideIndex: newIndex }
    return { ...nextState, ...updateComputed(nextState) }
  }),

  updateSlideIndex: (index: number) => set((state) => {
    const nextState = { ...state, slideIndex: index }
    return { ...nextState, ...updateComputed(nextState) }
  }),

  addElement: (element: PPTElement | PPTElement[]) => set((state) => {
    const elementsToAdd = Array.isArray(element) ? element : [element]
    const currentSlide = state.slides[state.slideIndex]
    if (!currentSlide) return {}
    
    const newSlides = [...state.slides]
    const newElements = [...currentSlide.elements, ...elementsToAdd]
    newSlides[state.slideIndex] = { ...currentSlide, elements: newElements }
    
    const nextState = { ...state, slides: newSlides }
    return { ...nextState, ...updateComputed(nextState) }
  }),

  deleteElement: (elementId: string | string[]) => set((state) => {
    const elementIdList = Array.isArray(elementId) ? elementId : [elementId]
    const currentSlide = state.slides[state.slideIndex]
    if (!currentSlide) return {}
    
    const newSlides = [...state.slides]
    const newElements = currentSlide.elements.filter(item => !elementIdList.includes(item.id))
    newSlides[state.slideIndex] = { ...currentSlide, elements: newElements }
    
    const nextState = { ...state, slides: newSlides }
    return { ...nextState, ...updateComputed(nextState) }
  }),

  updateElement: (data: UpdateElementData) => set((state) => {
    const { id, props, slideId } = data
    const elIdList = typeof id === 'string' ? [id] : id
    const slideIndex = slideId ? state.slides.findIndex(item => item.id === slideId) : state.slideIndex
    if (slideIndex === -1) return {}
    
    const slide = state.slides[slideIndex]
    const newElements = slide.elements.map(el => {
      return elIdList.includes(el.id) ? { ...el, ...props } : el
    })
    
    const newSlides = [...state.slides]
    newSlides[slideIndex] = { ...slide, elements: newElements as PPTElement[] }
    
    const nextState = { ...state, slides: newSlides }
    return { ...nextState, ...updateComputed(nextState) }
  }),

  removeElementProps: (data: RemovePropData) => set((state) => {
    const { id, propName } = data
    const propsNames = typeof propName === 'string' ? [propName] : propName
    const slideIndex = state.slideIndex
    const slide = state.slides[slideIndex]
    
    const newElements = slide.elements.map(el => {
      return el.id === id ? omit(el, propsNames) : el
    })
    
    const newSlides = [...state.slides]
    newSlides[slideIndex] = { ...slide, elements: newElements as PPTElement[] }
    
    const nextState = { ...state, slides: newSlides }
    return { ...nextState, ...updateComputed(nextState) }
  }),
}))
