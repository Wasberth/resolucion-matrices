const { range } = require('express/lib/request');
const operations = require('./operations');

function shiftRows(mc, row1, row2) {
    for (let i = 0; i < mc.nVar + 1; i++) {
        let temp = mc.matrix[row1][i];
        mc.matrix[row1][i] = mc.matrix[row2][i];
        mc.matrix[row2][i] = temp;
    }
}

function subtractRows(mc, affRow, affRowCoeff, subRow, subRowCoeff) {
    for (let i = 0; i < mc.nVar + 1; i++) {
        mc.matrix[affRow][i] = (affRowCoeff * mc.matrix[affRow][i]) -
            (subRowCoeff * mc.matrix[subRow][i]);
    }
}

function multiplyRow(mc, row, coeff) {
    for (let i = 0; i < mc.nVar + 1; i++) {
        mc.matrix[row][i] = coeff * mc.matrix[row][i];
    }
}

function validateJSON(json) {
    console.log(json);
    let nEc = json['n-ec']; // Number of ecuations
    let nVar = json['n-var']; // Number of variables

    if (typeof nEc === 'undefined' || typeof nVar === 'undefined' ||
        isNaN(nEc) || isNaN(nVar)) { // IF N-EC & N-VAR IS VALID NUMBER
        return { isCorrect: false };
    }
    nEc = Number(nEc);
    nVar = Number(nVar);

    let estmLength = nEc * nVar + (nEc + 2); // ESTIMATED LENGTH
    let keys = Object.keys(json);
    if (keys.length != estmLength) {
        return { isCorrect: false };
    }

    let matrix = Array(nEc).fill().map(() => Array(nVar + 1).fill()); // INIT ARRAY WITH undefined

    for (let i = 0; i < nEc; i++) {
        for (let j = 0; j < nVar; j++) {
            let currentVar = json[`var-${i}-${j}`];
            if (typeof currentVar === 'undefined' || isNaN(currentVar)) { // IF j-i VAR IS VALID NUMBER
                return { isCorrect: false };
            };

            matrix[i][j] = Number(currentVar);
        }

        let currentRes = json[`res-${i}`];
        if (typeof currentRes === 'undefined' || isNaN(currentRes)) { // IF i RES IS VALID NUMBER
            return { isCorrect: false };
        };
        matrix[i][nVar] = Number(currentRes);
    }

    return {
        isCorrect: true,
        mc: { nEc: nEc, nVar: nVar, matrix: matrix },
        t: "",
        msg: "",
        getOriginalEcuation: function() {
                let oEc = "";
                for (let i = 0; i < Number(json[`n-ec`]); i++) {
                    let cEc = "";
                    let passed = false;
                    for (let j = 0; j < Number(this.mc.nVar); j++) {
                        if (Number(json[`var-${i}-${j}`]) === 0) {
                            continue;
                        }
                        if (!passed) {
                            let sCoeff = json[`var-${i}-${j}`];
                            sCoeff = sCoeff === '1' ? "" : sCoeff;
                            sCoeff = sCoeff === '-1' ? "-" : sCoeff;

                            cEc = cEc + `${sCoeff}x<sub>${j + 1}</sub>`
                            passed = true;
                            continue;
                        }

                        cEc = cEc + `&nbsp;${Number(json[`var-${i}-${j}`]) < 0 ? "-" : "+"}&nbsp;`;
                    cEc = cEc + `${Math.abs(Number(json[`var-${i}-${j}`])) !== 1? Math.abs(Number(json[`var-${i}-${j}`])) : ""}x<sub>${j + 1}</sub>`;
                }
                if (cEc === "") {
                    oEc = oEc + "0 = ";
                }
                oEc = oEc + cEc + `&nbsp;=&nbsp;${json[`res-${i}`]}<br>`;
            }

            return oEc;
        },

        shiftRows: function(rowA, rowB) {
            //this.appendStep();
            shiftRows(this.mc, rowA, rowB);
            this.addT(`F<sub>${rowA + 1}</sub>&nbsp;&harr;&nbsp;F<sub>${rowB + 1}</sub><br>`);
            this.appendStep();
        },
        subtractRows: function(affRow, affRowCoeff, subRow, subRowCoeff) {
            //this.appendStep();
            subtractRows(this.mc, affRow, affRowCoeff, subRow, subRowCoeff);
            this.addT(`${affRowCoeff != 1? affRowCoeff : ""}F<sub>${affRow + 1}</sub>&nbsp;${subRowCoeff < 0 ? "+":"-"}&nbsp;${Math.abs(subRowCoeff) != 1? Math.abs(subRowCoeff) : ""}F<sub>${subRow + 1}</sub>&nbsp;&rarr;&nbsp;F<sub>${affRow + 1}</sub><br>`);
        },
        multiplyRow: function(row, coeff) {
            //this.appendStep();
            multiplyRow(this.mc, row, coeff);
            this.addT(`${coeff}F<sub>${row + 1}</sub>&nbsp;&rarr;&nbsp;F<sub>${row + 1}</sub><br>`);
        },
        simplify: function() {
            //let appended = false;
            for (let ec = 0; ec < this.mc.nEc; ec++) {
                let cGcd = this.mc.matrix[ec][0];

                for (let i = 1; i < this.mc.nVar + 1; i++) {
                    cGcd = operations.gcd(cGcd, this.mc.matrix[ec][i]);
                }

                if (typeof cGcd === 'undefined' || cGcd === 0) {
                    this.addT(`Se borró la F<sub>${ec + 1}</sub><br>`);

                    this.mc.matrix.splice(ec, 1);
                    this.mc.nEc--;
                    ec--;

                    this.appendStep();
                    continue;
                }

                cGcd = Math.abs(cGcd);

                if (cGcd === 1) continue;
                /*if (!appended) {
                    this.appendStep();
                    appended = true;
                };*/

                for (let i = 0; i < this.mc.nVar + 1; i++) {
                    this.mc.matrix[ec][i] = this.mc.matrix[ec][i] / cGcd;
                }
                this.addT(`F<sub>${ec + 1}</sub>&nbsp;/&nbsp;${cGcd}&nbsp;&rarr;&nbsp;F<sub>${ec + 1}</sub><br>`);
            }
            if (this.t !== "") {
                this.appendStep();
            }
        },
        calculateStatus: function() {
            let rangeMatrix = 0;
            let rangeAumMatrix = this.mc.nEc;
            for (let i = 0; i < this.mc.nEc; i++) {
                let matIsCero = false;

                for (let j = 0; j < this.mc.nVar && !matIsCero; j++) {
                    matIsCero = this.mc.matrix[i][j] !== 0;
                }

                if (matIsCero) { rangeMatrix++; }
            }

            if (rangeMatrix !== rangeAumMatrix) {
                this.addT(`Calculando el rango:<br> R(M) = ${rangeMatrix} &ne; R(M*) = ${rangeAumMatrix}`);
                this.appendT(false);
                return 0;
            }
            if (rangeMatrix === rangeAumMatrix && rangeAumMatrix < this.mc.nVar) {
                this.addT(`Calculando el rango:<br> R(M) = R(M*) = ${rangeMatrix} < #inc = ${this.mc.nVar}`);
                this.appendStep(false);
                return 1;
            }
            this.addT(`Calculando el rango:<br> R(M) = R(M*) = #inc = ${rangeMatrix}`);
            this.appendStep(false);
            return 2;
        },

        addT: function(t) {
            this.t = this.t + t;
        },
        appendT: function(appendArrow = true) {
            if (this.t === "") { return; }

            this.appendedHtml = this.appendedHtml +
                `<div class="col" style="text-align: center; margin-top: 1rem;">` + this.t +
                `${appendArrow? "&rarr;":""}</div>`;
            this.t = "";
        },
        appendStep: function(appendArrow = true) {
            this.appendT(appendArrow);

            this.appendedHtml = this.appendedHtml +
                `<div class="col" style="margin-top: 1rem;">` +
                `   <table class="matrix-container">` +
                `       <tbody class="matrix" align="center">`;
            for (let i = 0; i < this.mc.nEc; i++) {

                this.appendedHtml = this.appendedHtml +
                    `<tr>`;

                for (let j = 0; j < this.mc.nVar + 1; j++) {
                    this.appendedHtml = this.appendedHtml +
                        `<td style="padding-left:5px; padding-right:5px">${this.mc.matrix[i][j]}</td>`;
                }

                this.appendedHtml = this.appendedHtml +
                    `</tr>`;
            }

            this.appendedHtml = this.appendedHtml +
                `       </tbody>` +
                `   </table>` +
                `</div>`;
        },
        appendStepValidate: function() {
            if (this.t === "") { return; }
            this.appendStep();
        },

        appendedHtml: "",
        getHtml: function() {
            html =
                `<!DOCTYPE html>
                <html lang="es">
                
                <head>
                    <meta charset="UTF-8">
                    <meta http-equiv="X-UA-Compatible" content="IE=edge">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                
                    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-ka7Sk0Gln4gmtz2MlQnikT1wXgYsOg+OMhuP+IlRH9sENBO0LRn5q+8nbTov4+1p" crossorigin="anonymous"></script>
                    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous">
                
                    <link rel="stylesheet" href="css/matrix.css">
                
                    <title>Document</title>
                </head>
                
                <body>
                
                    <div class="container" style="margin-top: 1rem;">
                
                        <div class="row">
                            <h2>Respuesta</h2>
                            <p>Resolviendo:<br>${this.getOriginalEcuation()}</p>
                            <p>${this.msg}</p>
                        </div>
                
                        <div class="row row-cols-auto">` +
                this.appendedHtml +
                `        </div>
                    </div>
                </body>
            
                </html>`;

            return html;
        }
    };

}

module.exports.CreateIfValid = validateJSON;