/* ── DealHub Frontend App ────────────────────────────── */

const API = '';
let allBrandDeals = [];
let brandPage = 1;
let currentBrand = '';
let searchTimer;

// ── Utility ──────────────────────────────────────────────
function formatPrice(p) { return '₹' + Number(p).toLocaleString('en-IN'); }
function discount(o, n) { return o > 0 ? Math.round(((o - n) / o) * 100) : 0; }

function showToast(msg = '✓ Copied!', color = '#10b981') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.style.background = color;
  t.classList.remove('hidden');
  setTimeout(() => t.classList.add('hidden'), 2200);
}

function platformClass(p) {
  if (p === 'Amazon') return 'pb-amazon';
  if (p === 'Flipkart') return 'pb-flipkart';
  if (p === 'Meesho') return 'pb-meesho';
  return '';
}

// ── Deal Card Template ────────────────────────────────────
function dealCard(d, compact = false) {
  const disc = discount(d.oldPrice, d.newPrice);
  const tgUrl = encodeURIComponent(`🔥 ${d.title}\n💰 ${formatPrice(d.newPrice)} (${disc}% OFF)\n🛒 ${d.affiliateLink}`);
  const waUrl = encodeURIComponent(`🔥 *${d.title}*\n💰 ${formatPrice(d.newPrice)} (was ${formatPrice(d.oldPrice)})\n🛒 ${d.affiliateLink}`);

  return `
  <div class="deal-card" onclick="openDealModal('${d._id}')">
    <div class="deal-image-wrap">
      <img src="${d.imageUrl}" alt="${d.title}" loading="lazy" onerror="this.src='https://placehold.co/400x400/111827/374151?text=No+Image'" />
      <span class="platform-badge ${platformClass(d.platform)}">${d.platform}</span>
      ${d.hotDeal ? '<span style="position:absolute;top:8px;right:8px;background:#ef4444;color:white;font-size:9px;font-weight:800;padding:3px 7px;border-radius:20px;">🔥 HOT</span>' : ''}
    </div>
    <div class="deal-body">
      <p class="deal-title">${d.title}</p>
      <div class="deal-prices">
        <span class="deal-new-price">${formatPrice(d.newPrice)}</span>
        ${d.oldPrice > d.newPrice ? `<span class="deal-old-price">${formatPrice(d.oldPrice)}</span>` : ''}
      </div>
      <div class="deal-badges">
        ${disc > 0 ? `<span class="badge-discount">${disc}% OFF</span>` : ''}
        ${d.trending ? '<span class="badge-trending">📈 Trending</span>' : ''}
      </div>
      <a href="${d.affiliateLink}" target="_blank" rel="noopener noreferrer"
         onclick="trackClick(event,'${d._id}')"
         class="buy-btn">Buy Now →</a>
      <div class="deal-actions">
        <button class="action-btn" onclick="copyLink(event,'${d.affiliateLink}')">📋 Copy</button>
        <a class="action-btn" href="https://t.me/share/url?url=${tgUrl}" target="_blank" onclick="event.stopPropagation()">✈️ TG</a>
        <a class="action-btn" href="https://wa.me/?text=${waUrl}" target="_blank" onclick="event.stopPropagation()">💬 WA</a>
      </div>
    </div>
  </div>`;
}

// ── Track Click ──────────────────────────────────────────
function trackClick(e, id) {
  e.stopPropagation();
  fetch(`${API}/deals/${id}/click`, { method: 'POST' }).catch(() => {});
}

// ── Copy Link ─────────────────────────────────────────────
function copyLink(e, link) {
  e.stopPropagation();
  navigator.clipboard.writeText(link).then(() => showToast('✓ Link copied!')).catch(() => showToast('Failed to copy', '#ef4444'));
}

// ── Load Featured Deals ───────────────────────────────────
async function loadFeaturedDeals() {
  try {
    const res = await fetch(`${API}/deals/featured`);
    const data = await res.json();
    const container = document.getElementById('featuredDeals');
    if (data.success && data.deals.length > 0) {
      container.innerHTML = data.deals.map(d => dealCard(d)).join('');
    } else {
      container.innerHTML = '<div class="empty-state col-span-full"><div class="emoji">😔</div><p>No featured deals today. Check back soon!</p></div>';
    }
  } catch (err) {
    console.error('Featured deals error:', err);
    document.getElementById('featuredDeals').innerHTML = '<div class="empty-state col-span-full"><div class="emoji">⚠️</div><p>Could not load deals. Please refresh.</p></div>';
  }
}

