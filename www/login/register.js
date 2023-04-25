function limitNumber(event, value, maxLength){
    if (value != undefined && value.toString().length >= maxLength){
        event.preventDefault();
    }
}

function check(){
    var password = document.getElementById('createpass').value;
    var confirm = document.getElementById('confirmpass').value;
    if (password == confirm){
        document.getElementById("message").style.color = 'green';
        document.getElementById("message").innerHTML = 'matching';
    }
    else{
        document.getElementById("message").style.color = 'red';
        document.getElementById("message").innerHTML = 'not matching';
    }
}

document.getElementById("button-create-account").onclick = createAccount;
async function createAccount() {
    console.log(document.getElementById("field-username").value)
    var customerData = { 
        "location" : {
			"street" : document.getElementById("field-addy").value,
			"stateCode" : document.getElementById("field-state").value, 
            "city" : document.getElementById("field-city").value,
            "postalCode" : document.getElementById("field-zipcode").value
		},
		"customerUsername" : document.getElementById("field-username").value,
		"customerPassword" : document.getElementById("confirmpass").value,
		"firstName" : document.getElementById("field-fname").value,
        "middleInit" : document.getElementById("field-middleInitial").value,
		"lastName" : document.getElementById("field-lname").value,
        "customerEmail": document.getElementById("field-email").value,
        "customerPhoneNum" : document.getElementById("field-phonenum").value, 

	};
    
    const response = await fetch("/api/auth/customer/create-account", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(customerData)
    });

    const responseJSON = await response.json();

    if (!responseJSON.success) {
        alert(responseJSON.message);
    } else {
        alert("Account succesfully created!");
        window.location.href = "/";
    }
}
