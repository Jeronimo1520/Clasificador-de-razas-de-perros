const video = document.getElementById("imagen_video"); //Atrapa la información del video de html//

if(navigator.mediaDevices.getUserMedia){ //Verifica que el dispositivo si tenga entrada multimedia//
    navigator.mediaDevices.getUserMedia({ video:true}) //Pedir permiso al usuario para acceder a la cámara HU004//
        .then(
            (stream) => {        //Se ejecuta cuando el usuario permite acceder a la cámara//
                video.srcObject = stream; //Asocia el stream del MediaDevices con el html//
                console.log(stream)
            }
        )
        .catch((error) => {      //Manejo de error cuando el usuario NO permite acceder a la cámara//
            window.alert("Para ejecutar el programa debe tener el acceso a la cámara"); 
        })
    
    }

//menu
//Funcion en el evento click
document.getElementById("btn_abrir").addEventListener("click", abrir_cerrar_menu);

//crear variables 
var side_menu = document.getElementById("menu");
var btn_open = document.getElementById("btn_abrir");
var body = document.getElementById("body");

//Evento para mostrar y ocultar el menú
    function abrir_cerrar_menu(){
        body.classList.toggle("body_move");
        side_menu.classList.toggle("menu_move");
    }


//Volviendo el programa Responsive
//si el ancho de la página es menos a 760px ocultará el menu al recargar la página
if (window.innerWidth < 760){

    body.classList.add("body_move");
    side_menu.classList.add("menu_move");
}

//Menu adaptable

window.addEventListener("resize", function(){

    if (window.innerWidth > 760){
        body.classList.remove("body_move");
        side_menu.classList.remove("menu_move");
    }

    if (window.innerWidth < 760){
        body.classList.add("body_move");
        side_menu.classList.add("menu_move");
    }
})
