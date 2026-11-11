// =-=-=-=-=-=-= [ 1 | CONSTANTS ] =-=-=-=-=-=-=-=

const DEFAULT_CATEGORIES = ['Food', 'Transport', 'Fun'];
const MAX_TRANSACTIONS = 1000;
const MAX_CUSTOM_CATEGORIES = 10;
const MAX_ITEM_NAME = 100;
const LIST_LIMIT = 100;
const MIN_AMOUNT = 0.01;
const MAX_AMOUNT = 9999999999.99;
const MIN_LIMIT = 0.01;
const MAX_LIMIT = 9999999999.99;

const STORAGE_KEYS = {
  transactions: 'expense_transactions',
  categories: 'expense_categories',
  limits: 'expense_limits',
  settings: 'expense_settings',
};


// =-=-=-=-=-=-= [ 2 | STATE ] =-=-=-=-=-=-=-=

const state = {
  transactions: [],
  customCategories: [],
  spendingLimits: {},
  theme: 'light',
  sortMethod: 'newest',
};