// ── Load Platform Deals (scroll sections) ────────────────
async function loadPlatformDeals(platform, containerId) {
  try {
    const res = await fetch(`${API}/deals?platform=${platform}&limit=15`);
    const data = await res.json();
    const scroll = document.querySelector(`#${containerId} .deals-scroll`);
    if (data.success && data.deals.length > 0) {
      scroll.innerHTML = data.deals.map(d => dealCard(d)).join('');
    } else {
      scroll.innerHTML = `<div class="empty-state"><div class="emoji">📦</div><p>No ${platform} deals right now</p></div>`;
    }
  } catch (err) {
    console.error(`${platform} deals error:`, err);
  }
}

// ── Load Brand Deals ──────────────────────────────────────
async function loadBrandDeals(brand = '', page = 1) {
  try {
    const url = brand ? `${API}/deals?brand=${brand}&page=${page}&limit=12` : `${API}/deals?page=${page}&limit=12`;
    const res = await fetch(url);
    const data = await res.json();
    const container = document.getElementById('brandDeals');

    if (page === 1) container.innerHTML = '';

    if (data.success && data.deals.length > 0) {
      container.innerHTML += data.deals.map(d => dealCard(d)).join('');
      allBrandDeals = data.deals;
      const loadMoreBtn = document.getElementById('loadMoreBtn');
      if (data.pagination.page < data.pagination.pages) {
        loadMoreBtn.classList.remove('hidden');
      } else {
        loadMoreBtn.classList.add('hidden');
      }
    } else if (page === 1) {
      container.innerHTML = '<div class="empty-state col-span-full"><div class="emoji">😔</div><p>No deals found for this brand.</p></div>';
      document.getElementById('loadMoreBtn').classList.add('hidden');
    }
  } catch (err) {
    console.error('Brand deals error:', err);
  }
}

function loadMoreBrandDeals() {
  brandPage++;
  loadBrandDeals(currentBrand, brandPage);
}

function loadMoreDeals(platform) {
  document.getElementById(platform.toLowerCase()).scrollIntoView({ behavior: 'smooth' });
}

function filterByCategory(cat) {
  window.scrollTo({ top: document.getElementById('brands').offsetTop - 80, behavior: 'smooth' });
}

// ── Brand Filter Buttons ──────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.brand-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.brand-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentBrand = btn.dataset.brand;
      brandPage = 1;
      loadBrandDeals(currentBrand, 1);
    });
  });
});

// ── Search ────────────────────────────────────────────────
function setupSearch() {
  const input = document.getElementById('searchInput');
  const dropdown = document.getElementById('searchDropdown');
  if (!input) return;

  input.addEventListener('input', (e) => {
    clearTimeout(searchTimer);
    const q = e.target.value.trim();
    if (q.length < 2) { dropdown.classList.add('hidden'); return; }
    searchTimer = setTimeout(() => performSearch(q, dropdown), 300);
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') dropdown.classList.add('hidden');
  });

  document.addEventListener('click', (e) => {
    if (!input.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.add('hidden');
    }
  });

  // Mobile search
  const mobileInput = document.getElementById('mobileSearchInput');
  if (mobileInput) {
    mobileInput.addEventListener('input', (e) => {
      clearTimeout(searchTimer);
      const q = e.target.value.trim();
      if (q.length < 2) return;
      searchTimer = setTimeout(() => {
        fetch(`${API}/deals?search=${encodeURIComponent(q)}&limit=20`)
          .then(r => r.json())
          .then(data => {
            if (data.success) renderSearchResults(data.deals);
          }).catch(() => {});
      }, 300);
    });
  }
}

