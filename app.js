class Despesa {
    constructor(ano, mes, dia, tipo, descricao, valor) {
        Object.assign(this, { ano, mes, dia, tipo, descricao, valor });
    }

    validarDados() {
        // Retorna true apenas se todos os campos tiverem valor
        return Object.values(this).every(valor => valor !== undefined && valor !== '' && valor !== null);
    }
}

class Bd {
    constructor() {
        if (localStorage.getItem('id') === null) localStorage.setItem('id', 0);
    }

    getProximoId() {
        return parseInt(localStorage.getItem('id')) + 1;
    }

    gravar(d) {
        const id = this.getProximoId();
        localStorage.setItem(id, JSON.stringify(d));
        localStorage.setItem('id', id);
    }

    recuperarTodosRegistros() {
        const despesas = [];
        const id = localStorage.getItem('id');

        for (let i = 1; i <= id; i++) {
            const despesa = JSON.parse(localStorage.getItem(i));
            if (despesa) {
                despesa.id = i;
                despesas.push(despesa);
            }
        }
        return despesas;
    }

    pesquisar(filtro) {
        let despesas = this.recuperarTodosRegistros();
        // Filtra dinamicamente apenas os campos que foram preenchidos no formulário
        const campos = ['ano', 'mes', 'dia', 'tipo', 'descricao', 'valor'];
        campos.forEach(campo => {
            if (filtro[campo]) despesas = despesas.filter(d => d[campo] == filtro[campo]);
        });
        return despesas;
    }

    remover(id) { localStorage.removeItem(id); }
}

const bd = new Bd();

function cadastrarDespesa() {
    const campos = ['ano', 'mes', 'dia', 'tipo', 'descricao', 'valor'];
    const valores = campos.map(id => document.getElementById(id));
    const despesa = new Despesa(...valores.map(c => c.value));

    // Validação de Data Futura
    const hoje = new Date();
    const dataInvalida = parseInt(despesa.mes) > (hoje.getMonth() + 1) || 
                         (parseInt(despesa.mes) == (hoje.getMonth() + 1) && parseInt(despesa.dia) > hoje.getDate());

    if (dataInvalida) return exibirModal('Erro', 'Data futura não permitida!', 'btn-danger');

    if (despesa.validarDados()) {
        bd.gravar(despesa);
        exibirModal('Sucesso', 'Despesa cadastrada!', 'btn-success');
        valores.forEach((c, i) => i > 0 ? c.value = '' : null); // Limpa tudo exceto o Ano
    } else {
        exibirModal('Erro', 'Preencha todos os campos!', 'btn-danger');
    }
}

function exibirModal(titulo, conteudo, classeBtn) {
    document.getElementById('modal_titulo').innerHTML = titulo;
    document.getElementById('modal_titulo_div').className = `modal-header text-${classeBtn.replace('btn-', '')}`;
    document.getElementById('modal_conteudo').innerHTML = conteudo;
    const btn = document.getElementById('modal_btn');
    btn.innerHTML = 'Voltar';
    btn.className = `btn ${classeBtn}`;
    $('#modalRegistroDespesa').modal('show');
}

// Inicialização Única e Inteligente
window.onload = () => {
    const anoAtual = new Date().getFullYear();
    const campoAno = document.getElementById('ano');
    
    if (campoAno) {
        campoAno.innerHTML = `<option value="${anoAtual}">${anoAtual}</option>`;
        campoAno.value = anoAtual;
    }

    if (document.getElementById('listaDespesas')) carregaListaDespesas();
    if (typeof gerarGraficos === "function") gerarGraficos();
};

function carregaListaDespesas(despesas = [], filtro = false) {
    if (despesas.length === 0 && !filtro) despesas = bd.recuperarTodosRegistros();

    const tabela = document.getElementById('listaDespesas');
    tabela.innerHTML = '';

    const tipos = { 1: 'Alimentação', 2: 'Educação', 3: 'Lazer', 4: 'Saúde', 5: 'Transporte' };

    despesas.forEach(d => {
        const linha = tabela.insertRow();
        linha.insertCell(0).innerHTML = `${d.dia}/${d.mes}/${d.ano}`;
        linha.insertCell(1).innerHTML = tipos[d.tipo] || d.tipo;
        linha.insertCell(2).innerHTML = d.descricao;
        linha.insertCell(3).innerHTML = `R$ ${parseFloat(d.valor).toFixed(2)}`;

        const btn = document.createElement('button');
        btn.className = 'btn btn-danger btn-sm';
        btn.innerHTML = '<i class="fas fa-times"></i>';
        btn.onclick = () => { 
            bd.remover(d.id); 
            carregaListaDespesas(); 
        };
        linha.insertCell(4).append(btn);
    });

    // Linha de Totalizador
    const total = despesas.reduce((acc, d) => acc + parseFloat(d.valor), 0);
    const rowTotal = tabela.insertRow();
    rowTotal.className = 'table-secondary fw-bold';
    rowTotal.insertCell(0).innerHTML = 'TOTAL';
    rowTotal.insertCell(1); rowTotal.insertCell(2);
    rowTotal.insertCell(3).innerHTML = `R$ ${total.toFixed(2)}`;
    rowTotal.insertCell(4);
}