const RES_EXAMPLE_SCHEDULE = `
<div class="section_info">
    <table id="tblActuales" class="uk-width-1-1 accordion-tabla ui-accordion ui-widget ui-helper-reset" role="tablist">
        <thead>
            <tr>
                <th>Código</th>
                <th>Asignatura</th>
                <th>Sec</th>
                <th>Aula</th>
                <th>Lun</th>
                <th>Ma</th>
                <th>Mi</th>
                <th>Ju</th>
                <th>Vi</th>
                <th>Sa</th>
                <th>Calif</th>
                <th>Profesor</th>
                <th>Eval</th>
            </tr>
        </thead>
        <tbody class="title ui-accordion-header ui-helper-reset ui-state-default ui-corner-all ui-accordion-icons" role="tab" id="ui-accordion-tblActuales-header-0" aria-controls="ui-accordion-tblActuales-panel-0" aria-selected="false" aria-expanded="false" tabindex="0"><span class="ui-accordion-header-icon ui-icon ui-icon-triangle-1-e"></span>
            <tr class="header-tr">
                <td class="uk-text-center">IDS322</td>
                <td class="">MANTENIMIENTO DE SOFTWARE</td>
                <td class="uk-text-center">01</td>
                <td class="uk-text-center">VT1</td>
                <td class="uk-text-center">09/11</td>
                <td class="uk-text-center"> </td>
                <td class="uk-text-center">09/11</td>
                <td class="uk-text-center"> </td>
                <td class="uk-text-center"> </td>
                <td class="uk-text-center"> </td>
                <td class="uk-text-center"></td>
                <td>FRANCIA ODALIS MEJIA POLANCO</td>
                <td class="uk-text-center"><input type="checkbox" disabled=""></td>
            </tr>
            <tr class="header-tr">
                <td class="uk-text-center">IDS332</td>
                <td class="">PROYECTO FINAL DE INGENIERIA DE SOFTWARE II</td>
                <td class="uk-text-center">01</td>
                <td class="uk-text-center">GC204, VT1</td>
                <td class="uk-text-center"> </td>
                <td class="uk-text-center"> </td>
                <td class="uk-text-center">20/22</td>
                <td class="uk-text-center"> </td>
                <td class="uk-text-center">20/22</td>
                <td class="uk-text-center"> </td>
                <td class="uk-text-center"></td>
                <td>FRANCIA ODALIS MEJIA POLANCO</td>
                <td class="uk-text-center"><input type="checkbox" disabled=""></td>
            </tr>
            <tr class="header-tr">
                <td class="uk-text-center">INS348</td>
                <td class="">GOBERNABILIDAD DE TECNOLOGIA DE LA INFORMACION</td>
                <td class="uk-text-center">01</td>
                <td class="uk-text-center">DP203</td>
                <td class="uk-text-center"> </td>
                <td class="uk-text-center"> </td>
                <td class="uk-text-center"> </td>
                <td class="uk-text-center"> </td>
                <td class="uk-text-center"> </td>
                <td class="uk-text-center"> </td>
                <td class="uk-text-center"></td>
                <td>DAVID  ALEJANDRO JOA  MORALES</td>
                <td class="uk-text-center"><input type="checkbox" disabled=""></td>
            </tr>
        </tbody>
    </table>
</div>
`;

const RES_EXAMPLE_DISCRIM = `
<div class="content-header">
    <div class="uk-width-1-1">
        <h1 class="section-title light-bottom-border uk-margin-bottom-remove">Oferta Académica para el trimestre NOVIEMBRE 2019 - ENERO 2020</h1>
        <div class="parameter-container">
            <div class="parameter">
                <span>Asignatura</span>
                <input id="txtSearch" class="large-input no-border" sytle="color:#BCBCBC" type="text" name="txtSearch" placeholder="Introduzca el código o el nombre de la asignatura">
            </div>            

            <div class="parameter uk-margin-left">
                <button id="btnBuscarAsignatura" class="button-square no-border bg-black">Buscar</button>
            </div>          
        </div>
    </div>
</div>
`;

module.exports = {
    RES_EXAMPLE_SCHEDULE,
    RES_EXAMPLE_DISCRIM,
};
