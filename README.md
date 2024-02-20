# Project 2: Flack

¡Bienvenido a Flack! A continuación, encontrarás una descripción general del proyecto, una lista de los archivos incluidos y las instrucciones para ejecutar la aplicación en tu entorno local.

## Descripción del Proyecto

Flack es una plataforma que facilita la creación de salas de chat para interactuar con varias personas simultáneamente. Para unirte, no es necesario crear una cuenta; simplemente asigna un nombre de usuario y, si lo prefieres, agrega una foto de perfil. No te preocupes, tu nombre de usuario y tu imagen quedarán registrados en tu navegador para futuras sesiones. Una vez dentro, tendrás la libertad de crear tantas salas como desees, brindándote la oportunidad de disfrutar de conversaciones agradables y personalizadas.

## Video tutorial

   **Youtube**: https://youtu.be/CagWjRBUChI

## Archivos en el Proyecto

- **application.py**: Este archivo contiene el corazón de la aplicación Flask, con las rutas y funciones para manejar la funcionalidad de la aplicación web.

- **templates/**: Esta carpeta contiene al archivo HTML que define la estructura y apariencia de la página web de la aplicación.

- **static/**: Aquí encontrarás archivos estáticos como hojas de estilo CSS, el Javascript, las fuentes y otros recursos utilizados en las plantillas HTML.

- **.env.txt**: Un archivo de ejemplo que muestra cómo deben configurarse las variables de entorno (en este caso, la configuración del nombre de la app).

## Ejecución de la Aplicación

1. Asegúrate de tener Python 3.11 instalado en tu sistema.

2. Instala las dependencias de Python utilizando el siguiente comando:

   ```
   pip install -r requirements.txt
   ```

3. Renombra el archivo `.env.txt` a `.env`.

   ```
   .env.txt -> .env
   ```

4. Al final tu archivo `.env` debe tener la siguiente estructura:

   ```
   export FLASK_APP=application.py
   ```

5. Ejecuta la aplicación de Flask con el siguiente comando:
   ```
   flask run
   ```

6. Abre tu navegador web y accede a `http://localhost:5000` para comenzar a usar la aplicación.

7. Introduce un usuario y una URL de imagen y comienza a disfrutar de tu aplicación.

## Notas Adicionales

- Asegúrate de tener los archivos de la aplicación con la siguiente jerarquía:
   ```
   application.py
   .env
   .gitignore

   - static
      - css
      - fonts
      - icons
      - javascript
   
   - templates
   ```

## A considerar

- Recuerda realizar las ejecuciones de la consola desde la carpeta en donde se encuentra el application.py.

- La aplicación no incluye autenticación de usuarios.

- Todas las salas de la aplicación son de acceso público y los mensajes no se cifran al momento de compartirse.

- La aplicación no almacenará en una base de datos la información compartida, si el servidor es reiniciado, todos los datos (a excepción de tu nombre que se guarda en el navegador) se perderán.

- En caso de que desees modificar tu nombre de usuario, será necesario limpiar la caché de tu navegador para iniciar sesión con el nuevo nombre deseado.

- Puedes eliminar un canal haciendo click derecho desde la vista de canales. La única condición es que debes ser el creador del canal.

- En la versión para dispositivos pequeños, puedes retroceder simplemente tocando el nombre de la sala.

- Permite a la página las notificaciones para poder saber quién ha enviado un nuevo mensaje.

¡Espero que disfrutes utilizando la aplicación de chats! Si tienes alguna pregunta o necesitas más información, no dudes en contactarme.

## Hecho por: Carlos Adrián Espinosa Luna.