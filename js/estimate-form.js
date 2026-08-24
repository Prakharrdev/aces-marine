(function () {
  const form = document.getElementById('estimateForm');
  if (!form) return;

  const btn = document.getElementById('estimateSubmitBtn');
  const msg = document.getElementById('estimateFormMsg');

  function setMsg(text, ok) {
    msg.textContent = text;
    msg.style.color = ok ? '#38a169' : '#e53e3e';
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const data = {};
    for (const field of form.elements) {
      if (field.name) data[field.name] = field.value;
    }

    btn.disabled = true;
    btn.textContent = 'SENDING…';
    setMsg('', true);

    fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
      .then(r => {
        if (!r.ok) throw new Error('submit failed');
        form.reset();
        setMsg('Thanks! We\u2019ll reach out shortly.', true);
      })
      .catch(() => {
        setMsg('Something went wrong \u2014 please try again.', false);
      })
      .finally(() => {
        btn.disabled = false;
        btn.textContent = 'GET A QUOTE';
      });
  });
})();