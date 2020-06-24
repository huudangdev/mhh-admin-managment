'use strict';

/**
 * UsersPermissions.js controller
 *
 * @description: A set of functions called "actions" of the `users-permissions` plugin.
 */

const _ = require('lodash');

module.exports = {
  /**
   * Default action.
   *
   * @return {Object}
   */
  async createRole(ctx) {
    if (_.isEmpty(ctx.request.body)) {
      return ctx.badRequest(null, [{ messages: [{ id: 'Cannot be empty' }] }]);
    }

    try {
      await strapi.plugins['users-permissions'].services.userspermissions.createRole(
        ctx.request.body
      );

      ctx.send({ ok: true });
    } catch (err) {
      strapi.log.error(err);
      ctx.badRequest(null, [{ messages: [{ id: 'An error occured' }] }]);
    }
  },

  async deleteProvider(ctx) {
    const { provider } = ctx.params;

    if (!provider) {
      return ctx.badRequest(null, [{ messages: [{ id: 'Bad request' }] }]);
    }

    // TODO handle dynamic
    ctx.send({ ok: true });
  },

  async deleteRole(ctx) {
    // Fetch public role.
    const publicRole = await strapi.query('role', 'users-permissions').findOne({ type: 'public' });

    const publicRoleID = publicRole.id;

    const roleID = ctx.params.role;

    if (!roleID) {
      return ctx.badRequest(null, [{ messages: [{ id: 'Bad request' }] }]);
    }

    // Prevent from removing the public role.
    if (roleID.toString() === publicRoleID.toString()) {
      return ctx.badRequest(null, [{ messages: [{ id: 'Unauthorized' }] }]);
    }

    try {
      await strapi.plugins['users-permissions'].services.userspermissions.deleteRole(
        roleID,
        publicRoleID
      );

      ctx.send({ ok: true });
    } catch (err) {
      strapi.log.error(err);
      ctx.badRequest(null, [{ messages: [{ id: 'Bad request' }] }]);
    }
  },

  async getPermissions(ctx) {
    try {
      const { lang } = ctx.query;
      const plugins = await strapi.plugins[
        'users-permissions'
      ].services.userspermissions.getPlugins(lang);
      const permissions = await strapi.plugins[
        'users-permissions'
      ].services.userspermissions.getActions(plugins);

      ctx.send({ permissions });
    } catch (err) {
      ctx.badRequest(null, [{ message: [{ id: 'Not Found' }] }]);
    }
  },

  async getPolicies(ctx) {
    ctx.send({
      policies: _.without(
        _.keys(strapi.plugins['users-permissions'].config.policies),
        'permissions'
      ),
    });
  },

  async getRole(ctx) {
    const { id } = ctx.params;
    const { lang } = ctx.query;
    const plugins = await strapi.plugins['users-permissions'].services.userspermissions.getPlugins(
      lang
    );
    const role = await strapi.plugins['users-permissions'].services.userspermissions.getRole(
      id,
      plugins
    );

    if (_.isEmpty(role)) {
      return ctx.badRequest(null, [{ messages: [{ id: `Role don't exist` }] }]);
    }

    ctx.send({ role });
  },

  async getRoles(ctx) {
    try {
      const roles = await strapi.plugins['users-permissions'].services.userspermissions.getRoles();

      ctx.send({ roles });
    } catch (err) {
      ctx.badRequest(null, [{ messages: [{ id: 'Not found' }] }]);
    }
  },

  async getRoutes(ctx) {
    try {
      const routes = await strapi.plugins[
        'users-permissions'
      ].services.userspermissions.getRoutes();

      ctx.send({ routes });
    } catch (err) {
      ctx.badRequest(null, [{ messages: [{ id: 'Not found' }] }]);
    }
  },

  async index(ctx) {
    // Send 200 `ok`
    ctx.send({ message: 'ok' });
  },

  async init(ctx) {
    const admins = await strapi.query('administrator', 'admin').find({ _limit: 1 });

    ctx.send({ hasAdmin: admins.length > 0 });
  },

  async searchUsers(ctx) {
    const { id } = ctx.params;

    const data = await strapi.query('user', 'users-permissions').custom(searchQueries)({
      id,
    });

    ctx.send(data);
  },

  async updateRole(ctx) {
    const roleID = ctx.params.role;

    if (_.isEmpty(ctx.request.body)) {
      return ctx.badRequest(null, [{ messages: [{ id: 'Bad request' }] }]);
    }

    try {
      await strapi.plugins['users-permissions'].services.userspermissions.updateRole(
        roleID,
        ctx.request.body
      );

      ctx.send({ ok: true });
    } catch (err) {
      strapi.log.error(err);
      ctx.badRequest(null, [{ messages: [{ id: 'An error occurred' }] }]);
    }
  },

  async getEmailTemplate(ctx) {
    ctx.send(
      await strapi
        .store({
          environment: '',
          type: 'plugin',
          name: 'users-permissions',
          key: 'email',
        })
        .get()
    );
  },

  async updateEmailTemplate(ctx) {
    if (_.isEmpty(ctx.request.body)) {
      return ctx.badRequest(null, [{ messages: [{ id: 'Cannot be empty' }] }]);
    }

    await strapi
      .store({
        environment: '',
        type: 'plugin',
        name: 'users-permissions',
        key: 'email',
      })
      .set({ value: ctx.request.body['email-templates'] });

    ctx.send({ ok: true });
  },

  async getAdvancedSettings(ctx) {
    ctx.send({
      settings: await strapi
        .store({
          environment: '',
          type: 'plugin',
          name: 'users-permissions',
          key: 'advanced',
        })
        .get(),
      roles: await strapi.plugins['users-permissions'].services.userspermissions.getRoles(),
    });
  },

  async updateAdvancedSettings(ctx) {
    if (_.isEmpty(ctx.request.body)) {
      return ctx.badRequest(null, [{ messages: [{ id: 'Cannot be empty' }] }]);
    }

    await strapi
      .store({
        environment: '',
        type: 'plugin',
        name: 'users-permissions',
        key: 'advanced',
      })
      .set({ value: ctx.request.body });

    ctx.send({ ok: true });
  },

  async getProviders(ctx) {
    const providers = await strapi
      .store({
        environment: '',
        type: 'plugin',
        name: 'users-permissions',
        key: 'grant',
      })
      .get();

    ctx.send(providers);
  },

  async updateProviders(ctx) {
    if (_.isEmpty(ctx.request.body)) {
      return ctx.badRequest(null, [{ messages: [{ id: 'Cannot be empty' }] }]);
    }

    await strapi
      .store({
        environment: '',
        type: 'plugin',
        name: 'users-permissions',
        key: 'grant',
      })
      .set({ value: ctx.request.body.providers });

    ctx.send({ ok: true });
  },
};

const searchQueries = {
  bookshelf({ model }) {
    return ({ id }) => {
      return model
        .query(function(qb) {
          qb.where('username', 'LIKE', `%${id}%`).orWhere('email', 'LIKE', `%${id}%`);
        })
        .fetchAll()
        .then(results => results.toJSON());
    };
  },
  mongoose({ model }) {
    return ({ id }) => {
      const re = new RegExp(id);

      return model.find({
        $or: [{ username: re }, { email: re }],
      });
    };
  },
};
