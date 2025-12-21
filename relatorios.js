const nomesCategorias = {
    '1': 'Alimentação',
    '2': 'Educação',
    '3': 'Lazer',
    '4': 'Saúde',
    '5': 'Transporte'
};

function gerarGraficos() {
    let despesas = bd.recuperarTodosRegistros();
    
    let totaisPorCategoria = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
    let totalGeral = 0;

    despesas.forEach(d => {
        let valor = parseFloat(d.valor);
        totaisPorCategoria[d.tipo] += valor;
        totalGeral += valor;
    });

    // --- LÓGICA PARA IDENTIFICAR A MAIOR CATEGORIA ---
    let maiorValor = 0;
    let idMaiorCategoria = "-";

    for (let id in totaisPorCategoria) {
        if (totaisPorCategoria[id] > maiorValor) {
            maiorValor = totaisPorCategoria[id];
            idMaiorCategoria = id;
        }
    }

    // Atualiza os Cards no HTML
    document.getElementById('totalGeral').innerText = `R$ ${totalGeral.toFixed(2)}`;
    
    // Verifica se existe alguma despesa antes de exibir o nome
    if (maiorValor > 0) {
        document.getElementById('maiorCategoria').innerText = nomesCategorias[idMaiorCategoria];
    } else {
        document.getElementById('maiorCategoria').innerText = "Nenhuma";
    }

    // --- RENDERIZAÇÃO DOS GRÁFICOS (Chart.js) ---
    renderizarGraficoPizza(totaisPorCategoria);
    renderizarGraficoBarras(despesas);
}

// Funções auxiliares para manter o código limpo
function renderizarGraficoPizza(totais) {
    const ctxPizza = document.getElementById('graficoPizza').getContext('2d');
    
    // Destrói o gráfico anterior se ele já existir (evita sobreposição ao recarregar)
    if (window.meuGraficoPizza) {
        window.meuGraficoPizza.destroy();
    }

    window.meuGraficoPizza = new Chart(ctxPizza, {
        type: 'doughnut',
        data: {
            labels: Object.values(nomesCategorias),
            datasets: [{
                data: Object.values(totais),
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
            }]
        },
        options: {
            plugins: {
                tooltip: {
                    callbacks: {
                        // Esta função adiciona o R$ no balão que aparece ao passar o mouse
                        label: function(context) {
                            let label = context.label || '';
                            let valor = context.parsed || 0;
                            return `${label}: R$ ${valor.toFixed(2)}`;
                        }
                    }
                }
            }
        }
    });
}

function renderizarGraficoBarras(despesas) {
    let mensal = new Array(12).fill(0);
    despesas.forEach(d => {
        let mesIndex = parseInt(d.mes) - 1;
        if(mesIndex >= 0 && mesIndex < 12) {
            mensal[mesIndex] += parseFloat(d.valor);
        }
    });

    const ctxBarras = document.getElementById('graficoBarras').getContext('2d');
    new Chart(ctxBarras, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
            datasets: [{
                label: 'Total por Mês',
                data: mensal,
                backgroundColor: '#36A2EB'
            }]
        }
    });
}

window.onload = function() {
    gerarGraficos();
};