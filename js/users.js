// js/users.js - JS for users.html (validation and fetch to API)
const apiBase = 'api'; // relative

document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('registerForm');
  const loginForm = document.getElementById('loginForm');
  const editForm = document.getElementById('editForm');
  const usersTableBody = document.querySelector('#usersTable tbody');
  const adminSection = document.getElementById('admin');
  const userBar = document.getElementById('userBar');
  const userNameSpan = document.getElementById('userName');
  const logoutBtn = document.getElementById('logoutBtn');

  async function checkSession() {
    try {
      const res = await fetch(`${apiBase}/check_session.php`);
      const data = await res.json();
      if (data.logged) {
        document.getElementById('auth').style.display = 'none';
        adminSection.style.display = 'block';
        userBar.style.display = 'block';
        userNameSpan.textContent = `Conectado como: ${data.user.name || ''}`;
        return true;
      } else {
        document.getElementById('auth').style.display = 'block';
        adminSection.style.display = 'none';
        userBar.style.display = 'none';
        return false;
      }
    } catch (err) {
      console.error('Session check failed', err);
      return false;
    }
  }

  async function fetchUsers() {
    const res = await fetch(`${apiBase}/list.php`);
    if (res.status === 401) {
      // session expired or not authorized
      await checkSession();
      return;
    }
    const data = await res.json();
    usersTableBody.innerHTML = '';
    (data.users || []).forEach(u => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${u.id}</td><td>${u.name}</td><td>${u.email}</td><td>
        <button data-id="${u.id}" class="edit">Editar</button>
        <button data-id="${u.id}" class="delete">Eliminar</button>
      </td>`;
      usersTableBody.appendChild(tr);
    });
    // attach events
    document.querySelectorAll('.edit').forEach(b => b.onclick = onEdit);
    document.querySelectorAll('.delete').forEach(b => b.onclick = onDelete);
  }

  function showMessage(m) { alert(m); }

  registerForm.onsubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value;
    const password2 = form.password2.value;
    if (password !== password2) { showMessage('Las contraseñas no coinciden'); return; }
    const res = await fetch(`${apiBase}/register.php`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({name, email, password}) });
    const data = await res.json();
    if (res.ok) { showMessage('Registro correcto'); form.reset(); fetchUsers(); }
    else showMessage(data.error || 'Error al registrar');
  };

  loginForm.onsubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const email = form.email.value.trim();
    const password = form.password.value;
    const res = await fetch(`${apiBase}/login.php`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({email, password}) });
    const data = await res.json();
    if (res.ok) {
      showMessage('Login correcto');
      await checkSession();
      fetchUsers();
    } else {
      showMessage(data.error || 'Login falló');
    }
  };

  editForm.onsubmit = async (e) => {
    e.preventDefault();
    const f = e.target;
    const id = f.id.value ? parseInt(f.id.value,10) : 0;
    const name = f.name.value.trim();
    const email = f.email.value.trim();
    const password = f.password.value;
    const password2 = f.password2.value;
    if (password || password2) {
      if (password !== password2) { showMessage('Las contraseñas no coinciden'); return; }
    }
    const payload = { id, name, email };
    if (password) payload.password = password;
    const url = id ? `${apiBase}/update.php` : `${apiBase}/register.php`;
    const res = await fetch(url, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
    if (res.status === 401) {
      await checkSession();
      showMessage('No autorizado');
      return;
    }
    const data = await res.json();
    if (res.ok) { showMessage('Guardado'); f.reset(); fetchUsers(); }
    else showMessage(data.error || 'Error');
  };

  function onEdit(e) {
    const id = e.target.dataset.id;
    // fetch user details from list (simple)
    const row = e.target.closest('tr');
    const name = row.children[1].textContent;
    const email = row.children[2].textContent;
    const f = editForm;
    f.id.value = id; f.name.value = name; f.email.value = email; f.password.value = ''; f.password2.value = '';
    adminSection.scrollIntoView();
  }

  async function onDelete(e) {
    if (!confirm('¿Eliminar este usuario?')) return;
    const id = e.target.dataset.id;
    const res = await fetch(`${apiBase}/delete.php`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({id}) });
    if (res.status === 401) { await checkSession(); showMessage('No autorizado'); return; }
    const data = await res.json();
    if (res.ok) { showMessage('Eliminado'); fetchUsers(); }
    else showMessage(data.error || 'Error');
  }

  logoutBtn.onclick = async () => {
    await fetch(`${apiBase}/logout.php`);
    await checkSession();
  };

  // initial state - check session then fetch
  (async () => {
    const ok = await checkSession();
    if (ok) fetchUsers();
  })();
});