async function performSearch(query, dropdown) {
  try {
    const res = await fetch(`${API}/deals?search=${encodeURIComponent(query)}&limit=6`);
    const data = await res.json();
    if (!data.success || data.deals.length === 0) {
      dropdown.innerHTML = '<div class="p-4 text-xs text-gray-500 text-center">No deals found for "' + query + '"</div>';
      dropdown.classList.remove('hidden');
      return;
    }
    dropdown.innerHTML = data.deals.map(d => `
      <div class="search-item" onclick="openDealModal('${d._id}')">
        <img src="${d.imageUrl}" onerror="this.src='https://placehold.co/36x36/1f2937/374151?text=?'" />
        <div>
          <div class="search-item-title">${d.title.substring(0, 50)}...</div>
          <div class="search-item-price">${formatPrice(d.newPrice)} <span style="color:#6b7280;font-size:10px;text-decoration:line-through">${formatPrice(d.oldPrice)}</span></div>
        </div>
        <span class="ml-auto text-xs" style="color:#ef4444;font-weight:800">${discount(d.oldPrice, d.newPrice)}% OFF</span>
      </div>
    `).join('');
    dropdown.classList.remove('hidden');
  } catch (err) { console.error(err); }
}

function renderSearchResults(deals) {
  const featured = document.getElementById('featuredDeals');
  if (deals.length > 0) {
    featured.innerHTML = deals.map(d => dealCard(d)).join('');
    document.getElementById('today').scrollIntoView({ behavior: 'smooth' });
  }
}

// ── Deal Modal ────────────────────────────────────────────
async function openDealModal(id) {
  try {
    const res = await fetch(`${API}/deals/${id}`);
    const data = await res.json();
    if (!data.success) return;
    const d = data.deal;
    const disc = discount(d.oldPrice, d.newPrice);
    const tgUrl = encodeURIComponent(`🔥 ${d.title}\n💰 ${formatPrice(d.newPrice)} (${disc}% OFF)\n🛒 ${d.affiliateLink}`);
    const waUrl = encodeURIComponent(`🔥 *${d.title}*\n💰 ${formatPrice(d.newPrice)}\n🛒 ${d.affiliateLink}`);

    document.getElementById('modalBody').innerHTML = `
      <img src="${d.imageUrl}" alt="${d.title}" style="width:100%;height:200px;object-fit:cover;border-radius:12px;margin-bottom:16px;" onerror="this.src='https://placehold.co/400x200/111827/374151?text=No+Image'" />
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px;">
        ${disc > 0 ? `<span class="badge-discount">${disc}% OFF</span>` : ''}
        ${d.trending ? '<span class="badge-trending">📈 Trending</span>' : ''}
        ${d.hotDeal ? '<span class="badge-hot">🔥 Hot Deal</span>' : ''}
        <span class="platform-badge ${platformClass(d.platform)}" style="position:relative;top:auto;left:auto;">${d.platform}</span>
      </div>
      <h3 style="font-size:15px;font-weight:700;color:#e5e7eb;margin-bottom:12px;line-height:1.4;">${d.title}</h3>
      <div class="deal-prices" style="margin-bottom:16px;">
        <span class="deal-new-price" style="font-size:24px;">${formatPrice(d.newPrice)}</span>
        ${d.oldPrice > d.newPrice ? `<span class="deal-old-price" style="font-size:14px;">${formatPrice(d.oldPrice)}</span>` : ''}
      </div>
      <div style="display:flex;gap:8px;flex-direction:column;">
        <a href="${d.affiliateLink}" target="_blank" rel="noopener noreferrer"
           onclick="trackClick(event,'${d._id}')"
           class="buy-btn" style="font-size:14px;padding:12px;">🛒 Buy Now on ${d.platform} →</a>
        <div style="display:flex;gap:8px;">
          <button class="action-btn" style="flex:1;padding:10px;" onclick="copyLink(event,'${d.affiliateLink}')">📋 Copy Link</button>
          <a class="action-btn" style="flex:1;padding:10px;text-align:center;" href="https://t.me/share/url?url=${tgUrl}" target="_blank">✈️ Telegram</a>
          <a class="action-btn" style="flex:1;padding:10px;text-align:center;" href="https://wa.me/?text=${waUrl}" target="_blank">💬 WhatsApp</a>
        </div>
      </div>
    `;
    document.getElementById('dealModal').classList.remove('hidden');
  } catch (err) { console.error(err); }
}

