# DataTable

| | |
|---|---|
| ID | `UI-26` (split: `UI-94` to `UI-98`) |
| Phase | 3 |
| Depends on | UI-22, UI-11, FE-07 (paging shape from the API) |
| File path | `web/src/components/common/data-table.tsx` (on `web/src/components/ui/table.tsx`) |
| Status | 0 of 6 done, 1 partial (uncommitted WIP without sort or pagination), 5 not started |

## Purpose

Lists of records (assessments, payments, users, tickets, affiliate referrals) that read well at 360px. Below `md` each row becomes a stacked card; from `md` up it is a real table. Sorting and paging are driven by the URL and the API, so Server Components can render them without client state.

## API

| Prop | Type | Default | Notes |
|---|---|---|---|
| `caption` | `string` | required | Visually hidden table caption and the list `aria-label` on mobile. |
| `columns` | `DataTableColumn<Row>[]` | required | `{ id, header, cell(row), align?: "start" \| "end", hideOnMobile?: boolean }`. |
| `rows` | `Row[]` | required | Already fetched; empty shows `EmptyState`. |
| `getRowId` | `(row) => string` | required | Stable key (Guid v7 id). |
| `primaryColumn` | `string` | first column | Card title on mobile. |
| `actions` | `(row) => ReactNode` | none | Row actions; rendered in the card footer or last column. |
| `emptyTitle` | `string` | "Nothing to show yet" | |
| `emptyDescription` | `string` | none | |
| `className` | `string` | none | |

Planned:

| Prop | Type | Notes |
|---|---|---|
| `sort` (UI-94) | `{ column: string; direction: "asc" \| "desc" }` plus `sortable: true` on columns | Header buttons are links that update `?sort=`; `aria-sort` on the active header. |
| `pagination` (UI-95) | `{ page: number; pageSize: number; total?: number; nextCursor?: string }` | Renders previous and next links (and page x of y when total is known) from the API paging response. |
| `toolbar` (UI-97) | `ReactNode` | Search and filter slot above the table. |
| `loading` (UI-96) | `boolean` | Skeleton rows and cards. |

## Variants

Read only list; list with row actions; sortable; paginated; with toolbar.

## States

- Populated: cards below `md`, table from `md`.
- Empty: `EmptyState` with page specific copy.
- Loading (UI-96): 5 skeleton rows or cards.
- Error: owned by the page (`PageError`).
- Cells with missing values show a muted "Not set" or "No marks yet", never `0`.

## Accessibility

- Table: `scope="col"` headers, visually hidden caption, numeric columns right aligned with `tabular-nums`.
- Mobile: `ul` of cards with `dl` pairs so each value keeps its label.
- Sorting: header button text plus `aria-sort`; direction icon `aria-hidden`.
- Pagination: `nav aria-label="Pagination"`, links 44px, current page `aria-current="page"`.
- Known issue (UI-98): both layouts are in the DOM at once and hidden with CSS, so `actions` render twice; any ids inside actions must be unique and hidden copies must not be reachable (they are `display:none`, so they are not, but duplicate ids still break `aria-labelledby`).

## Tasks

- [ ] **UI-26** DataTable with mobile card fallback, sort, pagination *(partial: mobile card fallback, caption, columns, actions and empty state in `web/src/components/common/data-table.tsx`, uncommitted WIP; no sort, no pagination)*
- [ ] **UI-94** URL driven sorting: sortable columns, header links updating `?sort=`, `aria-sort`, server applies sort through the generated client
- [ ] **UI-95** Pagination from the API paging shape (SharedKernel paging): previous and next links, page count when total known, preserves other query params
- [ ] **UI-96** Loading variant with skeleton rows and cards for `loading.tsx`
- [ ] **UI-97** Toolbar slot for search and filters, stacking above the list at 360px
- [ ] **UI-98** Render each row's actions once per breakpoint safely (unique ids, or a single layout chosen with a container query) and test 200 rows render under budget at 360px

## Tests

- Vitest `data-table.test.tsx`: empty rows render EmptyState; mobile list has one `li` per row; `hideOnMobile` columns absent from cards; sortable header has `aria-sort`; pagination hides previous on page 1.
- Playwright `gallery/data-table.spec.ts`: no horizontal scroll at 360px with 6 columns; keyboard sort via Enter; snapshots light and dark at 360 and 1440; axe zero violations.

## Verification

1. Gallery table with 50 rows: cards at 360px, table at 1440px, sorting changes the URL and order.
2. Lighthouse on an admin list page keeps JS under the 150 KB per route budget (no client table library).

## Open questions

- Cursor or offset paging for admin lists? Depends on the SharedKernel paging contract (BE skeleton tasks).
- Is client side sorting ever needed (small fixed lists), or always server side?
