export const STATES = Object.freeze(['draft', 'validated', 'queued', 'running', 'succeeded', 'failed']);
export const ACTIONS = Object.freeze(['validate', 'submit', 'run', 'complete']);

export class DomainError extends Error {
  constructor(code, message, status, details = {}) {
    super(message);
    this.name = 'DomainError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export function validateCreateInput(input) {
  if (!input || typeof input !== 'object') {
    throw new DomainError('INVALID_JOB_INPUT', 'job input must be an object', 422);
  }
  const query = typeof input.query === 'string' ? input.query.trim() : '';
  const strategy = typeof input.strategy === 'string' ? input.strategy.trim() : '';
  const owner = typeof input.owner === 'string' && input.owner.trim() ? input.owner.trim() : 'demo-user';
  if (query.length < 2 || query.length > 200) {
    throw new DomainError('INVALID_JOB_INPUT', 'query must contain 2-200 characters', 422, { field: 'query' });
  }
  if (!['baseline', 'strategy-v2'].includes(strategy)) {
    throw new DomainError('INVALID_JOB_INPUT', 'strategy must be baseline or strategy-v2', 422, { field: 'strategy' });
  }
  return { query, strategy, owner };
}

export function errorEnvelope(error) {
  if (error instanceof DomainError) {
    return {
      status: error.status,
      body: {
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      },
    };
  }
  return {
    status: 500,
    body: {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'internal server error',
        details: {},
      },
    },
  };
}
