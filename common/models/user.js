'use strict';

const validator = require('validator');

module.exports = function(model) {
  model.on('resetPasswordRequest', (info) => {
    if(validator.isEmail(info.email)) {
      model.app.models.Email.send({
        from: "QPlan it! <no-reply@qplan.it>", // sender address
        to: info.email, // list of receivers
        subject: "Restablecer contraseña de QPlan it!", // Subject line
        text: "Test body", // plain text body
        html: 'Se ha solicitado cambiar la contraseña de tu cuenta QPlan it, puedes introducir una nueva haciendo click ' +
          '<a href="http://localhost:3000/reset_password?jwt=' + info.accessToken.id + '">aqu&iacute;</a>. Si no ha ' +
          'solicitado cambiar la contraseña, por favor, ignore este correo.<br/>' +
          'El enlace expirará en 15 minutos.'
      });
    }
  });
};
