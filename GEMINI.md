# CQIS - Catering Quotations & Invoicing System

## Project Overview
CQIS is a modern web application for catering businesses to manage quotations, invoices, customers, and their item catalog. It emphasizes a premium SaaS aesthetic (Linear, Stripe, Vercel) and is built for scalability and maintainability.

## Architecture Decisions
- **Framework:** Vue 3 (Composition API with `<script setup>`)
- **Build Tool:** Vite
- **Styling:** Tailwind CSS + shadcn-vue (Radix UI)
- **State Management:** Pinia (Composition API stores)
- **Routing:** Vue Router (nested routes with layout system)
- **Backend:** Supabase (Auth, Database, Storage)
- **Icons:** Lucide Vue Next
- **Document Generation:** Snapshot-based. Branding (logo, colors, contact info) is snapshotted into each quotation/invoice at creation time to preserve historical accuracy.
- **Invoice Pipeline:** Invoices are strictly derived from approved quotations via a snapshot-copy mechanism. This ensures 100% data integrity between what was quoted and what was billed.
- **PDF Engine:** Component-based rendering using CSS Print media. Avoids heavy JS-only PDF libraries for better performance and maintainability.

## Folder Structure Rules
- `src/assets/`: Global styles and static assets.
- `src/components/ui/`: Base UI components (shadcn-vue).
- `src/components/layout/`: Structural components like Sidebar and Topbar.
- `src/components/forms/`: Complex, reusable form logic.
- `src/templates/documents/`: Stateless document layout components for PDF/Print.
- `src/layouts/`: Page wrappers (AppLayout, AuthLayout).
- `src/pages/`: Route-level components.
- `src/stores/`: Pinia stores (one file per store).
- `src/services/`: API and third-party integrations (Supabase).
- `src/types/`: TypeScript interfaces and types.

## Coding Standards
- **Naming Conventions:**
  - Components: PascalCase (e.g., `QuotationBuilder.vue`)
  - Files/Folders: kebab-case (except for components)
  - Variables/Functions: camelCase
  - Types/Interfaces: PascalCase
- **Component Standards:**
  - Use `script setup` and TypeScript.
  - Keep components small and focused.
  - Prioritize composition over complex props/inheritance.
- **Tailwind Conventions:**
  - Use theme tokens (`text-primary`, `bg-background`) instead of hardcoded hex values.
  - Use `clsx` and `tailwind-merge` for dynamic classes.

## UI Component Export Rule
- **Explicit Reality:** Only export components that physically exist in the file system.
- **No Assumptions:** Never assume shadcn-vue structure unless explicitly installed via CLI.
- **Manual Verification:** Every `index.ts` must be manually verified.
- **No Phantom Exports:** Phantom exports (exporting things that don't exist) are strictly forbidden.
- **Checklist before adding UI components:**
  1. Does the .vue file exist?
  2. Does index.ts export it?
  3. Are all imports aligned with actual files?
  4. Has the project ever used this component before?

## UI Component Import Convention
The project uses **Barrel Exports** for all UI components located in `src/components/ui`. This ensures consistency and cleaner import statements.

### Correct Usage
Always use named imports from the component folder:
```typescript
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
```

### Incorrect Usage
Never import directly from the `.vue` file for UI components:
```typescript
// INCORRECT
import Button from '@/components/ui/button/Button.vue'
import { Input } from '@/components/ui/input/Input.vue'
```

### Import Convention Checklist
Before adding or generating imports:
1. **Verify Location:** Ensure the component is in `src/components/ui`.
2. **Check Structure:** Confirm the component has a dedicated folder.
3. **Verify index.ts:** Ensure an `index.ts` exists in the component folder and exports the component.
4. **Use Named Imports:** Use the `{ ComponentName }` syntax.
5. **No .vue Extension:** Do not include `.vue` in the import path for UI components.

Failure to follow this convention will lead to build errors and is considered an implementation error.

## UI/UX Guidelines
- **Typography:** Use Inter. Titles should be bold and well-spaced.
- **Spacing:** Follow a strict 4px/8px grid (Tailwind defaults).
- **Colors:** 
  - Primary: `#0F766E` (Teal)
  - Secondary: `#0EA5E9` (Sky)
  - Accent: `#F59E0B` (Amber)
- **Interactions:** Subtle hover states, soft shadows, and rounded corners (0.5rem/8px default).

## State Management (Pinia)
- Stores must use the Composition API syntax.
- Store logic should be focused on data fetching and state manipulation.
- Computed properties in stores should be used for derived state (e.g., quotation totals).

## Responsiveness Requirements
- Mobile-first approach.
- Sidebar collapses on tablet/mobile into a hamburger menu or bottom bar.
- Tables should be horizontally scrollable or transform into cards on small screens.
