// Constantes
const baseUrl = "/api/descuentos";
const filtroRadicado = document.querySelector("#filtroRadicado");
const filtroFechaRegistro = document.querySelector("#filtroFechaSolicitud");
const filtroEstadoSolicitud = document.querySelector("#filtroEstadoSolicitud");
const botonConsultar = document.querySelector("#btnConsultar");
const modalEditarArticulo = document.querySelector("#modal-editar-articulo");
const modalEditarArticuloBootstrap = new bootstrap.Modal(modalEditarArticulo);
const modalEditarArticuloTitulo = document.querySelector("#modal-editar-articulo-titulo");
const modalEditarAlmacen = document.querySelector("#modal-editar-almacen");
const modalEditarAlmacenBootstrap = new bootstrap.Modal(modalEditarAlmacen);
const modalEditarAlmacenTitulo = document.querySelector("#modal-editar-almacen-titulo");
let radicadoModal;
const botonAgregarAlmacen = document.querySelector("#btnAgregarAlmacen");

const btnCargarArticulos = document.querySelector("#btnCargarArticulos");
const articulosSelectList = document.querySelector("#articulosSelectList");
const almacenesSelectList = document.querySelector("#almacenesSelectList");

// EventListeners
botonConsultar.addEventListener("click", obtenerDescuentos);
btnCargarArticulos.addEventListener("click", obtenerDescuentos);
// botonAgregarAlmacen.addEventListener("click", () => console.log("hola"));

// Definir Modelo
function descuentoListadoViewModelFn() {
    var self = this;
    self.descuentos = ko.observableArray([]);
    self.selectedItem = ko.observable(new articuloViewModelFn());
    self.cargando = ko.observable(false);

    self.noDescuentos = ko.pureComputed(function () {
        if (self.cargando()) {
            return false;
        }

        return self.descuentos().length === 0;
    });

    self.manejarClickArticulos = function (item) {
        self.selectedItem(item);
        // console.log(item);
        radicadoModal = item.radicado;
        // console.log(radicadoModal);
        modalEditarArticuloTitulo.textContent = `Radicado ${radicadoModal} - Lista de artículos`;
        obtenerArticulos(radicadoModal)
        modalEditarArticuloBootstrap.show();
    };

    self.manejarClickAlmacenes = function (item) {
        self.selectedItem(item);
        // console.log(item);
        radicadoModal = item.radicado;
        // console.log(radicadoModal);
        modalEditarAlmacenTitulo.textContent = `Radicado ${radicadoModal} - Lista de almacenes`;
        obtenerAlmacenes(radicadoModal)
        modalEditarAlmacenBootstrap.show();
    };

    self.manejarClickAprobar = function (item) {
        self.selectedItem(item);
        confirmarDescuento(item.radicado);
    }
}

function articuloViewModelFn(radicado) {
    var self = this;

    self.radicado = ko.observable(radicado);
}

async function obtenerArticulos(radicado) {
    const url = `${baseUrl}/articulos/${radicado}`

    const respuesta = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (!respuesta.ok) {
        manejarErrorApi(respuesta);
        return;
    }

    const json = await respuesta.json();

    const arreglos = _.partition(json, e => e.artEstado);

    articulosListadoViewModel.articulos([]);
    articulosListadoViewModel.articulos(arreglos[0]);

    articulosListadoViewModel.articulosRemovidos([]);
    articulosListadoViewModel.articulosRemovidos(arreglos[1]);
}

async function obtenerAlmacenes(radicado) {
    const url = `${baseUrl}/almacenes/${radicado}`

    const respuesta = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (!respuesta.ok) {
        manejarErrorApi(respuesta);
        return;
    }

    const json = await respuesta.json();

    const arreglos = _.partition(json, e => e.almEstado);

    almacenesListadoViewModel.almacenes([]);
    almacenesListadoViewModel.almacenes(arreglos[0]);

    almacenesListadoViewModel.almacenesRemovidos([]);
    almacenesListadoViewModel.almacenesRemovidos(arreglos[1]);
}

async function obtenerDescuentos() {
    descuentoListadoViewModel.cargando(true);

    let fecha;
    if (filtroFechaRegistro.value != "" && filtroFechaRegistro.value != 'undefined') {
        fecha = filtroFechaRegistro.value + "T00:00:00";
    } else {
        fecha = "";
    }

    const url = `${baseUrl}?radicado=${filtroRadicado.value.trim()}&fechaRegistro=${fecha}&estadoSolicitud=${filtroEstadoSolicitud.value}`;

    const respuesta = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (!respuesta.ok) {
        manejarErrorApi(respuesta);
        return;
    }

    const json = await respuesta.json();
    descuentoListadoViewModel.descuentos([]);

    descuentoListadoViewModel.descuentos(json);

    descuentoListadoViewModel.cargando(false);
}

