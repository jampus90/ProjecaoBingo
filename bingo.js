const INICIAL_STATE ={
    rodada: 0,
    numeroAtual: null,
    sorteados:[],
    premios:[],
    tema: 'claro',
    horaInicio: null,
    preco: ''
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

    if (!estado.horaInicio) {
        estado.horaInicio = new Date().toISOString();
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

function setPreco(valor) {
    estado.preco = valor;
    sincronizar();
    if(typeof renderizar === 'function') renderizar();
}

function setTema(tema) {
    estado.tema = tema;
    sincronizar();
    if(typeof renderizar === 'function') renderizar();
}

function resetar() {
    if (estado.horaInicio) {
        registrarRodadaCSV({
            rodada: estado.rodada,
            horaInicio: estado.horaInicio,
            horaFim: new Date().toISOString()
        });
    }

    estado = {
        ...INICIAL_STATE,
        sorteados: [],
        premios: [],
        tema: estado.tema
    };
    sincronizar();
    if(typeof renderizar === 'function') renderizar();
}

// ── PERSISTÊNCIA DO HISTÓRICO DE RODADAS EM CSV ────────────────
// Usa a File System Access API para escrever direto numa pasta
// escolhida pelo operador (sem downloads repetidos). O handle da
// pasta é guardado no IndexedDB para ser reaproveitado entre sessões.

let pastaCSV = null;

function idbAbrirDB() {
    return new Promise(function(resolve, reject) {
        const req = indexedDB.open('bingoDB', 1);
        req.onupgradeneeded = function() { req.result.createObjectStore('handles'); };
        req.onsuccess = function() { resolve(req.result); };
        req.onerror = function() { reject(req.error); };
    });
}

async function idbSalvar(chave, valor) {
    const db = await idbAbrirDB();
    return new Promise(function(resolve, reject) {
        const tx = db.transaction('handles', 'readwrite');
        tx.objectStore('handles').put(valor, chave);
        tx.oncomplete = function() { resolve(); };
        tx.onerror = function() { reject(tx.error); };
    });
}

async function idbLer(chave) {
    const db = await idbAbrirDB();
    return new Promise(function(resolve, reject) {
        const tx = db.transaction('handles', 'readonly');
        const req = tx.objectStore('handles').get(chave);
        req.onsuccess = function() { resolve(req.result); };
        req.onerror = function() { reject(req.error); };
    });
}

async function selecionarPastaCSV() {
    if (!window.showDirectoryPicker) {
        alert('Seu navegador não suporta salvar arquivos em pasta local. Use Chrome ou Edge.');
        return false;
    }

    try {
        pastaCSV = await window.showDirectoryPicker();
        await idbSalvar('pastaCSV', pastaCSV);
        return true;
    } catch (erro) {
        console.warn('Seleção de pasta cancelada.', erro);
        return false;
    }
}

async function restaurarPastaCSV() {
    if (!window.showDirectoryPicker) return false;

    try {
        const handle = await idbLer('pastaCSV');
        if (!handle) return false;

        const permissao = await handle.queryPermission({ mode: 'readwrite' });
        if (permissao === 'granted') {
            pastaCSV = handle;
            return true;
        }
    } catch (erro) {
        console.warn('Não foi possível restaurar a pasta do histórico.', erro);
    }

    return false;
}

async function registrarRodadaCSV(registro) {
    if (!pastaCSV) return;

    try {
        const arquivoHandle = await pastaCSV.getFileHandle('historico_rodadas.csv', { create: true });
        const arquivo = await arquivoHandle.getFile();
        let conteudo = await arquivo.text();

        if (!conteudo) {
            conteudo = 'rodada,hora_inicio,hora_fim\n';
        }

        conteudo += registro.rodada + ',' + registro.horaInicio + ',' + registro.horaFim + '\n';

        const writable = await arquivoHandle.createWritable();
        await writable.write(conteudo);
        await writable.close();
    } catch (erro) {
        console.error('Erro ao salvar histórico em CSV.', erro);
    }
}