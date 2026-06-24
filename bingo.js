const INICIAL_STATE ={
    rodada: 0,
    numeroAtual: null,
    sorteados:[],
    premios:[]
};

let estado = {...INICIAL_STATE, sorteados:[], premios:[]};

const canal = new BroadcastChannel('bingo');

function sincronizar() {
    canal.postMessage(estado);
};

canal.onmessage = (evento) => {
    estado = evento.data;

    if(typeof renderizar === 'function') {
        renderizar();
    }
};

function getLetra(numero) {
    if (numero >= 1  && numero <= 15) return 'B';
    if (numero >= 16 && numero <= 30) return 'I';
    if (numero >= 31 && numero <= 45) return 'N';
    if (numero >= 46 && numero <= 60) return 'G';
    if (numero >= 61 && numero <= 75) return 'O';
    return '?';
};

function sortearNumero(numero) {
    numero = Number(numero);

    if (numero < 1 || numero > 75) {
        alert(`Numero inválido. Use entre 1 e 75.`);
        return;
    }

    estado.numeroAtual = { numero, letra: getLetra(numero) };
    estado.sorteados.push(numero);

    sincronizar();
    if(typeof renderizar === 'function') renderizar();
}

function removerNumero(numero) {
    numero = Number(numero);
    estado.sorteados = estado.sorteados.filter(function(n) { return n !== numero; });

    if (estado.numeroAtual && estado.numeroAtual.numero === numero) {
        const ultimo = estado.sorteados[estado.sorteados.length - 1];
        estado.numeroAtual = ultimo ? { numero: ultimo, letra: getLetra(ultimo) } : null;
    }

    sincronizar();
    if(typeof renderizar === 'function') renderizar();
}

function setRodada(valor) {
    estado.rodada = valor;
    sincronizar();
    if(typeof renderizar === 'function') renderizar();
}

function setPremio(lista) {
    estado.premios = lista;
    sincronizar();
    if(typeof renderizar === 'function') renderizar();
}

function resetar() {
    estado = {
        ...INICIAL_STATE,
        sorteados: [],
        premios: []
    };
    sincronizar();
    if(typeof renderizar === 'function') renderizar();
}