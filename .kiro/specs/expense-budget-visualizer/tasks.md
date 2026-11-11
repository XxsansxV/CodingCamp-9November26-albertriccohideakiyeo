# Implementation Plan: Expense & Budget Visualizer

## Overview

This implementation plan transforms the feature design into a series of prompts for a code-generation LLM that will implement each step with incremental progress. Each prompt builds on the previous prompts, and ends with wiring things together. There should be no hanging or orphaned code that isn't integrated into a previous step. Focus ONLY on tasks that involve writing, modifying, or testing code.

## Technology Stack
- **HTML**: Semantic structure for single-page application
- **CSS**: Single file in css/ folder with responsive design and theme support
- **JavaScript**: Single file in js/ folder using Vanilla JS (no frameworks)
- **Storage**: Browser Local Storage API
- **Visualization**: Chart.js (CDN)

## Tasks

- [ ] 1. Project Setup and Folder Structure
  - Create directory structure: expense-budget-visualizer/, css/, js/
  - Create index.html with semantic HTML structure matching design
  - Link Chart.js from CDN and link css/style.css and js/app.js
  - Set up meta tags for mobile viewport
  - _Requirements: 12.1, 12.2_

- [ ] 2. Create CSS Foundation and Theme Variables
  - Create css/style.css with CSS custom properties for colors
  - Define light/dark theme color variables
  - Add base reset and typography styles
  - Add utility classes (hidden, error-message)
  - _Requirements: 13.1, 13.4, 12.2_

- [ ] 3. JavaScript Constants and Data Models
  - Create js/app.js with constants (DEFAULT_CATEGORIES, MAX_TRANSACTIONS, MAX_CUSTOM_CATEGORIES)
  - Define data model structures matching design (Transaction, Category, SpendingLimit, Settings)
  - Initialize state object with default values
  - _Requirements: 1.8, 9.5_

- [ ] 4. Utility Functions - ID Generation and Validation
  - Implement generateId() using crypto.randomUUID() or fallback
  - Implement validateAmount(value) - range 0.01 to 9,999,999,999.99
  - Implement validateItemName(value) - 1-100 chars, non-whitespace
  - _Requirements: 1.5, 1.7_

- [ ] 5. Utility Functions - Formatting
  - Implement formatCurrency(amount) - Indonesian Rupiah with period separators
  - Implement formatTimestamp(date) - ISO 8601 format
  - Add validation for category names (1-50 chars)
  - _Requirements: 10.1, 10.2, 10.3, 9.1_

- [ ]* 5.1 Write unit tests for utility functions
  - Test validateAmount boundary conditions (0, 0.01, 9999999999999.99, 10000000000000)
  - Test validateItemName edge cases (empty, whitespace-only, 100 chars, 101 chars)
  - Test formatCurrency examples (15000 → Rp15.000, 1500000 → Rp1.500.000)
  - _Requirements: 1.5, 1.7, 10.1_

- [ ] 6. Local Storage Data Layer
  - Implement saveToStorage(key, data) with JSON.stringify and error handling
  - Implement loadFromStorage(key) with JSON.parse and null fallback
  - Implement clearStorage(key) for cleanup operations
  - Add graceful degradation for unavailable storage
  - _Requirements: 11.1, 11.2, 11.3, 11.5_

- [ ]* 6.1 Write integration tests for Local Storage
  - Test save and load round-trip for transactions
  - Test save and load round-trip for categories
  - Test save and load round-trip for settings
  - _Requirements: 11.4, 11.5_

- [ ] 7. State Management System
  - Implement createState() with observer pattern
  - Add subscribe(callback) for UI reactivity
  - Add notify() to trigger all observers
  - Implement state initialization from Local Storage with defaults
  - _Requirements: 11.4, 13.2, 13.3_

- [ ] 8. Transaction Operations
  - Implement addTransaction(itemName, amount, category) with validation
  - Implement deleteTransaction(id) with array filter
  - Implement getTransaction(id) for lookups
  - Add MAX_TRANSACTIONS limit check (1000)
  - _Requirements: 1.3, 1.5, 1.6, 1.8, 3.1, 3.2_

