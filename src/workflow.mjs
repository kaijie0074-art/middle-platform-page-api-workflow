import { DomainError } from './contracts.mjs';

const transitionTable = {
  validate: { draft: 'validated' },
  submit: { validated: 'queued' },
  run: { queued: 'running' },
  complete: { running: 'outcome-dependent' },
};

export function transition(job, action, { actor = 'demo-user', outcome = null } = {}) {
  const allowed = transitionTable[action];
  if (!allowed) {
    throw new DomainError('UNKNOWN_ACTION', `unknown action: ${action}`, 400, { action });
  }
  const configuredTarget = allowed[job.state];
  if (!configuredTarget) {
    throw new DomainError('INVALID_TRANSITION', `job cannot ${action} from ${job.state}`, 409, {
      jobId: job.id,
      state: job.state,
      action,
    });
  }

  let nextState = configuredTarget;
  if (action === 'complete') {
    if (!['success', 'failure'].includes(outcome)) {
      throw new DomainError('INVALID_OUTCOME', 'outcome must be success or failure', 400, { outcome });
    }
    nextState = outcome === 'success' ? 'succeeded' : 'failed';
  }

  const now = new Date().toISOString();
  const event = {
    action,
    from: job.state,
    to: nextState,
    actor,
    at: now,
  };
  job.state = nextState;
  job.updatedAt = now;
  job.audit.push(event);
  if (nextState === 'failed') {
    job.error = { code: 'RETRIEVAL_FAILED', message: 'retrieval provider failed', details: { action } };
  } else {
    job.error = null;
  }
  return job;
}
