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

const CHART_COLORS = [
  '#2563eb', '#16a34a', '#f59e0b', '#dc2626', '#7c3aed',
  '#0891b2', '#db2777', '#65a30d', '#ea580c', '#4f46e5',
];

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

;  if (isFinite(value) && value >= MIN_AMOUNT && value <= MAX_AMOUNT && value !== 0) {
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
  return isFinite(Number(value) && Number(value) >= MIN_LIMIT && Number(value) <= MAX_LIMIT && Number(value) !== 0);
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
    return fallback;
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
  state.customCategories = Array.isArray(categories) ? categories : [];
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

const addTransaction = (itemName, amount, category) => {  
  if (!validateItemName(itemName)) throw new Error('Item name is required! (Max 100 characters)');
  if (!validateAmount(amount)) throw new Error(`Amount must be between ${formatCurrency(MIN_AMOUNT)} and ${formatCurrency(MAX_AMOUNT)}!`);
  if (typeof(category)!=='string' || category.trim()==='') throw new Error('Category is required.');
  if (state.transactions.length >= MAX_TRANSACTIONS) throw new Error(`You tried adding another transaction, but max is ${MAX_TRANSACTIONS}`);

  const transaction = {
    id: generateId(),
    itemName: itemName.trim(),
    amount: Number(amount),
    category: category.trim(),
    timestamp: formatTimestamp(new Date()),
  }
  state.transactions.push(transaction);
  persist();
  notify();
  return transaction;
}

const deleteTransaction = (id) => {
  const index = state.transactions.findIndex((item) => item.id === id);
  if (index === -1) return false;
  state.transactions.splice(index, 1);
  persist();
  notify();
  return true;
}

const getTransaction = (id) => {
  return state.transactions.find((item) => item.id === id);
}

const getBalance = () => {
  return state.transactions.reduce((sum, trans) => sum + trans.amount, 0);
}

// =-=-=-=-=-=-= [ 6 | RENDERER ] =-=-=-=-=-=-=-=
const renderBalance = () => {
  document.querySelector('#balance-display').textContent = formatCurrency(getBalance());
}

const renderCategoryOptions = () => {
  const categoryCombox = document.querySelector('#category');
  const current = categoryCombox.value;
  categoryCombox.replaceChildren();
  DEFAULT_CATEGORIES.concat(state.customCategories.map(c => c.name)).forEach((name) =>{
    const optioned = document.createElement('option');
    optioned.value = name;
    optioned.textContent = name;
    categoryCombox.appendChild(optioned);
  })
  if (current) categoryCombox.value = current;
}

const showFieldError = (id, msg) => {
  document.querySelector(`#${id}`).textContent = msg;
}

const clearFormErrors = () => {
  document.querySelector("#item-name-error").textContent = '';
  document.querySelector("#amount-error").textContent = '';
  document.querySelector("#category-error").textContent = '';
  document.querySelector("#form-error").textContent = '';
}

const handleFormSubmit = (e) => {
  e.preventDefault();
  clearFormErrors();

  const itemName = document.querySelector("#item-name").value;
  const amount = document.querySelector("#amount").value;
  const category = document.querySelector("#category").value;

  let valid = true
  if (!validateItemName(itemName)) {
    showFieldError('item-name-error', `Item name is required (Max ${MAX_ITEM_NAME} characters).`);
    valid = false;
  }
  if (!validateAmount(amount)) {
    showFieldError('amount-error', `Enter an amount between ${formatCurrency(MIN_AMOUNT)} and ${formatCurrency(MAX_AMOUNT)}.`);
    valid = false;
  }
  if (!category) {
    showFieldError('category-error', 'Choose a category.');
    valid = false;
  }
  if (!valid) return;

  try {
    addTransaction(itemName,amount,category);
    e.target.reset();
  } catch (err) {
    document.querySelector("#form-error").textContent = err.message;
  }
}

const wireEvents = () => {
  document.querySelector('#transaction-form').addEventListener('submit', handleFormSubmit);
  document.querySelector('#transaction-list').addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-id]');
    if (!btn) return;
    deleteTransaction(btn.dataset.id);
  })
  document.querySelector('#theme-toggle').addEventListener('click', () => {
    toggleTheme();
    applyTheme();
  });
}

