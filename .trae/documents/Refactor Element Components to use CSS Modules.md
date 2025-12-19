I will convert the `.scss` files in `src/views/components/element/` to CSS Modules to implement style isolation as requested.

### Phase 1: Preparation & Scope

I have identified approximately 30 `.scss` files in `src/views/components/element/` that need conversion. These files are paired with `.tsx` components.

### Phase 2: Conversion Strategy

For each component (e.g., `BaseVideoElement`):

1. **Rename File**: Rename `filename.scss` to `filename.module.scss`.
2. **Refactor SCSS**:

   * Update CSS class names from kebab-case (e.g., `.base-element-video`) to camelCase (e.g., `.baseElementVideo`) to align with standard CSS Module usage (`styles.baseElementVideo`).

   * Refactor nested modifier classes (e.g., `&.t`) to ensure they are accessible via the `styles` object (e.g., making them top-level or ensuring they are exported).
3. **Update Component (`.tsx`)**:

   * Change import from `import './filename.scss'` to `import styles from './filename.module.scss'`.

   * Replace string class names with `styles` object properties.

     * Example: `className="base-element-video"` → `className={styles.baseElementVideo}`.

   * Handle dynamic class names (e.g., in loops) by mapping keys to `styles`.

### Phase 3: Execution Order

I will process the components in groups to ensure accuracy:

1. **VideoElement & AudioElement**: Start with `VideoElement` (as currently viewed) and `AudioElement`.
2. **ImageElement**: Process `BaseImageElement` and related outline components.
3. **ShapeElement & LineElement**: Process basic shape and line elements.
4. **TextElement & TableElement**: Process text and table elements.
5. **ChartElement & LatexElement**: Process remaining elements.
6. **Verify**: Ensure the application compiles and styles are applied correctly (using `styles.xxxx` pattern).

### Phase 4: Verification

* I will verify the changes by checking if the classes are correctly transformed in the code and ensuring the build (or at least the static analysis) passes.

* I will pay special attention to dynamic class names to avoid regressions.

This approach ensures strict style isolation and follows the requested `styles.xxxx` pattern.
