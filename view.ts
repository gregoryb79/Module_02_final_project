import { onRegisterFormSubmit, onLoginFormSubmit, onImportFile } from "./controller.js";
import { getCurrentUser, getExpensesByDates } from "./model.js";


export function checkUser(){
    const currentUser = getCurrentUser();
    if (currentUser === ""){
        window.location.href = "./login.html";
    }
}

export function index(){
     
}

export function expenses(filesForm: HTMLFormElement, datesForm: HTMLFormElement, expensesList: HTMLElement){

    const today = new Date();   
    const monthAgo = new Date;
    monthAgo.setMonth(monthAgo.getMonth()-1);
  
    const formattedToday = today.toISOString().slice(0, 10);
    const formattedMonthAgo = monthAgo.toISOString().slice(0, 10);
    datesForm.startDate.value = formattedToday;
    datesForm.stopDate.value = formattedMonthAgo;    

    renderExpenses(monthAgo,today);

    filesForm.addEventListener("change", function(e){
        const target = e.target as HTMLInputElement;

        if (target.id === "importFile") {
            console.log("Import file changed:", target.files);
            try{
                onImportFile(target.files);
            } catch (error){
                console.error(error);
                displayToast(datesForm, error);
            }
            
        } else if (target.id === "exportFile") {
            console.log("Export file changed:", target.files);
            // Handle export logic here
        }
    });

    function renderExpenses(startDate : Date, stopDate : Date){

        const expenses = getExpensesByDates (startDate,stopDate);
        expensesList.innerHTML = "";

        for (const expense of expenses ){

            const li = document.createElement("li");
            li.dataset.id = expense.id;
            li.className = "expenseRow";

            const icon = document.createElement("div");
            icon.className = `u-${expense.category} iconPHsmall`;
            const firstLetter = expense.category.charAt(0).toUpperCase();
            icon.textContent = firstLetter;
            li.appendChild(icon);

            const day = document.createElement("span");
            day.className = "day";
            // day.textContent = expense.date.toISOString().slice(0, 10);
            day.textContent = expense.date.toLocaleDateString('en-GB',{day: '2-digit',month: '2-digit',year: '2-digit'})
                                            .slice(0, 10);
            li.appendChild(day);

            const description = document.createElement("span");
            description.className = "description";
            description.textContent = expense.description;
            li.appendChild(description);

            const sum = document.createElement("span");
            sum.className = "sum";
            const sumFormated = expense.sum.toLocaleString("en-US",{ minimumFractionDigits: 2, maximumFractionDigits: 2 });
            sum.textContent = `$ ${sumFormated}`;
            li.appendChild(sum);
            
            expensesList.appendChild(li);

        }

    }
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