const form = document.querySelector('#create-form');
const message = document.querySelector('#message');
const jobId = document.querySelector('#job-id');
const state = document.querySelector('#state');
const error = document.querySelector('#error');
const audit = document.querySelector('#audit');
const actionButtons = [...document.querySelectorAll('[data-action]')];
let currentId = null;

function showMessage(text, kind = 'info') {
  message.textContent = text;
  message.dataset.kind = kind;
}

function setButtons(currentState) {
  const allowed = {
    draft: ['validate'],
    validated: ['submit'],
    queued: ['run'],
    running: ['complete'],
    succeeded: [],
    failed: [],
  }[currentState] || [];
  for (const button of actionButtons) {
    const isComplete = button.dataset.action === 'complete';
    button.disabled = !currentId || (!isComplete ? !allowed.includes(button.dataset.action) : !allowed.includes('complete'));
  }
}

function render(job) {
  currentId = job.id;
  jobId.textContent = job.id;
  state.textContent = job.state;
  error.textContent = job.error ? `${job.error.code}: ${job.error.message}` : 'none';
  audit.replaceChildren();
  if (!job.audit.length) {
    audit.append(Object.assign(document.createElement('li'), { textContent: 'no transitions' }));
  } else {
    for (const event of job.audit) {
      audit.append(Object.assign(document.createElement('li'), {
        textContent: `${event.action}: ${event.from} → ${event.to} (${event.actor})`,
      }));
    }
  }
  setButtons(job.state);
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: { 'content-type': 'application/json' },
    ...options,
  });
  const body = await response.json();
  if (!response.ok) {
    const detail = body.error ? `${body.error.code}: ${body.error.message}` : `HTTP ${response.status}`;
    throw new Error(detail);
  }
  return body;
}

async function refresh() {
  if (!currentId) return;
  render(await api(`/api/jobs/${encodeURIComponent(currentId)}`));
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  try {
    const job = await api('/api/jobs', {
      method: 'POST',
      body: JSON.stringify({
        query: document.querySelector('#query').value,
        strategy: document.querySelector('#strategy').value,
        owner: document.querySelector('#owner').value,
      }),
    });
    render(job);
    showMessage('job created', 'success');
  } catch (cause) {
    showMessage(cause.message, 'error');
  }
});

for (const button of actionButtons) {
  button.addEventListener('click', async () => {
    const action = button.dataset.action;
    try {
      const body = action === 'complete' ? { outcome: button.dataset.outcome } : {};
      render(await api(`/api/jobs/${encodeURIComponent(currentId)}/${action}`, {
        method: 'POST',
        body: JSON.stringify(body),
      }));
      showMessage(`${action} completed`, 'success');
    } catch (cause) {
      showMessage(cause.message, 'error');
      await refresh();
    }
  });
}
