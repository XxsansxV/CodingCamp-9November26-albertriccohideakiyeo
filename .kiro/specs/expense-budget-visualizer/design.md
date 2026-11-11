# Design Document: Expense & Budget Visualizer

## Overview

The Expense & Budget Visualizer is a mobile-friendly web application that helps users track daily spending with transaction management, visual charts, and budget alerts. The application runs entirely in the browser using Local Storage for data persistence.

### Purpose

Enable users to record expenses, view spending summaries, visualize distribution via pie chart, set budget limits per category, and analyze monthly spending patterns—all with offline-first functionality.

### Scope

- Single-page web application (HTML/CSS/Vanilla JS)
- Browser-based data storage via Local Storage API
- Chart.js for pie chart visualization
- Mobile-responsive design (320px+ viewport support)

---

## Architecture

### System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Interface Layer                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  Header      │  │  Balance     │  │  Theme Toggle        │  │
│  │  Component   │  │  Display     │  │  Component           │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  Transaction │  │  Transaction │  │  Pie Chart           │  │
│  │  Form        │  │  List        │  │  Component           │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  Sort        │  │  Monthly     │  │  Settings            │  │
│  │  Dropdown    │  │  Summary     │  │  Panel               │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      State Management Layer                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    State Manager                          │   │
│  │  - transactions[]  - categories[]                         │   │
│  │  - spendingLimits{} - theme                               │   │
│  │  - sortMethod      - notify()                             │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Data Access Layer                         │
│  ┌────────────────────┐  ┌───────────────────────────────────┐  │
│  │  LocalStorage      │  │  Data Validation                  │  │
│  │  Adapter           │  │  Service                          │  │
│  └────────────────────┘  └───────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Architecture Layers

1. **UI Layer**: DOM manipulation, event handling, Chart.js rendering
2. **State Layer**: Centralized state with observer pattern for reactivity
3. **Data Layer**: Local Storage operations, data validation

### Key Design Decisions

- **Single HTML file** with embedded or linked CSS/JS for simplicity
- **Observer pattern** for state changes → UI updates
- **Single source of truth** in state object, UI always reflects state
- **Validation at form layer** before state updates

---

## Components and Interfaces

### Component Breakdown

| Component | Responsibility | Public API |
|-----------|---------------|------------|
| `TransactionForm` | Input validation, submission | `submitTransaction(data)`, `validateForm()` |
| `TransactionList` | Display, sorting, deletion | `render(transactions)`, `sort(method)`, `deleteTransaction(id)` |
| `BalanceDisplay` | Show total balance | `update(amount)` |
| `PieChart` | Render Chart.js visualization | `update(data)`, `destroy()` |
| `MonthlySummary` | Calculate/show monthly stats | `render(transactions)` |
| `SettingsPanel` | Manage limits, custom categories | `saveLimits(limits)`, `addCategory(name)`, `removeCategory(id)` |
| `ThemeToggle` | Dark/light mode switching | `toggle()`, `apply(theme)` |
| `SortDropdown` | Sort method selection | `getSortMethod()`, `setSortMethod(method)` |

### Event Flow

```
User Action → Event Handler → State Update → Notify Observers → UI Render
     │                                                        │
     └──────────────── Error Handling ←─────────────────────┘
```

### Key Functions and Signatures

```javascript
// State Management
const createState = (initialData) => ({
  transactions: [],
  categories: ['Food', 'Transport', 'Fun'],
  customCategories: [],
  spendingLimits: {},
  theme: 'light',
  sortMethod: 'newest',
  subscribe(callback) { /* observer pattern */ },
  notify() { /* notify all observers */ }
});

// Transaction Operations
addTransaction(itemName, amount, category) → Transaction | Error
deleteTransaction(id) → boolean
updateBalance() → number

// Data Operations
saveToStorage(key, data) → boolean
loadFromStorage(key) → data | null
validateAmount(value) → boolean
validateItemName(value) → boolean

// Formatting
formatCurrency(amount) → string  // e.g., "Rp15.000"
formatTimestamp(date) → string   // ISO 8601

// Chart Operations
calculateCategoryTotals(transactions) → { category: amount }
updatePieChart(categoryTotals) → void
```

---

## Data Models

### Transaction Object

```javascript
{
  id: string,           // UUID, e.g., "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
  itemName: string,     // 1-100 characters
  amount: number,       // 0.01 - 9,999,999,999.99
  category: string,     // From default or custom categories
  timestamp: string     // ISO 8601: "2024-01-15T14:30:00"
}
```

### Category Object (Custom)

```javascript
{
  id: string,           // UUID
  name: string,         // 1-50 characters
  isDefault: boolean    // false for custom categories
}
```

### Spending Limit Object

