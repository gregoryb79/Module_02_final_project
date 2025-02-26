let onUpdateCallbacks = [];
const usersStorageKey = "users";
const currentUserStorageKey = "currUser";
const storedUsers = JSON.parse(localStorage.getItem(usersStorageKey) || "[]"); // Ensure it's at least an empty array
const users = new Map(Array.isArray(storedUsers) ? storedUsers : []); // Ensure it's a valid Map
const currentUser = sessionStorage.getItem(currentUserStorageKey) ?? "";
const expencesStorageKey = `${currentUser}_expenses`;
const incomesStorageKey = `${currentUser}_incomes`;
let expenses = loadExpenses();
console.log(expenses);
let incomes = loadIncomes();
// console.log("incomes");
// console.log(incomes);
function loadExpenses() {
    const storedExpenses = localStorage.getItem(expencesStorageKey);
    if (!storedExpenses)
        return new Map();
    const expensesArray = JSON.parse(storedExpenses);
    return new Map(expensesArray.map(([id, expense]) => [
        id,
        { ...expense, date: new Date(expense.date) } // Recreate Date object
    ]));
}
function loadIncomes() {
    const storedincomes = localStorage.getItem(incomesStorageKey);
    if (!storedincomes)
        return new Map();
    const incomesArray = JSON.parse(storedincomes);
    return new Map(incomesArray.map(([id, income]) => [
        id,
        { ...income, date: new Date(income.date) } // Recreate Date object
    ]));
}
export function addExpense(expense) {
    expenses.set(expense.id, expense);
    saveExpenses(expenses);
}
export function addIncome(income) {
    incomes.set(income.id, income);
    saveIncomes(incomes);
}
function saveExpenses(expenses) {
    const expensesArray = Array.from(expenses.entries());
    localStorage.setItem(expencesStorageKey, JSON.stringify(expensesArray));
}
function saveIncomes(incomes) {
    const incomesArray = Array.from(incomes.entries());
    localStorage.setItem(incomesStorageKey, JSON.stringify(incomesArray));
}
export function importFromCSV(file, type) {
    const reader = new FileReader();
    reader.onload = function (e) {
        if (!e.target || typeof e.target.result !== "string")
            return;
        const csvData = e.target.result;
        // console.log("importFromCSV");
        // console.log(file);
        // console.log(csvData);
        switch (type) {
            case "expenses":
                const importedExpenses = parseExpensesCSV(csvData);
                console.log("saving imported expesnses to local storage");
                saveExpenses(importedExpenses);
                expenses = loadExpenses();
                console.log("loading imported expesnses from local storage");
                break;
            case "incomes":
                const importedIncomes = parseIncomesCSV(csvData);
                saveIncomes(importedIncomes);
                incomes = loadIncomes();
                console.log(incomes);
                break;
        }
    };
    reader.readAsText(file);
}
export function saveExpensesToCSV() {
    const headers = ["date", "description", "category", "sum"];
    const rows = [headers.join(",")];
    for (const [, expense] of expenses) {
        const row = [
            expense.date.toISOString().slice(0, 10),
            `"${expense.description.replace(/"/g, '""')}"`,
            expense.category,
            expense.sum.toFixed(2)
        ];
        rows.push(row.join(","));
    }
    // Create CSV content as a single string
    const csvContent = rows.join("\n");
    // Create a Blob and a downloadable link
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    // Create a hidden download link
    const a = document.createElement("a");
    a.href = url;
    a.download = "expenses.csv";
    document.body.appendChild(a);
    a.click();
    // Cleanup
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
export function saveIncomesToCSV() {
    const headers = ["date", "source", "sum"];
    const rows = [headers.join(",")];
    for (const [, income] of incomes) {
        const row = [
            income.date.toISOString().slice(0, 10),
            `"${income.source.replace(/"/g, '""')}"`,
            income.sum.toFixed(2)
        ];
        rows.push(row.join(","));
    }
    // Create CSV content as a single string
    const csvContent = rows.join("\n");
    // Create a Blob and a downloadable link
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    // Create a hidden download link
    const a = document.createElement("a");
    a.href = url;
    a.download = "incomes.csv";
    document.body.appendChild(a);
    a.click();
    // Cleanup
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
function parseExpensesCSV(csv) {
    const lines = csv.trim().split("\n");
    const expenses = new Map();
    for (const line of lines.slice(1)) { // Skip header
        const [day, category, description, sum] = line.split(",");
        const id = crypto.randomUUID().replaceAll("-", "").slice(-8);
        expenses.set(id, { id,
            date: new Date(day), category: category, description,
            sum: parseFloat(sum) });
    }
    return expenses;
}
function parseIncomesCSV(csv) {
    const lines = csv.trim().split("\n");
    const incomes = new Map();
    for (const line of lines.slice(1)) { // Skip header
        const [day, source, sum] = line.split(",");
        const id = crypto.randomUUID().replaceAll("-", "").slice(-8);
        incomes.set(id, { id,
            date: new Date(day),
            source,
            sum: parseFloat(sum) });
    }
    return incomes;
}
export function getExpenseById(id) {
    return expenses.get(id);
}
export function getIncomeById(id) {
    return incomes.get(id);
}
export function getExpensesByDates(startDate, stopDate) {
    // console.log(startDate);
    // console.log(stopDate);
    const expenseByDates = Array.from(expenses.values()).filter(expense => (expense.date >= startDate) && (expense.date <= stopDate));
    // console.log("expenseByDates:");
    // console.log(expenseByDates);
    return expenseByDates.sort((a, b) => b.date.valueOf() - a.date.valueOf());
}
export function getExpensesByCategories(expenses) {
    const categorySums = {};
    expenses.forEach(({ category, sum }) => {
        if (categorySums[category]) {
            categorySums[category] += sum;
        }
        else {
            categorySums[category] = sum;
        }
    });
    return Object.entries(categorySums).sort(([, sumA], [, sumB]) => sumB - sumA);
    ;
}
export function getIncomesByDates(startDate, stopDate) {
    console.log(startDate);
    console.log(stopDate);
    const incomeByDates = Array.from(incomes.values()).filter(income => (income.date >= startDate) && (income.date <= stopDate));
    // console.log("expenseByDates:");
    // console.log(expenseByDates);
    return incomeByDates.sort((a, b) => b.date.valueOf() - a.date.valueOf());
}
export function getPassword(username) {
    const password = users.get(username);
    if (password) {
        return password;
    }
    else {
        return "";
    }
}
export function setCurrentUser(username) {
    sessionStorage.setItem(currentUserStorageKey, username);
}
export function getCurrentUser() {
    return sessionStorage.getItem(currentUserStorageKey) ?? "";
}
export function addUser(username, password) {
    if (users.has(username)) {
        throw new Error(`User with Username: ${username} already exists`);
    }
    users.set(username, password);
    console.log(users);
    const usersArray = Array.from(users.entries());
    localStorage.setItem(usersStorageKey, JSON.stringify(usersArray));
}
