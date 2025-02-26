import { onRegisterFormSubmit, onLoginFormSubmit, onImportFile, onExpenseSubmit, onIncomeSubmit } from "./controller.js";
import { Expense, Income, getCurrentUser, getExpensesByDates, getIncomesByDates,
        getExpensesByCategories, getExpenseById, getIncomeById,
        saveExpensesToCSV, saveIncomesToCSV} from "./model.js";


export function checkUser(){
    const currentUser = getCurrentUser();
    if (currentUser === ""){
        window.location.href = "./login.html";
    }
}

export function index(monthInput: HTMLInputElement, balanceSheet: HTMLElement, expenseMeterCanvas: HTMLCanvasElement,
                    balance: HTMLElement, percentage: HTMLElement, expenseGraphCanvas: HTMLCanvasElement,
                    largestCategories: HTMLElement, recentExpensesList: HTMLElement,
                    addExpense: HTMLElement, expenseForm: HTMLFormElement){
    const today = new Date();
    const monthAgo = new Date();
    const firstOfThisMonth = new Date(today.getFullYear(),today.getMonth(),1);
    monthAgo.setMonth(monthAgo.getMonth()-1);    

    renderTransactions(monthAgo,today,recentExpensesList,"expenses");
    const formatedToday = today.toISOString().slice(0, 7);
    monthInput.value = formatedToday;

    const categories = getExpensesByCategories(getExpensesByDates(firstOfThisMonth,today));
    const totalIncomeThisMonth = getIncomesByDates(firstOfThisMonth,today).reduce((acc,income) => acc + income.sum,0);
    const totalExpencesThisMonth = getExpensesByDates(firstOfThisMonth,today).reduce((acc,expense) => acc + expense.sum,0);
    renderBalanceSection(totalIncomeThisMonth,totalExpencesThisMonth);
    drawChart(categories);
    renderLargestCategories(categories);
    
    monthInput.addEventListener("change",function(e){
        const target = e.target as HTMLInputElement;
        const firstDay = new Date(target.value);        
        const lastDay = new Date(firstDay.getFullYear(),firstDay.getMonth()+1,0);
        const monthIncome = getIncomesByDates(firstDay,lastDay).reduce((acc,income) => acc + income.sum,0);
        const monthExpense = getExpensesByDates(firstDay,lastDay).reduce((acc,expense) => acc + expense.sum,0);
        const categories = getExpensesByCategories(getExpensesByDates(firstDay,lastDay));
        renderBalanceSection(monthIncome,monthExpense);
        drawChart(categories); 
        renderLargestCategories(categories);       
    });

    let expenseFormShown = false;
    addExpense.addEventListener("click",function(e){
        console.log(`+ clicked, formShown is: ${expenseFormShown}`);
        if (expenseFormShown) {
            expenseForm.classList.remove("active");
            expenseFormShown = false;
        } else{
            doExpenseForm();
            expenseForm.classList.add("active");
            expenseFormShown = true;           
            console.log(`expense form done, formShown is: ${expenseFormShown}`);
        }
    });

    function doExpenseForm(){
        const newForm = expenseForm.cloneNode(true) as HTMLFormElement;;
        expenseForm.replaceWith(newForm);
        expenseForm = newForm;
        newForm.reset();

        newForm.date.value = today.toISOString().slice(0, 10);
        newForm.addEventListener("submit", function(e){
            e.preventDefault();
            const formData = new FormData(newForm, e.submitter);
            try {
                onExpenseSubmit(formData);
                newForm.reset();
            }catch (error) {
                console.error(error);
                displayToast(expenseForm,error);
            }
            renderTransactions(monthAgo,today,recentExpensesList,"expenses");
            newForm.classList.remove("active");
            expenseFormShown = false;
        });
        return newForm;
    }

    function drawChart(categories: Array<[string, number]>){
        
        let colors: string[]=[];

        for(let i = 0; i < categories.length; i++){
            switch (categories[i][0]){
                case "Apparel":
                    colors[i] = "#ff69b4";
                    break;
                case "Bills":
                    colors[i] = "#0066cc";
                    break;                
                case "Eating Out":
                    colors[i] = "#ffa500";
                    break;
                case "Education":
                    colors[i] = "#00ccff";
                    break;
                case "Groceries":
                    colors[i] = "#228b22";
                    break;
                case "Miscellaneous":
                    colors[i] = "#808080";
                    break;
                case "Pets":
                    colors[i] = "#ff6347";
                    break;
                case "Housing":
                    colors[i] = "#8b4513";
                    break;
                case "Transportation":
                    colors[i] = "#008080";
                    break;
                case "Vacations":
                    colors[i] = "#ffdfba";
                    break;                
            }
        }

        const canvas = expenseGraphCanvas;
        canvas.width = canvas.parentElement!.clientWidth; // Set width to parent’s width
        canvas.height = canvas.parentElement!.clientHeight; // Set width to parent’s width
        const ctx = canvas.getContext("2d");
                
        const data = categories.map(([, sum]) => sum);

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        const radius = (canvas.height / 2) * 0.95;  // Outer radius
        const holeRadius = (canvas.height / 2) * 0.45; // Inner radius for doughnut effect

        let startAngle = 0;
        const total = data.reduce((sum, value) => sum + value, 0); // Sum of data values

        data.forEach((value, index) => {
            const sliceAngle = (value / total) * (Math.PI * 2); // Convert percentage to radians

            // Draw the outer slice
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
            ctx.closePath();
            ctx.fillStyle = colors[index];
            ctx.fill();

            startAngle += sliceAngle;
        });

        // Draw the inner circle (hole)
        ctx.globalCompositeOperation = "destination-out"; // Makes the next shape remove parts from existing drawing
        ctx.beginPath();
        ctx.arc(centerX, centerY, holeRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = "source-over"; // Reset to normal drawing mode
    }

    function drawMeter(income : number, expense : number){
        const canvas = expenseMeterCanvas;
        canvas.width = canvas.parentElement!.clientWidth; // Set width to parent’s width
        canvas.height = canvas.parentElement!.clientHeight; // Set width to parent’s width
        const ctx = canvas.getContext("2d");       

        const centerX = canvas.width / 2;
        const centerY = canvas.height; //bottom

        const radius = (canvas.width/2) * 0.95;  // Outer radius
        const holeRadius = (canvas.width/2) * 0.75; // Inner radius for arch effect

        //draw 100% income arch
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX,centerY,radius,Math.PI,0);        
        ctx.fillStyle = "#228b22";
        ctx.fill();
        ctx.closePath();
        
        
        //draw expences arch
        let sliceAngle = 0;
        let fillColor = "#ff4500";
        if (income > expense){
            sliceAngle = (1-(expense/income))*Math.PI;            
        } else {
            sliceAngle = 0;
            fillColor = "#b22222"
        }
        
        console.log(sliceAngle);
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX,centerY,radius,Math.PI,-1*sliceAngle);        
        ctx.fillStyle = fillColor;
        ctx.fill();
        ctx.closePath();
       

        ctx.globalCompositeOperation = "destination-out";
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX,centerY,holeRadius,Math.PI,0);        
        ctx.fill();
        ctx.closePath();
        ctx.globalCompositeOperation = "source-over";
        
    }
    
    function renderLargestCategories(categories: Array<[string, number]>){
        largestCategories.innerHTML = "";
        for (const category of categories ){       
            const li = document.createElement("li");       
            li.className = "categoryRow";

            const icon = document.createElement("div");                      
            icon.className = `u-${category[0]} iconPHsmall`;
            const firstLetter = category[0].charAt(0).toUpperCase();
            icon.textContent = firstLetter;
                    
            li.appendChild(icon);        

            const categoryName = document.createElement("span");
                    
            categoryName.textContent = category[0];        
            categoryName.className = "categoryName"; 
            
            li.appendChild(categoryName);

            const sum = document.createElement("span");
            sum.className = "sum";
            const sumFormated = category[1].toLocaleString("en-US",{ minimumFractionDigits: 2, maximumFractionDigits: 2 });
            sum.textContent = `$ ${sumFormated}`;
            li.appendChild(sum);
            
            largestCategories.appendChild(li);
        }
    }

    function renderBalanceSection (income : number, expense : number){

        const incomeEl = balanceSheet.querySelector('[data-type="income"] span');
        const expenseEl = balanceSheet.querySelector('[data-type="expense"] span');
        const balanceEl = balanceSheet.querySelector('[data-type="balance"] span');
        const balanceBox = balance;
        const percentageBox = percentage;

        const incomeFormated = income.toLocaleString("en-US",{ minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const expenseFormated = expense.toLocaleString("en-US",{ minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const balanceFormated = (income-expense).toLocaleString("en-US",{ minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const percentageCalc = (income === 0) ? 9.99 : (1-(income-expense)/income);
        const percentageFormated = percentageCalc.toLocaleString("en-US",{ style: "percent" ,minimumFractionDigits: 0});
        
        incomeEl.textContent = `$ ${incomeFormated}`;
        expenseEl.textContent = `$ ${expenseFormated}`;        
        balanceEl.textContent = `$ ${balanceFormated}`;
        balanceBox.textContent = `$ ${balanceFormated}`;
        percentageBox.textContent = percentageFormated;
        if (expense > income){
            balanceEl.classList.remove("u-pBalance");
            balanceEl.classList.add("u-nBalance");
            balanceBox.classList.remove("u-pBalance");
            balanceBox.classList.add("u-nBalance");
            percentageBox.classList.remove("u-pBalance");
            percentageBox.classList.add("u-nBalance");
        }else{
            balanceEl.classList.remove("u-nBalance");
            balanceEl.classList.add("u-pBalance");
            balanceBox.classList.remove("u-nBalance");
            balanceBox.classList.add("u-pBalance");
            percentageBox.classList.remove("u-nBalance");
            percentageBox.classList.add("u-pBalance");
        }

        drawMeter(income,expense);

    }
}




export function expenses(filesForm: HTMLFormElement, datesForm: HTMLFormElement,
                         expensesList: HTMLElement, expenseForm: HTMLFormElement,
                        exportFile: HTMLElement){

    const today = new Date();   
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth()-1);
  
    const formattedToday = today.toISOString().slice(0, 10);
    const formattedMonthAgo = monthAgo.toISOString().slice(0, 10);
    datesForm.startDate.value = formattedMonthAgo;
    datesForm.stopDate.value = formattedToday;
    expenseForm.date.value = today.toISOString().slice(0, 10);
    let stopDate = today;
    let startDate = monthAgo;

    renderTransactions(startDate,stopDate,expensesList,"expenses");

    filesForm.addEventListener("change", function(e){
        const target = e.target as HTMLInputElement;

        if (target.id === "importFile") {
            console.log("Import file changed:", target.files);
            try{
                onImportFile(target.files,"expenses");
            } catch (error){
                console.error(error);
                displayToast(datesForm, error);
            }           
       
        setTimeout(() => {
            console.log(`render transactions ${startDate}, ${stopDate}`);
            renderTransactions(startDate,stopDate,expensesList,"expenses");
        }, 100);
        
    });

    exportFile.addEventListener("click", function(e){
        saveExpensesToCSV();
    });

    expenseForm.addEventListener("submit", function(e){
        e.preventDefault();
        const formData = new FormData(expenseForm, e.submitter);
        try {
            onExpenseSubmit(formData);
            expenseForm.reset();
        }catch (error) {
            console.error(error);
            displayToast(expenseForm,error);
        }
        renderTransactions(startDate,stopDate,expensesList,"expenses");
    });

    expensesList.addEventListener("click", function(e){
        const target = (e.target as HTMLElement).closest("li");
        const expenseId =target.dataset.id;
        console.log("expensesList clicked");
        if (!expenseId){
            return;
        }
        console.log(`Espense record ${expenseId} clicked`);
        
        try{
            const expense = getExpenseById(expenseId);
            const idInput = expenseForm.elements.namedItem('id') as HTMLInputElement;
            idInput.value = expense.id;
            expenseForm.date.value = expense.date.toISOString().slice(0, 10);
            expenseForm.category.value = expense.category;
            expenseForm.sum.value = Math.round(expense.sum * 100) / 100;;
            expenseForm.description.value = expense.description;          
        } catch (error){
            displayToast(expenseForm,error);
        }        

    });

    
    datesForm.addEventListener("change",function(e){       
        const target = e.target as HTMLInputElement;
        if (target.id === "stopDate"){
            stopDate = new Date(target.value);
            console.log(stopDate);
        }
        if (target.id === "startDate"){
            startDate = new Date(target.value);
            console.log(startDate);
        }

        renderTransactions(startDate,stopDate,expensesList,"expenses");
        
    });
}

export function incomes(filesForm: HTMLFormElement, datesForm: HTMLFormElement, incomesList: HTMLElement,
                        incomeForm: HTMLFormElement, exportFile: HTMLElement
){

    const today = new Date(); 
    const yearAgo = new Date();
    yearAgo.setFullYear(yearAgo.getFullYear()-1);
    
  
    const formattedToday = today.toISOString().slice(0, 10);
    const formattedMonthAgo = yearAgo.toISOString().slice(0, 10);
    datesForm.startDate.value = formattedMonthAgo;
    datesForm.stopDate.value = formattedToday;    
    incomeForm.date.value = today.toISOString().slice(0, 10);

    renderTransactions(yearAgo,today,incomesList,"income");

    filesForm.addEventListener("change", function(e){
        const target = e.target as HTMLInputElement;

        if (target.id === "importFile") {
            console.log("Import file changed:", target.files);
            try{
                onImportFile(target.files,"incomes");
            } catch (error){
                console.error(error);
                displayToast(datesForm, error);
            }
            
        setTimeout(() => {
            console.log(`render transactions ${startDate}, ${stopDate}`);
            renderTransactions(startDate,stopDate,incomesList,"income");
        }, 100);
    });

    exportFile.addEventListener("click", function(e){
        saveIncomesToCSV();
    });

    incomeForm.addEventListener("submit", function(e){
        e.preventDefault();
        const formData = new FormData(incomeForm, e.submitter);
        try {
            onIncomeSubmit(formData);
            incomeForm.reset();
        }catch (error) {
            console.error(error);
            displayToast(incomeForm,error);
        }
        renderTransactions(startDate,stopDate,incomesList,"income");
    });

    incomesList.addEventListener("click", function(e){
        const target = (e.target as HTMLElement).closest("li");
        const incomeID =target.dataset.id;
        console.log("incomesList clicked");
        if (!incomeID){
            return;
        }
        console.log(`Income record ${incomeID} clicked`);
        
        try{
            const income = getIncomeById(incomeID);
            const idInput = incomeForm.elements.namedItem('id') as HTMLInputElement;
            idInput.value = income.id;
            incomeForm.date.value = income.date.toISOString().slice(0, 10);          
            incomeForm.sum.value = Math.round(income.sum * 100) / 100;
            incomeForm.source.value = income.source;          
        } catch (error){
            displayToast(incomeForm,error);
        }
        

    });


    let stopDate = today;
    let startDate = yearAgo;
    datesForm.addEventListener("change",function(e){       
        const target = e.target as HTMLInputElement;
        if (target.id === "stopDate"){
            stopDate = new Date(target.value);
            console.log(stopDate);
        }
        if (target.id === "startDate"){
            startDate = new Date(target.value);
            console.log(startDate);
        }

        renderTransactions(startDate,stopDate,incomesList,"income");
        
    });


}

export function register(registerForm: HTMLFormElement){

    registerForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const formData = new FormData(registerForm, e.submitter) as any;
        
        try {
            onRegisterFormSubmit(formData);
            registerForm.reset();
            window.location.href = "./login.html"
        } catch (error) {
            console.error(error);
            displayToast(registerForm, error);
        }
    });

}

export function login(loginForm: HTMLFormElement){

    loginForm.addEventListener("submit", function (e) {
        e.preventDefault();

        let isLoginSucsessful = false;         
        const formData = new FormData(loginForm, e.submitter) as any;
        
        try {
            isLoginSucsessful = onLoginFormSubmit(formData);
            loginForm.reset();
        } catch (error) {
            console.error(error);
            console.log("show toast");
            displayToast(loginForm, error);
        } 

        if (isLoginSucsessful) {
            window.location.href = "./index.html" 
        }

    });

}

function displayToast(container: HTMLElement, message: string){
           
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerText = message;
    
    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000); // Auto-hide after 3s
}


function renderTransactions(startDate : Date, stopDate : Date, transactionsList: HTMLElement
                        , transactionType : "expenses" | "income"
){

    let transactions: (Expense | Income)[] = [];
    console.log(`rendering transaction${startDate}, ${stopDate}, ${transactionType}.`)


    switch (transactionType){
        case "expenses":
            transactions = getExpensesByDates (startDate,stopDate);
            break;        
        case "income":
            transactions = getIncomesByDates(startDate,stopDate);
            console.log(transactions);
            break;
    }
    console.log(transactions);
    transactionsList.innerHTML = "";

    for (const transaction of transactions ){

        const li = document.createElement("li");
        li.dataset.id = transaction.id;
        li.className = "transactionRow";

        const icon = document.createElement("div");        
        
        if (transactionType === "expenses") {
            const expence = transaction as Expense;
            icon.className = `u-${expence.category} iconPHsmall`;
            const firstLetter = expence.category.charAt(0).toUpperCase();
            icon.textContent = firstLetter;
        }else{
            icon.className = 'u-income iconPHsmall';
            icon.textContent = "$";             
        }          
        
        li.appendChild(icon);

        const day = document.createElement("span");
        day.className = "day";
        day.textContent = transaction.date.toLocaleDateString('en-GB',{day: '2-digit',month: '2-digit',year: '2-digit'})
                                        .slice(0, 10);
        li.appendChild(day);

        const description = document.createElement("span");
        if (transactionType === "expenses") {
            const expence = transaction as Expense;
            description.textContent = expence.description;
        } else {
            const income = transaction as Income;
            description.textContent = income.source;
        }
        description.className = "description"; 
        
        li.appendChild(description);

        const sum = document.createElement("span");
        sum.className = "sum";
        const sumFormated = transaction.sum.toLocaleString("en-US",{ minimumFractionDigits: 2, maximumFractionDigits: 2 });
        sum.textContent = `$ ${sumFormated}`;
        li.appendChild(sum);
        
        transactionsList.appendChild(li);

    }

}