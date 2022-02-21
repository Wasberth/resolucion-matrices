const operations = require('./operations');

function diagonalize(m) {

    for (let ec = 0; ec < m.mc.nEc - 1; ec++) {
        pivot = chooseRow(m, ec);

        if (pivot === -1) { continue; }

        if (pivot !== ec) { m.shiftRows(ec, pivot); }

        for (let affEc = ec + 1; affEc < m.mc.nEc; affEc++) {
            if (m.mc.matrix[ec][ec] === 0 || m.mc.matrix[affEc][ec] === 0) { continue; }
            let ecCoeff = m.mc.matrix[ec][ec];
            let affEcCoeff = m.mc.matrix[affEc][ec];
            cLcm = operations.lcm(affEcCoeff, ecCoeff);

            affEcCoeff = cLcm / affEcCoeff;
            ecCoeff = cLcm / ecCoeff;

            m.subtractRows(affEc, affEcCoeff, ec, ecCoeff);
        }
        m.appendStepValidate();
        m.simplify();
    }

    let hasSolutions = m.calculateStatus();

    if (!hasSolutions) {
        m.msg = "El sistema no tiene ecuaciones";
        return;
    }

    for (let ec = m.mc.nEc - 1; ec >= 1; ec--) {

        for (let affEc = ec - 1; affEc >= 0; affEc--) {
            if (m.mc.matrix[ec][ec] === 0 || m.mc.matrix[affEc][ec] === 0) { continue; }
            let ecCoeff = m.mc.matrix[ec][ec];
            let affEcCoeff = m.mc.matrix[affEc][ec];
            cLcm = operations.lcm(affEcCoeff, ecCoeff);

            affEcCoeff = cLcm / affEcCoeff;
            ecCoeff = cLcm / ecCoeff;

            m.subtractRows(affEc, affEcCoeff, ec, ecCoeff);
        }
        m.appendStepValidate();
        m.simplify();
    }

    hasSolutions--;

    if (!hasSolutions) {
        let aMsg = "El sistema tiene infinitas soluciones, representadas de la siguiente manera:<br>";

        for (let ec = 0; ec < m.mc.nEc; ec++) {
            aMsg = aMsg + `x<sub>${ec + 1}</sub>&nbsp;=&nbsp;(&nbsp;${m.mc.matrix[ec][m.mc.nVar]}&nbsp;`;
            const freeVarQ = m.mc.nVar - m.mc.nEc + 1;
            let i = 1;
            for (let freeVar = m.mc.nVar - 1; freeVar >= freeVarQ; freeVar--) {
                let varVal = m.mc.matrix[ec][freeVar] * (-1);
                if (varVal === 0) { console.log(`Aparently ${varVal} === 0`); continue; }
                aMsg = aMsg + `${varVal < 0 ? "-":"+"}&nbsp;${Math.abs(varVal) != 1? Math.abs(varVal) : ""}&lambda;<sub>${i}</sub>&nbsp;`;
                i++;
            }
            aMsg = aMsg + `)&nbsp;/&nbsp;${m.mc.matrix[ec][ec]}<br>`;
        }

        let j = m.mc.nVar - m.mc.nEc;
        for (let missVar = m.mc.nEc; missVar < m.mc.nVar; missVar++) {
            aMsg = aMsg + `x<sub>${missVar + 1}</sub>&nbsp;=&nbsp;&lambda;<sub>${j}</sub><br>`;
            j--;
        }

        m.msg = aMsg;

        return;
    }

    let bMsg = "El sistema tiene una única solución:<br>";

    for (let ec = 0; ec < m.mc.nEc; ec++) {
        let numerator = m.mc.matrix[ec][m.mc.nVar];
        let denominator = m.mc.matrix[ec][ec];

        bMsg = bMsg + `x<sub>${ec + 1}</sub>&nbsp;=&nbsp;${numerator}&nbsp;/&nbsp;${denominator} = ${numerator / denominator}<br>`;
    }

    m.msg = bMsg;

}

function chooseRow(m, index) {
    let row = -1;
    let prev = undefined;
    for (let i = index; i < m.mc.nEc; i++) {
        if (m.mc.matrix[i][index] === 0) { continue; }

        if (typeof prev === 'undefined') {
            prev = m.mc.matrix[i][index];
            row = i;
            continue;
        }

        let sm = operations.smallerAbs(m.mc.matrix[i][index], prev);

        if (sm !== prev) {
            prev = m.mc.matrix[i][index];
            row = i;
        }

    }

    return row;
}

module.exports.diagonalize = diagonalize;