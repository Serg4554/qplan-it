'use strict';

let shortid = require('shortid');
let hashids = require('hashids');
let bcrypt = require('bcrypt');
let randtoken = require('rand-token');

module.exports = function(model) {
  model.validatesPresenceOf("days");

  // Apply checks and modifications before save
  model.observe('before save', async function(ctx) {
    if(ctx.isNewInstance) {
      let userId = null;
      if(ctx.options.accessToken) {
        userId = ctx.options.accessToken.userId;
      }

      ctx.instance.id = new hashids(shortid.generate(), 6).encode(1);
      ctx.instance.ownerId = userId;
      ctx.instance.claimToken = userId ? null : randtoken.generate(64);
      if(ctx.instance.password) {
        ctx.instance.password = bcrypt.hashSync(ctx.instance.password, bcrypt.genSaltSync());
      }
    } else if(ctx.instance) {
      return ctx.Model.findById(ctx.instance.id)
        .then(event => {
          ctx.instance.id = event.id;
          ctx.instance.ownerId = event.ownerId;
          ctx.instance.claimToken = event.claimToken;
          if(ctx.instance.password) {
            ctx.instance.password = bcrypt.hashSync(ctx.instance.password, bcrypt.genSaltSync());
          }
        });
    } else if(ctx.currentInstance) {
      return ctx.Model.findById(ctx.currentInstance.id)
        .then(event => {
          ctx.instance.id = event.id;
          ctx.data.ownerId = event.ownerId;
          ctx.data.claimToken = event.claimToken;
          if(ctx.data.password) {
            ctx.data.password = bcrypt.hashSync(ctx.data.password, bcrypt.genSaltSync());
          }
        });
    }
  });

  // Send the claimToken when an event is created
  model.observe('after save', async function(ctx) {
    if(ctx.isNewInstance && ctx.instance.claimToken) {
      ctx.instance._claimToken = ctx.instance.claimToken;
    }
  });

  // Logic for claiming an event
  model.remoteMethod('claim', {
      description: 'Allows an user to claims an event using the claimToken',
      accepts: [
        {arg: 'id', type: 'String', required: true, description: 'Model id'},
        {arg: 'userId', type: 'any', http: ctx => ctx.req.accessToken ? ctx.req.accessToken.userId : null},
        {arg: 'claimToken', type: 'String', required: true, http: {source: 'form'}, description: 'Claim token'},
      ],
      http: {verb: 'POST', path: '/:id/claim'}
    }
  );
  model.claim = function(eventId, userId, claimToken, cb) {
    if(!userId) {
      let error = new Error("You need to log in to claim an event");
      error.statusCode = 400;
      return cb(error);
    }
    model.findById(eventId)
      .then(event => {
        if(!event) {
          let error = new Error("Event not found");
          error.statusCode = 400;
          return cb(error);
        }

        if(!event.claimToken || event.ownerId) {
          let error = new Error("The event already has an owner");
          error.statusCode = 400;
          return cb(error);
        }

        if(event.claimToken !== claimToken) {
          let error = new Error("Invalid claim token");
          error.statusCode = 400;
          return cb(error);
        }

        model.update({id: event.id}, {ownerId: userId, claimToken: null});

        return cb();
      });
  };
};
