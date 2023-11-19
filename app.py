# Creado por: Carlos Adrián Espinosa Luna / Grupo K.
from flask import Flask, render_template
from flask_socketio import SocketIO, emit, join_room, send
from datetime import datetime

# Inicializador del framework y el módulo de websocket.
app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

# Lista de usuarios conectados.
usuarios_conectados = set()

# Diccionario que funciona como base de datos de la información de la aplicación.
salas = {}

# Ruta principal de la aplicación.
@app.route("/")
def index():
    return render_template('index.html')

# Envío del evento que carga las salas en la aplicación.
@socketio.on("connect")
def handle_connect():
    
    # Envío de la "base de datos" al cliente.
    emit("salas_actualizadas", salas)

# Solicitud de creación de sala, estas no pueden tener el mismo nombre.
@socketio.on("crear_sala")
def handle_crear_sala(data):
    
    # Data hace referencia al JSON enviado desde el cliente.
    nombre_sala = data["nombre_sala"]
    creador_sala = data["nombre_usuario"]
    imagen_sala = data["imagen_sala"]
    
    if nombre_sala not in salas:
        # Cambia la estructura de la sala para incluir creador e imagen
        salas[nombre_sala] = {"mensajes": [], "creador": creador_sala, "imagen": imagen_sala}
        
    # Actualizar el cliente para mostrar la nueva sala.
    emit("salas_actualizadas", salas, broadcast=True)

# Carga de las salas al lado del cliente.
@socketio.on("obtener_salas")
def handle_obtener_salas(data):
    
    # Enviar las salas disponibles con mensajes en el nuevo formato JSON.
    salas_en_formato_json = {}
    for sala, mensajes in salas.items():
        
        # Usando una lista de comprensión se agrega la información al objeto.
        salas_en_formato_json[sala] = [{"usuario": mensaje["usuario"], "imagen": mensaje["imagen"], "mensaje": mensaje["mensaje"], "hora": mensaje["hora"], "fecha": mensaje["fecha"]} for mensaje in mensajes]
        
    emit("salas_actualizadas", salas_en_formato_json)

# Evento de envío de mensajes en una sala.
@socketio.on("enviar_mensaje")
def handle_enviar_mensaje(data):

    nombre_sala = data["nombre_sala"]
    mensaje = data["mensaje"]
    usuario = data["nombre_usuario"]
    # Acá se le puede agregar una imagen por defecto para mostrar en las conversaciones (si el usuario no tiene).
    imagen = data.get("imagen_usuario", "")
    hora = datetime.now().strftime("%I:%M %p")
    fecha = datetime.now().strftime("%d/%m/%Y")

    mensaje_con_hora = {"usuario": usuario, "imagen": imagen, "mensaje": mensaje, "hora": hora, "fecha": fecha}  # Formato JSON.

    if nombre_sala in salas:
        # Agrega el nuevo mensaje.
        salas[nombre_sala]["mensajes"].append(mensaje_con_hora)

        # Verifica si hay 100 o más mensajes en la sala.
        if len(salas[nombre_sala]["mensajes"]) > 100:
            # Si hay más de 100 mensajes, elimina el mensaje más antiguo (el primero en la lista).
            del salas[nombre_sala]["mensajes"][0]

        # Emite el mensaje a los clientes en la sala.
        emit("mensaje_recibido", mensaje_con_hora, room=nombre_sala, broadcast=True)
        send(f"Nuevo mensaje de {usuario} en {nombre_sala}", room=nombre_sala)

# Evento de unión a una sala (no necesita una autorización estricta).
@socketio.on("unirse_a_sala")
def handle_unirse_a_sala(data):
    # Validaciones de existencia de la sala en donde se intenta unir.
    nombre_sala = data["nombreSala"]

    join_room(nombre_sala)

    if nombre_sala in salas:
        # Si la sala existe, unirse y mostrar los mensajes anteriores.
        emit("chat_actualizado", {"mensajes": salas[nombre_sala]["mensajes"]})
    else:
        # De lo contrario, no cargar mensajes.
        emit("chat_actualizado", {"mensajes": []})

# Control de información de la sala en caso de reiniciar la página.
sala_actual_usuarios = dict()

# Control de sala actual:
@socketio.on("sala_actual")
def sala_actual(data):
    global sala_actual_usuarios
    
    nombre = data["nombre_sala"]
    creador = data["creador"]
    imagen = data["imagen"]
    usuario = data["usuario"]

    # Agrega al diccionario la información usando de clave al nombre de usuario.
    if data:
        sala_actual_usuarios[usuario] = [nombre, creador, imagen]
    
# Envía la información de la última sala en la que estuvo el usuario.
@socketio.on("respaldo")
def respaldo():
    
    global sala_actual_usuarios

    if sala_actual:
        emit("respaldo_exitoso", sala_actual_usuarios)
        
# Eliminación de salas.
# Añade el siguiente código en tu archivo Python donde se define el socket.
@socketio.on("eliminar_sala")
def handle_eliminar_sala(data):
    
    # En caso de encontrarse en la misma sala, permitirá la eliminación sin errores.
    global sala_actual_usuarios
    
    nombre_sala = data["nombre_sala"]
    creador_sala = salas.get(nombre_sala, {}).get("creador")

    # Obtiene el nombre del usuario actual desde los datos almacenados en el navegador.
    username_actual = data["nombre_usuario"]

    if creador_sala == username_actual:
        if nombre_sala in salas:
            del salas[nombre_sala]
            
            # Actualizar el cliente para mostrar las salas actualizadas.
            emit("salas_actualizadas", salas, broadcast=True)
            emit("cambiar_sala", nombre_sala)

    else:
        emit("mensaje_error", {"mensaje": "Solo el creador de la sala puede eliminarla."})


if __name__ == "__main__":
    host = "0.0.0.0"
    port = 3000
    
    app.run(host=host, port=port)
    
# Proyecto web finalizado :)