// async function manejarClickArticulos(articulo) {
//     modalEditarArticuloBootstrap.show();
// }

const descuentoListadoViewModel = new descuentoListadoViewModelFn();
ko.applyBindings(descuentoListadoViewModel, document.querySelector("#contenedor-listado-descuentos"));

const articulosListadoViewModel = new articulosListadoViewModelFn();
ko.applyBindings(articulosListadoViewModel, document.querySelector("#modal-editar-articulo"));

const almacenesListadoViewModel = new almacenesListadoViewModelFn();
ko.applyBindings(almacenesListadoViewModel, document.querySelector("#modal-editar-almacen"));

//function descuentoElementoListadoViewModel({ id, titulo }) {
//    var self = this;
//    self.id = ko.observable(id);
//    self.titulo = ko.observable(titulo);
//    self.esNuevo = ko.pureComputed(function () {
//        return self.id() == 0;
//    })
//}

function articulosListadoViewModelFn() {
    var self = this;
    self.articulos = ko.observableArray([]);
    self.articulosRemovidos = ko.observableArray([]);

    var articulo = {
        radicado: self.radicado,
        articulo: self.articulo,
        descLargaArt: self.descLargaArt,
        artEstado: self.artEstado,
    }

    self.articulo = ko.observable();

    self.delete = function (articulo) {
        if (self.articulos().length <= 1) {
            toast("error", "Debe haber al menos un artículo seleccionado!");
            return;
        }
        eliminarArticulo(radicadoModal, articulo.articulo);
    }

    self.obtenerArticulosPorRadicado = function() {
        // console.log("entr acá")
        ObtenerArticulosPorRadicado(radicadoModal);
    }

    self.agregarArticulosPorRadicado = function() {
        let articulo = articulosSelectList.value;
        const nombreArticulo = $("#articulosSelectList :selected").text();
        const descArticulo = nombreArticulo.split(" - ");

        if (articulo != '') {
            AgregarArticulosPorRadicado(radicadoModal, articulo, descArticulo[1]);
        } else {
            toast("error", "Error al procesar la solicitud!");
            return;
        }
    }

    self.putBack = function (articulo) {
        //console.log(almacen + '' + radicadoModal)
        devolverArticulo(radicadoModal, articulo.articulo);
    }
}

function almacenesListadoViewModelFn() {
    var self = this;
    self.almacenes = ko.observableArray([]);
    self.almacenesRemovidos = ko.observableArray([]);

    var almacen = {
        idCo: self.idCo,
        descripcion: self.descripcion
    }

    self.almacen = ko.observable();

    self.delete = function (almacen) {
        if (self.almacenes().length <= 1) {
            toast("error", "Debe haber al menos un almacén activo!");
            return;
        }
        eliminarAlmacen(radicadoModal, almacen.idCo);
    }

    self.putBack = function (almacen) {
        //console.log(almacen + '' + radicadoModal)
        devolverAlmacen(radicadoModal, almacen.idCo);
    }

    self.obtenerAlmacenesPorRadicado = function() {
        // console.log("entr acá")
        ObtenerAlmacenesPorRadicado(radicadoModal);
    }

    self.agregarAlmacenesPorRadicado = function() {
        const almacen = almacenesSelectList.value;
        const nombreAlmacen = $("#almacenesSelectList :selected").text();

        if (almacen != '') {
            AgregarAlmacenesPorRadicado(radicadoModal, almacen, nombreAlmacen);
        } else {
            toast("error", "Error al procesar la solicitud!");
            return;
        }
    }
}

/*function eliminarAlmacen()*/
function confirmarDescuento(radicado) {
    Swal.fire({
        title: 'Observaciones del aprobador:',
        input: 'text',
        inputAttributes: {
            autocapitalize: 'off'
        },
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
        confirmButtonText: 'Confirmar',
        showLoaderOnConfirm: true,
        preConfirm: (observaciones) => {
            datos = { radicado: radicado, observaciones: observaciones };
            return $.ajax({
                type: "GET",
                contentType: "application/json; charset=utf-8",
                dataType: "JSON",
                url: "C269Descuento/AprobarDescuento",
                data: datos,
                error: function (jqXHR, thrownError) {
                    //alert(jqXHR.status);
                    //alert(thrownError);
                    toast("error", "Error al procesar la solicitud!");
                }
            }).done(function (data) {
                //alert("Data Saved: " + msg);
                const num = data[0].resultado;
                if (num >= 1) {
                    obtenerDescuentos();
                    toast("success", "Descuento aprobado correctamente!");

                } else {
                    toast("warning", "Error al procesar la solicitud!");
                }
            }).fail((jqXHR, errorMsg) => {
                //alert(jqXHR.responseText, errorMsg)
                toast("error", "Error al procesar la solicitud!");
            })
        }
    })
}

