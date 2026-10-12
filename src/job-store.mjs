import { randomUUID } from 'node:crypto';
import { validateCreateInput } from './contracts.mjs';

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function createJobStore() {
  const jobs = new Map();
  let sequence = 0;

  return {
    create(input) {
      const valid = validateCreateInput(input);
      sequence += 1;
      const now = new Date().toISOString();
      const job = {
        id: `job-${sequence}-${randomUUID().slice(0, 8)}`,
        query: valid.query,
        strategy: valid.strategy,
        owner: valid.owner,
        state: 'draft',
        createdAt: now,
        updatedAt: now,
        audit: [],
        error: null,
      };
      jobs.set(job.id, job);
      return clone(job);
    },
    get(id) {
      const job = jobs.get(id);
      return job ? clone(job) : null;
    },
    getMutable(id) {
      return jobs.get(id) ?? null;
    },
    save(job) {
      jobs.set(job.id, job);
      return clone(job);
    },
    size() {
      return jobs.size;
    },
  };
}
