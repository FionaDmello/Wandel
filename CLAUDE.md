# Wandel — Claude Instructions

Inherits all rules from the global CLAUDE.md.

## Problem-solving pattern

Before any implementation, always work through these layers in order. Never skip ahead. No code until thinking is fully done.

1. **Spec study** — read every relevant file, doc, or zip before any discussion
2. **Architecture** — full breakdown of moving parts, data flow, and component structure
3. **Critical review** — explicitly identify weak points, bottlenecks, and simplifications before locking the design
4. **Decisions** — resolve all UX, data model, and schema questions one at a time
5. **Clean restatement** — after revisions, produce one stable final architecture document
6. **Save to memory** — lock the architecture into memory before any implementation begins
7. **Brainstorm** — design each session's deliverables section by section with approval gates
8. **Written plan** — convert the approved design into a step-by-step implementation plan
9. **Execute** — implement against the plan with all decisions already made

## Branching

- Each GitHub issue gets its own branch, named `<type>/<issue-number>-<short-slug>` (e.g. `fix/11-variation-name`).
- Open a PR back to `main` per issue rather than merging directly.

## Commit and push workflow

- After each step within a phase is completed, automatically stage the relevant files, create a conventional commit, and push to the issue's branch (`origin <branch>`).
- Before every push: run the build and the full test suite. If either fails, stop, fix the issue, and re-run before pushing. Never push broken code.
- Always show the staged files and commit message before committing so the user can confirm.

## Package manager

- Use Bun exclusively. Never use `npm`, `npx`, `yarn`, or `pnpm`.
- Install: `bun install` · Run scripts: `bun run <script>` · Execute binaries: `bunx <binary>`

## Stack conventions

- Routing: TanStack Router only. No `react-router-dom`.
- Server state: TanStack Query for all Supabase data fetching and mutations.
- Forms: TanStack Form + Zod (`@tanstack/react-form`, `@tanstack/zod-form-adapter`). No uncontrolled inputs.
- Styling: Tailwind CSS utility classes only. No inline styles, no CSS-in-JS.
- Icons: Lucide React only.

## File structure

- One function per file, two at most. One export per file.
- Icon components live in their own files under `src/components/icons/`.
- All app-wide constants live in `src/constants/` as separate files (e.g. `tabs.ts`, `emotions.ts`, `markLabels.ts`).
- Complex reusable CSS values (shadows, gradients) go in `@utility` blocks in `src/index.css`, not in component files.

## Design system

- All colours must reference design tokens (`--canvas`, `--plum`, `--amber`, `--violet`, `--card`, `--border`, `--soft`, `--muted`, `--teal`). No raw hex values in components.
- Typography: Cormorant for emotional/heading text, DM Sans for all UI text.
- Match the design prototype exactly — no improvised layouts or spacing.

## TypeScript

- No `any`. Every Supabase response must be typed against the types in `src/types/database.ts`.
- All component props must have explicit interfaces.

## Testing

- Unit test all hooks in `src/hooks/`.
- Test all Zod schemas and form validation logic.
- Test any date/rotation logic (e.g. reminder rotation in Morning screen).
