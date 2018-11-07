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
}

module.exports = ServiceNotificationsClient;