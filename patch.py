import sys

filepath = r'c:\Users\pc\Desktop\omji new site\src\pages\admin\dashboard.astro'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Frontmatter additions
if 'const initialFinances =' not in content:
    old_fm = "import { getProjects } from '../../lib/data-store.js';"
    new_fm = "import { getProjects, getFinances, getMaterials } from '../../lib/data-store.js';\nconst initialFinances = getFinances();\nconst initialMaterials = getMaterials();"
    # Actually getProjects isn't imported in dashboard.astro currently
    # Let's search for "const initialProjects = [];"
    old_fm2 = "const initialProjects = [];\nconst initialContacts = [];\nconst initialBlogs = [];\nimport '../../styles/global.css';"
    new_fm2 = """const initialProjects = [];
const initialContacts = [];
const initialBlogs = [];
import { getFinances, getMaterials } from '../../lib/data-store.js';
const initialFinances = getFinances();
const initialMaterials = getMaterials();
import '../../styles/global.css';"""
    content = content.replace(old_fm2, new_fm2)

# 2. Add Sidebar link
if 'data-tab="tracker"' not in content:
    sidebar_str = '      <button class="sidebar-link" data-tab="settings">'
    new_sidebar = '''      <button class="sidebar-link" data-tab="tracker">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:8px;vertical-align:middle;"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
        Site Tracker
      </button>
      <button class="sidebar-link" data-tab="settings">'''
    content = content.replace(sidebar_str, new_sidebar)

