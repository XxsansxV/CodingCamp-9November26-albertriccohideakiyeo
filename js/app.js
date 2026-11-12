// =-=-=-=-=-=-= [ 1 | CONSTANTS ] =-=-=-=-=-=-=-=

const DEFAULT_CATEGORIES = ['Food', 'Transport', 'Fun'];
const MAX_TRANSACTIONS = 1000;
const MAX_CUSTOM_CATEGORIES = 10;
const MAX_CATEGORY_NAME = 50;
const MAX_ITEM_NAME = 100;
const LIST_LIMIT = 100;
const MIN_AMOUNT = 0.01;
const MAX_AMOUNT = 9999999999.99;
const MIN_LIMIT = 0.01;
const MAX_LIMIT = 999999999.99;

const STORAGE_KEYS = {
  transactions: 'expense_transactions',
  categories: 'expense_categories',
  limits: 'expense_limits',
  settings: 'expense_settings',
};


// =-=-=-=-=-=-= [ 2 | STATE ] =-=-=-=-=-=-=-=

const observers = []

const state = {
  transactions: [],
  customCategories: [],
  spendingLimits: {},
  theme: 'light',
  sortMethod: 'newest',
};

// =-=-=-=-=-=-= [ 3 | UTILITIES ] =-=-=-=-=-=-=-=

const generateId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'){
    return crypto.randomUUID();
  }

  return String(Date.now()+Math.random());
}

const validateAmount = (value) => {
  value = Number(value);

  if (isFinite(value) && value >= MIN_AMOUNT && value <= MAX_AMOUNT && value !== 0) {
    return true;
  }

  return false;
}

const validateItemName =  (value) => {
  const valueTrimmedLength = value.trim().length;
  
  return valueTrimmedLength >= 1 && valueTrimmedLength <= MAX_ITEM_NAME;
}

const validateCategoryName = (value) => {
  const categoryNameTrimmed = value.trim();
  return categoryNameTrimmed.length >= 1 && categoryNameTrimmed.length <= MAX_CATEGORY_NAME;
}

const validateLimit = (value) => {
  return isFinite(value) && value >= MIN_LIMIT && value <= MAX_LIMIT && value !== 0;
}


const formatCurrency = (amount) => {
  return `Rp${new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(amount)}`;
}

const formatTimestamp = (date) => {
  const zeroPad = (num, places) => String(num).padStart(places, '0');
  
  return `${date.getFullYear()}-${zeroPad(date.getMonth()+1, 2)}-${zeroPad(date.getDate(), 2)}T${zeroPad(date.getHours(), 2)}:${zeroPad(date.getMinutes(), 2)}:${zeroPad(date.getSeconds(), 2)}`;
}

// =-=-=-=-=-=-= [ 4 | STORAGE ] =-=-=-=-=-=-=-=

const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (err) {
    console.error(`failed to save ${key} ${err}`);
    return false;
  }
}

const loadFromStorage = (key, fallback = null) => {
  try {    
    const unprocessed = localStorage.getItem(key);
    if (unprocessed === null) {
      return fallback;
    }
    return JSON.parse(unprocessed);
  } catch (err) {
    return null;
  }
}

const isStorageAvailable = () => {
  try {
    localStorage.setItem('__test__', '1');
    localStorage.removeItem('__test__');
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}

const subscribe = (callback) => {
  observers.push(callback);
}

const notify = () => {
  observers.forEach((callback) => callback(state));
}

const hydrate = () => {
  const transactions = loadFromStorage(STORAGE_KEYS.transactions, []);
  const categories = loadFromStorage(STORAGE_KEYS.categories, []);
  const limits = loadFromStorage(STORAGE_KEYS.limits, {});
  const settings = loadFromStorage(STORAGE_KEYS.settings, {});

  state.transactions = Array.isArray(transactions) ? transactions : [];
  state.categories = Array.isArray(categories) ? categories : [];
  state.spendingLimits =(limits && typeof(limits) === 'object' && !Array.isArray(limits)) ? limits : {};
  if (settings && typeof(settings) === 'object') {
    if (settings.theme === 'light' || settings.theme === 'dark') {
      state.theme = settings.theme;
    }
    if (typeof(settings.sortMethod) === 'string') {
      state.sortMethod = settings.sortMethod;
    }
  }
}

const persist = () => {
  return saveToStorage(STORAGE_KEYS.transactions, state.transactions) && saveToStorage(STORAGE_KEYS.categories, state.customCategories) && saveToStorage(STORAGE_KEYS.limits, state.spendingLimits) && saveToStorage(STORAGE_KEYS.settings, { theme: state.theme, sortMethod: state.sortMethod, }) ;
}

// =-=-=-=-=-=-= [ 5 | STATE OPS ] =-=-=-=-=-=-=-=
// TODO
