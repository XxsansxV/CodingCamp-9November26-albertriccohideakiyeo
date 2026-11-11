# Requirements Document

## Introduction

This document specifies the requirements for an Expense & Budget Visualizer web application. The application helps users track daily spending with a mobile-friendly interface, displaying total balance, transaction history, and a visual pie chart of spending by category. Data persists locally using browser Local Storage.

## Glossary

- **System**: The Expense & Budget Visualizer web application
- **Transaction**: A single expense entry containing an item name, amount, category, and timestamp
- **Category**: A classification label for transactions (Food, Transport, Fun, or custom user-defined)
- **Total Balance**: The sum of all transaction amounts
- **Monthly Spending**: The total amount spent in a specific calendar month
- **Daily Average**: Monthly spending divided by the number of days in that month
- **Limit**: A user-configurable threshold amount per category for spending alerts

## Requirements

### Requirement 1: Transaction Input Form

**User Story:** As a user, I want to input transactions with item name, amount, and category, so that I can track my daily spending.

#### Acceptance Criteria

1. THE Transaction Form SHALL provide fields for Item Name, Amount, and Category
2. THE Category field SHALL include default options: Food, Transport, Fun
3. WHEN the user submits the form with all fields filled, THE System SHALL add the transaction to the list
4. WHEN the user submits the form with any field empty, THE System SHALL display a validation error
5. THE Amount field SHALL accept only positive numbers between 0.01 and 9,999,999,999.99
6. THE System SHALL automatically assign a timestamp to each transaction at creation in ISO 8601 format (YYYY-MM-DDTHH:MM:SS)
7. THE Item Name SHALL have a maximum character limit of 100 characters
8. THE System SHALL support a maximum of 1,000 transactions in the list

### Requirement 2: Transaction List Display

**User Story:** As a user, I want to view my transaction history in a scrollable list, so that I can review my spending.

#### Acceptance Criteria

1. WHEN user navigates to transaction list view, THE Transaction List SHALL display up to 100 most recent transactions in a scrollable container
2. EACH transaction entry SHALL show the item name (max 50 characters), amount (in Rp format with thousand separators, 0 decimal places), and category
3. IF device viewport width is less than 768px, THEN THE Transaction List SHALL be vertically scrollable
4. IF no transactions exist in the system, THEN THE System SHALL display an empty state message

### Requirement 3: Transaction Deletion

**User Story:** As a user, I want to delete transactions, so that I can correct mistakes or remove unwanted entries.

#### Acceptance Criteria

1. EACH transaction entry SHALL have a delete button
2. WHEN the user clicks the delete button, THE System SHALL remove the transaction from the list
3. WHEN a transaction is deleted, THE System SHALL update the Total Balance and Chart within 2 seconds
4. IF deletion fails due to a system error, THEN THE System SHALL display an error message indicating the operation could not be completed
5. IF deletion succeeds, THEN THE System SHALL persist the removal such that the deleted transaction does not reappear after page refresh

### Requirement 4: Total Balance Display

**User Story:** As a user, I want to see my total spending at a glance, so that I know how much I have spent.

#### Acceptance Criteria

1. THE System SHALL display the Total Balance at the top of the application
2. THE Total Balance SHALL display the sum of all expense transaction amounts
3. WHEN transactions are added or deleted, THE Total Balance SHALL update within 2 seconds
4. THE Total Balance SHALL display amounts in Indonesian Rupiah (Rp) format with thousand separators (e.g., Rp15.000)

### Requirement 5: Pie Chart Visualization

**User Story:** As a user, I want to see a visual chart of my spending by category, so that I can understand my spending distribution.

#### Acceptance Criteria

1. THE System SHALL display a pie chart showing spending distribution by category
2. WHEN transactions are added, deleted, or modified, THE System SHALL update the pie chart within 1 second
3. THE Pie Chart SHALL show the percentage proportion of spending for each category
4. THE System SHALL use Chart.js library for rendering the pie chart
5. WHEN no transactions exist, THE Pie Chart SHALL display a message indicating no data available

### Requirement 6: Transaction Sorting

**User Story:** As a user, I want to sort my transactions by various criteria, so that I can organize my spending history.

#### Acceptance Criteria

