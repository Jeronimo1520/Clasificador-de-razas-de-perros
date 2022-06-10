
https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@2.0.0/dist/tf.min.js

var tamano = 500;
var video = document.getElementById("imagen_video"); //Atrapa la información del video de html//
var canvas = document.getElementById("canvas");
var otrocanvas = document.getElementById("otrocanvas");
var ctx = canvas.getContext("2d");
var ctx2 = otrocanvas.getContext("2d");
var currentStream= null
var facingMode = "user";

var modelo = null;


//Carga el modelo entrenado
(async() => {
    console.log("Cargando modelo...");
    modelo = await tf.loadLayersModel("model.json");
    console.log("Modelo cargado");
})();

window.onload = function() {
    mostrarCamara()
}

function mostrarCamara(){
    var opciones = {
        audio:false,
        video: {
          width: tamano, height: tamano
        }
    }
    if (navigator.mediaDevices.getUserMedia) { //Verifica que el dispositivo si tenga entrada multimedia//
        navigator.mediaDevices.getUserMedia(opciones)  //Pedir permiso al usuario para acceder a la cámara-HU004//
            .then(function(stream) {
              currentStream = stream;
              video.srcObject = currentStream; //Asocia el stream del MediaDevices con el html//
              procesarCamara();
              predecir();

            })
            .catch(function(err) {
                alert("Oops, hubo un error", err);
            })
        }
    else {
        alert("No existe cámara para usar el reconocimiento :(");
      }


}

function procesarCamara() {
    ctx.drawImage(video, 0, 0, tamano, tamano, 0, 0, tamano, tamano); //atrapa la imagen que procesa de la cámara
    setTimeout(procesarCamara, 20);
}


//Función para cambiar de sentido la cámara- HU002
function cambiarCamara() {
    if (currentStream) {
        currentStream.getTracks().forEach(track => {
            track.stop();
        });
    }

    facingMode = facingMode == "user" ? "environment" : "user";

    var opciones = {
        audio: false,
        video: {
            facingMode: facingMode, width: tamano, height: tamano
        }
    };

    navigator.mediaDevices.getUserMedia(opciones)
        .then(function(stream) {
            currentStream = stream;
            video.srcObject = currentStream;
        })
        .catch(function(err) {
            console.log("Lo sentimos, hubo un error");
        })
}


//Funcion que compara la imagen del canvas con el modelo de entrenamiento
function predecir() {
    if (modelo != null){
        resample_single(canvas, 200, 200, otrocanvas); //pasar canvas a version 200x200

        //Hacer la predicción
        var ctx2 = otrocanvas.getContext("2d");
        var imgData = ctx2.getImageData(0, 0, 200, 200);

        var arr = [];
        var arr200 = [];


        for (var p=0; p < imgData.data.length; p+=4){
            var rojo = imgData.data[p] / 255;
            var verde = imgData.data[p+1] / 255;
            var azul = imgData.data[p+2] / 255;

            var gris = (rojo+verde+azul) / 3;

            arr200.push([gris]);
            if (arr200.length == 200) {
                arr.push(arr200);
                arr200 = [];
            }
        }
        arr = [arr];

        var tensor = tf.tensor4d(arr);
        var resultados = modelo.predict(tensor).dataSync();
        var mayorIndice = resultados.indexOf(Math.max.apply(null, resultados));

        //guardar nombre de las razas en un arreglo
        lista_razas = ['Chihuahua','Chin japonés','Bichón maltés','pequinés','Shih Tzu',
        'Toy spaniel inglés','Papillón','Toy terrier americano','Perro crestado rodesiano','Lebrel afgano',
        'Basset hound','Beagle','Perro de San Huberto','Bluetick','black and tan coonhound','Treeing Walker','Foxhound inglés',
        'Redbone Coonhound ','Borzoi','Lobero irlandés','Galgo italiano','Whippet','Ibizan hound','Cazador de alces noruego',
        'Otterhound','Saluki','Lebrel escocés','Weimaraner','Staffordshire bull terrier','American Staffordshire terrier','Bedlington terrier',
        'Border terrier','Kerry blue terrier','Terrier irlandés','Terrier de Norfolk','Terrier de norwich','Yorkshire terrier',
        'Fox terrier de pelo duro','Lakeland terrier','Sealyham terrier','Airedale terrier','Cairn terrier','Australian Terrier',
        'Dandie Dinmont terrier','Boston terrier','Schnauzer Miniatura','Schnauzer gigante','Schnauzer mediano',
        'Terrier escocés','terrier tibetano','Silky terrier australiano','Irish soft coated wheaten terrier','West Highland white terrier',
        'Lhasa apso','Cobrador de pelo liso','Retriever de pelo rizado','Golden retriever','Labrador retriever',
        'Retriever de Chesapeake','Braco alemán de pelo corto','Vizsla','Setter inglés','Setter irlandés','Gordon setter',
        'spaniel bretón','Clumber spaniel','Springer spaniel inglés','Springer spaniel galés','Cocker spaniel inglés',
        'Sussex spaniel','Perro de agua irlandés','Kuvasz','Schipperke','Pastor belga groenendae','Pastor belga malinois',
        'Pastor de Brie','Kelpie australiano','Komondor',' Antiguo pastor inglés','Pastor de las islas Shetland','Collie ',
        'Border Collie','Boyero de Flandes','Rottweiler','pastor alemán','Doberman',
        'Pinscher miniatura','Gran boyero suizo','Boyero de Berna','Boyero de Appenzell','Boyero de Entlebuch','Boxer','Bullmastiff',
        'Dogo del Tíbet ','Bulldog francés','Gran danés','San bernardo','Esquimal americano','Malamute de Alaska','Husky siberiano','Affenpinscher','Basenji','Pug','Leonbergerg',
        'Terranova','Gran pirineo','Samoyedo','Pomeranian','Chow Chow','Keeshond','Grifón de Bruselas','Corgi galés ','Corgi de Cardigan','Poodle','Poodle miniatura',
        'Poodle mediano','Xoloitzcuintle','Dingo','Perro rojo','Perro salvaje africano']

        document.getElementById("resultado").innerHTML = lista_razas[mayorIndice]; //Muestra en pantalla la predicción

    }
    setTimeout(predecir, 150);
}


