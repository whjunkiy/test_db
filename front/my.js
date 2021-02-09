let tables = [];
let col = 1;
let curTbl = null;
$('#exampleModal').on('show.bs.modal', function (event) {
    const button = $(event.relatedTarget) // Button that triggered the modal
    const recipient = button.data('whatever') // Extract info from data-* attributes

    if (recipient === "newTable") {
        $("#newTableDiv").css('display', 'block');
        $("#newDataDiv").css('display', 'none');
    } else {
        $("#newTableDiv").css('display', 'none');
        $("#newDataDiv").css('display', 'block');
        $("#colDataDiv").html('');
        $("#THS th").each((i,e)=>{
            $("#colDataDiv").append('<label for="coldata-'+i+'" class="col-form-label">'+$(e).html()+':</label>\n' +
                '<div id="coldata-'+i+'"><input type="text" class="form-control" id="coldatainput-'+i+'"></div>');
        });
    }
});

async function addNewTableData(event) {
    event.preventDefault();
    $("#blockingDiv").fadeIn(1);
    let data = [];
    $("input[id*=coldatainput-]").each((i,e)=>{
        data.push($(e).val());
    });
    let q = {act: "addTableData", table: curTbl, data: data};
    await makeRequest(q);
    let html = '<tr>';
    for (let j in data) {
        html += '<td>'+data[j]+'</td>';
    }
    html += '</tr>';
    $("#tBody").append(html);
    $("#blockingDiv").fadeOut(1);
}

async function createNewTable(event) {
    event.preventDefault();
    $("#blockingDiv").fadeIn(1);
    let tn = $("#table-name").val();
    $("#table-name").val('');
    let cols = [];
    $("input[id*=column-]").each((i,e)=>{
        if ($(e).val().trim().length) {
            cols.push($(e).val());
        }
        let id = $(e).attr('id').replace( /^\D+/g, '');
        if (id != 1) {
            $("#col-"+id).remove();
        }
    });
    $("#column-1").val('');
    col = 1;
    $("#blockingDiv").fadeOut(1);
    let q = {act: "createTable", name: tn, cols: cols};
    tables = await makeRequest(q);
    tables = JSON.parse(tables)
    tables = tables['data'];
    remakeTables();
    $("#blockingDiv").fadeOut(1);
}

function remakeTables() {
    $("#tablesUl").html('');
    for (let i in tables) {
        $("#tablesUl").append('<li id="tbl_' + i + '"><a href="" onclick="event.preventDefault();">'+tables[i]+'</a></li>');
        $("#tbl_" + i).click(e=>{
            showTable(i);
        });
    }
}

function addCol() {
    col++;
    $("#colGroupDiv").append('<div style="margin-top: 5px;" id="col-'+col+'"><input type="text" class="form-control" id="column-'+col+'"></div>');
}

async function initState(){
    $("#tablesUl").html('');
    $("#THS").html('');
    $("#tBody").html('');
    $("#addDataBtn").fadeOut(1);
    $("#tableH1").fadeOut(1);
    $("#blockingDiv").fadeIn(1);
    const q = {act: "getTables"};
    try {
        tables = await makeRequest(q);
        tables = JSON.parse(tables)
        tables = tables['data'];
        remakeTables();
    } catch (e) {
        console.log(e);
    }
    $("#blockingDiv").fadeOut(1);
}

async function showTable(id) {
    $("#blockingDiv").fadeIn(1);
    $("li[id*=tbl_]").each((i,e)=>{
        $(e).removeClass('active');
    });
    $("#tbl_"+id).addClass("active");
    curTbl = tables[id];
    const q = {act: "getTableData", table: tables[id]};
    $("#tableH1").html(tables[id]);
    try {
        let data = await makeRequest(q);
        data = JSON.parse(data)
        data = data['data'];
        showData(data);
    } catch (e) {
        console.log(e);
    }
    $("#blockingDiv").fadeOut(1);
}

function showData(data) {
    $("#THS").html('');
    for (let i in data['cols']) {
        $("#THS").append('<th>'+data['cols'][i]+'</th>');
    }
    $("#tBody").html('');
    let html = '';
    for (let i in data['data']) {
        html += '<tr>';
        for (let j in data['data'][i]) {
            html += '<td>'+data['data'][i][j]+'</td>';
        }
        html += '</tr>';
    }
    $("#tBody").html(html);
    $("#addDataBtn").fadeIn(1);
    $("#tableH1").fadeIn(1);
}

async function makeRequest(q) {
    return $.ajax({
        method: "POST",
        url: "api.php",
        data: JSON.stringify(q),
        contentType: "application/json; charset=utf-8",
    }).done( msg => {
        try {
            msg = JSON.parse(msg);
            if (msg.status === "error") {
                alert(msg.data);
                return new Error(msg.data);
            } else {
                return msg;
            }
        } catch (e) {
            alert("ERROR 500");
            return false;
        }
    }).fail(function( jqXHR, textStatus ) {
        alert( "Request failed: " + textStatus );
        return new Error(textStatus);
    })
}
initState();