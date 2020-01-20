const baseTemplate = (content) => (`
<html style="background-color:#F6F6F6; color:#000000;font-family:AvenirNext-Regular,Droid Sans monospace,Roboto,Arial,sans-serif;">
  <body>
    <div style="max-width:620px;margin:25px auto 25px auto;">
      <div style="background-color:#FFFFFF;padding:20px;border-radius:10px">
       <center><img width="100" src="https://streampage.nyc3.cdn.digitaloceanspaces.com/memo/assets/memo_icon.png"/></center>
          ${content}
    </div>
    <center style="padding-top:20px;padding-bottom:20px">&copy; Memo ${new Date().getFullYear()}</center>
  </body>
</html>
`);

const welcomeEmailTemplate = () => baseTemplate(`
<h3>Bienvenido a Memo</h3>
<p>
¡Gracias por registrarte en Memo! Ya estás listo para crear publicaciones e interactuar con tus compañeros de clase.
</p>
`);

const otpEmailTemplate = (code) => baseTemplate(`
<h3>Recuperar contraseña</h3>
<p>Se ha recibido una solicitud de cambio de contraseña para su cuenta de Memo. Para realizar el cambio, introduzca el siguiente código en el app:</p>
<h4 style="text-align:center">${code}</h4>
<p>Este código sólo tendrá 24 horas de validez.</p>
`);

module.exports = {
    baseTemplate,
    welcomeEmailTemplate,
    otpEmailTemplate,
};
