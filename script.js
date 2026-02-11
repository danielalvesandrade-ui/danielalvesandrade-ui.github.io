const display = document.getElementById('result');

// Adiciona números e operadores ao visor
function appendToDisplay(input) {
    display.value += input;
}

// Limpa todo o visor
function clearDisplay() {
    display.value = "";
}

// Apaga o último caractere digitado
function deleteLast() {
    display.value = display.value.slice(0, -1);
}

// Realiza o cálculo
function calculate() {
    try {
        // eval() processa a string matemática, ex: "2+2" vira 4
        display.value = eval(display.value);
    } catch (error) {
        display.value = "Erro";
        setTimeout(clearDisplay, 1500);
    }
}