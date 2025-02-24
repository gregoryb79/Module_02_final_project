type Expense = {
    id: string;
    date: Date;
    description: string;
    category: "apparel" | "bills" | "eatingOut" | "education" | "grosceries" 
                | "misc" | "pets" | "housing" | "transportation" | "vacations";
    sum: number;
}

type Income = {
    id: string;
    source : string;
    date: Date;
    description: string;
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
//console.log(expenses);
let incomes = loadIncomes();

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

function saveExpenses(expenses: Map<string, Expense>) {
    const expensesArray = Array.from(expenses.entries()); 
    localStorage.setItem(expencesStorageKey, JSON.stringify(expensesArray));
}

function saveIncomes(incomes: Map<string, Income>) {
    const incomesArray = Array.from(incomes.entries()); 
    localStorage.setItem(incomesStorageKey, JSON.stringify(incomesArray));
}

export function importFromCSV (file: File){
    const reader = new FileReader();

    reader.onload = function (e) {
        if (!e.target || typeof e.target.result !== "string") return;

        const csvData = e.target.result;
        const expenses = parseCSV(csvData);
        saveExpenses(expenses);
    };

    reader.readAsText(file);
}

function parseCSV(csv : string) : Map<string, Expense> {
    
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

export function getExpensesByDates(startDate : Date, stopDate : Date) : Expense[] {
    console.log(startDate);
    console.log(stopDate);
    const expenseByDates = Array.from(expenses.values()).filter(expense => (expense.date >= startDate) && (expense.date <= stopDate)); 
    // console.log("expenseByDates:");
    // console.log(expenseByDates);
    return expenseByDates.sort((a,b) => a.date.valueOf() - b.date.valueOf());
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