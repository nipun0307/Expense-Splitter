let payees = {};
let tax = 0;
let discount = 0;
let expenses = []; // To keep track of all expenses globally

function addPayee() {
    const payeeName = document.getElementById("payeeName").value;
    if (payeeName) {
        payees[payeeName] = [];
        updatePayeeList();
        document.getElementById("payeeName").value = '';
    }
}

function deletePayee(payee) {
    delete payees[payee];
    updatePayeeList();
    updateExpenseList();
}

function renamePayee(oldName) {
    const newName = prompt("Enter new name:", oldName);
    if (newName && newName !== oldName) {
        payees[newName] = payees[oldName];
        delete payees[oldName];
        updatePayeeList();
        updateExpenseList();
    }
}

function updatePayeeList() {
    let payeeList = document.getElementById("payeeList");
    let payeesCheck = document.getElementById("payeesCheck");
    
    payeeList.innerHTML = '';
    payeesCheck.innerHTML = '';

    for (let p in payees) {
        payeeList.innerHTML += `<li>${p} 
            <button onclick="renamePayee('${p}')" class="action-btn">Rename</button>
            <button onclick="deletePayee('${p}')" class="action-btn">Delete</button></li>`;
        payeesCheck.innerHTML += `<label><input type="checkbox" name="payeeCheck" value="${p}" checked> ${p}</label>`;
    }
}

function addExpense() {
    const itemName = document.getElementById("itemName").value;
    const itemCost = parseFloat(document.getElementById("itemCost").value);
    const selectedPayees = Array.from(document.querySelectorAll("input[name='payeeCheck']:checked")).map(el => el.value);

    if (itemName && itemCost && selectedPayees.length) {
        const sharedCost = itemCost / selectedPayees.length;
        let expense = { name: itemName, cost: itemCost, payees: selectedPayees };

        // Add the expense globally
        expenses.push(expense);

        selectedPayees.forEach(payee => {
            payees[payee].push({ name: itemName, amount: sharedCost });
        });
        document.getElementById("itemName").value = '';
        document.getElementById("itemCost").value = '';
        updateExpenseList();
    }
}

function deleteExpense(itemName) {
    expenses = expenses.filter(exp => exp.name !== itemName);
    
    // Remove from each payee
    for (let p in payees) {
        payees[p] = payees[p].filter(exp => exp.name !== itemName);
    }
    updateExpenseList();
}

function renameExpense(itemName) {
    let expense = expenses.find(exp => exp.name === itemName);
    if (expense) {
        const newItemName = prompt("Enter new item name:", expense.name);
        const newItemCost = parseFloat(prompt("Enter new item cost:", expense.cost));
        if (newItemName && !isNaN(newItemCost)) {
            // Update the expense globally
            expense.name = newItemName;
            expense.cost = newItemCost;

            // Reflect the changes across all payees who shared the expense
            expense.payees.forEach(payee => {
                let payeeExpenses = payees[payee];
                payeeExpenses.forEach(exp => {
                    if (exp.name === itemName) {
                        exp.name = newItemName;
                        exp.amount = newItemCost / expense.payees.length;
                    }
                });
            });

            updateExpenseList();
        }
    }
}

function updateExpenseList() {
    let expenseList = document.getElementById("expenseList");
    expenseList.innerHTML = '';

    expenses.forEach(exp => {
        expenseList.innerHTML += `<h3>${exp.name}: $${exp.cost.toFixed(2)} 
            <button onclick="renameExpense('${exp.name}')" class="action-btn">Rename</button>
            <button onclick="deleteExpense('${exp.name}')" class="action-btn">Delete</button></h3>`;
    });

    for (let p in payees) {
        expenseList.innerHTML += `<h3>${p}'s Expenses</h3><ul>`;
        payees[p].forEach(exp => {
            expenseList.innerHTML += `<li>${exp.name}: $${exp.amount.toFixed(2)}</li>`;
        });
        expenseList.innerHTML += `</ul>`;
    }
}

function applyTaxAndDiscount() {
    const taxInput = parseFloat(document.getElementById("taxAmount").value);
    const discountInput = parseFloat(document.getElementById("discountAmount").value);

    if (!isNaN(taxInput)) tax = taxInput;
    if (!isNaN(discountInput)) discount = discountInput;

    const totalExpenses = expenses.reduce((acc, exp) => acc + exp.cost, 0);

    for (let p in payees) {
        const personalExpenses = payees[p].reduce((sum, exp) => sum + exp.amount, 0);
        const personalTax = (personalExpenses / totalExpenses) * tax;
        payees[p].push({ name: "Tax", amount: personalTax });
    }

    updateExpenseList();
    showSummary();
}

function showSummary() {
    let summary = document.getElementById("summary");
    summary.innerHTML = "<h3>Summary</h3>";
    const totalDiscount = discount / Object.keys(payees).length;

    for (let p in payees) {
        let personalExpenses = payees[p].reduce((sum, exp) => sum + exp.amount, 0);
        personalExpenses -= totalDiscount;
        summary.innerHTML += `<p>${p} owes: $${personalExpenses.toFixed(2)}</p>`;
    }

    summary.innerHTML += "<h4>Tax Info:</h4>";
    for (let p in payees) {
        payees[p].forEach(exp => {
            if (exp.name === "Tax") {
                summary.innerHTML += `<p>${p}'s tax: $${exp.amount.toFixed(2)}</p>`;
            }
        });
    }
}
