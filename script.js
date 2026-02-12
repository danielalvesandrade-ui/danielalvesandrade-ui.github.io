const fields = ['brutoInss', 'semIncidenciaInss', 'dependentes', 'pensaoAlimenticia', 'semIncidenciaIrrf', 'outrosDescontos'];
fields.forEach(id => {
    const el = document.getElementById(id);
    if(el) {
        el.addEventListener('input', calcular);
        el.addEventListener('blur', function() {
            if(this.value !== "") {
                this.id === 'dependentes' ? this.value = parseInt(this.value) || 0 : this.value = parseFloat(this.value).toFixed(2);
            }
        });
    }
});

document.getElementById('descInssAlvo').addEventListener('input', calcularReversoINSS);
let modoIndividual = false;

function formatar(v) { return v.toLocaleString('pt-br', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function abrirModalReverso() { document.getElementById('modalReverso').style.display = 'block'; }
function fecharModalReverso() { document.getElementById('modalReverso').style.display = 'none'; }

function toggleContribuinte() {
    modoIndividual = !modoIndividual;
    document.getElementById('btnContribuinte').classList.toggle('ativo');
    document.getElementById('passoCltInss').style.display = modoIndividual ? 'none' : 'block';
    document.getElementById('passoIndividualInss').style.display = modoIndividual ? 'block' : 'none';
    calcular();
}

function alternarTela() {
    const pRes = document.getElementById('painelResumo'), pMem = document.getElementById('painelMemoria'), btn = document.getElementById('btnExplica');
    if (pRes.style.display === "none") { pRes.style.display = "grid"; pMem.style.display = "none"; btn.classList.remove('ativo'); }
    else { pRes.style.display = "none"; pMem.style.display = "grid"; btn.classList.add('ativo'); }
    calcular();
}

function calcularReversoINSS() {
    const descontoAlvo = parseFloat(this.value) || 0;
    const sInss = parseFloat(document.getElementById('semIncidenciaInss').value) || 0;
    let bruto = 0, obs = "Informe o valor acima";
    if (descontoAlvo > 0) {
        if (modoIndividual) { bruto = (descontoAlvo / 0.11) + sInss; obs = descontoAlvo >= 988.07 ? "Atingiu o Teto" : "Baseado em 11%"; }
        else {
            if (descontoAlvo <= 121.58) bruto = (descontoAlvo / 0.075) + sInss;
            else if (descontoAlvo <= 237.03) bruto = ((descontoAlvo + 24.32) / 0.09) + sInss;
            else if (descontoAlvo <= 411.10) bruto = ((descontoAlvo + 111.41) / 0.12) + sInss;
            else { bruto = ((descontoAlvo + 198.49) / 0.14) + sInss; obs = descontoAlvo >= 988.07 ? "Atingiu o Teto" : "Faixa de 14%"; }
        }
    }
    document.getElementById('brutoReversoResultado').innerText = "R$ " + formatar(bruto);
    document.getElementById('obsReverso').innerText = obs;
}

function calcularValores(bruto) {
    const sInss = parseFloat(document.getElementById('semIncidenciaInss').value) || 0, nDep = parseInt(document.getElementById('dependentes').value) || 0;
    const pensao = parseFloat(document.getElementById('pensaoAlimenticia').value) || 0, sIrrf = parseFloat(document.getElementById('semIncidenciaIrrf').value) || 0, outros = parseFloat(document.getElementById('outrosDescontos').value) || 0;
    const bInss = Math.max(0, bruto - sInss);
    let vInss = 0, aI = 0, dI = 0;
    if (modoIndividual) { aI = 0.11; vInss = Math.min(bInss * 0.11, 988.07); }
    else {
        if (bInss <= 1621) { aI = 0.075; dI = 0; } else if (bInss <= 2902.84) { aI = 0.09; dI = 24.32; } else if (bInss <= 4354.27) { aI = 0.12; dI = 111.41; } else { aI = 0.14; dI = 198.49; }
        vInss = Math.min(988.07, Math.max(0, (bInss * aI) - dI));
    }
    const bCalcIrrf = Math.max(0, bruto - sIrrf), dLegal = vInss + (nDep * 189.59) + pensao, dUtil = Math.max(607.20, dLegal), bFinalI = Math.max(0, bCalcIrrf - dUtil);
    let aIr = 0, pIr = 0;
    if (bFinalI <= 2428.80) { aIr = 0; pIr = 0; } else if (bFinalI <= 2826.65) { aIr = 0.075; pIr = 182.16; } else if (bFinalI <= 3751.05) { aIr = 0.15; pIr = 394.16; } else if (bFinalI <= 4664.68) { aIr = 0.225; pIr = 675.49; } else { aIr = 0.275; pIr = 908.73; }
    const irParc = Math.max(0, (bFinalI * aIr) - pIr);
    let red = (bruto <= 5000) ? 312.89 : (bruto <= 7350) ? 978.62 - (0.133145 * bruto) : 0;
    const redE = Math.min(irParc, Math.max(0, red));
    return { vInss, vIrrf: irParc - redE, bInss, aI, dI, bCalcIrrf, dLegal, dUtil, bFinalI, aIr, pIr, redE, redC: red, pensao, outros, nDep, sIrrf, irParc };
}

function calcular() {
    const b = parseFloat(document.getElementById('brutoInss').value) || 0, r = calcularValores(b);
    document.getElementById('resBaseInss').innerText = "R$ " + formatar(r.bInss);
    document.getElementById('resAliqInss').innerText = modoIndividual ? "11.0%" : (r.aI * 100).toFixed(1) + "%";
    document.getElementById('resValorInss').innerText = "R$ " + formatar(r.vInss);
    document.getElementById('resBaseIrrf').innerText = "R$ " + formatar(r.bFinalI);
    document.getElementById('resDedUtil').innerText = "R$ " + formatar(r.dUtil);
    document.getElementById('resAliqIrrf').innerText = (r.aIr * 100).toFixed(1) + "%";
    document.getElementById('resBaseRed').innerText = "R$ " + formatar(b);
    document.getElementById('resValRed').innerText = "R$ " + formatar(r.redE);
    document.getElementById('resValorIrrf').innerText = "R$ " + formatar(r.vIrrf);
    document.getElementById('resSalBase').innerText = "R$ " + formatar(b);
    document.getElementById('resInssFinal').innerText = "R$ " + formatar(r.vInss);
    document.getElementById('resIrrfFinal').innerText = "R$ " + formatar(r.vIrrf);
    document.getElementById('resPensaoFinal').innerText = "R$ " + formatar(r.pensao);
    document.getElementById('resOutrosFinal').innerText = "R$ " + formatar(r.outros);
    document.getElementById('fLiquido').innerText = "R$ " + formatar(b - r.vInss - r.vIrrf - r.pensao - r.outros);

    // Destaque Tabelas
    ['f1','f2','f3','f4'].forEach(id => document.getElementById(id).classList.remove('faixa-ativa'));
    if (!modoIndividual) {
        if (r.bInss <= 1621) document.getElementById('f1').classList.add('faixa-ativa');
        else if (r.bInss <= 2902.84) document.getElementById('f2').classList.add('faixa-ativa');
        else if (r.bInss <= 4354.27) document.getElementById('f3').classList.add('faixa-ativa');
        else document.getElementById('f4').classList.add('faixa-ativa');
    }
    ['irf1','irf2','irf3','irf4','irf5'].forEach(id => document.getElementById(id).classList.remove('faixa-ativa'));
    if (r.bFinalI <= 2428.80) document.getElementById('irf1').classList.add('faixa-ativa');
    else if (r.bFinalI <= 2826.65) document.getElementById('irf2').classList.add('faixa-ativa');
    else if (r.bFinalI <= 3751.05) document.getElementById('irf3').classList.add('faixa-ativa');
    else if (r.bFinalI <= 4664.68) document.getElementById('irf4').classList.add('faixa-ativa');
    else document.getElementById('irf5').classList.add('faixa-ativa');

    // Memórias
    document.getElementById('m1').innerText = formatar(b); document.getElementById('m2').innerText = formatar(r.sIrrf); document.getElementById('m3').innerText = formatar(r.bInss);
    if (!modoIndividual) {
        document.getElementById('m4').innerText = formatar(r.bInss); document.getElementById('m5').innerText = (r.aI * 100).toFixed(1) + "%";
        const p = r.bInss * r.aI; document.getElementById('m6').innerText = formatar(p); document.getElementById('m7').innerText = formatar(p); document.getElementById('m8').innerText = formatar(r.dI); document.getElementById('m9').innerText = formatar(r.vInss);
    } else { document.getElementById('mi1').innerText = formatar(r.bInss); document.getElementById('mi2').innerText = formatar(r.vInss); }
    document.getElementById('mFinalInss').innerText = formatar(r.vInss);
    document.getElementById('ir1').innerText = formatar(b); document.getElementById('ir2').innerText = formatar(r.sIrrf); document.getElementById('ir3').innerText = formatar(r.bCalcIrrf);
    document.getElementById('irL1').innerText = formatar(r.vInss); document.getElementById('irL2').innerText = formatar(r.nDep * 189.59); document.getElementById('irL3').innerText = formatar(r.pensao); document.getElementById('irL4').innerText = formatar(r.dLegal); document.getElementById('irDedUtilExp').innerText = formatar(r.dUtil);
    document.getElementById('irB1').innerText = formatar(r.bCalcIrrf); document.getElementById('irB2').innerText = formatar(r.dUtil); document.getElementById('irB3').innerText = formatar(r.bFinalI);
    document.getElementById('irF1').innerText = formatar(r.bFinalI); document.getElementById('irF2').innerText = (r.aIr * 100).toFixed(1) + "%"; document.getElementById('irF3').innerText = formatar(r.irParc + r.pIr);
    document.getElementById('irD1').innerText = formatar(r.irParc + r.pIr); document.getElementById('irD2').innerText = formatar(r.pIr); document.getElementById('irD3').innerText = formatar(r.irParc);
    
    // ATUALIZAÇÃO DO 6º PASSO - REDUÇÃO ADICIONAL 2026
    const txtRed = document.getElementById('txtRegraReducao');
    if (b <= 5000) {
        txtRed.innerText = "Quando for até 5.000,00: o valor da redução é apenas para zerar o IRRF.";
    } else if (b <= 7350) {
        txtRed.innerHTML = `Condição de 5.000,01 a 7.350,00: <br> 978,62 - (0,133145 × Base Cálculo: ${formatar(b)}) = ${formatar(r.redC)}`;
    } else {
        txtRed.innerText = "Acima de 7.350,01: a partir deste valor não tem redução adicional.";
    }
    
    document.getElementById('redFinal').innerText = formatar(r.redE); 
    document.getElementById('mFinalIrrf').innerText = formatar(r.vIrrf);
}