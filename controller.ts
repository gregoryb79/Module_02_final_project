import { Expense, Income, addUser, getPassword, setCurrentUser, importFromCSV, addExpense} from "./model.js";


export function onRegisterFormSubmit(formData: FormData){
    const rawUsername = formData.get("username"); 
    if (typeof rawUsername !== "string") {
        throw new Error("Username must be a string");
    }   
   
    const password = formData.get("password");
    if (typeof password !== "string") {
        throw new Error("Password must be a string");
    } 
    console.log(password);
    const repeatPassword = formData.get("repeatPassword");
    if (typeof repeatPassword !== "string") {
        throw new Error("Repeat password must be a string");
    } 

    console.log(repeatPassword);
    const username = rawUsername.trim(); 
    console.log(`username: <${username}>`);   
    if (!username) {
        throw new Error("Username can't be empty");
    }
    if (!password) {
        throw new Error("Password can't be empty");
    }
    if (!repeatPassword) {
        throw new Error("Repeat can't be empty");
    }
    if (password != repeatPassword){
        throw new Error("Passwords don't match.");
    }

    addUser(username,password);

}

export function onExpenseSubmit (formData: FormData){
    const categoryRaw = formData.get("category");
    if (typeof categoryRaw !== "string"){
        throw new Error("Category must be a string");
    }
    if (!categoryRaw) {
        throw new Error("Category can't be empty");
    }
    const category = categoryRaw as Expense["category"];

    const dateRaw = formData.get("date").toString();    
    if (!dateRaw) {
        throw new Error("Date can't be empty");
    }       
    const date = new Date(dateRaw);

    const sumRaw = formData.get("sum").toString();
    if (!sumRaw) {
        throw new Error("Sum can't be empty");
    }     
    const sum = parseFloat(sumRaw);

    const descriptionRaw = formData.get("description");
    if (typeof descriptionRaw !== "string") {
        throw new Error("Description must be a string");
    }
    const description = descriptionRaw.trim();
    if (!description) {
        throw new Error("Description can't be empty");
    }

    let id = formData.get("id");
    if (typeof id !== "string"){
        throw new Error("Id must be a string");
    }
    if (!id){
        id = crypto.randomUUID().replaceAll("-", "").slice(-8);
    }

    addExpense({id,date,description,category,sum});    

}

export function onLoginFormSubmit(formData: FormData) : boolean{
    const username = formData.get("username"); 
    if (typeof username !== "string") {
        throw new Error("Username must be a string");
    }   
   
    const password = formData.get("password");
    if (typeof password !== "string") {
        throw new Error("Password must be a string");
    } 
    console.log(password);    

    console.log(`username: <${username}>`); 
    if (!username) {
        throw new Error("Username can't be empty");
    }
    if (!password) {
        throw new Error("Password can't be empty");
    }
  
    const savedPassword = getPassword(username);    
    if (savedPassword === ""){
        throw new Error("No such username");
    }
    if (password === savedPassword){
        setCurrentUser(username);
        return true;
    } else {
        throw new Error("username and password dont match");        
    }      

}

export function onImportFile (fileList: FileList,type : "expenses" | "incomes"){

    if (!fileList){
        throw new Error("No file selected");
    }

    if(fileList.length > 1){
        throw new Error("Must select single file");
    }

    const fileName = fileList[0].name;
    const extention = fileName.substring(fileName.lastIndexOf('.') + 1);
    console.log(`extention is ${extention}`);
    if (extention != "csv"){
        throw new Error("Must be CSV file!");
    }

    try{
        importFromCSV(fileList[0],type);
    }catch(error){
        console.error(error);
        throw new Error(error);
    }
    

}