const renderTransactionList = () => {
  const list = document.querySelector("#transaction-list");
  list.replaceChildren();

  for (const item of getVisibleTransactions()) {
    const li = document.createElement('li');
    li.className = 'transaction-item';

    const name = document.createElement('span');
    name.className = 'transaction-name';
    name.textContent = truncate(item.itemName, 50);

    const amount = document.createElement('span');
    amount.className = 'transaction-amount';
    amount.textContent = formatCurrency(item.amount);

    const category = document.createElement('span');
    category.className = 'transaction-category';
    category.textContent = item.category

    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'delete-btn';
    del.dataset.id = item.id;
    del.setAttribute('aria-label', `Delete ${item.itemName}`);
    del.textContent = '×';

    li.append(name, amount, category, del);
    list.appendChild(li);
  }

  document.querySelector("#list-empty").classList.toggle('hidden', state.transactions.length > 0);
}

let pieChart = null;

const calculateCategoryTotals = (transaction) => {
  return transaction.reduce((totals, t) => {
    totals[t.category] = (totals[t.category] ?? 0) + t.amount;
    return totals;
  }, {})
}

const renderPieChart = () => {
  const wrapper = document.querySelector(".chart-wrapper");
  const empty = document.querySelector("#chart-empty");

  if (typeof Chart === 'undefined') {
    wrapper.classList.add('hidden');
    empty.classList.remove('hidden');
    return;
  }

  const total = calculateCategoryTotals(state.transactions);
  const labels = Object.keys(total);
  const values = labels.map((label) => total[label]);
  const grandTotal = values.reduce((sum, value) => sum + value, 0);

  if (grandTotal === 0) {
    if (pieChart) { pieChart.destroy(); pieChart = null; }
    wrapper.classList.add('hidden');
    empty.classList.remove('hidden');
    return
  }

  wrapper.classList.remove('hidden');
  empty.classList.add('hidden');

  const colors = labels.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]);

  if (pieChart) {
    pieChart.data.labels = labels;
    pieChart.data.datasets[0].data = values;
    pieChart.data.datasets[0].backgroundColor = colors;
    pieChart.update();
    return;
  }

  pieChart = new Chart(document.querySelector("#pie-chart"), {
    type: 'pie',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: colors,
        borderWidth: 0,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: getComputedStyle(document.body).color,
            generateLabels(chart) {
              const data = chart.data.datasets[0].data;
              const total = data.reduce((a, b) => a + b, 0);
              return chart.data.labels.map((label, i) => ({
                text: `${label} (${total ? Math.round((data[i] / total) * 100) : 0}%)`,
                fillStyle: chart.data.datasets[0].backgroundColor[i],
                strokeStyle: chart.data.datasets[0].backgroundColor[i],
                index: i,
              }))
            }
          }
        },
        tooltip: {
          callbacks: {
            label(ctx) {
              const data = ctx.dataset.data;
              const total = data.reduce((a, b) => a + b, 0);
              const pct = total ? Math.round((ctx.parsed / total) * 100) : 0;
              return `${ctx.label}: ${formatCurrency(ctx.parsed)} (${pct}%)`;
            }
          }
        }
      }
    }
  })
}

const applyTheme = () => {
  document.documentElement.dataset.theme = state.theme;
  document.querySelector('#theme-toggle').textContent = state.theme === 'dark' ? '☀️' : '🌙';
  if (pieChart) {
    pieChart.options.plugins.legend.labels.color = getComputedStyle(document.body).color;
    pieChart.update('none');
  }
}

const toggleTheme = () => {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  persist();
  applyTheme();
}

const render = () => {
  renderBalance();
  renderTransactionList();
  renderPieChart();
}

const getVisibleTransactions = () => {
  return [...state.transactions]
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, LIST_LIMIT)
}

const truncate = (str, max) => str.length > max ? `${str.slice(0, max-3)}...` : str;

const init = () => {
  hydrate();
  renderCategoryOptions();
  subscribe(render);
  wireEvents();
  applyTheme();
  render();
}

document.addEventListener('DOMContentLoaded', init);
