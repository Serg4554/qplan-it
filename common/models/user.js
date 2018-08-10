'use strict';

const validator = require('validator');
const passwordValidator = require('password-validator');
const passwordSchema = new passwordValidator();
const TokenGenerator = require('uuid-token-generator');
const UserErrors = require('../errors/user');
const token = new TokenGenerator(256, TokenGenerator.BASE62);

passwordSchema
  .is().min(8)
  .is().max(100)
  .has().uppercase()
  .has().lowercase();


module.exports = function(model) {
  model.beforeRemote('create', async function (ctx) {
    if(!passwordSchema.validate(ctx.req.body.password, {})) {
      throw UserErrors.PASSWORD_TOO_WEAK;
    }
    if(!validator.isEmail(ctx.req.body.email)) {
      throw  UserErrors.INVALID_EMAIL;
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
    } else if(ctx.data.password) {
      if(!passwordSchema.validate(ctx.data.password, {})) {
        throw UserErrors.PASSWORD_TOO_WEAK;
      }
      if(ctx.options.accessToken && ctx.options.accessToken.ttl === 900) {
        await model.app.models.AccessToken.deleteById(ctx.options.accessToken.id);
      }
    }
  });


  model.observe('after save', async function(ctx) {
    if(ctx.isNewInstance) {
      const redirectUrl = encodeURIComponent("http://localhost:3000/account_verified");

      await model.findOne({where: {email: ctx.instance.email}})
        .then(user => {
          if(user) {
            const url  = "http://localhost:3001/api/users/confirm?uid=" + user.id + "&token=" + user.verificationToken + "&redirect=" + redirectUrl;

            model.app.models.Email.send({
              from: "QPlan it! <no-reply@qplan.it>", // sender address
              to: user.email, // list of receivers
              subject: "Activa tu cuenta de QPlan it!", // Subject line
              text: "", // plain text body
              html: 'Hola ' + ctx.instance.name + ', haz click <a href="' + url + '">aqu&iacute;</a> para activar tu cuenta de QPlan it!'
            });
          }
        });
    }
  });


  model.on('resetPasswordRequest', function(info) {
    if(validator.isEmail(info.email)) {
      model.app.models.Email.send({
        from: "QPlan it! <no-reply@qplan.it>", // sender address
        to: info.email, // list of receivers
        subject: "Restablecer contraseña de QPlan it!", // Subject line
        text: "", // plain text body
        html: 'Se ha solicitado cambiar la contraseña de tu cuenta QPlan it, puedes introducir una nueva haciendo click ' +
          '<a href="http://localhost:3000/password_recovery?jwt=' + info.accessToken.id + '&usr=' + info.user.id + '">aqu&iacute;</a>. Si no ha ' +
          'solicitado cambiar la contraseña, por favor, ignore este correo.<br/>' +
          'El enlace expirará en 15 minutos.'
      });
    }
  });
};