function eliminarAlmacen(radicado, almacen) {
    Swal.fire({
        title: '¿Está seguro de la acción?',
        text: "No se puede revertir la acción!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Eliminar!'
    }).then((result) => {
        if (result.isConfirmed) {
            datos = { radicado: radicado, almacen: almacen };
            return $.ajax({
                type: "GET",
                contentType: "application/json; charset=utf-8",
                dataType: "JSON",
                url: "C269Descuento/EliminarAlmacenDescuento",
                data: datos,
                error: function (jqXHR, thrownError) {
                    //alert(jqXHR.status);
                    //alert(thrownError);
                    toast("error", "Error al procesar la solicitud!");
                }
            }).done(function (data) {
                //alert("Data Saved: " + msg);
                const num = data[0].resultado;
                if (num >= 1) {
                    obtenerAlmacenes(radicado);
                    toast("success", "Almacen eliminado correctamente!");
                } else {
                    toast("warning", "Error al procesar la solicitud!");
                }
            }).fail((jqXHR, errorMsg) => {
                //alert(jqXHR.responseText, errorMsg)
                toast("error", "Error al procesar la solicitud!");
            })
            //Swal.fire(
            //    'Deleted!',
            //    'Almacen eliminado correctamente.',
            //    'success'
            //)
        }
    })
}

function eliminarArticulo(radicado, articulo) {
    Swal.fire({
        title: '¿Está seguro de la acción?',
        text: "No se puede revertir la acción!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Eliminar!'
    }).then((result) => {
        if (result.isConfirmed) {
            datos = { radicado: radicado, articulo: articulo };
            return $.ajax({
                type: "GET",
                contentType: "application/json; charset=utf-8",
                dataType: "JSON",
                url: "C269Descuento/EliminarArticuloDescuento",
                data: datos,
                error: function (jqXHR, thrownError) {
                    //alert(jqXHR.status);
                    //alert(thrownError);
                    toast("error", "Error al procesar la solicitud!");
                }
            }).done(function (data) {
                //alert("Data Saved: " + msg);
                const num = data[0].resultado;
                if (num >= 1) {
                    obtenerArticulos(radicado);
                    toast("success", "Artículo removido correctamente!");
                } else {
                    toast("warning", "Error al procesar la solicitud!");
                }
            }).fail((jqXHR, errorMsg) => {
                //alert(jqXHR.responseText, errorMsg)
                toast("error", "Error al procesar la solicitud!");
            })
            //Swal.fire(
            //    'Deleted!',
            //    'Almacen eliminado correctamente.',
            //    'success'
            //)
        }
    })
}

function devolverArticulo(radicado, articulo) {
    Swal.fire({
        title: '¿Está seguro de la acción?',
        text: "No se puede revertir la acción!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Devolver!'
    }).then((result) => {
        if (result.isConfirmed) {
            datos = { radicado: radicado, articulo: articulo };
            return $.ajax({
                type: "GET",
                contentType: "application/json; charset=utf-8",
                dataType: "JSON",
                url: "C269Descuento/DevolverArticuloDescuento",
                data: datos,
                error: function (jqXHR, thrownError) {
                    //alert(jqXHR.status);
                    //alert(thrownError);
                    toast("error", "Error al procesar la solicitud!");
                }
            }).done(function (data) {
                //alert("Data Saved: " + msg);
                const num = data[0].resultado;
                if (num >= 1) {
                    obtenerArticulos(radicado);
                    toast("success", "Artículo devuelto correctamente!");
                } else {
                    toast("warning", "Error al procesar la solicitud!");
                }
            }).fail((jqXHR, errorMsg) => {
                //alert(jqXHR.responseText, errorMsg)
                toast("error", "Error al procesar la solicitud!");
            })
        }
    })
}

function devolverAlmacen(radicado, almacen) {
    Swal.fire({
        title: '¿Está seguro de la acción?',
        text: "No se puede revertir la acción!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Devolver!'
    }).then((result) => {
        if (result.isConfirmed) {
            datos = { radicado: radicado, almacen: almacen };
            return $.ajax({
                type: "GET",
                contentType: "application/json; charset=utf-8",
                dataType: "JSON",
                url: "C269Descuento/DevolverAlmacenDescuento",
                data: datos,
                error: function (jqXHR, thrownError) {
                    //alert(jqXHR.status);
                    //alert(thrownError);
                    toast("error", "Error al procesar la solicitud!");
                }
            }).done(function (data) {
                //alert("Data Saved: " + msg);
                const num = data[0].resultado;
                if (num >= 1) {
                    obtenerAlmacenes(radicado);
                    toast("success", "Almacen devuelto correctamente!");
                } else {
                    toast("warning", "Error al procesar la solicitud!");
                }
            }).fail((jqXHR, errorMsg) => {
                //alert(jqXHR.responseText, errorMsg)
                toast("error", "Error al procesar la solicitud!");
            })
        }
    })
}

