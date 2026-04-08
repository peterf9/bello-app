```markdown
# Design System Strategy: The Gentle Caretaker

## 1. Overview & Creative North Star
The "Gentle Caretaker" strategy moves away from the clinical, utility-first nature of standard pet trackers. Instead, it adopts a **"Sophisticated Organic"** aesthetic. Our goal is to make the digital experience feel as tactile and comforting as a high-end pet boutique. 

We break the "standard app" mold by rejecting rigid grids in favor of **intentional asymmetry** and **tonal layering**. Elements should feel like they are floating on soft cushions rather than locked into boxes. We use high-contrast typography scales—pairing massive, friendly displays with tight, functional body copy—to create an editorial feel that guides the user’s eye through their dog's daily routine with effortless grace.

## 2. Colors & Surface Philosophy
The palette is a sun-drenched morning: creams, soft ambers, and sky blues. However, the execution must remain premium, not "childish."

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to define sections. Traditional dividers are prohibited. 
*   **How to separate content:** Use background shifts. A `surface-container-low` (#f8f3ec) card should sit on a `surface` (#fef9f3) background. The contrast is felt, not seen.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. Use the `surface-container` tiers to create depth:
*   **Base Level:** `surface` (#fef9f3)
*   **Secondary Content:** `surface-container` (#f2ede6)
*   **Interactive Cards:** `surface-container-low` (#f8f3ec) or `surface-container-lowest` (#ffffff) for maximum "pop."
*   **Deep Inset/Modals:** `surface-container-highest` (#e7e2d9)

### The "Glass & Gradient" Rule
For floating action buttons or high-priority meal tracking cards, use **Glassmorphism**. Apply `surface` with 60% opacity and a `backdrop-blur` of 12px. 
*   **Signature Textures:** For the "Meal Complete" state or "Hero" sections, use a subtle linear gradient transitioning from `primary` (#914d00) to `primary_container` (#ffaf6d) at a 135-degree angle. This adds a "soul" to the UI that flat hex codes cannot achieve.

## 3. Typography: The Editorial Voice
We use two distinct personalities to balance playfulness with professional clarity.

*   **The Hero (Plus Jakarta Sans):** Used for `display` and `headline` scales. This font’s open counters and modern geometry feel "friendly" without being "comic." Use `display-lg` (3.5rem) for big milestones (e.g., "Bello is fed!") to create a celebratory moment.
*   **The Anchor (Be Vietnam Pro):** Used for `title`, `body`, and `label` scales. This provides the "Clean" aspect of the prompt. It is highly legible for tracking weights, times, and ingredients.
*   **Hierarchy Tip:** Pair a `headline-sm` title with a `label-md` uppercase subtitle (using `on_surface_variant` #625f58) to create a premium, magazine-style header for pet profiles.

## 4. Elevation & Depth
We convey importance through **Tonal Layering** rather than structural lines.

*   **The Layering Principle:** To lift a card, don't reach for a shadow first. Place a `surface-container-lowest` (#ffffff) element on a `surface-dim` (#dfd9cf) background. This creates a "soft lift" that feels natural.
*   **Ambient Shadows:** If a shadow is required for a floating state (like a quick-add meal button), use a 12% opacity shadow using the `primary` (#914d00) color rather than black. Blur radius should be 20px+ for a "soft glow" effect.
*   **The "Ghost Border" Fallback:** If accessibility requires a border, use `outline_variant` (#b6b1a9) at **15% opacity**. It should be a whisper, not a shout.

## 5. Signature Components

### Primary Buttons
*   **Shape:** `full` (pill-shaped) to echo the "friendly" prompt.
*   **Color:** `primary` (#914d00) with `on_primary` (#fff7f4) text.
*   **Depth:** No shadow. Use a 2px "inner glow" (lighter version of primary) at the top edge for a tactile, 3D feel.

### Meal Tracking Cards
*   **Structure:** Forbidden to use dividers. Use `Spacing 4` (1.4rem) to separate the meal time from the food name.
*   **Visual Cue:** Use a `secondary_container` (#b7eaff) vertical pill (width: 4px) on the far left of the card to indicate "Morning" or "Evening" meals.

### Interactive Chips
*   **States:** Unselected chips should be `surface-container-high` (#ede8df). Selected chips should transition to `tertiary_container` (#fdd34d).
*   **Interaction:** On tap, use a subtle "scale-down" transform (0.98) to mimic the feeling of pressing into something soft.

### Pet Profile Inputs
*   **Style:** No bottom-line-only inputs. Use a fully rounded (`md`: 1.5rem) container with `surface-variant` (#e7e2d9). Labels should be `body-sm` and sit 0.5rem above the input, never inside it.

## 6. Do's and Don'ts

### Do
*   **Use Asymmetry:** Place the pet’s photo slightly off-center or overlapping the edge of a container to break the "boxed-in" feel.
*   **Embrace White Space:** Use `Spacing 8` (2.75rem) between major sections. Let the "creamy" palette breathe.
*   **Iconography:** Use "monoline" icons with rounded terminals. The stroke weight should match the weight of your `body-md` text for visual harmony.

### Don't
*   **Don't use 100% Black:** Never use #000000. Use `on_surface` (#34322c) for text to keep the "warmth."
*   **Don't use "Sharp" Corners:** The `none` roundedness scale is strictly forbidden. Even the smallest elements should use at least `sm` (0.5rem).
*   **Don't use standard Dividers:** If you feel the need to separate two list items, increase the vertical padding (using `Spacing 3`) instead of drawing a line.```