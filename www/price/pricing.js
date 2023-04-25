
function postCardButton() {
    const testDiv = document.getElementById('PostCard-Button')
    testDiv.addEventListener('click', () => {
    const testDiv2 = document.getElementById('PostCard-Price')
    testDiv2.classList.toggle('hidden')
    })
}

function postCardCalculate(){
    var variable1 = parseInt(document.getElementById('quantity-1').value) * 0.48;
    var variable2 = parseInt(document.getElementById('quantity-2').value) * 0.63;
    var firstresult = variable1 + variable2;
    var lastresult = firstresult.toFixed(2);
    alert("The total price is " + lastresult);
};

function boxCalculate(){
    var variable5 = parseInt(document.getElementById('quantity-5').value) * 22.80;
    var varibale6 = parseInt(document.getElementById('quantity-6').value) * 25.80;
    var variable7 = parseInt(document.getElementById('quantity-7').value) * 17.10;
    var variable8 = parseInt(document.getElementById('quantity-8').value) * 20.10;
    var variable9 = parseInt(document.getElementById('quantity-9').value) * 10.20;
    var variable10 = parseInt(document.getElementById('quantity-10').value) * 13.20;
    var firstresult = variable5 + variable6 + variable7 + variable8 + variable9 + variable10;
    var lastresult = firstresult.toFixed(2);
    alert("The total price is " + lastresult);
};