- [ ] 9. Balance Calculations
  - Implement updateBalance() - calculate sum of all amounts
  - Implement getBalance() getter
  - Connect balance to state notifications
  - _Requirements: 4.1, 4.2, 4.3_

- [ ]* 9.1 Write property test for balance calculation
  - **Property 4: Total balance equals sum of all transaction amounts**
  - Test with random transaction arrays, verify sum equals balance
  - _Requirements: 4.2_

- [ ]* 9.2 Write property test for transaction addition
  - **Property 1: Transaction addition increases list length**
  - Test that adding valid transaction increases array length by 1
  - _Requirements: 1.3, 1.5_

- [ ]* 9.3 Write property test for transaction validation
  - **Property 2: Whitespace-only item names are rejected**
  - **Property 3: Amount validation enforces boundaries**
  - Test various invalid inputs are rejected correctly
  - _Requirements: 1.4, 1.5, 1.7_

- [ ] 10. Balance Display UI Component
  - Implement renderBalance() - update balance-display element
  - Call formatCurrency() for proper formatting
  - Add to state subscription for auto-updates
  - _Requirements: 4.1, 4.3, 4.4_

- [ ] 11. Transaction Form UI Component
  - Implement renderForm() - create form with Item Name, Amount, Category fields
  - Add Category dropdown with DEFAULT_CATEGORIES + custom categories
  - Implement validateForm() - check all fields, validate amount
  - Implement handleFormSubmit(event) - prevent default, validate, add transaction
  - Display validation errors inline
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.7_

- [ ] 12. Transaction List UI Component
  - Implement renderTransactionList() - iterate transactions, create list items
  - Display item name (truncate to 50 chars), formatted amount, category
  - Add delete button to each transaction
  - Implement handleDeleteClick(id) - call deleteTransaction, re-render
  - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.3_

- [ ] 13. Empty State Handling
  - Add isEmpty check for transaction list
  - Show/hide empty state message (list-empty element)
  - _Requirements: 2.4_

- [ ]* 13.1 Write property test for transaction deletion
  - **Property 6: Transaction deletion removes exact item**
  - **Property 7: Deleted transactions persist after reload**
  - Test deletion removes specific ID, test persistence
  - _Requirements: 3.2, 3.5_

- [ ] 14. Sorting Functionality
  - Implement sortTransactions(transactions, method) - support all 6 options
  - Implement setSortMethod(method) - update state, re-render
  - Add sort dropdown to UI (sort-select element)
  - Handle sort change events (handleSortChange)
  - Apply sorting within 300ms
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [ ]* 14.1 Write property test for sorting
  - **Property 9: Sorting produces correct order**
  - Test all sort methods produce correct order
  - _Requirements: 6.3_

- [ ] 15. Pie Chart Component
  - Implement calculateCategoryTotals(transactions) - aggregate by category
  - Implement renderPieChart() - initialize/update Chart.js
  - Handle empty chart state (show message, hide canvas)
  - Update chart within 1 second of data changes
  - _Requirements: 5.1, 5.2, 5.3, 5.5_

- [ ]* 15.1 Write property test for category totals
  - **Property 8: Category totals sum to total balance**
  - Verify sum of category totals equals total balance
  - _Requirements: 5.3_

- [ ] 16. Spending Limit Alerts Feature
  - Implement getSpendingByCategory() - calculate totals per category
  - Implement checkLimits() - compare spending to limits
  - Add limit input fields in settings panel
  - Implement saveLimits(limits) - persist to Local Storage
  - Add visual highlighting when limit exceeded (CSS class)
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ]* 16.1 Write property test for limit detection
  - **Property 10: Spending limit detection**
  - Test limit exceeded detection works correctly
  - _Requirements: 7.4_

