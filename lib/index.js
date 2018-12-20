const kue = require('kue');

const send = async (type, data, connectionString) => {
  return new Promise((resolve, reject) => {
    const queue = kue.createQueue({
      redis: connectionString
    });
    queue.create(type, data)
      .save((err) => {
        if (err) {
          reject(err);
        } else {
          resolve(err);
        }
        try {
          queue.shutdown();
        } catch (e) {
        }
      });
  });
};

class ServiceNotificationsClient {
  constructor({ connectionString }) {
    this.connectionString = connectionString;
  }

  async notifyOrganisationUpdated(organisation) {
    if (!organisation) {
      throw new Error('Organisation must be provided');
    }
    if (!organisation.id) {
      throw new Error('Organisation must have id');
    }
    if (!organisation.name) {
      throw new Error('Organisation must have name');
    }
    if (!organisation.category) {
      throw new Error('Organisation must have category');
    }
    if (!organisation.category.id) {
      throw new Error('Organisation must have category.id');
    }
    await send('organisationupdated_v1', organisation, this.connectionString);
  }

  async notifyUserUpdated(user) {
    if (!user) {
      throw new Error('User must be provided');
    }
    if (!user.sub) {
      throw new Error('User must have sub');
    }
    await send('userupdated_v1', user, this.connectionString);
  }

  async notifyRoleUpdated(role) {
    if (!role) {
      throw new Error('Role must be provided');
    }
    if (!role.id) {
      throw new Error('Role must have id');
    }
    if (!role.name) {
      throw new Error('Role must have name');
    }
    if (!role.code) {
      throw new Error('Role must have code');
    }
    await send('roleupdated_v1', role, this.connectionString);
  }
}

module.exports = ServiceNotificationsClient;