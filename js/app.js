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
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0, style: "currency", currency: 'IDR' }).format(amount);
}

const formatTimestamp = (date) => {
  const zeroPad = (num, places) => String(num).padStart(places, '0');
  
  return `${date.getFullYear()}-${zeroPad(date.getMonth()+1, 2)}-${zeroPad(date.getDate(), 2)}T${zeroPad(date.getHours(), 2)}:${zeroPad(date.getMinutes(), 2)}:${zeroPad(date.getSeconds(), 2)}`;
}

// =-=-=-=-=-=-= [ 4 | STORAGE ] =-=-=-=-=-=-=-=

const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, data);
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}

const loadFromStorage = (key) => {
  try {    
    return localStorage.getItem(key);
  } catch (err) {
    return null;
  }
}

const isStorageAvailable = () => {
  try {
    saveToStorage('test', true);
    localStorage.removeItem('test');
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
  //TODO
}
