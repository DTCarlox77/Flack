document.addEventListener("DOMContentLoaded", () => {
    const chat_menu = document.querySelector("#chat-menu");
    const room_menu = document.querySelector("#all-rooms");

    const cabeza = document.querySelector("#exit-room");
    const chat_menu_content = document.querySelector("#contenedor-de-chats");

    const logo = document.querySelector("#show-all-rooms");

    function recarga() {
        if (window.innerWidth <= 950) {
            if (chat_menu.style.display === "flex") {
                room_menu.style.display = "none";
            }
        }
    }

    function cerrar() {

        if (window.innerWidth <= 950) {
            chat_menu.style.display = "none";
            room_menu.style.display = "flex";
        }
    }

    function redimensionar() {
        if (window.innerWidth <= 950) {

            if (logo.style.display === "none") {
                if (chat_menu_content.style.display === "flex") {
                    room_menu.style.display = "none";
                } else {
                    room_menu.style.display = "flex";
                }
            } else {
                room_menu.style.display = "flex";
                chat_menu.style.display = "none";
            }
            
        } else {
            room_menu.style.display = "flex";
            chat_menu.style.display = "flex";
        }
    }

    function cargar() {
        recarga();
        redimensionar();
    }
    window.addEventListener("resize", cargar);
    cabeza.addEventListener("click", cerrar);
    cargar()
});