1. THE System SHALL provide a dropdown for selecting sort methods
2. THE Sort Options SHALL include: Newest First, Oldest First, Highest Amount, Lowest Amount, By Category (A-Z), By Category (Z-A)
3. WHEN the user selects a sort option, THE System SHALL reorder the Transaction List accordingly
4. WHEN the user selects a sort option, THE System SHALL apply sorting within 300ms
5. IF the Transaction List is null or undefined, THEN THE System SHALL handle the error gracefully without crashing
6. IF the Transaction List is empty, THEN THE System SHALL display an empty state message

### Requirement 7: Spending Limit Alerts

**User Story:** As a user, I want to set spending limits per category and receive alerts, so that I can control my spending.

#### Acceptance Criteria

1. THE System SHALL allow users to set a spending limit for each category
2. THE User SHALL be able to configure the limit amount through a settings interface
3. THE spending limit input SHALL validate that the amount is between 0.01 and 999,999,999.99
4. WHEN the total spending in a category reaches or exceeds its limit, THE System SHALL highlight that category or transaction
5. THE Highlight SHALL use a visual indicator (e.g., different background color, warning icon)

### Requirement 8: Monthly Summary View

**User Story:** As a user, I want to see a monthly summary of my spending, so that I can analyze my financial habits.

#### Acceptance Criteria

1. THE Monthly Summary SHALL display total spending for the current month
2. THE Monthly Summary SHALL show a category breakdown for the current month
3. WHEN there is previous month data, THE Monthly Summary SHALL show comparison to the previous month (difference in amount and percentage)
4. WHEN there is NO previous month data, THE Monthly Summary SHALL display "No previous month data"
5. IF no transactions exist in current month, THEN THE Monthly Summary SHALL display Rp0 for total spending
6. THE Monthly Summary SHALL display the average daily spending for the current month calculated as: Total Monthly Spending / Number of Days in Month (28, 29, 30, or 31 based on calendar)

### Requirement 9: Custom Categories

**User Story:** As a user, I want to add custom categories, so that I can categorize my spending more precisely.

#### Acceptance Criteria

1. THE System SHALL allow users to add custom category names with 1-50 characters (whitespace trimmed)
2. THE Custom Categories SHALL appear in the Category dropdown alongside default categories
3. THE Custom Categories SHALL be saved in Local Storage
4. THE Custom Categories SHALL be available after page reload
5. THE System SHALL support a maximum of 10 custom categories
6. IF the maximum custom category limit is exceeded, THEN THE System SHALL display an error message
7. IF Local Storage save fails, THEN THE System SHALL display an error message
8. IF Local Storage retrieval fails, THEN THE System SHALL display an error message

### Requirement 10: Currency Formatting

**User Story:** As a user, I want amounts displayed in Indonesian Rupiah format, so that the values are clear and properly formatted.

#### Acceptance Criteria

1. THE System SHALL display all amounts in Indonesian Rupiah (Rp) format
2. THE System SHALL use thousand separators (period/dot) for formatting (e.g., Rp15.000, Rp1.500.000)
3. ALL amount displays throughout the application SHALL use consistent formatting

### Requirement 11: Data Persistence

**User Story:** As a user, I want my data to persist after closing the browser, so that I can continue tracking over time.

#### Acceptance Criteria

1. THE System SHALL store all transactions in browser Local Storage
2. THE System SHALL store custom categories in Local Storage
3. THE System SHALL store spending limits per category in Local Storage
4. WHEN the page is reloaded, THE System SHALL restore all saved data
5. THE System SHALL handle Local Storage unavailability gracefully

### Requirement 12: Responsive Design

**User Story:** As a mobile user, I want the application to work well on my phone, so that I can track expenses on the go.

#### Acceptance Criteria

1. THE Application SHALL be fully functional on mobile devices with viewport widths of 320px and above
2. THE Application SHALL use responsive CSS to adapt to different screen sizes
3. THE Transaction List SHALL be scrollable on mobile without causing horizontal overflow
4. THE Pie Chart SHALL resize appropriately on smaller screens

### Requirement 13: Dark/Light Mode Toggle

**User Story:** As a user, I want to toggle between dark and light themes, so that I can use the app comfortably in different lighting conditions.

#### Acceptance Criteria

1. THE System SHALL provide a toggle button for switching between dark and light modes
2. THE Theme preference SHALL be saved in Local Storage
3. WHEN the page is reloaded, THE System SHALL restore the previously selected theme
4. THE Dark Mode SHALL provide adequate contrast for readability