# 3. HTML Content
if 'id="tab-tracker"' not in content:
    html_content = '''
      <!-- SITE TRACKER TAB -->
      <div class="tab-content" id="tab-tracker">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
          <h2 style="font-family:var(--font-display);font-size:1.4rem;color:var(--text-primary);margin:0;">Expense & Material Tracker</h2>
          <div style="display:flex; gap:12px;">
            <button class="btn btn-ghost" id="toggle-finances-btn" style="background:var(--gold-pale); border-color:var(--gold);">Finances</button>
            <button class="btn btn-ghost" id="toggle-materials-btn" style="background:#fff;">Materials</button>
            <a href="/report/site-summary" target="_blank" class="btn btn-primary" style="margin-left:12px;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px;vertical-align:middle;"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
              Share / Export Report
            </a>
          </div>
        </div>

        <!-- FINANCES SECTION -->
        <div id="finances-section">
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:20px; margin-bottom:24px;">
            <div class="stat-mini">
              <div class="stat-mini-num" id="total-pocket" style="font-size:1.8rem;">₹0</div>
              <div class="stat-mini-lbl">Spent from Pocket</div>
            </div>
            <div class="stat-mini">
              <div class="stat-mini-num" id="total-paid" style="font-size:1.8rem;">₹0</div>
              <div class="stat-mini-lbl">Paid Out</div>
            </div>
            <div class="stat-mini">
              <div class="stat-mini-num" id="total-received" style="font-size:1.8rem; color:var(--success);">₹0</div>
              <div class="stat-mini-lbl">Received from Client</div>
            </div>
            <div class="stat-mini">
              <div class="stat-mini-num" id="total-pending" style="font-size:1.8rem; color:#c44;">₹0</div>
              <div class="stat-mini-lbl">Pending / Outstanding</div>
            </div>
          </div>

          <div class="admin-panel">
            <div class="admin-panel-title">Add Transaction</div>
            <form id="finance-form" style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px;">
              <div class="admin-field">
                <label>Type</label>
                <select id="fin-type" required>
                  <option value="out_of_pocket">Spent from Pocket</option>
                  <option value="paid_out">Paid to Vendor/Labor</option>
                  <option value="client_direct">Client Paid Directly</option>
                  <option value="received">Received from Client</option>
                </select>
              </div>
              <div class="admin-field">
                <label>Amount (₹)</label>
                <input type="number" id="fin-amount" required min="0" step="1"/>
              </div>
              <div class="admin-field">
                <label>Date</label>
                <input type="date" id="fin-date" required />
              </div>
              <div class="admin-field full">
                <label>Description & Person Name</label>
                <input type="text" id="fin-desc" required placeholder="e.g. Paid Ramu for labor, Cement bags..." />
              </div>
              <div class="admin-field full">
                <button type="submit" class="btn btn-primary" style="width:200px;">Save Transaction</button>
              </div>
            </form>
          </div>

          <div class="admin-panel">
            <div class="admin-panel-title">Transaction History</div>
            <div style="overflow-x:auto;">
              <table style="width:100%; border-collapse:collapse; font-size:0.9rem;" id="finance-table">
                <thead>
                  <tr style="border-bottom:1px solid var(--border-light); text-align:left; color:var(--text-muted);">
                    <th style="padding:12px 8px;">Date</th>
                    <th style="padding:12px 8px;">Type</th>
                    <th style="padding:12px 8px;">Description</th>
                    <th style="padding:12px 8px;">Amount</th>
                    <th style="padding:12px 8px;">Action</th>
                  </tr>
                </thead>
                <tbody id="finance-list"></tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- MATERIALS SECTION -->
        <div id="materials-section" style="display:none;">
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:20px; margin-bottom:24px;" id="material-stats">
            <!-- Populated via JS -->
          </div>

          <div class="admin-panel">
            <div class="admin-panel-title">Add Material Delivery</div>
            <form id="material-form" style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px;">
              <div class="admin-field">
                <label>Material Name</label>
                <select id="mat-name" required onchange="checkCustomMaterial()">
                  <option value="Cement">Cement</option>
                  <option value="Sand">Sand</option>
                  <option value="Brick">Brick</option>
                  <option value="Concrete">Concrete</option>
                  <option value="TMT">TMT / Steel</option>
                  <option value="custom">-- Add Custom --</option>
                </select>
                <input type="text" id="mat-custom-name" placeholder="Custom name..." style="display:none; margin-top:8px;" />
              </div>
              <div class="admin-field">
                <label>Quantity & Unit</label>
                <div style="display:flex; gap:8px;">
                  <input type="number" id="mat-qty" required min="0" step="0.1" style="flex:2;" />
                  <input type="text" id="mat-unit" required placeholder="Bags/CFT" style="flex:1;" />
                </div>
              </div>
              <div class="admin-field">
                <label>Amount (₹) - Optional</label>
                <input type="number" id="mat-amount" min="0" step="1"/>
              </div>
              <div class="admin-field" style="grid-column: 1 / 3;">
                <label>Supplier / Notes</label>
                <input type="text" id="mat-notes" />
              </div>
              <div class="admin-field">
                <label>Date</label>
                <input type="date" id="mat-date" required />
              </div>
              <div class="admin-field full">
                <button type="submit" class="btn btn-primary" style="width:200px;">Save Material</button>
              </div>
            </form>
          </div>

          <div class="admin-panel">
            <div class="admin-panel-title">Material History</div>
            <div style="overflow-x:auto;">
              <table style="width:100%; border-collapse:collapse; font-size:0.9rem;">
                <thead>
                  <tr style="border-bottom:1px solid var(--border-light); text-align:left; color:var(--text-muted);">
                    <th style="padding:12px 8px;">Date</th>
                    <th style="padding:12px 8px;">Material</th>
                    <th style="padding:12px 8px;">Quantity</th>
                    <th style="padding:12px 8px;">Amount</th>
                    <th style="padding:12px 8px;">Notes</th>
                    <th style="padding:12px 8px;">Action</th>
                  </tr>
                </thead>
                <tbody id="material-list"></tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
'''
    insert_pos = content.rfind('</div>\n\n    </div>\n\n  </main>')
    if insert_pos == -1:
        insert_pos = content.rfind('      <!-- SETTINGS TAB -->')
        
    if insert_pos != -1:
        content = content[:insert_pos] + html_content + content[insert_pos:]

# 4. JS Script Additions
if 'window.initialFinances =' not in content:
    js_def = 'define:vars={{ initialProjects, initialContacts, initialBlogs, envGeminiKey: import.meta.env.PUBLIC_GEMINI_API_KEY || \'\' }}>'
    new_js_def = 'define:vars={{ initialProjects, initialContacts, initialBlogs, initialFinances, initialMaterials, envGeminiKey: import.meta.env.PUBLIC_GEMINI_API_KEY || \'\' }}>\n  window.initialFinances = initialFinances;\n  window.initialMaterials = initialMaterials;'
    content = content.replace(js_def, new_js_def)