- [ ] 17. Monthly Summary Feature
  - Implement getCurrentMonthTransactions() - filter by current month
  - Implement getPreviousMonthTransactions() - filter by previous month
  - Implement calculateMonthlyTotal(transactions) - sum amounts
  - Implement calculateDailyAverage(total, daysInMonth) - divide by 28-31
  - Render monthly summary with totals, category breakdown, comparison
  - Display "No previous month data" when applicable
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

- [ ]* 17.1 Write property test for monthly calculations
  - **Property 11: Monthly summary calculations**
  - **Property 12: Daily average calculation**
  - Test monthly totals and daily average calculations
  - _Requirements: 8.1, 8.6_

- [ ] 18. Custom Categories Feature
  - Implement addCategory(name) - add to customCategories array
  - Implement removeCategory(id) - remove by ID
  - Update category dropdown to include custom categories
  - Enforce MAX_CUSTOM_CATEGORIES limit (10)
  - Persist custom categories to Local Storage
  - Handle limit exceeded error message
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8_

- [ ]* 18.1 Write property test for custom categories
  - **Property 14: Custom category persistence round-trip**
  - Test category addition and persistence
  - _Requirements: 9.3, 9.4_

- [ ] 19. Theme Toggle Feature
  - Implement toggleTheme() - switch light/dark
  - Apply theme to document.documentElement
  - Save theme preference to Local Storage
  - Load theme on initialization
  - Update toggle button appearance
  - _Requirements: 13.1, 13.2, 13.3_

- [ ]* 19.1 Write property test for theme persistence
  - **Property 13: Theme persistence round-trip**
  - Test theme save and restore
  - _Requirements: 13.2, 13.3_

- [ ] 20. Responsive Design Implementation
  - Add mobile-first CSS media queries
  - Configure breakpoints: mobile (<768px), tablet (768-1024px), desktop (>1024px)
  - Ensure transaction list scrolls vertically on mobile
  - Make pie chart responsive
  - Ensure touch-friendly button sizes (min 44px)
  - _Requirements: 12.1, 12.2, 12.3, 12.4_

- [ ] 21. Settings Panel Integration
  - Render settings panel with category management
  - Render spending limit inputs per category
  - Connect all settings to state and Local Storage
  - _Requirements: 7.1, 7.2, 9.2_

- [ ] 22. Initialization and Bootstrap
  - Implement init() - load from storage, render all components
  - Set up event listeners for all interactive elements
  - Initialize Chart.js on DOMContentLoaded
  - Wire all components together with state subscriptions
  - _Requirements: 11.4, 13.2_

- [ ] 23. Error Handling Integration
  - Add try-catch for all Local Storage operations
  - Display error messages for storage failures
  - Add error display for form validation
  - Handle edge cases (null/undefined lists)
  - _Requirements: 3.4, 6.5, 9.7, 9.8, 11.5_

- [ ] 24. Final Integration and Polish
  - Ensure all components auto-update on state changes
  - Verify all acceptance criteria are met
  - Check all interactions work correctly
  - Verify responsive behavior at all breakpoints

- [ ] 25. Checkpoint - Verify Implementation
  - Ensure all tests pass, ask the user if questions arise.
  - Verify all 13 requirements are implemented

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties defined in design
- Unit tests validate specific examples and edge cases
- Checkpoints ensure incremental validation
- The implementation uses Vanilla JavaScript with observer pattern for reactivity

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1", "2"] },
    { "id": 1, "tasks": ["3", "4", "5"] },
    { "id": 2, "tasks": ["5.1", "6"] },
    { "id": 3, "tasks": ["6.1", "7", "8"] },
    { "id": 4, "tasks": ["9", "9.1", "9.2", "9.3"] },
    { "id": 5, "tasks": ["10", "11", "12"] },
    { "id": 6, "tasks": ["13", "13.1", "14", "14.1"] },
    { "id": 7, "tasks": ["15", "15.1", "16", "16.1"] },
    { "id": 8, "tasks": ["17", "17.1", "18", "18.1"] },
    { "id": 9, "tasks": ["19", "19.1", "20"] },
    { "id": 10, "tasks": ["21", "22", "23"] },
    { "id": 11, "tasks": ["24", "25"] }
  ]
}
```