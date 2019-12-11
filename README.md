# Memo App - Server

Servidor en express para la Aplicacion movil creada para  [Proyecto Final, Grupo QUACK](https://www.intec.edu.do) alojado en heroku.


## Tabla de contenidos

- [Instrucciones de configuracion](#Instrucciones-de-configuracion)
- [Instrucciones de instalación](#Instrucciones-de-instalación)
- [Instrucciones de operacion](#Instrucciones-de-operacion)
- [Estructura de archivos y directorios](#Estructura-de-archivos-y-directorios)
- [Changelog](#changelog)
- [Contacto](#Contacto)

# Instrucciones de configuración

## Prerrequisitos
- [NodeJS](https://nodejs.org)
- [Express](https://expressjs.com/es/)
- [Heroku](https://www.heroku.com/)
- [Mongodb](https://www.mongodb.com/es)

Ver versiones especificas en package.json.

## Instrucciones

1. Clonar el proyecto en un directorio, con el siguiente comando.

```sh
$ git clone
```

2. Correr el comando **npm install** dentro del directorio del proyecto para instalar todas las dependencias.

```sh
$ npm install
```

# Instrucciones de instalación

## Variables de ambiente

Para ciertas funcionalidades, la aplicacion depende de que algunas variables de ambiente estén configuradas:

**Carga de archivos**
- `AWS_ACCESS_KEY_ID`: Identificador de acceso del proveedor de object storage.
- `AWS_SECRET_ACCESS_KEY`: Llave de acceso secreta del proveedor de object storage.

**Autenticación**
- `AUTH_SECRET`: Llave secreta de encriptación de credenciales de usuario. Esta tendrá un valor por defecto que debe ser especificado en ambientes productivos.

**Base de datos**
- `MONGODB_URI`: URI de conexión hacia la base de datos mongodb. Por defecto apunta a una instalación local. 

## Despliegue

### Heroku
[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/QUACK-INTEC/memo-server)

Para desplegar la aplicacion en un servidor de Heroku, solo debe presionar botón anterior. El URI de conexion a la base de datos se configurará automaticamente. 

### Servidores tradicionales

Para desplegar en servidores tradicionales, asegurar instalar NodeJS en el servidor, asi como tener MongoDB corriendo, sea en el mismo servidor o en algun proveedor de base de datos como servicio (MongoDB Atlas)

# Instrucciones de operación

1. Correr el comando **npm start** dentro del directorio del proyecto para inicializar el servidor de expo, el cual alojara nuestro servidor local para poder comunicarse con la app.


```sh
$ npm start 
```

## **Probar app/server con Postman**

1. Asegurarse de tener un token valido para realizar las llamadas al servidor.

2. Colocar los parametros necesarios (si aplica) para poder realizar la llamada al endpoint que queremos probar.

## Pruebas unitarias

Para correr las pruebas unitarias, asegurar tener instalado `mocha`. Luego, correr siguiente comando:

```sh
$ npm run test 
```

# Estructura de archivos y directorios

```
/src
  /constants
    /errors
  /controllers
  /models
  /routes
  /services
  /unihook
  /utils
  database.js
  server.js
```

# Copyright

La reproducción, adaptación o transición de este producto por parte de terceros sin permiso escrito previo de la organización MEMO está completamente prohibido.

MEMO no hace representaciones ni garantías, ya sean expresas o implícitas, por o con respecto a cualquier cosa en este documento, y no será responsable de ninguna garantía implícita de comerciabilidad o adecuación para un propósito particular o por ningún daño indirecto, especial o consecuente.

# Contacto

Para cualquier duda se puede comunicar via correo electronico a memostudentapp@gmail.com

# Changelog

Release notes:

- [1.0.0](https://docs.google.com/document/d/1-iJrKZQLSGSOBNvlalW9tsI7nNbIhQBKuhJIQzTApdA/edit?usp=sharing)