if 'renderTracker()' not in content:
    # Append JS to the end of the file before </body>
    tracker_js = '''
<script is:inline>
  // Tracker Logic
  let finances = window.initialFinances || [];
  let materials = window.initialMaterials || [];

  // Toggle sections
  const toggleFinBtn = document.getElementById('toggle-finances-btn');
  const toggleMatBtn = document.getElementById('toggle-materials-btn');
  const finSection = document.getElementById('finances-section');
  const matSection = document.getElementById('materials-section');

  if(toggleFinBtn) {
    toggleFinBtn.addEventListener('click', () => {
      finSection.style.display = 'block';
      matSection.style.display = 'none';
      toggleFinBtn.style.background = 'var(--gold-pale)';
      toggleFinBtn.style.borderColor = 'var(--gold)';
      toggleMatBtn.style.background = '#fff';
      toggleMatBtn.style.borderColor = 'var(--border)';
    });
  }
  if(toggleMatBtn) {
    toggleMatBtn.addEventListener('click', () => {
      finSection.style.display = 'none';
      matSection.style.display = 'block';
      toggleMatBtn.style.background = 'var(--gold-pale)';
      toggleMatBtn.style.borderColor = 'var(--gold)';
      toggleFinBtn.style.background = '#fff';
      toggleFinBtn.style.borderColor = 'var(--border)';
    });
  }

  function checkCustomMaterial() {
    const sel = document.getElementById('mat-name');
    const cust = document.getElementById('mat-custom-name');
    if(sel && cust) {
      cust.style.display = sel.value === 'custom' ? 'block' : 'none';
      if(sel.value === 'custom') cust.required = true;
      else cust.required = false;
    }
  }

  // Formatting date safely
  function formatDate(dStr) {
    if(!dStr) return '';
    try { return new Date(dStr).toLocaleDateString(); } catch(e) { return dStr; }
  }

  function renderTracker() {
    // 1. Finances Render
    let totalPocket = 0;
    let totalPaid = 0;
    let totalRec = 0;
    let clientDirect = 0;

    const finList = document.getElementById('finance-list');
    if(finList) {
      finList.innerHTML = '';
      [...finances].sort((a,b) => new Date(b.date) - new Date(a.date)).forEach(f => {
        const amt = parseFloat(f.amount || 0);
        if(f.type === 'out_of_pocket') totalPocket += amt;
        if(f.type === 'paid_out') totalPaid += amt;
        if(f.type === 'received') totalRec += amt;
        if(f.type === 'client_direct') clientDirect += amt;

        let typeLbl = f.type.replace('_', ' ').toUpperCase();
        finList.innerHTML += `
          <tr style="border-bottom:1px solid var(--border-light);">
            <td style="padding:12px 8px;">${formatDate(f.date)}</td>
            <td style="padding:12px 8px; font-weight:600;">${typeLbl}</td>
            <td style="padding:12px 8px;">${f.description || ''}</td>
            <td style="padding:12px 8px; font-family:var(--font-display); font-weight:700;">₹${amt.toLocaleString()}</td>
            <td style="padding:12px 8px;"><button class="btn-delete" style="padding:4px 8px; width:auto;" onclick="deleteFinance('${f.id}')">Del</button></td>
          </tr>
        `;
      });
      if(finances.length === 0) finList.innerHTML = '<tr><td colspan="5" style="padding:20px; text-align:center; color:gray;">No transactions found</td></tr>';

      document.getElementById('total-pocket').innerText = '₹' + totalPocket.toLocaleString();
      document.getElementById('total-paid').innerText = '₹' + totalPaid.toLocaleString();
      document.getElementById('total-received').innerText = '₹' + totalRec.toLocaleString();
      
      // Calculate pending - purely for visualization (Total Paid Out + Pocket - Received) 
      // User can interpret it.
      let pending = (totalPaid + totalPocket) - totalRec;
      let pEl = document.getElementById('total-pending');
      pEl.innerText = '₹' + pending.toLocaleString();
      pEl.style.color = pending > 0 ? '#c44' : (pending < 0 ? 'var(--success)' : 'inherit');
    }

    // 2. Materials Render
    const matList = document.getElementById('material-list');
    const matStats = document.getElementById('material-stats');
    if(matList && matStats) {
      matList.innerHTML = '';
      let stats = {};

      [...materials].sort((a,b) => new Date(b.date) - new Date(a.date)).forEach(m => {
        let name = m.name || 'Unknown';
        let qty = parseFloat(m.quantity || 0);
        let u = m.unit || '';
        let key = `${name} (${u})`;
        
        if(!stats[key]) stats[key] = { qty:0, amt:0 };
        stats[key].qty += qty;
        stats[key].amt += parseFloat(m.amount || 0);

        matList.innerHTML += `
          <tr style="border-bottom:1px solid var(--border-light);">
            <td style="padding:12px 8px;">${formatDate(m.date)}</td>
            <td style="padding:12px 8px; font-weight:600;">${name}</td>
            <td style="padding:12px 8px;">${qty} ${u}</td>
            <td style="padding:12px 8px;">₹${parseFloat(m.amount||0).toLocaleString()}</td>
            <td style="padding:12px 8px;">${m.notes || ''}</td>
            <td style="padding:12px 8px;"><button class="btn-delete" style="padding:4px 8px; width:auto;" onclick="deleteMaterial('${m.id}')">Del</button></td>
          </tr>
        `;
      });
      if(materials.length === 0) matList.innerHTML = '<tr><td colspan="6" style="padding:20px; text-align:center; color:gray;">No materials found</td></tr>';

      matStats.innerHTML = '';
      Object.keys(stats).forEach(k => {
        matStats.innerHTML += `
          <div class="stat-mini">
            <div class="stat-mini-num" style="font-size:1.6rem;">${stats[k].qty}</div>
            <div class="stat-mini-lbl">${k}</div>
          </div>
        `;
      });
      if(Object.keys(stats).length === 0) {
        matStats.innerHTML = `<div class="stat-mini"><div class="stat-mini-num" style="font-size:1.6rem;">0</div><div class="stat-mini-lbl">No Materials</div></div>`;
      }
    }
  }

  const finForm = document.getElementById('finance-form');
  if(finForm) {
    // Set default date
    document.getElementById('fin-date').valueAsDate = new Date();
    
    finForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = e.target.querySelector('button[type="submit"]');
      btn.innerText = 'Saving...'; btn.disabled = true;

      const payload = {
        type: document.getElementById('fin-type').value,
        amount: document.getElementById('fin-amount').value,
        date: document.getElementById('fin-date').value,
        description: document.getElementById('fin-desc').value
      };

      try {
        const res = await fetch('/api/finances', {
          method: 'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload)
        });
        if(res.ok) {
          const data = await res.json();
          finances.push(data.transaction);
          renderTracker();
          finForm.reset();
          document.getElementById('fin-date').valueAsDate = new Date();
          showToast('Transaction saved');
        } else throw new Error('Failed to save');
      } catch(err) { showToast('Error saving', true); }
      finally { btn.innerText = 'Save Transaction'; btn.disabled = false; }
    });
  }

  window.deleteFinance = async function(id) {
    if(!confirm('Delete this transaction?')) return;
    try {
      const res = await fetch('/api/finances', {
        method: 'DELETE', headers:{'Content-Type':'application/json'}, body:JSON.stringify({id})
      });
      if(res.ok) {
        finances = finances.filter(f => f.id !== id);
        renderTracker();
        showToast('Deleted');
      } else throw new Error('Failed');
    } catch(err) { showToast('Error deleting', true); }
  }

  const matForm = document.getElementById('material-form');
  if(matForm) {
    document.getElementById('mat-date').valueAsDate = new Date();
    matForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = e.target.querySelector('button[type="submit"]');
      btn.innerText = 'Saving...'; btn.disabled = true;
      
      let name = document.getElementById('mat-name').value;
      if(name === 'custom') name = document.getElementById('mat-custom-name').value;

      const payload = {
        name: name,
        quantity: document.getElementById('mat-qty').value,
        unit: document.getElementById('mat-unit').value,
        amount: document.getElementById('mat-amount').value || 0,
        notes: document.getElementById('mat-notes').value,
        date: document.getElementById('mat-date').value
      };

      try {
        const res = await fetch('/api/materials', {
          method: 'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload)
        });
        if(res.ok) {
          const data = await res.json();
          materials.push(data.material);
          renderTracker();
          matForm.reset();
          document.getElementById('mat-date').valueAsDate = new Date();
          showToast('Material saved');
        } else throw new Error('Failed to save');
      } catch(err) { showToast('Error saving', true); }
      finally { btn.innerText = 'Save Material'; btn.disabled = false; }
    });
  }

  window.deleteMaterial = async function(id) {
    if(!confirm('Delete this material?')) return;
    try {
      const res = await fetch('/api/materials', {
        method: 'DELETE', headers:{'Content-Type':'application/json'}, body:JSON.stringify({id})
      });
      if(res.ok) {
        materials = materials.filter(m => m.id !== id);
        renderTracker();
        showToast('Deleted');
      } else throw new Error('Failed');
    } catch(err) { showToast('Error deleting', true); }
  }

  // Initial render if tracker elements exist
  setTimeout(() => { if(document.getElementById('finance-list')) renderTracker(); }, 100);

</script>
'''
    content = content.replace('</body>', tracker_js + '\n</body>')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Patched successfully")
