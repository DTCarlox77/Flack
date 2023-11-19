// Esto evitará mostrar salas creadas en una versión anterior.
let salaActual = "";

// Conexión al socket. Si desea probar la aplicación a través de un puerto, cambie el protocolo http a https para no tener inconvenientes.
const socket = io.connect("http://" + document.domain + ":" + location.port);

// Mantiene un control del máximo de mensajes en una sala (Se asignó que el máximo debe ser de 100).
const MAX_MESSAGES = 100;
function contarMensajes() {
    const mensajes = document.querySelectorAll(".message");
    const contadorMensajes = document.getElementById("contadorMensajes");
    
    if (contadorMensajes) {
        contadorMensajes.textContent = mensajes.length;
    }
}

// Mantiene el scroll bajo en las salas de chat para evitar estar bajando en todo momento.
function scrollDown() {
    let roomContentMessages = document.querySelector(".room-content-messages");
    roomContentMessages.scrollTop = roomContentMessages.scrollHeight;

    requestAnimationFrame(() => {
        roomContentMessages.scrollTop = roomContentMessages.scrollHeight;
    });
}  

let salasDisponibles = {}

// Funciones que estrictamente deben empezar una vez cargado todo.
document.addEventListener("DOMContentLoaded", () => {

    // Obtiene los datos del usuario de la caché del navegador.
    const user_data = localStorage.getItem("user_data");

    // Obtiene el nombre de usuario desde la caché.
    const nombreUsuario = JSON.parse(localStorage.getItem("user_data"))?.username;

    if (user_data) {
        const menu1 = document.querySelector("#menu-1");
        const menu2 = document.querySelector("#menu-2");
        const footer = document.querySelector("#footer");
        const header = document.querySelector("#header");

        if (menu1) {
            menu1.style.display = "none";
            footer.style.display = "none";
            header.style.display = "none";
            menu2.style.display = "flex";
        }

        const imagen_usuario = document.querySelector("#imagen-perfil-usuario");
        const username = JSON.parse(localStorage.getItem("user_data"))?.username;
        const image_url = JSON.parse(localStorage.getItem("user_data"))?.profile_image;
        const user_username = document.querySelector("#user-username");

        // Asigna una imagen por defecto para la pantalla principal, sin embargo, no se mostrará dentro de la sala.
        imagen_usuario.src = image_url ? image_url : "https://www.etudestech.com/wp-content/uploads/2023/06/anonymous-scaled.jpeg";
        user_username.textContent = username;
    }

    // Control de los diseños.
    const presentation = document.querySelector("#presentation");
    const login = document.querySelector("#login");
    const register = document.querySelector("#register");
    const back = document.querySelector("#back-presentation");
    const username = document.querySelector("#username");
    const profile_image = document.querySelector("#profile-image");
    const username_message = document.querySelector("#username-validation");
    const login_button = document.querySelector("#login-button");

    function ocultarMenu() {
        const menu1 = document.querySelector("#menu-1");
        const menu2 = document.querySelector("#menu-2");
        if (menu1) {
            menu1.style.display = "none";
            menu2.style.display = "flex";
        }
    }

    register.addEventListener("click", () => {
        const user_data = localStorage.getItem("user_data");
        if (!user_data) {
            presentation.classList.replace("presentacion-icono", "void");
            login.classList.replace("void", "presentacion-inicio");
        }
    });

    back.addEventListener("click", () => {
        presentation.classList.replace("void", "presentacion-icono");
        login.classList.replace("presentacion-inicio", "void");
    });

    // Restricciones al nombre de usuario. (Algunos para evitar fallos visuales).
    username.addEventListener("input", () => {
        login_button.disabled = true;
        if (username.value.length < 5 && username.value.length > 0) {
            username_message.textContent = "El nombre de usuario es muy corto.";
        } else if (!/^[a-zA-Z0-9]+$/.test(username.value)) {
            username_message.textContent = "El nombre de usuario no es válido.";
        } else if (username.value.length > 8) {
            username_message.textContent = "El nombre de usuario muy largo.";
        } else {
            username_message.textContent = "Ingresa un nombre de usuario:";
            login_button.disabled = false;
        }
    });

    username.addEventListener("blur", () => {
        if (username.value.length < 1) {
            username_message.textContent = "Ingresa un nombre de usuario:";
        }
    });

    login_button.addEventListener("click", () => {
        const user_data = {
            username: username.value,
            profile_image: profile_image.value,
        };

        localStorage.setItem("user_data", JSON.stringify(user_data));
        ocultarMenu();
        window.location.reload()
    });
    
    // Eventos de unión a una sala.
    function unirseASala(nombreSala) {
        let nombreUsuario = JSON.parse(localStorage.getItem("user_data"))?.username;

        salaActual = nombreSala;
        localStorage.setItem("salaactual", nombreSala);

        socket.off("mensaje_recibido");
        socket.emit("unirse_a_sala", { nombreUsuario: nombreUsuario, nombreSala: nombreSala });

        // Al momento de entrar, carga todo el contenido de la sala.
        socket.on("mensaje_recibido", function (data) {

            let roomContentMessages = document.querySelector(".room-content-messages");
            let mensajeWrapper = document.createElement("span");
            mensajeWrapper.className = "message";
            let allRoomImage = document.createElement("div");
            allRoomImage.className = "all-room-image";
            let profileImageElement = document.createElement("img");
            profileImageElement.src = data.imagen;
            allRoomImage.appendChild(profileImageElement);
            let externalMessageInfo = document.createElement("div");
            externalMessageInfo.className = "external-message-info";
            let usuarioElement = document.createElement("h2");
            usuarioElement.textContent = data.usuario;
            let mensajeElement = document.createElement("p");
            mensajeElement.textContent = data.mensaje;
            let horaElement = document.createElement("h4");
            horaElement.textContent = `Hora: ${data.hora} Fecha: ${data.fecha}`;
        
            externalMessageInfo.appendChild(usuarioElement);
            externalMessageInfo.appendChild(mensajeElement);
            externalMessageInfo.appendChild(horaElement);
        
            mensajeWrapper.appendChild(allRoomImage);
            mensajeWrapper.appendChild(externalMessageInfo);
        
            if (data.usuario !== nombreUsuario) {
                externalMessageInfo.style.backgroundColor = "rgb(205, 242, 255)";
            }

            roomContentMessages.appendChild(mensajeWrapper);

            if (roomContentMessages.children.length > MAX_MESSAGES) {
                roomContentMessages.removeChild(roomContentMessages.firstElementChild);
            }

            contarMensajes();
            scrollDown();
        });
        
        document.getElementById("mensajeInput").value = "";
    }   

    // Realiza validación tomando en cuenta la sala actual y al usuario emisor.
    function enviarMensaje() {
        let mensaje = document.getElementById("mensajeInput").value;
    
        if (salaActual && mensaje.trim() !== "") {
            let nombreSala = salaActual;
    
            socket.emit("enviar_mensaje", {
                nombre_usuario: nombreUsuario,
                // Acá se le puede agregar una imagen por defecto para mostrar en las conversaciones (si el usuario no tiene).
                imagen_usuario: localStorage.getItem("user_data") ? JSON.parse(localStorage.getItem("user_data")).profile_image : '',
                mensaje: mensaje,
                nombre_sala: nombreSala
            });
    
            document.getElementById("mensajeInput").value = "";
    
            let mensajes = document.getElementById("mensajes");
            if (mensajes && mensajes.children.length >= MAX_MESSAGES) {
                mensajes.removeChild(mensajes.firstChild);
            }
        }
    }
    
    // Mantiene la sala de chat actualizada en tiempo real.
    socket.on("salas_actualizadas", function (data) {
        let roomList = document.getElementById("room-elements");
        roomList.innerHTML = "";

        for (let sala in data) {
            const roomData = data[sala];
            const newRoomElement = document.createElement("div");
            newRoomElement.className = "room-view";

            newRoomElement.setAttribute("data-search", sala);

            newRoomElement.innerHTML = `
                <div class="all-room-image">
                    <img src="${roomData.imagen}" alt="">
                </div>
                <div class="room-information">
                    <h3>${sala}</h3>
                    <h4>Por: ${roomData.creador}</h4>
                </div>
            `;

            // Función para eliminar una sala.
            newRoomElement.addEventListener("contextmenu", function (event) {
                event.preventDefault();

                const currentUser = JSON.parse(localStorage.getItem("user_data"))?.username;

                // Verificar si el usuario actual es el creador de la sala.
                if (currentUser === roomData.creador) {
                    const confirmDelete = window.confirm("¿Seguro que deseas eliminar esta sala?");
                    if (confirmDelete) {
                        socket.emit("eliminar_sala", { nombre_sala: sala, nombre_usuario: nombreUsuario });
                    }
                } else {
                    alert("Solo el creador de la sala puede eliminarla.");
                }
            });

            roomList.appendChild(newRoomElement);

            newRoomElement.addEventListener("click", function (event) {
                event.preventDefault();
                unirseASala(sala);

                socket.emit("sala_actual", {nombre_sala: sala, creador: roomData.creador, imagen: roomData.imagen, usuario: nombreUsuario})
            });
        }
    });

    socket.on("cambiar_sala", function (data) {

        nombreSala = localStorage.getItem("salaactual");
        if (data === nombreSala) {
            const a = document.querySelector("#contenedor-de-chats");
            const b = document.querySelector("#show-all-rooms");

            a.style.display = "none";
            b.style.display = "flex";
        }
    })

    // Mantiene la sala de chat actualizada en tiempo real.
    socket.on("chat_actualizado", function (data) {
        let roomContentMessages = document.querySelector(".room-content-messages");
    
        roomContentMessages.innerHTML = "";
    
        for (let mensajeData of data.mensajes) {
            let mensajeWrapper = document.createElement("span");
            mensajeWrapper.className = "message";
    
            let allRoomImage = document.createElement("div");
            allRoomImage.className = "all-room-image";
            let profileImageElement = document.createElement("img");
            profileImageElement.src = mensajeData.imagen;
            allRoomImage.appendChild(profileImageElement);
    
            let externalMessageInfo = document.createElement("div");
            externalMessageInfo.className = "external-message-info";
    
            let usuarioElement = document.createElement("h2");
            usuarioElement.textContent = mensajeData.usuario;
    
            let mensajeElement = document.createElement("p");
            mensajeElement.textContent = mensajeData.mensaje;
    
            let horaElement = document.createElement("h4");
            horaElement.textContent = `Hora: ${mensajeData.hora} Fecha: ${mensajeData.fecha}`;
    
            externalMessageInfo.appendChild(usuarioElement);
            externalMessageInfo.appendChild(mensajeElement);
            externalMessageInfo.appendChild(horaElement);
    
            mensajeWrapper.appendChild(allRoomImage);
            mensajeWrapper.appendChild(externalMessageInfo);
    
            // Cambia el color cuando un tercero mande mensaje.
            if (mensajeData.usuario !== nombreUsuario) {
                externalMessageInfo.style.backgroundColor = "rgb(205, 242, 255)";
            }
    
            roomContentMessages.appendChild(mensajeWrapper);
        }
    
        while (roomContentMessages.children.length > MAX_MESSAGES) {
            roomContentMessages.removeChild(roomContentMessages.firstElementChild);
        }
    
        contarMensajes();
        scrollDown();
    });

    // Validación para el nombre de sala

    const nombreSalaInput = document.querySelector("#room-name");
    const mensajeCrear = document.querySelector("#mensaje-crear-sala");
    const crearBtn = document.querySelector("#create-room-button");

    nombreSalaInput.addEventListener("input", () => {
        crearBtn.disabled = true;
        if (nombreSalaInput.value.length < 2 && nombreSalaInput.value.length > 0) {
            mensajeCrear.textContent = "El nombre de la sala es muy corto.";
        } else if (!/^[a-zA-Z0-9\s]+$/.test(mensajeCrear.value)) {
            mensajeCrear.textContent = "El nombre de la sala no es válido.";
        } else if (nombreSalaInput.value.length > 10) {
            mensajeCrear.textContent = "El nombre de la sala es muy largo.";
        } else {
            mensajeCrear.textContent = "";
            crearBtn.disabled = false;
        }
    });    

    // Apartado creador de salas, asigna una imagen por defecto si no se agrega URL de imagen.
    crearBtn.addEventListener("click", function (event) {
        event.preventDefault();
        
        const nombreSala = nombreSalaInput.value.trim();
        const imagenSalaInput = document.querySelector("#room-image");
        let imagenSala = imagenSalaInput.value.trim();

        if (!imagenSala) {
            imagenSala = "https://i.pinimg.com/1200x/a4/0f/3d/a40f3db39370251001ba29f5f24aa29c.jpg";
        }
    
        if (nombreSala) {
            // Manda al servidor la información para crear la sala.
            socket.emit("crear_sala", { nombre_sala: nombreSala, nombre_usuario: nombreUsuario, imagen_sala: imagenSala });
            nombreSalaInput.value = "";

            roomNameInput.value = "";
            roomImageInput.value = "";

            // Oculta el contenedor de creación de salas.
            createRoomOptions.style.display = "none";
        }
    });
    
    document.getElementById("enviarMensajeBtn").addEventListener("click", function () {
        enviarMensaje();
    });

    // Permite enviar mensajes con el enter.
    const mensajeInput = document.getElementById("mensajeInput");
    mensajeInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            enviarMensaje();
        }
    });

    // Funciones que controlan el diseño de la página.
    const background_container = document.querySelector("#background-container");

    background_container.addEventListener("click", (event) => {
        if (event.target === background_container) {
            background_container.style.display = "none";
        }
    });

    let salaActual = "";

    const createRoomButton = document.querySelector("#create-room");
    const createRoomOptions = document.querySelector("#background-container");
    const roomNameInput = document.querySelector("#room-name");
    const roomImageInput = document.querySelector("#room-image");

    createRoomButton.addEventListener("click", () => {
        createRoomOptions.style.display = "flex";
    });    

    const roomElementsContainer = document.querySelector("#room-elements");

    roomElementsContainer.addEventListener("click", (event) => {
        const roomElement = event.target.closest(".room-view");

        if (roomElement) {
            const roomNameElement = roomElement.querySelector(".room-information h3");
            const createdByElement = roomElement.querySelector(".room-information h4");
            const roomImageElement = roomElement.querySelector(".all-room-image img");
            const roomName = roomNameElement.textContent;
            const createdBy = createdByElement.textContent.replace("Por: ", "");
            const roomImageSrc = roomImageElement.src;

            const chatContent = document.querySelector(".conversation");
            const roomNameContent = chatContent.querySelector(".room-name");
            const roomCreatorContent = chatContent.querySelector(".room-creator");
            const roomImageContent = chatContent.querySelector(".all-room-image img");
            roomNameContent.textContent = roomName;
            roomCreatorContent.textContent = createdBy;
            roomImageContent.src = roomImageSrc;

            const logo = document.querySelector("#show-all-rooms");
            logo.style.display = "none";

            chatContent.style.display = "flex";
            function responsive () {
                if (window.innerWidth <= 950) {
                    const room_menu = document.querySelector("#all-rooms");
                    room_menu.style.display = "none";

                    const chat_menu = document.querySelector("#chat-menu");
                    if (chat_menu.style.display === "none") {
                        chat_menu.style.display = "flex";
                    }
                }
            }

            window.addEventListener("resize", responsive);
            responsive();
        }
    });

    // Funcionalidad de la barra de búsqueda. Está modificada de tal forma que no entra en conflicto con el socket.
    const searchInput = document.getElementById("search-room");
    let originalRoomList = null;

    searchInput.addEventListener("input", () => {
        const searchTerm = searchInput.value.toLowerCase();
        const roomElements = document.querySelectorAll('.room-view');

        if (!originalRoomList) {
            originalRoomList = document.getElementById("room-elements").innerHTML;
        }

        roomElements.forEach((roomElement) => {
            const roomName = roomElement.getAttribute('data-search').toLowerCase();

            if (roomName.includes(searchTerm)) {
                roomElement.style.display = "flex";
            } else {
                roomElement.style.display = "none";
            }
        });
    });

    // Devuelve a una sala en la que se estaba si se recarga la página.
    socket.on("respaldo_exitoso", function (data) {

        if (data) {

            const usuarioData = data[nombreUsuario];
            
            if (usuarioData) {

                const chats = document.querySelector("#contenedor-de-chats");
                const menu = document.querySelector("#show-all-rooms");
                menu.style.display = "none";
                chats.style.display = "flex";

                const nombre = usuarioData[0];
                const creador = usuarioData[1];
                const imagen = usuarioData[2];
        
                const nombreElement = document.querySelector("#nombre-de-sala");
                const creadorElement = document.querySelector("#creador-de-sala");
                const imageElement = document.querySelector("#imagen-de-sala");
        
                nombreElement.textContent = nombre;
                console.log(nombre);
                creadorElement.textContent = creador;
                imageElement.src = imagen ? imagen : "https://i.pinimg.com/1200x/a4/0f/3d/a40f3db39370251001ba29f5f24aa29c.jpg";
    
                unirseASala(nombre);
            } else {
                console.log("no")
            }
        }
        
    })

    // Emite la sala en donde se realizó la última conexión.
    socket.emit("respaldo");

    function Sonido() {
        const audio = new Audio("./static/sounds/alert.mp3");
        audio.play();
    }

    // Función para notificaciones.
    socket.on("message", function (msg) {

        if (Notification.permission === "granted") {
            const notification = new Notification("Nuevo mensaje", {
                body: msg,
            });
    
            Sonido();
        } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(function (permission) {
                if (permission === "granted") {
                    const notification = new Notification("Nuevo mensaje", {
                        body: msg,
                    });
                    Sonido();
                }
            });
        }
    });
});

// Proyecto web desarrollado por Carlos Adrián Espinosa Luna :)