(() => {
  const seedProducts = [
    {id:"p1",title:"The quiet between places",creator:"Noor Al-Harthy",type:"Images",category:"Photography",price:12,image:"https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=850&q=80",description:"A soft, early-morning study of mountain light and open water. Includes a high-resolution JPG for personal or editorial projects."},
    {id:"p2",title:"A slower kind of Sunday",creator:"Amal Rahman",type:"Images",category:"Lifestyle",price:8,image:"https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=850&q=80",description:"Warm window light, a well-loved table, and a moment to yourself. A carefully color-graded editorial photograph."},
    {id:"p3",title:"The thoughtful brand kit",creator:"Studio Saffron",type:"Documents",category:"Design",price:18,image:"https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=850&q=80",description:"A practical branding workbook with thoughtful prompts and editable exercises for your next creative project."},
    {id:"p4",title:"Somewhere in the garden",creator:"Maya Flores",type:"Images",category:"Nature",price:0,image:"https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=850&q=80",description:"A free-to-use study of the last light in a summer garden. Download the original file directly from its creator."},
    {id:"p5",title:"A field guide to doing less",creator:"Hana Saleh",type:"Documents",category:"Guides",price:9,image:"https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=850&q=80",description:"A gentle, practical printable guide to a more intentional week. Includes worksheets and reflection prompts."},
    {id:"p6",title:"Shapes of Muscat",creator:"Layla Al-Busaidi",type:"Images",category:"Architecture",price:14,image:"https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=850&q=80",description:"A clean editorial image study celebrating the lines, light, and detail of contemporary architecture."},
    {id:"p7",title:"The Sunday market",creator:"Noor Al-Harthy",type:"Images",category:"Food",price:10,image:"https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=850&q=80",description:"Colorful seasonal produce from a neighborhood market. A high-resolution image for editorial projects."},
    {id:"p8",title:"Notes for a new beginning",creator:"Studio Saffron",type:"Documents",category:"Templates",price:6,image:"https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=850&q=80",description:"A beautifully simple set of printable pages for mapping out ideas, plans, and small next steps."}
  ];
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const safeRead = (key, fallback) => { try { const value = JSON.parse(localStorage.getItem(key)); return value ?? fallback; } catch { return fallback; } };
  const checkoutAttemptStorageKey = "ac-checkout-attempt";
  const checkoutAttemptIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  let checkoutAttemptNeedsReset = false;
  function clearCheckoutAttempt() {
    checkoutAttemptNeedsReset = true;
    try {
      sessionStorage.removeItem(checkoutAttemptStorageKey);
    } catch (error) {
      console.warn("Could not clear the saved checkout attempt.", error);
    }
  }
  function checkoutAttemptIdForCart(items) {
    const cartFingerprint = JSON.stringify(
      items
        .map(({id, quantity}) => ({id, quantity}))
        .sort((first, second) => first.id < second.id ? -1 : first.id > second.id ? 1 : 0)
    );
    let savedAttempt = null;
    try {
      savedAttempt = JSON.parse(sessionStorage.getItem(checkoutAttemptStorageKey) || "null");
    } catch (error) {
      console.warn("Could not read the saved checkout attempt.", error);
    }
    if (
      !checkoutAttemptNeedsReset &&
      savedAttempt?.cartFingerprint === cartFingerprint &&
      typeof savedAttempt.id === "string" &&
      checkoutAttemptIdPattern.test(savedAttempt.id)
    ) {
      return savedAttempt.id;
    }
    const attemptId = crypto.randomUUID();
    try {
      sessionStorage.setItem(checkoutAttemptStorageKey, JSON.stringify({id:attemptId, cartFingerprint}));
    } catch {
      throw new Error("Checkout retry state could not be saved in this tab. Allow session storage and try again.");
    }
    checkoutAttemptNeedsReset = false;
    return attemptId;
  }
  if (new URLSearchParams(location.search).get("checkout_cancelled") === "1") {
    clearCheckoutAttempt();
    history.replaceState(null, "", `${location.pathname}${location.hash}`);
  }
  function readStoredList(key, validate) {
    const value = safeRead(key, []);
    if (!Array.isArray(value)) {
      console.warn(`Ignoring invalid saved ${key} data.`);
      return [];
    }
    const valid = value.filter(validate);
    if (valid.length !== value.length) console.warn(`Ignoring invalid entries in saved ${key} data.`);
    return valid;
  }
  const isLocalOrigin = location.hostname === "localhost" || location.hostname === "127.0.0.1";
  const localConfig = window.ALIBABA_SUPABASE_LOCAL_CONFIG;
  const localConfigReady = Boolean(isLocalOrigin && localConfig && localConfig.url === "http://127.0.0.1:54321" && typeof localConfig.publishableKey === "string" && localConfig.publishableKey.length > 20 && !localConfig.publishableKey.includes("YOUR_"));
  const supabaseConfig = localConfigReady ? localConfig : window.ALIBABA_SUPABASE_CONFIG;
  const supabaseApiKey = supabaseConfig && (supabaseConfig.publishableKey || supabaseConfig.anonKey);
  function isSafeImageUrl(value) {
    if (typeof value !== "string" || !value) return false;
    if (value.startsWith("blob:")) return true;
    try {
      const url = new URL(value, location.href);
      const supabaseOrigin = supabaseConfig && typeof supabaseConfig.url === "string" ? new URL(supabaseConfig.url).origin : "";
      const publicStorageImage = supabaseOrigin && url.origin === supabaseOrigin && url.pathname.startsWith("/storage/v1/object/public/marketplace-files/");
      return (url.protocol === "https:" && (url.hostname === "images.unsplash.com" || publicStorageImage)) || (localConfigReady && url.protocol === "http:" && publicStorageImage);
    } catch { return false; }
  }
  const brandMarkup = '<span class="brand-mark" aria-hidden="true"><svg viewBox="0 0 44 44" focusable="false"><rect x="1" y="1" width="42" height="42" rx="12" fill="#234b37"/><rect x="5" y="5" width="34" height="34" rx="9" fill="none" stroke="#d8c397" stroke-opacity=".58"/><path d="M11 30.5 19.2 21l5.2 5.4 3.2-3.1 5.4 7.2H11Z" fill="none" stroke="#f8f5ec" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"/><circle cx="27.5" cy="15.5" r="2.4" fill="#d8c397"/><path d="m32 8 .8 2.1 2.2.9-2.2.8-.8 2.2-.9-2.2-2.1-.8 2.1-.9z" fill="#d8c397"/></svg></span><span class="brand-name" aria-hidden="true"><span class="brand-primary">DiscoveryImage</span></span>';
  $$("[data-brand-logo]").forEach(brand => { brand.innerHTML = brandMarkup; });
  const state = {
    products: [...seedProducts],
    articles: [],
    favorites: readStoredList("ac-favorites", item => typeof item === "string" && item.length <= 120),
    cart: readStoredList("ac-cart", item => Boolean(item && typeof item.id === "string" && item.id.length <= 120 && Number.isInteger(item.quantity) && item.quantity > 0 && item.quantity <= 99)),
    query:"", favoritesView:"", selectedFile:null, selectedFileUrl:"", adminSession:null, editingArticleId:""
  };
  const imageGrid = $("#image-grid"), documentGrid = $("#document-grid");
  const money = amount => Number(amount) === 0 ? "Free" : `$${Number(amount).toFixed(2)}`;
  const escapeHtml = text => String(text).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  function setBackendStatus(message = "") {
    const status = $("#backend-status");
    status.textContent = message;
    status.classList.toggle("hidden", !message);
  }
  function toast(message, error = false) {
    const node = document.createElement("div"); node.className = `toast${error ? " error" : ""}`; node.textContent = message;
    $(".toast-region").append(node); setTimeout(() => node.remove(), 3200);
  }
  function save(key, data) { try { localStorage.setItem(key, JSON.stringify(data)); return true; } catch { toast("Your browser storage is full. Remove some uploads and try again.", true); return false; } }
  const storageBucket = "marketplace-files";
  const privateStorageBucket = "marketplace-paid-files";
  const supabaseReady = Boolean(supabaseConfig && typeof supabaseConfig.url === "string" && (/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(supabaseConfig.url) || (localConfigReady && supabaseConfig.url === localConfig.url)) && typeof supabaseApiKey === "string" && supabaseApiKey.length > 20 && !supabaseApiKey.includes("YOUR_"));
  const secureAdminOrigin = location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1";
  function isAdmin() { return Boolean(state.adminSession); }
  function requireAdmin() {
    if (isAdmin()) return true;
    toast("Admin access is required for that action.", true);
    return false;
  }
  function updateAdminControls() {
    const authorized = isAdmin();
    $$(".open-upload, .admin-write").forEach(control => control.classList.toggle("hidden", !authorized));
    $(".admin-login").classList.toggle("hidden", authorized);
    $(".admin-revenue").classList.toggle("hidden", !authorized);
    $(".admin-change").classList.toggle("hidden", !authorized);
    $(".admin-logout").classList.toggle("hidden", !authorized);
    $("#article-editor-locked").classList.toggle("hidden", authorized);
    $("#article-editor-panel").classList.toggle("hidden", !authorized);
    renderAdminArticles();
  }
  function requireSupabase() {
    if (!supabaseReady) throw new Error("Supabase is not configured. Follow README.md to add your project URL and publishable key.");
  }
  async function supabaseRequest(path, options = {}) {
    requireSupabase();
    const headers = new Headers(options.headers || {});
    headers.set("apikey", supabaseApiKey);
    headers.set("Authorization", `Bearer ${options.token || supabaseApiKey}`);
    if (options.body !== undefined && !(options.body instanceof Blob)) headers.set("Content-Type", "application/json");
    const response = await fetch(`${supabaseConfig.url.replace(/\/$/, "")}${path}`, {method:options.method || "GET", headers, body:options.body instanceof Blob ? options.body : options.body === undefined ? undefined : JSON.stringify(options.body)});
    const responseText = await response.text();
    let payload = null;
    try { payload = responseText ? JSON.parse(responseText) : null; } catch { payload = responseText; }
    if (!response.ok) {
      const detail = payload && typeof payload === "object" ? payload.msg || payload.message || payload.error_description || payload.error : "";
      const error = new Error(detail || `Supabase request failed (${response.status}).`);
      error.code = payload && typeof payload === "object" ? payload.code : "";
      throw error;
    }
    return payload;
  }
  async function verifyAdminSession(session) {
    return Boolean(await supabaseRequest("/rest/v1/rpc/is_admin", {method:"POST", token:session.access_token, body:{}}));
  }
  async function currentAdminToken() {
    requireAdmin();
    const session = state.adminSession;
    if (session.expires_at * 1000 > Date.now() + 30000) return session.access_token;
    try {
      const refreshed = await supabaseRequest("/auth/v1/token?grant_type=refresh_token", {method:"POST", body:{refresh_token:session.refresh_token}});
      state.adminSession = {...refreshed, expires_at:Date.now() / 1000 + refreshed.expires_in};
      return state.adminSession.access_token;
    } catch (error) {
      state.adminSession = null;
      updateAdminControls();
      throw new Error(`Your admin session expired. Sign in again. ${error.message}`);
    }
  }
  async function uploadObject(path, file, bucket) {
    const token = await currentAdminToken();
    await supabaseRequest(`/storage/v1/object/${bucket}/${path.split("/").map(encodeURIComponent).join("/")}`, {
      method:"POST", token, headers:{"Content-Type":file.type || "application/octet-stream", "x-upsert":"false"}, body:file
    });
    return bucket === storageBucket
      ? `${supabaseConfig.url.replace(/\/$/, "")}/storage/v1/object/public/${bucket}/${path.split("/").map(encodeURIComponent).join("/")}`
      : "";
  }
  async function deleteObject(path, bucket = storageBucket) {
    const token = await currentAdminToken();
    await supabaseRequest(`/storage/v1/object/${bucket}/${path.split("/").map(encodeURIComponent).join("/")}`, {method:"DELETE", token});
  }
  function productFromRow(row) {
    return {id:row.id,title:row.title,creator:row.creator,type:row.type,category:row.category,price:Number(row.price),image:row.image_url || "",description:row.description,isAdminUpload:true,isCatalogProduct:true,createdAt:row.created_at};
  }
  function articleMarkdownHtml(markdown) {
    const lines = escapeHtml(String(markdown || "")).replace(/\r\n?/g, "\n").split("\n");
    const output = [];
    let listType = "";
    const closeList = () => {
      if (listType) output.push(listType === "ul" ? "</ul>" : "</ol>");
      listType = "";
    };
    const inline = text => text
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>");
    lines.forEach(line => {
      const heading = line.match(/^(#{1,3})\s+(.+)$/);
      const unordered = line.match(/^\s*[-*]\s+(.+)$/);
      const ordered = line.match(/^\s*\d+\.\s+(.+)$/);
      if (unordered || ordered) {
        const nextType = unordered ? "ul" : "ol";
        if (listType !== nextType) {
          closeList();
          listType = nextType;
          output.push(nextType === "ul" ? "<ul>" : "<ol>");
        }
        output.push(`<li>${inline((unordered || ordered)[1])}</li>`);
      } else {
        closeList();
        if (!line.trim()) return;
        if (heading) output.push(`<h${heading[1].length}>${inline(heading[2])}</h${heading[1].length}>`);
        else if (/^&gt;\s?/.test(line)) output.push(`<blockquote>${inline(line.replace(/^&gt;\s?/, ""))}</blockquote>`);
        else output.push(`<p>${inline(line)}</p>`);
      }
    });
    closeList();
    return output.join("");
  }
  const articleDate = value => new Date(value).toLocaleDateString(undefined, {year:"numeric",month:"long",day:"numeric"});
  function renderArticles() {
    const published = state.articles.filter(article => article.is_published);
    $("#article-grid").innerHTML = published.map(article => {
      const excerpt = String(article.content).replace(/[#>*`_~-]/g, "").replace(/\s+/g, " ").trim();
      return `<article class="article-card"><a href="#article/${encodeURIComponent(article.id)}"><span class="article-card-date">${escapeHtml(articleDate(article.created_at))}</span><h2>${escapeHtml(article.title)}</h2><p>${escapeHtml(excerpt.slice(0, 180))}${excerpt.length > 180 ? "…" : ""}</p><span class="article-card-link">Read article <b>↗</b></span></a></article>`;
    }).join("");
    $("#articles-empty").classList.toggle("hidden", published.length > 0 || !$("#articles-error").classList.contains("hidden"));
    renderAdminArticles();
  }
  function renderArticleDetail(id) {
    const article = state.articles.find(candidate => candidate.id === id && (candidate.is_published || isAdmin()));
    const host = $("#article-detail");
    if (!article) {
      host.innerHTML = `<div class="empty-state"><h2 id="article-detail-title">Article not found.</h2><p>This article may have been unpublished or removed.</p><a class="button button-outline" href="#articles">Back to articles</a></div>`;
      return;
    }
    host.innerHTML = `<header class="article-detail-heading"><p class="article-card-date">${escapeHtml(articleDate(article.created_at))} · DiscoveryImage</p><h1 id="article-detail-title">${escapeHtml(article.title)}</h1></header><div class="article-body">${articleMarkdownHtml(article.content)}</div>`;
  }
  async function loadArticles() {
    if (!supabaseReady) {
      state.articles = [];
      renderArticles();
      return;
    }
    try {
      const token = isAdmin() ? await currentAdminToken() : undefined;
      const articles = await supabaseRequest("/rest/v1/articles?select=id,title,content,author_id,created_at,is_published&order=created_at.desc", {token});
      if (!Array.isArray(articles)) throw new Error("Supabase returned an unexpected articles response.");
      state.articles = articles;
      $("#articles-error").classList.add("hidden");
      renderArticles();
      if (location.hash.startsWith("#article/")) renderArticleDetail(decodeURIComponent(location.hash.slice("#article/".length)));
    } catch (error) {
      console.warn("Could not load articles from Supabase.", error);
      $("#articles-error").textContent = error && error.code === "PGRST205"
        ? "The articles table is not installed yet. Apply the articles migration in Supabase, then reload."
        : error instanceof Error ? `Articles could not be loaded: ${error.message}` : "Articles could not be loaded.";
      $("#articles-error").classList.remove("hidden");
      renderArticles();
      $("#articles-empty").classList.add("hidden");
    }
  }
  function renderAdminArticles() {
    const list = $("#article-admin-list");
    if (!list) return;
    if (!isAdmin()) {
      list.innerHTML = "";
      return;
    }
    const owned = state.articles.filter(article => article.author_id === state.adminSession.user.id);
    list.innerHTML = owned.length ? owned.map(article => `<div class="article-admin-row"><span><strong>${escapeHtml(article.title)}</strong><small>${article.is_published ? "Published" : "Draft"} · ${escapeHtml(articleDate(article.created_at))}</small></span><div class="article-admin-actions"><button class="button button-outline" type="button" data-edit-article="${escapeHtml(article.id)}">Edit</button><button class="button button-outline" type="button" data-delete-article="${escapeHtml(article.id)}">Delete</button></div></div>`).join("") : '<p class="modal-intro">Your saved drafts and published articles will appear here.</p>';
    list.querySelectorAll("[data-edit-article]").forEach(button => button.addEventListener("click", () => {
      const article = owned.find(candidate => candidate.id === button.dataset.editArticle);
      if (article && confirmDiscardArticle()) editArticle(article);
    }));
    list.querySelectorAll("[data-delete-article]").forEach(button => button.addEventListener("click", async () => {
      const article = owned.find(candidate => candidate.id === button.dataset.deleteArticle);
      if (!article || !requireAdmin() || !window.confirm(`Permanently delete "${article.title}"? This cannot be undone.`)) return;
      button.disabled = true;
      try {
        const result = await supabaseRequest(`/rest/v1/articles?id=eq.${encodeURIComponent(article.id)}`, {
          method:"DELETE",
          token:await currentAdminToken(),
          headers:{Prefer:"return=representation"}
        });
        if (!Array.isArray(result) || result.length !== 1) throw new Error("Supabase did not confirm the article deletion.");
        state.articles = state.articles.filter(candidate => candidate.id !== article.id);
        renderArticles();
        if (state.editingArticleId === article.id) editArticle(null);
        toast("Article deleted.");
      } catch (error) {
        toast(error instanceof Error ? `Article could not be deleted: ${error.message}` : "Article could not be deleted.", true);
        button.disabled = false;
      }
    }));
  }
  function editArticle(article) {
    const form = $("#article-form");
    state.editingArticleId = article ? article.id : "";
    state.articleDirty = false;
    form.elements.id.value = state.editingArticleId;
    form.elements.title.value = article ? article.title : "";
    form.elements.content.value = article ? article.content : "";
    form.elements.is_published.checked = Boolean(article && article.is_published);
    $("#article-editor-heading").innerHTML = article ? 'Edit your <span class="serif">article.</span>' : 'Write something <span class="serif">good.</span>';
    $("#article-save").textContent = form.elements.is_published.checked ? "Save & publish" : "Save draft";
    $("#article-form-error").classList.add("hidden");
    $("#article-preview-content").innerHTML = articleMarkdownHtml(form.elements.content.value) || "<p>Your formatted article preview will appear here.</p>";
  }
  $("#article-form").elements.is_published.addEventListener("change", event => {
    state.articleDirty = true;
    $("#article-save").textContent = event.currentTarget.checked ? "Save & publish" : "Save draft";
  });
  $("#article-form").elements.title.addEventListener("input", () => { state.articleDirty = true; });
  $("#article-form").elements.content.addEventListener("input", event => {
    state.articleDirty = true;
    $("#article-preview-content").innerHTML = articleMarkdownHtml(event.currentTarget.value) || "<p>Your formatted article preview will appear here.</p>";
  });
  const confirmDiscardArticle = () => !state.articleDirty || window.confirm("Discard your unsaved article changes?");
  $(".article-new").addEventListener("click", () => {
    if (confirmDiscardArticle()) editArticle(null);
  });
  $(".article-admin-login").addEventListener("click", openAdminLogin);
  $("#article-form").addEventListener("submit", async event => {
    event.preventDefault();
    if (!requireAdmin()) return;
    const form = event.currentTarget;
    const submit = $("#article-save");
    const errorNode = $("#article-form-error");
    const controls = [...form.querySelectorAll("input, textarea, button")];
    const title = form.elements.title.value.trim();
    const content = form.elements.content.value.trim();
    if (!title || !content) {
      errorNode.textContent = "Add a title and article content before saving.";
      errorNode.classList.remove("hidden");
      return;
    }
    controls.forEach(control => { control.disabled = true; });
    errorNode.classList.add("hidden");
    try {
      const token = await currentAdminToken();
      const isPublished = form.elements.is_published.checked;
      const body = {title, content, is_published:isPublished};
      const editingId = state.editingArticleId;
      const result = await supabaseRequest(editingId
        ? `/rest/v1/articles?id=eq.${encodeURIComponent(editingId)}`
        : "/rest/v1/articles", {
          method:editingId ? "PATCH" : "POST",
          token,
          headers:{Prefer:"return=representation"},
          body:editingId ? body : {...body, author_id:state.adminSession.user.id}
        });
      if (!Array.isArray(result) || result.length !== 1) throw new Error("Supabase did not confirm the article save.");
      await loadArticles();
      editArticle(result[0]);
      toast(isPublished ? "Article published." : "Draft saved.");
    } catch (error) {
      errorNode.textContent = error instanceof Error ? error.message : "The article could not be saved.";
      errorNode.classList.remove("hidden");
    } finally {
      controls.forEach(control => { control.disabled = false; });
    }
  });
  async function loadMarketplaceContent() {
    if (!supabaseReady) {
      setBackendStatus("Preview mode — showing sample content. Configure Supabase to enable shared publishing and admin sign-in.");
      renderArticles();
      return;
    }
    await loadArticles();
    try {
      const products = await supabaseRequest("/rest/v1/products?select=id,title,creator,type,category,price,description,image_url,created_at&order=created_at.desc");
      if (!Array.isArray(products)) throw new Error("Supabase returned an unexpected product response.");
      state.products = products.map(productFromRow);
      renderProducts(); renderCart();
      setBackendStatus("");
    } catch (error) {
      console.warn("Could not load shared marketplace content; keeping sample content available.", error);
      if (error && typeof error === "object" && error.code === "PGRST205") {
        setBackendStatus("Supabase is connected, but its catalog tables are missing. Run supabase-schema.sql in the Supabase SQL Editor, then reload.");
        return;
      }
      const detail = error instanceof Error ? error.message : String(error);
      setBackendStatus(`Could not load shared marketplace content: ${detail}`);
    }
  }
  const adminDialog = $("#admin-dialog");
  let adminDialogMode = "login";
  function openAdminDialog(mode) {
    const form = $("#admin-form");
    adminDialogMode = mode;
    const changing = mode === "change";
    $("#admin-dialog-title").textContent = changing ? "Change admin password" : "Admin login";
    $("#admin-dialog-copy").textContent = changing
      ? "Verify your current password, then choose a new password with at least 12 characters."
      : supabaseReady
        ? "Sign in with the admin account authorized for this site."
        : "Preview mode is active. Configure your Supabase project URL and publishable key to enable admin sign-in.";
    $("#admin-email-field").classList.toggle("hidden", changing);
    $("#admin-email").required = !changing;
    $("#admin-current-field").classList.toggle("hidden", !changing);
    $("#admin-password-label").textContent = changing ? "New password" : "Password";
    $("#admin-confirm-field").classList.toggle("hidden", !changing);
    form.elements.current.required = changing;
    form.elements.confirm.required = changing;
    $("#admin-password").autocomplete = changing ? "new-password" : "current-password";
    $("#admin-submit").textContent = changing ? "Save new password" : "Log in";
    $("#admin-error").classList.add("hidden");
    form.reset();
    adminDialog.showModal();
  }
  function openAdminLogin() {
    if (supabaseReady && !secureAdminOrigin) { toast("Admin sign-in requires HTTPS (or localhost during development).", true); return; }
    openAdminDialog("login");
  }
  $("#admin-form").addEventListener("submit", async event => {
    event.preventDefault();
    const form = event.currentTarget, submit = $("#admin-submit"), error = $("#admin-error");
    const password = form.elements.password.value;
    submit.disabled = true;
    error.classList.add("hidden");
    try {
      if (adminDialogMode === "change") {
        if (!isAdmin()) throw new Error("Sign in as admin before changing the password.");
        if (password.length < 12) throw new Error("Choose a new password with at least 12 characters.");
        if (password !== form.elements.confirm.value) throw new Error("The new passwords do not match.");
        const reauthenticated = await supabaseRequest("/auth/v1/token?grant_type=password", {
          method:"POST", body:{email:state.adminSession.user.email,password:form.elements.current.value}
        });
        if (!await verifyAdminSession(reauthenticated)) throw new Error("This account is not authorized as an admin.");
        await supabaseRequest("/auth/v1/user", {method:"PUT", token:reauthenticated.access_token, body:{password}});
        state.adminSession = {...reauthenticated, expires_at:Date.now() / 1000 + reauthenticated.expires_in};
        adminDialog.close();
        form.reset();
        toast("Your admin password has been updated by Supabase.");
        return;
      } else {
        const session = await supabaseRequest("/auth/v1/token?grant_type=password", {
          method:"POST", body:{email:form.elements.email.value.trim(),password}
        });
        if (!await verifyAdminSession(session)) {
          try { await supabaseRequest("/auth/v1/logout", {method:"POST", token:session.access_token}); }
          catch (logoutError) { console.warn("Could not revoke the non-admin Supabase session.", logoutError); }
          throw new Error("This account is not on the site's admin allowlist.");
        }
        state.adminSession = {...session, expires_at:Date.now() / 1000 + session.expires_in};
      }
      updateAdminControls();
      await loadArticles();
      adminDialog.close();
      form.reset();
      toast("Signed in to the authorized admin account.");
    } catch (cause) {
      error.textContent = cause.message || "Could not sign in. Try again.";
      error.classList.remove("hidden");
    } finally {
      submit.disabled = false;
    }
  });
  $(".admin-login").addEventListener("click", openAdminLogin);
  $(".admin-change").addEventListener("click", () => {
    if (requireAdmin()) openAdminDialog("change");
  });
  async function showRevenueDashboard() {
    if (!requireAdmin()) return;
    const dialog=$("#revenue-dialog");
    const status=$("#revenue-status");
    const errorNode=$("#revenue-error");
    const bestSellers=$("#revenue-best-sellers");
    const recentOrders=$("#revenue-recent-orders");
    const formatCents=value=>{
      const cents=Number(value);
      if(!Number.isSafeInteger(cents)||cents<0)throw new Error("The sales report returned an invalid amount.");
      return `$${(cents/100).toFixed(2)}`;
    };
    const textRow=(container,values,className)=>{
      const row=document.createElement("div");
      row.className=className;
      values.forEach(value=>{
        const cell=document.createElement("span");
        cell.textContent=String(value);
        row.append(cell);
      });
      container.append(row);
    };
    dialog.showModal();
    status.textContent="Loading verified Stripe orders…";
    errorNode.classList.add("hidden");
    ["orders","gross","refunds","net","failures"].forEach(name=>$("#revenue-"+name).textContent="—");
    bestSellers.replaceChildren();
    recentOrders.replaceChildren();
    try {
      const summary=await supabaseRequest("/rest/v1/rpc/admin_sales_summary",{method:"POST",token:await currentAdminToken(),body:{}});
      if(!summary||typeof summary!=="object"||Array.isArray(summary))throw new Error("The sales report returned an unexpected response.");
      $("#revenue-orders").textContent=String(summary.successful_orders);
      $("#revenue-gross").textContent=formatCents(summary.gross_revenue_cents);
      $("#revenue-refunds").textContent=formatCents(summary.refunded_cents);
      $("#revenue-net").textContent=formatCents(summary.net_revenue_cents);
      $("#revenue-failures").textContent=String(summary.failed_payments);
      if(!Array.isArray(summary.best_sellers)||!Array.isArray(summary.recent_orders))throw new Error("The sales report returned incomplete transaction data.");
      summary.best_sellers.forEach(item=>textRow(bestSellers,[item.title,`${item.units_sold} units`,formatCents(item.gross_cents)],"revenue-data-row"));
      summary.recent_orders.forEach(order=>textRow(recentOrders,[String(order.checkout_session_id).slice(-12),order.customer_email||"Email not provided",formatCents(order.amount_total-order.refunded_amount),new Date(order.paid_at).toLocaleDateString()],"revenue-data-row"));
      if(!summary.best_sellers.length)bestSellers.textContent="No verified sales yet.";
      if(!summary.recent_orders.length)recentOrders.textContent="No verified orders yet.";
      status.textContent="Totals include verified paid orders and recorded refunds. Failed payments count distinct payment intents with no successful order.";
    } catch(cause) {
      status.textContent="The verified sales report could not be loaded.";
      errorNode.textContent=cause instanceof Error?cause.message:"The sales report is temporarily unavailable.";
      errorNode.classList.remove("hidden");
    }
  }
  $(".admin-revenue").addEventListener("click",showRevenueDashboard);
  $(".admin-logout").addEventListener("click", async () => {
    const session = state.adminSession;
    state.adminSession = null;
    updateAdminControls();
    if (adminDialog.open) adminDialog.close();
    if ($("#upload-dialog").open) $("#upload-dialog").close();
    try {
      if (session) await supabaseRequest("/auth/v1/logout", {method:"POST", token:session.access_token});
      toast("Admin session signed out.");
    } catch (error) { toast(`Signed out locally, but Supabase could not revoke the session: ${error.message}`, true); }
    await loadArticles();
  });
  function productMarkup(product) {
    const image = isSafeImageUrl(product.image) ? product.image : "";
    const actions = !product.isCatalogProduct
      ? '<div class="product-actions"><button class="button button-outline" type="button" disabled>Sample preview</button></div>'
      : product.price === 0
        ? `<div class="product-actions"><button class="button button-dark" type="button" data-free-download="${escapeHtml(product.id)}">View free download</button></div>`
        : `<div class="product-actions"><button class="button button-outline add-to-cart" type="button" data-add-cart="${escapeHtml(product.id)}">Add to Cart</button><button class="button button-dark buy-now" type="button" data-buy-now="${escapeHtml(product.id)}">Buy Now</button></div>`;
    return `<article class="product-card" data-id="${escapeHtml(product.id)}"><div class="product-image-wrap">${image ? `<img class="product-image" src="${escapeHtml(image)}" alt="${escapeHtml(product.title)}" loading="lazy">` : `<div class="image-placeholder">${product.type === "Documents" ? "A little something to read" : "Made to be found"}</div>`}<span class="type-chip">${escapeHtml(product.category)}</span><button class="favorite-button ${state.favorites.includes(product.id) ? "is-favorite" : ""}" data-favorite="${escapeHtml(product.id)}" aria-label="${state.favorites.includes(product.id) ? "Remove from" : "Add to"} saved items">${state.favorites.includes(product.id) ? "♥" : "♡"}</button></div><div class="product-info"><div><h3 class="product-title"><button class="product-title-button" type="button" data-view-product="${escapeHtml(product.id)}">${escapeHtml(product.title)}</button></h3><p class="product-creator">By ${escapeHtml(product.creator)}</p><div class="product-category">${product.type === "Documents" ? "DIGITAL DOCUMENT" : "IMAGE"}</div></div><span class="product-price">${money(product.price)}</span></div>${actions}</article>`;
  }
  function renderProducts() {
    const term = state.query.trim().toLowerCase();
    [
      {type:"Images", key:"images", grid:imageGrid, empty:$("#images-empty"), sort:$("#images-page .sort-select")},
      {type:"Documents", key:"documents", grid:documentGrid, empty:$("#documents-empty"), sort:$("#documents-page .sort-select")}
    ].forEach(({type,key,grid,empty,sort}) => {
      let products=state.products.filter(product=>product.type===type&&(!term||`${product.title} ${product.creator} ${product.category} ${product.description}`.toLowerCase().includes(term))&&(!state.favoritesView||state.favoritesView!==key||state.favorites.includes(product.id)));
      if(sort.value==="newest")products=[...products].sort((a,b)=>Date.parse(b.createdAt||"1970-01-01")-Date.parse(a.createdAt||"1970-01-01"));
      if(sort.value==="price-low")products=[...products].sort((a,b)=>Number(a.price)-Number(b.price));
      if(sort.value==="price-high")products=[...products].sort((a,b)=>Number(b.price)-Number(a.price));
      grid.innerHTML=products.map(productMarkup).join("");
      empty.classList.toggle("hidden",products.length>0);
      grid.classList.toggle("hidden",products.length===0);
    });
  }
  function cartCount() {
    return state.cart.reduce((count, item) => count + item.quantity, 0);
  }
  function renderCart() {
    const count = cartCount();
    const cartButton = $(".cart-toggle");
    cartButton.setAttribute("aria-label", `Shopping cart, ${count} ${count === 1 ? "item" : "items"}`);
    $(".cart-count").textContent = String(count);

    const items = state.cart.map(item => {
      const product = state.products.find(candidate => candidate.id === item.id);
      if (!product) {
        return `<div class="cart-item cart-item-unavailable"><div><strong>Unavailable listing</strong><span>This item is no longer in the catalog.</span></div><button class="cart-remove" type="button" data-cart-action="remove" data-cart-id="${escapeHtml(item.id)}">Remove</button></div>`;
      }
      return `<div class="cart-item"><div class="cart-item-details"><strong>${escapeHtml(product.title)}</strong><span>${escapeHtml(product.type)} · ${money(product.price)}</span></div><div class="cart-item-controls"><button type="button" aria-label="Remove one ${escapeHtml(product.title)}" data-cart-action="decrement" data-cart-id="${escapeHtml(item.id)}">−</button><span>${item.quantity}</span><button type="button" aria-label="Add one ${escapeHtml(product.title)}" data-cart-action="increment" data-cart-id="${escapeHtml(item.id)}" ${item.quantity >= 99 ? "disabled" : ""}>+</button></div><strong class="cart-item-total">${money(Number(product.price) * item.quantity)}</strong><button class="cart-remove" type="button" data-cart-action="remove" data-cart-id="${escapeHtml(item.id)}">Remove</button></div>`;
    }).join("");
    $("#cart-items").innerHTML = items || '<p class="cart-empty">Your cart is empty. Add an image or document to get started.</p>';
    const total = state.cart.reduce((sum, item) => {
      const product = state.products.find(candidate => candidate.id === item.id);
      return sum + (product ? Number(product.price) * item.quantity : 0);
    }, 0);
    $("#cart-total").textContent = `$${total.toFixed(2)}`;
  }
  function addToCart(id, openCartAfterAdd = false) {
    const product = state.products.find(item => item.id === id);
    if (!product) {
      toast("This listing is no longer available.", true);
      return;
    }
    if (!product.isCatalogProduct || product.price <= 0) {
      toast("Only live paid listings can be added to checkout.", true);
      return;
    }
    const existing = state.cart.find(item => item.id === id);
    if (existing) {
      if (existing.quantity >= 99) {
        toast("You can add up to 99 of the same item.", true);
        if (openCartAfterAdd) $("#cart-dialog").showModal();
        return;
      }
      existing.quantity++;
    } else {
      state.cart.push({id, quantity:1});
    }
    clearCheckoutAttempt();
    save("ac-cart", state.cart);
    renderCart();
    if (openCartAfterAdd) {
      $("#cart-dialog").showModal();
    } else {
      toast(`${product.title} added to your cart.`);
    }
  }
  $("#cart-items").addEventListener("click", event => {
    const button = event.target.closest("[data-cart-action]");
    if (!button) return;
    const {cartAction, cartId} = button.dataset;
    const item = state.cart.find(entry => entry.id === cartId);
    if (!item) return;
    if (cartAction === "remove" || (cartAction === "decrement" && item.quantity === 1)) {
      state.cart = state.cart.filter(entry => entry.id !== cartId);
    } else if (cartAction === "decrement") {
      item.quantity--;
    } else if (cartAction === "increment" && item.quantity < 99) {
      item.quantity++;
    }
    clearCheckoutAttempt();
    save("ac-cart", state.cart);
    renderCart();
  });
  $(".cart-toggle").addEventListener("click", () => $("#cart-dialog").showModal());
  $(".cart-continue").addEventListener("click", () => $("#cart-dialog").close());
  $(".cart-checkout").addEventListener("click", async event => {
    const button = event.currentTarget;
    if (!supabaseReady) {
      toast("Secure checkout is not configured yet. Contact the site owner.", true);
      return;
    }
    if (!secureAdminOrigin) {
      toast("Secure checkout requires HTTPS.", true);
      return;
    }
    if (!state.cart.length) {
      toast("Add an item to your cart before checkout.", true);
      return;
    }
    const purchasable = state.cart.every(item => {
      const product = state.products.find(candidate => candidate.id === item.id);
      return product && product.price > 0 && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(product.id);
    });
    if (!purchasable) {
      toast("Remove preview-only or legacy public listings; only paid items in private storage can be checked out.", true);
      return;
    }
    button.disabled = true;
    const originalText = button.textContent;
    button.textContent = "Preparing secure checkout…";
    try {
      const items = state.cart.map(item => ({id:item.id, quantity:item.quantity}));
      const attemptId = checkoutAttemptIdForCart(items);
      const response = await fetch(`${supabaseConfig.url.replace(/\/$/, "")}/functions/v1/create-checkout-session`, {
        method:"POST",
        headers:{"apikey":supabaseApiKey,"Content-Type":"application/json"},
        body:JSON.stringify({items, attempt_id:attemptId})
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (result.code === "checkout_attempt_closed" || result.code === "checkout_attempt_conflict") {
          clearCheckoutAttempt();
        }
        throw new Error(result.error || "Secure checkout could not be started.");
      }
      const checkoutUrl = new URL(result.url);
      if (checkoutUrl.protocol !== "https:" || checkoutUrl.hostname !== "checkout.stripe.com") {
        throw new Error("Stripe returned an invalid secure checkout URL.");
      }
      location.assign(checkoutUrl.href);
    } catch (error) {
      toast(error instanceof Error ? error.message : "Secure checkout could not be started. Please try again.", true);
      button.disabled = false;
      button.textContent = originalText;
    }
  });
  const uploadMimeByExtension = {
    jpg:"image/jpeg",jpeg:"image/jpeg",png:"image/png",webp:"image/webp",gif:"image/gif",tif:"image/tiff",tiff:"image/tiff",
    pdf:"application/pdf",doc:"application/msword",docx:"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ppt:"application/vnd.ms-powerpoint",pptx:"application/vnd.openxmlformats-officedocument.presentationml.presentation",
    xls:"application/vnd.ms-excel",xlsx:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",epub:"application/epub+zip"
  };
  const allowedUploadMimeTypes = new Set(Object.values(uploadMimeByExtension));
  function getUploadMimeType(file) {
    const extension = file.name.split(".").pop().toLowerCase();
    const inferred = uploadMimeByExtension[extension];
    if (!inferred || (file.type && file.type !== inferred && file.type !== "application/octet-stream")) return "";
    return inferred;
  }
  const uploadDialog = $("#upload-dialog");
  function openUpload() {
    if (!requireAdmin()) return;
    const form = $("#product-form");
    form.reset(); form.classList.add("hidden");
    $("#upload-error").classList.add("hidden"); $("#upload-progress").classList.add("hidden");
    $("#upload-progress").dataset.progress = "0";
    $("#file-input").value=""; state.selectedFile=null;
    if (state.selectedFileUrl) URL.revokeObjectURL(state.selectedFileUrl);
    state.selectedFileUrl=""; uploadDialog.showModal();
  }
  function chooseFile(file) {
    if (!file) return;
    const mimeType = getUploadMimeType(file);
    if (!mimeType || !allowedUploadMimeTypes.has(mimeType)) { $("#upload-error").textContent="That file type is not supported. Choose a JPG, PNG, WebP, GIF, TIFF, PDF, Office document, or EPUB file."; $("#upload-error").classList.remove("hidden"); return; }
    if (file.size > 15 * 1024 * 1024) { $("#upload-error").textContent="This file is larger than 15 MB. Choose a smaller file and try again."; $("#upload-error").classList.remove("hidden"); return; }
    state.selectedFile = new File([file], file.name, {type:mimeType});
    state.selectedFileUrl = mimeType.startsWith("image/") ? URL.createObjectURL(state.selectedFile) : "";
    const form = $("#product-form"); form.classList.remove("hidden"); form.elements.title.value = file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g," ");
    form.elements.type.value = mimeType.startsWith("image/") ? "Images" : "Documents";
    $("#upload-error").classList.add("hidden"); toast(`${file.name} is ready to add.`);
  }
  $("#file-input").addEventListener("change", event => chooseFile(event.target.files[0]));
  const drop = $("#upload-drop");
  ["dragenter","dragover"].forEach(name => drop.addEventListener(name, event => { event.preventDefault(); drop.classList.add("drag-over"); }));
  ["dragleave","drop"].forEach(name => drop.addEventListener(name, event => { event.preventDefault(); drop.classList.remove("drag-over"); }));
  drop.addEventListener("drop", event => chooseFile(event.dataTransfer.files[0]));
  $$(".open-upload").forEach(button => button.addEventListener("click", openUpload));
  $$(".cancel-upload").forEach(button => button.addEventListener("click", () => uploadDialog.close()));
  $("#product-form").addEventListener("submit", async event => {
    event.preventDefault(); if (!requireAdmin() || !state.selectedFile) return;
    const form = event.currentTarget, submit = form.querySelector('[type="submit"]'), progress = $("#upload-progress");
    submit.disabled = true; progress.classList.remove("hidden"); progress.dataset.progress = "0";
    const file = state.selectedFile, id = crypto.randomUUID();
    let uploadedPath = "";
    let uploadedBucket = storageBucket;
    try {
      if (form.elements.title.value.trim().length < 1 || form.elements.category.value.trim().length < 1) throw new Error("Add a title and category before publishing.");
      if (!Number.isFinite(Number(form.elements.price.value)) || Number(form.elements.price.value) < 0 || Number(form.elements.price.value) > 10000) throw new Error("Enter a valid price between 0 and 10,000.");
      const price = Number(form.elements.price.value);
      uploadedBucket = price > 0 ? privateStorageBucket : storageBucket;
      const safeFileName = file.name.normalize("NFKC").replace(/[^a-zA-Z0-9._-]/g,"-").replace(/^\.+/,"").slice(0,100) || "upload";
      const folder = `${state.adminSession.user.id}/${id}`;
      uploadedPath = `${folder}/${safeFileName}`;
      const publicUrl = await uploadObject(uploadedPath, file, uploadedBucket);
      progress.dataset.progress = "75";
      const productBody = {id,title:form.elements.title.value.trim(),creator:"DiscoveryImage Admin",type:form.elements.type.value,category:form.elements.category.value.trim(),price,description:`${file.name} · ${file.type || "Digital file"} · ${Math.max(1,Math.round(file.size/1024))} KB`,file_name:file.name,file_path:uploadedPath,image_url:publicUrl || null};
      productBody.file_bucket = uploadedBucket;
      const requestOptions = {
        method:"POST",
        token:await currentAdminToken(),
        headers:{Prefer:"return=representation"},
        body:productBody
      };
      let row;
      try {
        row = await supabaseRequest("/rest/v1/products?select=id,title,creator,type,category,price,description,image_url,created_at", requestOptions);
      } catch(error) {
        if(error && ["PGRST204","42703"].includes(error.code)) {
          if(price>0)throw new Error("Paid uploads require the secure-storage migration. Apply 20261013000000_stripe_checkout.sql before uploading paid products.");
          const {file_bucket:ignoredBucket,...freeProductBody}=productBody;
          row = await supabaseRequest("/rest/v1/products?select=id,title,creator,type,category,price,description,image_url,created_at", {
            ...requestOptions,
            body:freeProductBody
          });
        } else {
          throw error;
        }
      }
      if (!Array.isArray(row) || row.length !== 1) throw new Error("Supabase did not confirm the uploaded listing.");
      state.products.unshift(productFromRow(row[0])); progress.dataset.progress = "100";
      uploadDialog.close(); renderProducts(); location.hash="#images"; toast("Your work is now published in the shared collection.");
    } catch (error) {
      if (uploadedPath) {
        try { await deleteObject(uploadedPath, uploadedBucket); }
        catch (cleanupError) { error.message = `${error.message} The uploaded file also needs cleanup: ${cleanupError.message}`; }
      }
      $("#upload-error").textContent=error.message || "Could not upload this file. Check your connection and try again.";
      $("#upload-error").classList.remove("hidden");
    }
    finally { submit.disabled=false; }
  });
  function handleProductClick(event) {
    const viewButton = event.target.closest("[data-view-product]");
    if (viewButton) {
      event.stopPropagation();
      showProduct(viewButton.dataset.viewProduct);
      return;
    }
    const freeButton = event.target.closest("[data-free-download]");
    if (freeButton) {
      event.stopPropagation();
      const product = state.products.find(item => item.id === freeButton.dataset.freeDownload);
      if (product) showProduct(product.id);
      return;
    }
    const addButton = event.target.closest("[data-add-cart]");
    if (addButton) {
      event.stopPropagation();
      addToCart(addButton.dataset.addCart);
      return;
    }
    const buyButton = event.target.closest("[data-buy-now]");
    if (buyButton) {
      event.stopPropagation();
      addToCart(buyButton.dataset.buyNow, true);
      return;
    }
    const favorite = event.target.closest("[data-favorite]");
    if (favorite) { event.stopPropagation(); const id=favorite.dataset.favorite; state.favorites=state.favorites.includes(id)?state.favorites.filter(item=>item!==id):[...state.favorites,id]; save("ac-favorites",state.favorites); renderProducts(); toast(state.favorites.includes(id)?"Saved to your collection.":"Removed from saved items."); return; }
    const card=event.target.closest("[data-id]");
    if(card) {
      showProduct(card.dataset.id);
    }
  }
  [imageGrid,documentGrid].forEach(grid=>{
    grid.addEventListener("click",handleProductClick);
  });
  async function downloadFreeProduct(product, button) {
    button.disabled=true;
    try {
      const response=await fetch(`${supabaseConfig.url.replace(/\/$/,"")}/functions/v1/get-free-download`, {
        method:"POST",
        headers:{"apikey":supabaseApiKey,"Content-Type":"application/json"},
        body:JSON.stringify({product_id:product.id})
      });
      const result=await response.json().catch(()=>({}));
      if(!response.ok||typeof result.url!=="string")throw new Error(result.error||"The free download could not be prepared.");
      const downloadUrl=new URL(result.url);
      const supabaseOrigin=new URL(supabaseConfig.url).origin;
      const secureProtocol=downloadUrl.protocol==="https:"||(localConfigReady&&downloadUrl.protocol==="http:");
      if(!secureProtocol||downloadUrl.origin!==supabaseOrigin)throw new Error("A secure download link could not be verified.");
      const link=document.createElement("a");
      link.href=downloadUrl.href;
      link.rel="noopener";
      link.click();
      toast("Your free file download has started.");
    } catch(error) {
      toast(error instanceof Error?error.message:"The free download could not be prepared.",true);
    } finally {
      button.disabled=false;
    }
  }
  async function showProduct(id) {
    const product=state.products.find(p=>p.id===id); if(!product)return;
    const image=isSafeImageUrl(product.image)?product.image:"";
    const canDownload = product.price === 0 && product.isCatalogProduct;
    const isPreview = !product.isCatalogProduct;
    const action = canDownload
      ? '<button class="button button-dark detail-download" type="button">Download free file <span>↗</span></button>'
      : isPreview
        ? '<button class="button button-outline" type="button" disabled>Sample preview only</button>'
        : '<button class="button button-dark detail-add-to-cart" type="button">Add to Cart <span>＋</span></button>';
    const accessNote = product.price > 0
      ? '<p class="detail-local-note">Paid downloads are available after Stripe confirms your checkout.</p>'
      : canDownload ? '<p class="detail-local-note">This free file is publicly downloadable.</p>' : "";
    $("#detail-content").innerHTML=`${image?`<img class="detail-image" src="${escapeHtml(image)}" alt="${escapeHtml(product.title)}">`:""}<div class="detail-copy"><div class="detail-topline"><span>${escapeHtml(product.type)} · ${escapeHtml(product.category)}</span><span>By ${escapeHtml(product.creator)}</span></div><h2>${escapeHtml(product.title)}</h2><p>${escapeHtml(product.description || "A thoughtful addition to the collection.").replace(/\n/g,"<br><br>")}</p><div class="detail-bottom"><span class="detail-price">${money(product.price)}</span>${action}</div>${accessNote}</div>`;
    $("#detail-content").querySelector(".detail-download")?.addEventListener("click", event => downloadFreeProduct(product,event.currentTarget));
    $("#detail-content").querySelector(".detail-add-to-cart")?.addEventListener("click", () => {
      $("#detail-dialog").close();
      addToCart(product.id);
    });
    $("#detail-dialog").showModal();
  }
  $("#search-input").addEventListener("input", event => { state.query=event.target.value; renderProducts(); });
  $(".search-form").addEventListener("submit", event => {
    event.preventDefault();
    state.query=$("#search-input").value.trim();
    location.hash=`#${$("#search-type").value.toLowerCase()}`;
  });
  $$(".popular-searches button").forEach(button=>button.addEventListener("click",()=>{
    $("#search-input").value=button.dataset.query;state.query=button.dataset.query;renderProducts();location.hash="#images";
  }));
  $$(".sort-select").forEach(select=>select.addEventListener("change",renderProducts));
  $$("[data-favorites]").forEach(button=>button.addEventListener("click",()=>{
    state.favoritesView=state.favoritesView===button.dataset.favorites?"":button.dataset.favorites;
    button.classList.toggle("is-active",state.favoritesView===button.dataset.favorites);
    renderProducts();
  }));
  $$(".clear-search").forEach(button=>button.addEventListener("click",()=>{
    $("#search-input").value="";state.query="";renderProducts();
  }));
  function showPage() {
    const route=location.hash.slice(1);
    const articleId = route.startsWith("article/") ? route.slice("article/".length) : "";
    const page=route==="images"?"images":route==="documents"?"documents":route==="articles"?"articles":route==="article-editor"?"article-editor":articleId?"article-detail":"home";
    $("#storefront-view").classList.toggle("hidden",page!=="home");
    $("#images-page").classList.toggle("hidden",page!=="images");
    $("#documents-page").classList.toggle("hidden",page!=="documents");
    $("#articles-page").classList.toggle("hidden",page!=="articles");
    $("#article-detail-page").classList.toggle("hidden",page!=="article-detail");
    $("#article-editor-page").classList.toggle("hidden",page!=="article-editor");
    if (page === "article-detail") {
      let decodedId = articleId;
      try { decodedId = decodeURIComponent(articleId); }
      catch { decodedId = ""; }
      renderArticleDetail(decodedId);
    }
    $(".footer").classList.remove("hidden");
    $$(".nav-link").forEach(link => link.classList.toggle("active",link.dataset.view===(page==="article-detail"?"articles":page)));
    if (page!=="home") window.scrollTo(0,0);
  }
  function showAccount() {
    const uploads=state.products.filter(product=>product.isAdminUpload);
    const saved=state.favorites.map(id=>state.products.find(item=>item.id===id)).filter(Boolean);
    const itemRow=item=>`<div class="account-item"><span>${escapeHtml(item.title)}${item.price===undefined?"":` · ${money(item.price)}`}</span><button data-open-product="${escapeHtml(item.id)}">View ↗</button></div>`;
    $("#account-content").innerHTML=uploads.length||saved.length?`${uploads.length?`<h3 class="account-section-title">Published by admin (${uploads.length})</h3>${uploads.map(itemRow).join("")}`:""}<h3 class="account-section-title">Saved (${saved.length})</h3>${saved.length?saved.map(itemRow).join(""):'<p class="modal-intro">Your saved items will appear here.</p>'}`:'<div class="empty-state"><div class="empty-icon">✳</div><h3>A fresh start.</h3><p>Save work you love or explore the public collection to find something you like.</p></div>';
    $("#account-content").querySelectorAll("[data-open-product]").forEach(button=>button.addEventListener("click",()=>{ $("#account-dialog").close();showProduct(button.dataset.openProduct);}));
    $("#account-dialog").showModal();
  }
  $(".sign-in").addEventListener("click",showAccount);
  $(".theme-toggle").addEventListener("click",()=>{document.body.classList.toggle("dark");save("ac-dark",document.body.classList.contains("dark"));});
  if(safeRead("ac-dark",false))document.body.classList.add("dark");
  $(".mobile-menu").addEventListener("click",()=>$(".main-nav").classList.toggle("menu-open"));
  $$("[data-view='creators']").forEach(link=>link.addEventListener("click",event=>{
    event.preventDefault();
    if(location.hash!=="#discover")location.hash="#discover";
    setTimeout(()=>$("#creators").scrollIntoView({behavior:"smooth"}),0);
  }));
  $$(".nav-link").forEach(link=>link.addEventListener("click",()=>{
    $(".main-nav").classList.remove("menu-open");
  }));
  window.addEventListener("hashchange",showPage);
  try { localStorage.removeItem("ac-admin-credential"); }
  catch (error) { toast(`Could not remove the old local admin credential: ${error.message}`, true); }
  updateAdminControls();renderProducts();renderCart();showPage();loadMarketplaceContent();
})();
