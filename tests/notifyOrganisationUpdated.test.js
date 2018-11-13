jest.mock('kue');

const kue = require('kue');
const PublicApiClient = require('./../lib');

const job = {
  save: jest.fn(),
};
const queue = {
  create: jest.fn(),
};
const connectionString = 'some-redis-connection-string';
const organisation = {
  id: 'organisaton-1',
  name: 'Organisation One',
  category: {
    id: '001',
    name: 'Establishment',
  }
};
const reason = 'CREATE';

describe('when sending organisationupdated_v1', () => {
  let client;

  beforeEach(() => {
    job.save.mockReset().mockImplementation((cb) => {
      cb();
    });

    queue.create.mockReset().mockReturnValue(job);

    kue.createQueue.mockReset().mockReturnValue(queue);

    client = new PublicApiClient({ connectionString });
  });

  it('then it should create new queue connection to redis', async () => {
    await client.notifyOrganisationUpdated(organisation, reason);

    expect(kue.createQueue).toHaveBeenCalledTimes(1);
    expect(kue.createQueue.mock.calls[0][0]).toEqual({
      redis: connectionString,
    });
  });

  it('then it should create job with correct type', async () => {
    await client.notifyOrganisationUpdated(organisation, reason);

    expect(queue.create).toHaveBeenCalledTimes(1);
    expect(queue.create.mock.calls[0][0]).toBe('organisationupdated_v1');
  });

  it('then it should create job with correct data', async () => {
    await client.notifyOrganisationUpdated(organisation, reason);

    expect(queue.create).toHaveBeenCalledTimes(1);
    expect(queue.create.mock.calls[0][1]).toEqual({
      organisation,
      reason,
    });
  });

  it('then it should save job', async () => {
    await client.notifyOrganisationUpdated(organisation, reason);

    expect(job.save).toHaveBeenCalledTimes(1);
  });

  it('then it should error if fails to save job', async () => {
    job.save.mockImplementation(() => {
      throw new Error('test');
    });

    try {
      await client.notifyOrganisationUpdated(organisation, reason);
      throw new Error('no error thrown');
    } catch (e) {
      expect(e.message).toBe('test');
      expect(job.save).toHaveBeenCalledTimes(1);
    }
  });

  it('then it should error if organisation not passed', async () => {
    try {
      await client.notifyOrganisationUpdated(undefined, reason);
      throw new Error('no error thrown');
    } catch (e) {
      expect(e.message).toBe('Organisation must be provided');
      expect(job.save).toHaveBeenCalledTimes(0);
    }
  });

  it('then it should error if organisation missing id', async () => {
    const brokenOrganisation = Object.assign({}, organisation, { id: undefined });

    try {
      await client.notifyOrganisationUpdated(brokenOrganisation, reason);
      throw new Error('no error thrown');
    } catch (e) {
      expect(e.message).toBe('Organisation must have id');
      expect(job.save).toHaveBeenCalledTimes(0);
    }
  });

  it('then it should error if organisation missing name', async () => {
    const brokenOrganisation = Object.assign({}, organisation, { name: undefined });

    try {
      await client.notifyOrganisationUpdated(brokenOrganisation, reason);
      throw new Error('no error thrown');
    } catch (e) {
      expect(e.message).toBe('Organisation must have name');
      expect(job.save).toHaveBeenCalledTimes(0);
    }
  });

  it('then it should error if organisation missing category', async () => {
    const brokenOrganisation = Object.assign({}, organisation, { category: undefined });

    try {
      await client.notifyOrganisationUpdated(brokenOrganisation, reason);
      throw new Error('no error thrown');
    } catch (e) {
      expect(e.message).toBe('Organisation must have category');
      expect(job.save).toHaveBeenCalledTimes(0);
    }
  });

  it('then it should error if organisation missing category.id', async () => {
    const brokenOrganisation = Object.assign({}, organisation, { category: { name: 'category one' } });

    try {
      await client.notifyOrganisationUpdated(brokenOrganisation, reason);
      throw new Error('no error thrown');
    } catch (e) {
      expect(e.message).toBe('Organisation must have category.id');
      expect(job.save).toHaveBeenCalledTimes(0);
    }
  });

  it('then it should default reason to UPDATE if not provided', async () => {
    await client.notifyOrganisationUpdated(organisation, undefined);

    expect(queue.create).toHaveBeenCalledTimes(1);
    expect(queue.create.mock.calls[0][1]).toEqual({
      organisation,
      reason: 'UPDATE',
    });
  });
});