// Constantes
const baseUrl = "/api/descuentos";

// Selectores Inputs
const fechaRegistro = $("#fechaRegistro");
const articulos = $("#articulos");
const almacenes = $("#almacenes");
const razonSocial = $("#razonSocial");
const razonSocialText = $("#razonSocialText")
const perOrVal = $("#perOrVal");
const porcentajeProveedor = $("#porcentajeProveedor");
const porcentajeColanta = $("#porcentajeColanta");
const valorDescuento = $("#valorDescuento");
const lblperOrVal = document.querySelector("#lblperOrVal");

articulos.multiselect({
    search: true,
    selectAll: true,
    texts: {
        placeholder: "SELECCIONAR ARTICULOS",
        search: "Buscar artículo",
    },
});

almacenes.multiselect({
    search: true,
    selectAll: true,
    texts: {
        placeholder: "SELECCIONAR ALMACENES",
        search: "Buscar almacén",
    },
});

// Eventos
razonSocialText.on('change', function () {
    $("#cedNit").val(this.value);
    razonSocial.val($("#razonSocialText option:selected").text());
    obtenerArticulosPorId(this.value);
});

perOrVal.change(function () {
    if (this.checked) {
        porcentajeProveedor.val(0);
        porcentajeProveedor.prop("disabled", true);
        porcentajeColanta.val(0);
        porcentajeColanta.prop("disabled", true);
        valorDescuento.prop("disabled", false);
        return;
    }
    porcentajeProveedor.prop("disabled", false);
    porcentajeColanta.prop("disabled", false);
    valorDescuento.prop("disabled", true);
    porcentajeProveedor.val(10);
    porcentajeColanta.val(5);
    valorDescuento.val(0);
});

// Asignación a variables
$(function () {
    // Asignación/Cargar datos a inputs
    fechaRegistro.val(moment().format("YYYY-MM-DD"));
    obtenerProveedores();
    obtenerAlmacenes();
    //obtenerArticulos();
});

async function obtenerProveedores() {
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        dataType: "JSON",
        url: "Proveedores",
        error: function (jqXHR, thrownError) {
            //alert(jqXHR.status);
            //alert(thrownError);
            toast("error", "No se pudieron cargar los proveedores");
        }
    }).done(function (data) {
        //alert("Data Saved: " + msg);
        var defaultValuie = { id: "", text: '--Seleccione un proveedor--' };
        data.unshift(defaultValuie);
        $("#razonSocialText").select2({
            theme: "bootstrap-5",
            selectionCssClass: "select2--small",
            dropdownCssClass: "select2--small",
            data: data
        });
    }).fail((jqXHR, errorMsg) => {
        //alert(jqXHR.responseText, errorMsg)
        toast("error", "No se pudieron cargar los proveedores");
    });
}

async function obtenerArticulosPorId(id) {
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        dataType: "JSON",
        url: "ObtenerArticulosPorId",
        data: { id: id },
        error: function (jqXHR, thrownError) {
            toast("error", "No se pudieron cargar los artículos");
        }
    }).done(function (data) {
        if (data.length < 1) {
            toast("info", "No se encontraron artículos para el proveedor");
        }

        articulos.multiselect("loadOptions", data);
    }).fail((jqXHR, errorMsg) => {
        toast("error", "No se pudieron cargar los artículos");
    });
}

async function obtenerAlmacenes() {
    const respuesta = await fetch(`${baseUrl}/almacenes`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!respuesta.ok) {
        toast("error", "No se pudieron cargar los almacenes");
        return;
    }

    const json = await respuesta.json();
    almacenes.multiselect("loadOptions", json);
}

async function obtenerArticulos() {
    const respuesta = await fetch(`${baseUrl}/articulos`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!respuesta.ok) {
        toast("error", "No se pudieron cargar los artículos");
        return;
    }

    const json = await respuesta.json();
    articulos.multiselect("loadOptions", json);
}

