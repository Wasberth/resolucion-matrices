function editForm() {
    let ecuations = document.getElementById("form-ecuation-n").value; // NUMBER OF ECUATIONS
    let variables = document.getElementById("form-variable-n").value; // NUMBER OF VARIABLES

    // FORM FOR SYSTEM INPUT
    let html = `<form action="calculate" method="post">` +
        `<input name="n-ec" type="hidden" value="${ecuations}">` + // HIDDEN N-EC & N-VAR
        `<input name="n-var" type="hidden" value="${variables}">`;

    for (let i = 0; i < ecuations; i++) {
        html = html + `<div class="input-group mb-3">`;
        for (let j = 0; j < variables; j++) {
            let t = "";
            let l = "";

            if (j != 0) { // IF NOT THE FIRST VAR IN i EC
                t = `<span class="input-group-text" id="label-var-${i}-${j}">x<sub>${j}</sub>&nbsp;+ </span>` // X_j +
                l = `aria-describedby="label-var-${i}-${j}"`; // ASSOCIATE INPUT WITH DESC
            };

            html = html + t +
                `<input name="var-${i}-${j}" type="number" step="0.01" class="form-control" value="0" ${l}>`; // INPUT FOR j VAR IN i EC
        }
        html = html + // RES FOR i EC
            `<span class="input-group-text" id="label-res-${i}">x<sub>${variables}</sub>&nbsp;=</span>` +
            `<input name="res-${i}" type="number" class="form-control" value="0" aria-describedby="label-res-${i}">` +
            `</div>`;
    }

    html = html + `<input class="btn btn-primary" type="submit" value="Calcular">` + // CALCULATE BUTTON
        "</form>";

    document.getElementById("form-container").innerHTML = html; //APPEND

    return false;
};

document.addEventListener("DOMContentLoaded", function() {
    editForm();
});