function ObtenerArticulosPorRadicado(radicado) {
    datos = { radicado: radicado };
    return $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        dataType: "JSON",
        url: "C269Descuento/ObtenerArticulosPorRadicado",
        data: datos,
        error: function (jqXHR, thrownError) {
            //alert(jqXHR.status);
            //alert(thrownError);
            toast("error", "Error al procesar la solicitud!");
        }
    }).done(function (data) {
        // console.log(data);
        $("#articulosSelectList").empty().trigger("change");
        var defaultValuie = { id: "", text: '--Seleccione un articulo--' };
        data.unshift(defaultValuie);
        $("#articulosSelectList").select2({
            theme: "bootstrap-5",
            selectionCssClass: "select2--small",
            dropdownCssClass: "select2--small",
            data: data
        });
    }).fail((jqXHR, errorMsg) => {
        //alert(jqXHR.responseText, errorMsg)
        toast("error", "Error al procesar la solicitud!");
    })
}

function AgregarArticulosPorRadicado(radicado, articulo, descArticulo) {
    datos = { radicado: radicado, articulo: articulo, descArticulo: descArticulo };
    return $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        dataType: "JSON",
        url: "C269Descuento/AgregarArticulosPorRadicado",
        data: datos,
        error: function (jqXHR, thrownError) {
            //alert(jqXHR.status);
            //alert(thrownError);
            toast("error", "Error al procesar la solicitud!");
        }
    }).done(function (data) {
        const num = data[0].resultado;
        if (num >= 1) {
            obtenerArticulos(radicado);
            toast("success", "Artículo agregado correctamente!");
            $('#articulosSelectList option:selected').remove();
        } else {
            toast("warning", "Error al procesar la solicitud!");
        }
    }).fail((jqXHR, errorMsg) => {
        //alert(jqXHR.responseText, errorMsg)
        toast("error", "Error al procesar la solicitud!");
    })
}

function ObtenerAlmacenesPorRadicado(radicado) {
    datos = { radicado: radicado };
    return $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        dataType: "JSON",
        url: "C269Descuento/ObtenerAlmacenesPorRadicado",
        data: datos,
        error: function (jqXHR, thrownError) {
            //alert(jqXHR.status);
            //alert(thrownError);
            toast("error", "Error al procesar la solicitud!");
        }
    }).done(function (data) {
        // console.log(data);
        $("#almacenesSelectList").empty().trigger("change");
        var defaultValuie = { id: "", text: '--Seleccione un almacen--' };
        data.unshift(defaultValuie);
        $("#almacenesSelectList").select2({
            theme: "bootstrap-5",
            selectionCssClass: "select2--small",
            dropdownCssClass: "select2--small",
            data: data
        });
    }).fail((jqXHR, errorMsg) => {
        //alert(jqXHR.responseText, errorMsg)
        toast("error", "Error al procesar la solicitud!");
    })
}

function AgregarAlmacenesPorRadicado(radicado, almacen, nombreAlmacen) {
    datos = { radicado: radicado, almacen: almacen, nombreAlmacen: nombreAlmacen };
    return $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        dataType: "JSON",
        url: "C269Descuento/AgregarAlmacenesPorRadicado",
        data: datos,
        error: function (jqXHR, thrownError) {
            //alert(jqXHR.status);
            //alert(thrownError);
            toast("error", "Error al procesar la solicitud!");
        }
    }).done(function (data) {
        const num = data[0].resultado;
        if (num >= 1) {
            obtenerAlmacenes(radicado);
            toast("success", "Almacen agregado correctamente!");
            $('#almacenesSelectList option:selected').remove();
        } else {
            toast("warning", "Error al procesar la solicitud!");
        }
    }).fail((jqXHR, errorMsg) => {
        //alert(jqXHR.responseText, errorMsg)
        toast("error", "Error al procesar la solicitud!");
    })
}
// $( "#modal-editar-articulo" ).on('shown', function(){
//     alert("I want this to appear after the modal has opened!");
// });

modalEditarArticulo.addEventListener('show.bs.modal', () => {
    $("#articulosSelectList").empty().trigger("change");
    // console.log('show instance method called!');
  })

  
modalEditarAlmacen.addEventListener('show.bs.modal', () => {
    $("#almacenesSelectList").empty().trigger("change");
    // console.log('show instance method called!');
  })