//Funcion sacada de internet para redimensionar una imagen 
/**
    * Hermite resize - fast image resize/resample using Hermite filter. 1 cpu version!
    *
    * @param {HtmlElement} canvas
    * @param {int} width
    * @param {int} height
    * @param {boolean} resize_canvas if true, canvas will be resized. Optional.
    * Cambiado por RT, resize canvas ahora es donde se pone el chiqitillllllo
    */
function resample_single(canvas, width, height, resize_canvas) {
    var width_source = canvas.width;
    var height_source = canvas.height;
    width = Math.round(width);
    height = Math.round(height);

    var ratio_w = width_source / width;
    var ratio_h = height_source / height;
    var ratio_w_half = Math.ceil(ratio_w / 2);
    var ratio_h_half = Math.ceil(ratio_h / 2);

    var ctx = canvas.getContext("2d");
    var ctx2 = resize_canvas.getContext("2d");
    var img = ctx.getImageData(0, 0, width_source, height_source);
    var img2 = ctx2.createImageData(width, height);
    var data = img.data;
    var data2 = img2.data;

    for (var j = 0; j < height; j++) {
        for (var i = 0; i < width; i++) {
            var x2 = (i + j * width) * 4;
            var weight = 0;
            var weights = 0;
            var weights_alpha = 0;
            var gx_r = 0;
            var gx_g = 0;
            var gx_b = 0;
            var gx_a = 0;
            var center_y = (j + 0.5) * ratio_h;
            var yy_start = Math.floor(j * ratio_h);
            var yy_stop = Math.ceil((j + 1) * ratio_h);
            for (var yy = yy_start; yy < yy_stop; yy++) {
                var dy = Math.abs(center_y - (yy + 0.5)) / ratio_h_half;
                var center_x = (i + 0.5) * ratio_w;
                var w0 = dy * dy; //pre-calc part of w
                var xx_start = Math.floor(i * ratio_w);
                var xx_stop = Math.ceil((i + 1) * ratio_w);
                for (var xx = xx_start; xx < xx_stop; xx++) {
                    var dx = Math.abs(center_x - (xx + 0.5)) / ratio_w_half;
                    var w = Math.sqrt(w0 + dx * dx);
                    if (w >= 1) {
                        //pixel too far
                        continue;
                    }
                    //hermite filter
                    weight = 2 * w * w * w - 3 * w * w + 1;
                    var pos_x = 4 * (xx + yy * width_source);
                    //alpha
                    gx_a += weight * data[pos_x + 3];
                    weights_alpha += weight;
                    //colors
                    if (data[pos_x + 3] < 255)
                        weight = weight * data[pos_x + 3] / 250;
                    gx_r += weight * data[pos_x];
                    gx_g += weight * data[pos_x + 1];
                    gx_b += weight * data[pos_x + 2];
                    weights += weight;
                }
            }
            data2[x2] = gx_r / weights;
            data2[x2 + 1] = gx_g / weights;
            data2[x2 + 2] = gx_b / weights;
            data2[x2 + 3] = gx_a / weights_alpha;
        }
    }


    ctx2.putImageData(img2, 0, 0);
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

    if (window.innerWidth > 800){
        body.classList.remove("body_move");
        side_menu.classList.remove("menu_move");

    }

    if (window.innerWidth < 800){
        body.classList.add("body_move");
        side_menu.classList.add("menu_move");
    }
})