// Validación Formulario
// Métodos personalizados
jQuery.validator.addMethod(
    "valitDate",
    function (value, element) {
        return (
            this.optional(element) ||
            /([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/.test(value)
        );
    },
    "La fecha debe tener el formato yyyy-MM-dd"
);

jQuery.validator.addMethod("greaterThan", function (value, element) {
    var dateFrom = $("#fechaInicioDescuento").val();
    var dateTo = $("#fechaFinalDescuento").val();

    return dateTo >= dateFrom;
});

jQuery.validator.addMethod("numberGreaterThan", function (value, element) {
    var From = $("#cantidadMinima").val();
    var To = $("#cantidadMaxima").val();

    return To >= From;
});

jQuery.validator.addMethod("goeThanToday", function (value, element) {
    var CurrentDate = new Date().toLocaleDateString("fr-CA");

    return value >= CurrentDate;
});

jQuery.validator.addMethod("isNatural", function (value, element) {
    return this.optional(element) || /^[0-9][0-9]*$/.test(value);
}, 'El valor debe ser un número entero positivo');

jQuery.validator.addMethod("isMoney", function (value, element) {
    return this.optional(element) || /(^\d*\.?\d*[0-9]+\d*$)|(^[0-9]+\d*\.\d*$)/.test(value);
}, 'El valor debe ser un decimal positivo');

jQuery.validator.addMethod("limitDiscount", function (value, element) {
    var porcentajeColanta = parseInt($("#porcentajeColanta").val());
    var porcentajeProveedor = parseInt($("#porcentajeProveedor").val());

    return porcentajeColanta + porcentajeProveedor <= 100; 
});

$("#formDescuentoCrear").validate({
    ignore: [],

    rules: {
        articulos: {
            required: true,
        },
        almacenes: {
            required: true,
        },
        fechaInicioDescuento: {
            required: true,
            valitDate: true,
            goeThanToday: true,
        },
        fechaFinalDescuento: {
            required: true,
            valitDate: true,
            greaterThan: true,
        },
        observacionesSolicitante: {
            maxlength: 100,
        },
        cantidadMinima: {
            isNatural: true,
            min: 0,
        },
        cantidadMaxima: {
            isNatural: true,
            min: 0,
            numberGreaterThan: true,
        },
        valorDescuento: {
            isMoney: true,
        },
        porcentajeProveedor: {
            isNatural: true,
            min: 0,
            max: 100,
        },
        porcentajeProveedor: {
            isNatural: true,
            min: 0,
            max: 100,
            limitDiscount: true,
        },
        porcentajeColanta: {
            isNatural: true,
            min: 0,
            max: 100,
        },
    },

    messages: {
        articulos: {
            required: "Debe seleccionar al menos un articulo",
        },
        almacenes: {
            required: "Debe seleccionar al menos un almacén",
        },
        fechaInicioDescuento: {
            required: "La fecha de inicio es requerida",
            goeThanToday: "La fecha debe ser mayor o igual a la fecha actual",
        },
        fechaFinalDescuento: {
            required: "La fecha final es requerida",
            greaterThan: "La fecha debe ser mayor o igual a la del inicio",
        },
        observacionesSolicitante: {
            maxlength: "El tamaño máximo del texto es de 100 caracteres",
        },
        cantidadMinima: {
            min: "El valor debe ser mayor o igual a 0",
        },
        cantidadMaxima: {
            min: "El valor debe ser mayor o igual a 0",
            numberGreaterThan: "El valor debe ser mayor o igual a la cantidad mínima"
        },
        porcentajeProveedor: {
            min: "El valor debe ser mayor o igual a 0",
            max: "El valor debe ser menor o igual a 100",
            limitDiscount: "La suma de los porcentajes (Proveedor + Colanta) no puede ser mayor a 100",
        },
        porcentajeColanta: {
            min: "El valor debe ser mayor o igual a 0",
            max: "El valor debe ser menor o igual a 100",
        },
    },

    submitHandler: function (form) {
        form.submit();
    },
});
