# Module 2 Final Project - Gregory Breitmeier

The project is a Personal Finance Tracker application.

It consists of:

Landing page (index.html):
    Provides an overview of the finantial situation at given month.
    The desired month can be selected, and 
        1. The curren balance of the month (income, expenses, balance).
        2. Recent expenses (from current day to a month back)
        3. Expences by categories (as a list and as a pie chart)
        4. Balance meter - visualising the ratio between the income and expenses.
    will be displayed.
    The default is the current month.
    In addition there is a possibility to ad a new expense directly from the landing page.

Login and Register page - to handle users, each user has it's own lists of incomes and expenses in local storage.

Expenses page:
    Provides:
     1. List of expenses in selected period (from: date to:date), from the most recent, backwards. The default range is from current date month back.
     2. Form, to add a new expense, or to edit an existing one by clicking on it.
     3. Import from CSV file,and export to CSV file of the expenses list.

Incomes page: similar to the expenses, but with income data. The default time period is 1 year back from current date.

The design is responsive for descktop and mobile use.
