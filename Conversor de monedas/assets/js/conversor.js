const inputCLP = document.getElementById('inputPesoChile');
const selector = document.getElementById('conversor');
const btn = document.getElementById('btn');
const answer = document.getElementById('answer');

const endpoint = "https://mindicador.cl/api";
let myChart = null;

//------------------------------------------------------------
selector.addEventListener('change', monedaSelec);
btn.addEventListener('click', btnConversor);

inputCLP.addEventListener('input', function(){
    if (this.value.length > 9){
        this.value = this.value.slice(0.9);
    };
});
//------------------------------------------------------------

//Obtener datos y filtro monedas

async function getMonedas(){
    try {
        const resp = await fetch(endpoint);
        const datos = await resp.json();
        const {dolar, uf, euro} = datos;
        return [dolar, uf, euro];
    } catch (error) {
        window.alert('¡Uy, algo salió mal!');
    }
};

//Render Opciones

async function renderResult(url) {
    try {
        const monedas = await getMonedas(url);
        
        monedas.forEach((moneda) =>{
            const option = document.createElement('option');
            option.value = moneda.codigo;
            option.innerText = moneda.nombre;
            
            selector.appendChild(option);
        });
    } catch (error) {
        window.alert('¡Uy, algo salió mal!');
    };
};

//Consultar API moneda seleccionada

async function monedaSelec() {
    let selectCoin = selector.value;
    let selectURL = `${endpoint}/${selectCoin}`;
    try {
        const resp = await fetch(selectURL);
        const data = await resp.json();
        return data;
    } catch (error) {
        window.alert('Por favor, elije una moneda a convertir');
    };
};

// Función del Botón

async function btnConversor(){
    try {
        if (selector.value != '0'){
            const valorCLP = parseInt(inputCLP.value); //Valor del input
            const selectCoin = await monedaSelec(); //Datos de la moneda seleccionada
            const selectValor = selectCoin.serie[0].valor; //Valor de la moneda seleccionada
            
            if (valorCLP > 0){
                const conversion = (valorCLP / selectValor).toFixed(2);
                answer.innerText = `${selectCoin.codigo === 'euro' ? '€' : '$'} ${conversion}`;
                renderGrafic();
            };
        };
    } catch (error) {
        window.alert('Ingresa un número válido');
    };
};

//-------------------------------------------------------------

//Grafico

//Consigue los datos de la API

async function getCreatDataChart() {
    const tipodeGrafica = 'line';
    const titulo = 'Historial de Valor';
    const colorDeLinea = 'red';
    const conversion = await monedaSelec();
    
    const valores = await conversion.serie.map(moneda => moneda.valor);

    const dates = await conversion.serie.map(moneda => moneda.fecha);
    const typeDate = dates.map(date => date.slice(0, 10));

    const config = {
        type: tipodeGrafica,
        data: {
            labels: typeDate,
            datasets: [{
                label: titulo,
                backgroundColor: colorDeLinea,
                data: valores
            }
        ]
        }
    };
    return config;
};

async function renderGrafic() {
    //const monedas = await getMonedas();
    const config = await getCreatDataChart();
    const chartDOM = document.getElementById('myChart');
    
    if (myChart) {
        myChart.destroy();
    };
    myChart = new Chart(chartDOM, config);
};


/*
// Renderiza la gráfica

async function renderGrafic(){
    const optionSelect =document.getElementById('conversor').value;

    const data = await getCreatDataChart(endpoint, optionSelect);
    const config = {
        type: 'line',
        data,
    };

    const canvas = document.getElementById('myChart');
    canvas.style.backgroundColor = 'white';

    if (myChart) {
        myChart.destroy();
    };

    myChart = new Chart(canvas, config);
};
*/
renderResult(endpoint);