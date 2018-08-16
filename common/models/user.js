'use strict';

const passwordValidator = require('password-validator');
const passwordSchema = new passwordValidator();
const TokenGenerator = require('uuid-token-generator');
const token = new TokenGenerator(256, TokenGenerator.BASE62);
const ErrorConst = require('../../server/middleware/error-const');

passwordSchema
  .is().min(8)
  .is().max(100)
  .has().uppercase()
  .has().lowercase();

module.exports = function(model) {
  model.beforeRemote('create', async function (ctx) {
    if(!passwordSchema.validate(ctx.req.body.password, {})) {
      throw ErrorConst.Error(ErrorConst.PASSWORD_TOO_WEAK);
    }
  });

  model.beforeRemote('replaceById', async function (ctx) {
    if(!passwordSchema.validate(ctx.req.body.password, {})) {
      throw ErrorConst.Error(ErrorConst.PASSWORD_TOO_WEAK);
    }
  });

  model.beforeRemote('prototype.patchAttributes', async function (ctx) {
    if(!passwordSchema.validate(ctx.req.body.password, {})) {
      throw ErrorConst.Error(ErrorConst.PASSWORD_TOO_WEAK);
    }
  });

  model.beforeRemote('changePassword', async function (ctx) {
    if(!passwordSchema.validate(ctx.req.body.newPassword, {})) {
      throw ErrorConst.Error(ErrorConst.PASSWORD_TOO_WEAK);
    }
  });

  model.beforeRemote('setPassword', async function (ctx) {
    if(!passwordSchema.validate(ctx.req.body.newPassword, {})) {
      throw ErrorConst.Error(ErrorConst.PASSWORD_TOO_WEAK);
    }
    if(ctx.req.accessToken && ctx.req.accessToken.ttl === 900) {
      await model.app.models.AccessToken.deleteById(ctx.req.accessToken.id);
    }
  });

  model.observe('before save', async function(ctx) {
    if(ctx.isNewInstance) {
      await model.findOne({where: {email: ctx.instance.email}})
        .then(user => {
          if(!user) {
            ctx.instance.verificationToken = token.generate();
          }
        })
    }
  });

  model.observe('after save', async function(ctx) {
    if(ctx.isNewInstance) {
      await model.findOne({where: {email: ctx.instance.email}})
        .then(user => sendVerificationEmail(user));
    }
  });

  model.on('resetPasswordRequest', async function(info) {
    await sendPasswordRecoveryEmail(info.user, info.accessToken.id);
  });


  function sendVerificationEmail(user) {
    if(user) {
      const url = "http://localhost:3001/api/users/confirm?uid=" + user.id + "&token=" + user.verificationToken +
        "&redirect=" + encodeURIComponent("http://localhost:3000/account_verified");

      return model.app.models.Email.send({
        from: "QPlan it! <no-reply@qplan.it>",
        to: user.email,
        subject: "Activa tu cuenta de QPlan it!",
        text: "",
        html: 'Hola ' + user.name + ', haz click <a href="' + url + '">aqu&iacute;</a> para activar tu cuenta de QPlan it!'
      });
    }
  }

  function sendPasswordRecoveryEmail(user, token) {
    if(user && token) {
      const url = 'http://localhost:3000/password_recovery?jwt=' + token + '&usr=' + user.id;

      return model.app.models.Email.send({
        from: "QPlan it! <no-reply@qplan.it>",
        to: user.email,
        subject: "Restablecer contraseña de QPlan it!",
        text: "",
        html: 'Se ha solicitado cambiar la contraseña de tu cuenta QPlan it, puedes introducir una nueva haciendo click ' +
          '<a href="' + url + '">aqu&iacute;</a>. Si no ha solicitado cambiar la contraseña, por favor, ignore este correo.' +
          '<br/>El enlace expirará en 15 minutos.'
      });
    }
  }
};