```javascript
{
  category: string,     // Category name
  limit: number,        // 0.01 - 999,999,999.99
  isExceeded: boolean   // Calculated: currentSpending >= limit
}
```

### Settings Object

```javascript
{
  theme: 'light' | 'dark',
  sortMethod: 'newest' | 'oldest' | 'highest' | 'lowest' | 'category-asc' | 'category-desc',
  customCategories: Category[],
  spendingLimits: { [category]: number }
}
```

### Local Storage Schema

| Key | Type | Description |
|-----|------|-------------|
| `expense_transactions` | Transaction[] | All transactions |
| `expense_categories` | Category[] | Custom categories |
| `expense_limits` | {[category]: number} | Spending limits |
| `expense_settings` | Settings | Theme, sort preference |

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Based on the prework analysis, this feature is suitable for property-based testing because:
- Core logic functions are pure (formatting, calculations, validation)
- Input space is large (various amounts, names, categories)
- Universal properties can be defined for state transformations

### Property 1: Transaction addition increases list length

*For any* valid transaction (non-empty item name, valid amount 0.01-9999999999999.99, valid category) added to an existing transaction list, the resulting list length SHALL equal the original length plus one.

**Validates: Requirements 1.3, 1.5**

### Property 2: Whitespace-only item names are rejected

*For any* string that contains only whitespace characters (spaces, tabs, newlines), adding a transaction with that item name SHALL be rejected, and the transaction list SHALL remain unchanged.

**Validates: Requirements 1.4, 1.7**

### Property 3: Amount validation enforces boundaries

*For any* numeric value outside the range [0.01, 9999999999999.99], the amount validation SHALL reject it. Values within this range SHALL be accepted.

**Validates: Requirements 1.5**

### Property 4: Total balance equals sum of all transaction amounts

*For any* transaction list, computing the total balance SHALL produce a value equal to the sum of all transaction amounts in that list.

**Validates: Requirements 4.2**

### Property 5: Currency formatting uses Indonesian Rupiah format

*For any* positive number, formatting with the currency function SHALL produce a string starting with "Rp", using period (.) as thousand separator, with zero decimal places.

**Validates: Requirements 10.1, 10.2**

### Property 6: Transaction deletion removes exact item

*For any* transaction list containing a transaction with a specific ID, when that transaction is deleted, the resulting list SHALL NOT contain any transaction with that ID.

**Validates: Requirements 3.2**

### Property 7: Deleted transactions persist after reload

*For any* transaction that has been deleted from the state, after reloading the page and restoring from Local Storage, the deleted transaction SHALL NOT reappear.

**Validates: Requirements 3.5**

### Property 8: Category totals sum to total balance

*For any* transaction list, the sum of all category totals in the pie chart data SHALL equal the total balance.

**Validates: Requirements 5.3**

### Property 9: Sorting produces correct order

*For any* transaction list with at least 2 transactions:
- When sorted by "newest", each transaction timestamp SHALL be >= the next
- When sorted by "oldest", each transaction timestamp SHALL be <= the next
- When sorted by "highest", each amount SHALL be >= the next
- When sorted by "lowest", each amount SHALL be <= the next

**Validates: Requirements 6.3**

### Property 10: Spending limit detection

*For any* category with a defined spending limit, when the total spending in that category reaches or exceeds the limit, the system SHALL mark that category as exceeded.

**Validates: Requirements 7.4**

### Property 11: Monthly summary calculations

*For any* set of transactions, the monthly summary total for a specific month SHALL equal the sum of all transactions with timestamps in that month.

**Validates: Requirements 8.1**

### Property 12: Daily average calculation

*For any* month with transactions, the daily average SHALL equal total monthly spending divided by the number of days in that month (28, 29, 30, or 31).

**Validates: Requirements 8.6**

### Property 13: Theme persistence round-trip

*For any* theme setting (light or dark), after saving to Local Storage and reloading the page, the restored theme SHALL match the original setting.

**Validates: Requirements 13.2, 13.3**

### Property 14: Custom category persistence round-trip

*For any* custom category added to the system, after saving to Local Storage and reloading the page, the restored categories SHALL include the added category.

**Validates: Requirements 9.3, 9.4**

---

## Error Handling

### Error Categories

| Category | Examples | Handling |
|----------|----------|----------|
| Validation Errors | Empty fields, invalid amounts, name too long | Show inline error message, prevent submission |
| Storage Errors | LocalStorage full, unavailable, read failure | Show toast notification, use in-memory fallback |
| Limit Exceeded | Custom category limit (10), transaction limit (1000) | Show error message with specific limit info |
| Chart Errors | Chart.js load failure, canvas not found | Show fallback message, log error |

### Error Display Patterns

```javascript
// Form validation errors
showFieldError(fieldId, message) → void
clearFieldError(fieldId) → void

// Toast notifications
showToast(message, type: 'error' | 'success' | 'warning') → void

// Empty states
showEmptyState(containerId, message) → void
```

