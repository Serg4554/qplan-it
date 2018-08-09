'use strict';

const validator = require('validator');
const passwordValidator = require('password-validator');
const passwordSchema = new passwordValidator();

passwordSchema
  .is().min(8)
  .is().max(100)
  .has().uppercase()
  .has().lowercase();

module.exports = function(model) {
  model.beforeRemote('create', function (ctx, inst, next) {
    if(!passwordSchema.validate(ctx.req.body.password, {})) {
      return next(new Error("Password must have at least 8 characters, uppercase and lowercase letters"));
    }

    next();
  });

  model.on('resetPasswordRequest', (info) => {
    if(validator.isEmail(info.email)) {
      model.app.models.Email.send({
        from: "QPlan it! <no-reply@qplan.it>", // sender address
        to: info.email, // list of receivers
        subject: "Restablecer contraseña de QPlan it!", // Subject line
        text: "Test body", // plain text body
        html: 'Se ha solicitado cambiar la contraseña de tu cuenta QPlan it, puedes introducir una nueva haciendo click ' +
          '<a href="http://localhost:3000/password_recovery?jwt=' + info.accessToken.id + '">aqu&iacute;</a>. Si no ha ' +
          'solicitado cambiar la contraseña, por favor, ignore este correo.<br/>' +
          'El enlace expirará en 15 minutos.'
      });
    }
  });
};