function closeDealModal() {
  document.getElementById('dealModal').classList.add('hidden');
}

// ── Navigation helpers ────────────────────────────────────
function toggleMobileMenu() {
  document.getElementById('mobileMenu').classList.toggle('hidden');
}
function closeMobileMenu() {
  document.getElementById('mobileMenu').classList.add('hidden');
}
function toggleMobileSearch() {
  document.getElementById('mobileSearch').classList.toggle('hidden');
  if (!document.getElementById('mobileSearch').classList.contains('hidden')) {
    document.getElementById('mobileSearchInput').focus();
  }
}

// ── Chatbot ───────────────────────────────────────────────
let chatOpen = false;

function toggleChat() {
  chatOpen = !chatOpen;
  const win = document.getElementById('chatWindow');
  const badge = document.getElementById('chatBadge');
  const icon = document.getElementById('chatIcon');
  if (chatOpen) {
    win.classList.remove('hidden');
    icon.textContent = '✕';
    badge.classList.add('hidden');
  } else {
    win.classList.add('hidden');
    icon.textContent = '💬';
  }
}

function askBot(msg) {
  document.getElementById('chatInput').value = msg;
  sendMessage();
}

async function sendMessage() {
  const input = document.getElementById('chatInput');
  const msg = input.value.trim();
  if (!msg) return;

  const messages = document.getElementById('chatMessages');
  input.value = '';

  // User message
  messages.innerHTML += `<div class="user-message"><div class="user-bubble">${msg}</div></div>`;

  // Typing indicator
  const typingId = 'typing_' + Date.now();
  messages.innerHTML += `<div id="${typingId}" class="bot-message"><div class="chat-typing"><span></span><span></span><span></span></div></div>`;
  messages.scrollTop = messages.scrollHeight;

  try {
    const res = await fetch(`${API}/chatbot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg })
    });
    const data = await res.json();

    // Remove typing
    document.getElementById(typingId)?.remove();

    if (data.success) {
      let html = `<div class="bot-message"><div class="bot-bubble">${data.response}`;
      if (data.deals && data.deals.length > 0) {
        html += data.deals.map(d => `
          <div class="chat-deal-card">
            <img class="chat-deal-img" src="${d.imageUrl}" onerror="this.src='https://placehold.co/48x48/1f2937/374151?text=?'" loading="lazy" />
            <div class="chat-deal-info">
              <div class="chat-deal-title">${d.title}</div>
              <div class="chat-deal-price">${formatPrice(d.newPrice)} <span style="color:#6b7280;font-size:10px;text-decoration:line-through">${formatPrice(d.oldPrice)}</span></div>
            </div>
            <a href="${d.affiliateLink}" target="_blank" class="chat-deal-btn" onclick="trackClick(event,'${d.id}')">Buy →</a>
          </div>
        `).join('');
      }
      html += `</div></div>`;
      messages.innerHTML += html;
    } else {
      messages.innerHTML += `<div class="bot-message"><div class="bot-bubble">Sorry, I couldn't find deals right now. Try again!</div></div>`;
    }
  } catch (err) {
    document.getElementById(typingId)?.remove();
    messages.innerHTML += `<div class="bot-message"><div class="bot-bubble">Oops! Something went wrong. Please try again.</div></div>`;
  }

  messages.scrollTop = messages.scrollHeight;
}

// ── Init ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  await loadFeaturedDeals();
  await loadPlatformDeals('Flipkart', 'flipkartDeals');
  await loadPlatformDeals('Amazon', 'amazonDeals');
  await loadPlatformDeals('Meesho', 'meeshoDeals');
  await loadBrandDeals('', 1);
  setupSearch();

  // Show chatbot badge after 5s
  setTimeout(() => {
    if (!chatOpen) document.getElementById('chatBadge').classList.remove('hidden');
  }, 5000);

  // Keyboard shortcut for search
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      document.getElementById('searchInput')?.focus();
    }
    if (e.key === 'Escape') {
      closeDealModal();
      document.getElementById('searchDropdown')?.classList.add('hidden');
    }
  });
});