### Graceful Degradation

- If Local Storage is unavailable: operate in memory-only mode, show warning
- If Chart.js fails to load: display category totals as text list
- If custom categories cannot load: fall back to default categories only

---

## Testing Strategy

### Testing Approach

This application uses a **dual testing strategy**:

1. **Unit Tests**: Specific examples, edge cases, DOM interaction
2. **Property Tests**: Universal properties across all valid inputs

### Property-Based Testing

PBT is appropriate for this feature because:
- Core functions (validation, formatting, calculations) are pure
- Input space is large (amounts, names, categories)
- State transformations can be tested without DOM

**Library Selection**: Use a JavaScript PBT library such as:
- **fast-check** (recommended) - Works with any test runner
- **jsverify** - Integration with Jest/Mocha

**Configuration**:
- Minimum 100 iterations per property
- Seed control for reproducibility
- Tag format: `Feature: expense-budget-visualizer, Property N: <description>`

### Property Test Implementation

```javascript
// Example: Property 4 - Total balance equals sum
import { fc } from 'fast-check';

test('Property 4: total balance equals sum of all amounts', () => {
  fc.assert(
    fc.property(
      fc.array(
        fc.record({
          id: fc.uuid(),
          itemName: fc.stringOf(fc.char(), { minLength: 1, maxLength: 50 }),
          amount: fc.float({ min: 0.01, max: 9999999999999.99 }),
          category: fc.oneof(fc.constant('Food'), fc.constant('Transport'), fc.constant('Fun')),
          timestamp: fc.date()
        })
      ),
      (transactions) => {
        const totalBalance = calculateTotalBalance(transactions);
        const sum = transactions.reduce((acc, t) => acc + t.amount, 0);
        expect(totalBalance).toBe(sum);
      }
    ),
    { numRuns: 100 }
  );
});
```

### Unit Testing

Focus on:
- Specific validation edge cases
- DOM event handling
- Chart initialization
- Responsive behavior at breakpoints

**Test Framework**: Jest or Vitest

**Example Unit Tests**:
```javascript
// Validation edge cases
test('Amount rejects 0', () => expect(validateAmount(0)).toBe(false));
test('Amount accepts 0.01', () => expect(validateAmount(0.01)).toBe(true));
test('Item name rejects 101 chars', () => expect(validateItemName('a'.repeat(101))).toBe(false));
test('Item name accepts 100 chars', () => expect(validateItemName('a'.repeat(100))).toBe(true));

// Empty state
test('Empty transaction list shows message', () => {
  renderTransactionList([]);
  expect(document.querySelector('.empty-state')).toBeTruthy();
});

// Currency formatting
test('formats 15000 as Rp15.000', () => expect(formatCurrency(15000)).toBe('Rp15.000'));
test('formats 1500000 as Rp1.500.000', () => expect(formatCurrency(1500000)).toBe('Rp1.500.000'));
```

### Test File Structure

```
tests/
├── unit/
│   ├── validation.test.js
│   ├── formatting.test.js
│   ├── calculation.test.js
│   └── state.test.js
├── integration/
│   ├── localStorage.test.js
│   ├── formSubmission.test.js
│   └── fullFlow.test.js
└── properties/
    ├── transactionProperties.test.js
    ├── balanceProperties.test.js
    └── chartProperties.test.js
```

### Running Tests

```bash
# Unit tests
npm test -- --testPathPattern=unit

# Property tests
npm test -- --testPathPattern=properties

# All tests
npm test
```

---

## File Structure

```
expense-budget-visualizer/
├── index.html              # Main HTML file
├── css/
│   └── style.css          # All styles (single file)
├── js/
│   └── app.js             # All JavaScript (single file)
└── README.md              # Setup instructions
```

### HTML Structure

```html
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Expense & Budget Visualizer</title>
    <link rel="stylesheet" href="css/style.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js" defer></script>
    <script src="js/app.js" defer></script>
</head>
<body>
    <header>
        <h1>Expense & Budget Visualizer</h1>
        <button id="theme-toggle" aria-label="Toggle theme">🌙</button>
    </header>
    
    <main>
        <section id="balance-section">
            <h2>Total Balance</h2>
            <div id="balance-display">Rp0</div>
        </section>
        
        <section id="form-section">
            <form id="transaction-form">
                <!-- Item Name, Amount, Category fields -->
                <button type="submit">Add Transaction</button>
            </form>
            <div id="form-error" class="error-message"></div>
        </section>
        
        <section id="chart-section">
            <h2>Spending by Category</h2>
            <canvas id="pie-chart"></canvas>
            <p id="chart-empty" class="hidden">No data available</p>
        </section>
        
        <section id="sort-section">
            <label for="sort-select">Sort by:</label>
            <select id="sort-select">
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Amount</option>
                <option value="lowest">Lowest Amount</option>
                <option value="category-asc">By Category (A-Z)</option>
                <option value="category-desc">By Category (Z-A)</option>
            </select>
        </section>
        
        <section id="list-section">
            <h2>Transactions</h2>
            <div id="transaction-list" class="scrollable"></div>
            <p id="list-empty" class="empty-state hidden">No transactions yet</p>
        </section>
        
        <section id="summary-section">
            <h2>Monthly Summary</h2>
            <div id="monthly-summary"></div>
        </section>
        
        <section id="settings-section">
            <h2>Settings</h2>
            <div id="category-settings"></div>
            <div id="limit-settings"></div>
        </section>
    </main>
</body>
</html>
```

