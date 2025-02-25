export type Expense = {
    id: string;
    date: Date;
    description: string;
    category: "Apparel" | "Bills" | "Eating Out" | "Education" | "Groceries" 
                | "Miscellaneous" | "Pets" | "Housing" | "Transportation" | "Vacations";
    sum: number;
}

export type Income = {
    id: string;    
    date: Date;
    source: string;
    sum: number;     
}

const usersStorageKey = "users";
const currentUserStorageKey = "currUser";

const storedUsers = JSON.parse(localStorage.getItem(usersStorageKey) || "[]"); // Ensure it's at least an empty array
const users = new Map<string,string>(Array.isArray(storedUsers) ? storedUsers : []) // Ensure it's a valid Map


const currentUser = sessionStorage.getItem(currentUserStorageKey) ?? "";
const expencesStorageKey = `${currentUser}_expenses`;
const incomesStorageKey = `${currentUser}_incomes`;

let expenses = loadExpenses();
console.log(expenses);
let incomes = loadIncomes();
// console.log("incomes");
// console.log(incomes);

function loadExpenses(): Map<string, Expense> {
    const storedExpenses = localStorage.getItem(expencesStorageKey);
    
    if (!storedExpenses) return new Map(); 

    const expensesArray: [string, Expense][] = JSON.parse(storedExpenses);
 
    return new Map(expensesArray.map(([id, expense]) => [
        id,
        { ...expense, date: new Date(expense.date) } // Recreate Date object
    ]));
}

function loadIncomes(): Map<string, Income> {
    const storedincomes = localStorage.getItem(incomesStorageKey);
    if (!storedincomes) return new Map(); 

    const incomesArray: [string, Income][] = JSON.parse(storedincomes);
 
    return new Map(incomesArray.map(([id, income]) => [
        id,
        { ...income, date: new Date(income.date) } // Recreate Date object
    ]));
}

export function addExpense(expense: Expense){
    expenses.set(expense.id,expense);
    saveExpenses(expenses);
}

function saveExpenses(expenses: Map<string, Expense>) {
    const expensesArray = Array.from(expenses.entries()); 
    localStorage.setItem(expencesStorageKey, JSON.stringify(expensesArray));
}

function saveIncomes(incomes: Map<string, Income>) {
    const incomesArray = Array.from(incomes.entries()); 
    localStorage.setItem(incomesStorageKey, JSON.stringify(incomesArray));
}

export function importFromCSV (file: File, type: "expenses" | "incomes"){
    const reader = new FileReader();

    reader.onload = function (e) {
        if (!e.target || typeof e.target.result !== "string") return;

        const csvData = e.target.result;

        // console.log("importFromCSV");
        // console.log(file);
        // console.log(csvData);

        switch (type){
            case "expenses":
                const expenses = parseExpensesCSV(csvData);
                saveExpenses(expenses);
                break;
            case "incomes":
                const incomes = parseIncomesCSV(csvData);
                saveIncomes(incomes);
                break;
        }
        
    };

    reader.readAsText(file);
}

function parseExpensesCSV(csv : string) : Map<string, Expense> {
    
    const lines = csv.trim().split("\n");
    const expenses = new Map<string, Expense>();

    for (const line of lines.slice(1)) { // Skip header
        const [day, category, description, sum] = line.split(",");

        const id = crypto.randomUUID().replaceAll("-", "").slice(-8);
        expenses.set(id,
            {id,
            date: new Date(day),
            category: category as Expense["category"],
            description,
            sum: parseFloat(sum)}
        );
    }

    return expenses;

}

function parseIncomesCSV(csv : string) : Map<string, Income> {
    
    const lines = csv.trim().split("\n");
    const incomes = new Map<string, Income>();

    for (const line of lines.slice(1)) { // Skip header
        const [day, source, sum] = line.split(",");

        const id = crypto.randomUUID().replaceAll("-", "").slice(-8);
        incomes.set(id,
            {id,
            date: new Date(day),
            source,
            sum: parseFloat(sum)}
        );
    }

    return incomes;

}

export function getExpenseById (id: string) : Expense {
   return expenses.get(id);
}

export function getExpensesByDates(startDate : Date, stopDate : Date) : Expense[] {
    // console.log(startDate);
    // console.log(stopDate);
    const expenseByDates = Array.from(expenses.values()).filter(expense => (expense.date >= startDate) && (expense.date <= stopDate)); 
    // console.log("expenseByDates:");
    // console.log(expenseByDates);
    return expenseByDates.sort((a,b) => b.date.valueOf() - a.date.valueOf());
}

export function getExpensesByCategories(expenses: Expense[]) :Array<[string, number]> {
    
    const categorySums: Record<string, number> = {};
    expenses.forEach(({category,sum}) => {
        if(categorySums[category]){
            categorySums[category] += sum;
        } else{
            categorySums[category] = sum;
        }
    });

    return Object.entries(categorySums).sort(([, sumA], [, sumB]) => sumB - sumA);;
}

export function getIncomesByDates(startDate : Date, stopDate : Date) : Income[] {
    console.log(startDate);
    console.log(stopDate);
    const incomeByDates = Array.from(incomes.values()).filter(income => (income.date >= startDate) && (income.date <= stopDate)); 
    // console.log("expenseByDates:");
    // console.log(expenseByDates);
    return incomeByDates.sort((a,b) => b.date.valueOf() - a.date.valueOf());
}

export function getPassword(username : string) : string {

    const password = users.get(username);
    if (password) {
        return password;        
    }else{
        return "";
    } 
}

export function setCurrentUser(username: string){
    sessionStorage.setItem(currentUserStorageKey,username);
}

export function getCurrentUser():string {
    return sessionStorage.getItem(currentUserStorageKey) ?? "";
}


export function addUser(username:string, password : string){
    if (users.has(username)){
        throw new Error(`User with Username: ${username} already exists`);        
    }
    users.set(username,password);
    console.log(users);
    const usersArray = Array.from(users.entries());
    localStorage.setItem(usersStorageKey, JSON.stringify(usersArray));
}