### CSS Organization

- **Variables**: CSS custom properties for colors, spacing, typography
- **Base**: Reset, typography, utility classes
- **Layout**: Grid/flexbox layouts, responsive breakpoints
- **Components**: Component-specific styles
- **Theme**: Dark/light mode via CSS variables

**Responsive Breakpoints**:
- Mobile: < 768px (vertical layouts, stacked sections)
- Tablet: 768px - 1024px (2-column where appropriate)
- Desktop: > 1024px (full layout)

### JavaScript Organization (Single File)

```javascript
// ===== Constants =====
const DEFAULT_CATEGORIES = ['Food', 'Transport', 'Fun'];
const MAX_TRANSACTIONS = 1000;
const MAX_CUSTOM_CATEGORIES = 10;

// ===== State =====
const state = {
    transactions: [],
    customCategories: [],
    spendingLimits: {},
    theme: 'light',
    sortMethod: 'newest'
};

// ===== Utility Functions =====
function generateId() { /* UUID */ }
function validateAmount(value) { /* Range 0.01-9999999999999.99 */ }
function validateItemName(value) { /* 1-100 chars, non-whitespace */ }
function formatCurrency(amount) { /* Rp format */ }
function formatTimestamp(date) { /* ISO 8601 */ }

// ===== Data Layer =====
function saveToStorage(key, data) { /* LocalStorage */ }
function loadFromStorage(key) { /* LocalStorage */ }

// ===== State Management =====
function addTransaction(itemName, amount, category) { /* Validation + state */ }
function deleteTransaction(id) { /* Remove + persist */ }
function updateBalance() { /* Calculate sum */ }
function setSortMethod(method) { /* Sort transactions */ }

// ===== UI Rendering =====
function renderBalance() { /* Update balance display */ }
function renderTransactionList() { /* Render list with sorting */ }
function renderPieChart() { /* Chart.js update */ }
function renderMonthlySummary() { /* Summary calculations */ }
function renderSettings() { /* Limits + custom categories */ }

// ===== Event Handlers =====
function handleFormSubmit(event) { /* Form validation + add */ }
function handleDeleteClick(id) { /* Delete transaction */ }
function handleSortChange(event) { /* Apply sorting */ }
function handleThemeToggle() { /* Switch theme */ }

// ===== Initialization =====
function init() { /* Load from storage, render initial UI */ }

// ===== Bootstrap =====
document.addEventListener('DOMContentLoaded', init);
```

---

## Acceptance Criteria Mapping

| Requirement | Design Element | Test Strategy |
|-------------|----------------|---------------|
| 1.1-1.8 | TransactionForm component | Unit: validation; Property: addition |
| 2.1-2.4 | TransactionList component | Unit: empty state; Property: pagination |
| 3.1-3.5 | deleteTransaction function | Property: deletion, persistence |
| 4.1-4.4 | BalanceDisplay component | Property: calculation |
| 5.1-5.5 | PieChart component | Property: category totals |
| 6.1-6.6 | SortDropdown, sorting | Property: sort order |
| 7.1-7.5 | SettingsPanel | Property: limit detection |
| 8.1-8.6 | MonthlySummary | Property: monthly calculations |
| 9.1-9.8 | Custom categories | Property: persistence |
| 10.1-10.3 | formatCurrency | Property: formatting |
| 11.1-11.5 | LocalStorage adapter | Integration: persistence |
| 12.1-12.4 | CSS responsive | Unit: viewport testing |
| 13.1-13.4 | ThemeToggle | Property: theme persistence |

---

## Implementation Notes

1. **Chart.js Integration**: Load from CDN, initialize on DOMContentLoaded, destroy on page unload
2. **Local Storage**: Always wrap in try-catch, provide fallback for unavailable storage
3. **Validation**: Validate on both client (form) and state layer for defense in depth
4. **Performance**: Use requestAnimationFrame for UI updates, debounce chart rendering
5. **Accessibility**: Use semantic HTML, ARIA labels, keyboard navigation support