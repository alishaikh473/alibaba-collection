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
  const seedStories = [
    {id:"s1",title:"A small guide to noticing more",category:"CREATIVE PRACTICE",creator:"Noor Al-Harthy",image:"https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=700&q=80",body:"The best details rarely ask for your attention. They wait in the edges: light on a wall, the shape of a leaf, the last minute before the day changes. Taking a photograph is sometimes just a reason to slow down and look again."},
    {id:"s2",title:"Building a brand that feels like you",category:"MAKING THINGS",creator:"Studio Saffron",image:"https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=700&q=80",body:"A brand is not a collection of colors and typefaces. It is the feeling people carry away from your work. Start with the way you want to make somebody feel, and let every visual choice grow from that."},
    {id:"s3",title:"The joy of making room",category:"LIFE & WORK",creator:"Amal Rahman",image:"https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=700&q=80",body:"Making a little room can be a creative act. Clear the desk, leave a blank page, open an afternoon. The point is not to fill the space faster. It is to see what might arrive when you do not."}
  ];
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const safeRead = (key, fallback) => { try { const value = JSON.parse(localStorage.getItem(key)); return value ?? fallback; } catch { return fallback; } };
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
  const brandMarkup = '<span class="brand-mark" aria-hidden="true"><svg viewBox="0 0 44 44" focusable="false"><rect x="1" y="1" width="42" height="42" rx="12" fill="#3d5d4e"/><rect x="5" y="5" width="34" height="34" rx="9" fill="none" stroke="#d8c397" stroke-opacity=".55"/><path d="M12 31 21.9 11.5 32 31M15.5 24.5h13" fill="none" stroke="#f8f5ec" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.1"/><path d="m32.5 8 .9 2.3 2.3.9-2.3.9-.9 2.3-.9-2.3-2.3-.9 2.3-.9z" fill="#d8c397"/><path d="M16.5 34h11" stroke="#d8c397" stroke-linecap="round" stroke-width="1.4"/></svg></span><span class="brand-name" aria-hidden="true"><span class="brand-primary">Alibaba</span><span class="brand-secondary">COLLECTION</span></span>';
  $$("[data-brand-logo]").forEach(brand => { brand.innerHTML = brandMarkup; });
  const state = { products: [...seedProducts], stories: [...seedStories], favorites: readStoredList("ac-favorites", item => typeof item === "string" && item.length <= 120), query:"", favoritesView:"", selectedFile:null, selectedFileUrl:"", storyCoverUrl:"", adminSession:null };
  const imageGrid = $("#image-grid"), documentGrid = $("#document-grid"), storyGrid = $("#story-grid");
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
    $$(".open-upload, #write-story").forEach(control => control.classList.toggle("hidden", !authorized));
    $(".admin-login").classList.toggle("hidden", authorized);
    $(".admin-change").classList.toggle("hidden", !authorized);
    $(".admin-logout").classList.toggle("hidden", !authorized);
  }
  function requireSupabase() {
    if (!supabaseReady) throw new Error("Supabase is not configured. Follow README.md to add your project URL and publishable key.");
  }
  async function supabaseRequest(path, options = {}) {
    requireSupabase();
    const headers = new Headers(options.headers || {});
    headers.set("apikey", supabaseApiKey);
    if (options.token) headers.set("Authorization", `Bearer ${options.token}`);
    if (options.body !== undefined && !(options.body instanceof Blob)) headers.set("Content-Type", "application/json");
    const response = await fetch(`${supabaseConfig.url.replace(/\/$/, "")}${path}`, {method:options.method || "GET", headers, body:options.body instanceof Blob ? options.body : options.body === undefined ? undefined : JSON.stringify(options.body)});
    const responseText = await response.text();
    let payload = null;
    try { payload = responseText ? JSON.parse(responseText) : null; } catch { payload = responseText; }
    if (!response.ok) {
      const detail = payload && typeof payload === "object" ? payload.msg || payload.message || payload.error_description || payload.error : "";
      throw new Error(detail || `Supabase request failed (${response.status}).`);
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
  async function uploadObject(path, file) {
    const token = await currentAdminToken();
    await supabaseRequest(`/storage/v1/object/${storageBucket}/${path.split("/").map(encodeURIComponent).join("/")}`, {
      method:"POST", token, headers:{"Content-Type":file.type || "application/octet-stream", "x-upsert":"false"}, body:file
    });
    return `${supabaseConfig.url.replace(/\/$/, "")}/storage/v1/object/public/${storageBucket}/${path.split("/").map(encodeURIComponent).join("/")}`;
  }
  async function deleteObject(path) {
    const token = await currentAdminToken();
    await supabaseRequest(`/storage/v1/object/${storageBucket}/${path.split("/").map(encodeURIComponent).join("/")}`, {method:"DELETE", token});
  }
  function productFromRow(row) {
    return {id:row.id,title:row.title,creator:row.creator,type:row.type,category:row.category,price:Number(row.price),image:row.image_url || "",description:row.description,fileName:row.file_name,filePath:row.file_path,isAdminUpload:true,createdAt:row.created_at};
  }
  function storyFromRow(row) {
    return {id:row.id,title:row.title,category:row.category,creator:row.creator,image:row.image_url || "",body:row.body,createdAt:row.created_at};
  }
  async function loadMarketplaceContent() {
    if (!supabaseReady) {
      setBackendStatus("Preview mode — showing sample content. Configure Supabase to enable shared publishing and admin sign-in.");
      return;
    }
    try {
      const [products, stories] = await Promise.all([
        supabaseRequest("/rest/v1/products?select=id,title,creator,type,category,price,description,file_name,file_path,image_url,created_at&order=created_at.desc"),
        supabaseRequest("/rest/v1/stories?select=id,title,creator,category,body,image_url,created_at&order=created_at.desc")
      ]);
      if (!Array.isArray(products) || !Array.isArray(stories)) throw new Error("Supabase returned an unexpected content response.");
      state.products = [...seedProducts, ...products.map(productFromRow)];
      state.stories = [...seedStories, ...stories.map(storyFromRow)];
      renderProducts(); renderStories();
      setBackendStatus("");
    } catch (error) {
      console.warn("Could not load shared marketplace content; keeping sample content available.", error);
      setBackendStatus("Supabase is temporarily unavailable — showing sample content. Check your connection or Supabase project configuration.");
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
  $(".admin-logout").addEventListener("click", async () => {
    const session = state.adminSession;
    state.adminSession = null;
    updateAdminControls();
    if (adminDialog.open) adminDialog.close();
    if ($("#upload-dialog").open) $("#upload-dialog").close();
    if (location.hash === "#write-story-page") location.hash = "#stories";
    try {
      if (session) await supabaseRequest("/auth/v1/logout", {method:"POST", token:session.access_token});
      toast("Admin session signed out.");
    } catch (error) { toast(`Signed out locally, but Supabase could not revoke the session: ${error.message}`, true); }
  });
  function productMarkup(product) {
    const image = isSafeImageUrl(product.image) ? product.image : "";
    return `<article class="product-card" data-id="${escapeHtml(product.id)}" tabindex="0" role="button" aria-label="View ${escapeHtml(product.title)}"><div class="product-image-wrap">${image ? `<img class="product-image" src="${escapeHtml(image)}" alt="${escapeHtml(product.title)}" loading="lazy">` : `<div class="image-placeholder">${product.type === "Documents" ? "A little something to read" : "Made to be found"}</div>`}<span class="type-chip">${escapeHtml(product.category)}</span><button class="favorite-button ${state.favorites.includes(product.id) ? "is-favorite" : ""}" data-favorite="${escapeHtml(product.id)}" aria-label="${state.favorites.includes(product.id) ? "Remove from" : "Add to"} saved items">${state.favorites.includes(product.id) ? "♥" : "♡"}</button></div><div class="product-info"><div><h3 class="product-title">${escapeHtml(product.title)}</h3><p class="product-creator">By ${escapeHtml(product.creator)}</p><div class="product-category">${product.type === "Documents" ? "DIGITAL DOCUMENT" : "IMAGE"}</div></div><span class="product-price">${money(product.price)}</span></div></article>`;
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
  function renderStories() {
    const term = state.query.trim().toLowerCase();
    const stories = state.stories.filter(story => !term || `${story.title} ${story.creator} ${story.category} ${story.body}`.toLowerCase().includes(term));
    storyGrid.innerHTML = [...stories].sort((a,b)=>Date.parse(b.createdAt||"1970-01-01")-Date.parse(a.createdAt||"1970-01-01")).map(story => {
      const imageUrl = isSafeImageUrl(story.image) ? story.image : "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=700&q=80";
      return `<article class="story-card" data-story="${escapeHtml(story.id)}" tabindex="0" role="button"><img class="story-image" src="${escapeHtml(imageUrl)}" alt="" loading="lazy"><div class="story-content"><span class="story-category">${escapeHtml(story.category || "COMMUNITY NOTES")}</span><h3>${escapeHtml(story.title)}</h3><p>${escapeHtml(story.body.slice(0, 100))}${story.body.length > 100 ? "…" : ""}</p><div class="story-byline">A story by ${escapeHtml(story.creator || "You")}</div></div></article>`;
    }).join("");
  }
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
    try {
      if (form.elements.title.value.trim().length < 1 || form.elements.category.value.trim().length < 1) throw new Error("Add a title and category before publishing.");
      if (!Number.isFinite(Number(form.elements.price.value)) || Number(form.elements.price.value) < 0 || Number(form.elements.price.value) > 10000) throw new Error("Enter a valid price between 0 and 10,000.");
      const safeFileName = file.name.normalize("NFKC").replace(/[^a-zA-Z0-9._-]/g,"-").replace(/^\.+/,"").slice(0,100) || "upload";
      const folder = `${state.adminSession.user.id}/${id}`;
      uploadedPath = `${folder}/${safeFileName}`;
      const publicUrl = await uploadObject(uploadedPath, file);
      progress.dataset.progress = "75";
      const row = await supabaseRequest("/rest/v1/products", {
        method:"POST", token:await currentAdminToken(), headers:{Prefer:"return=representation"},
        body:{id,title:form.elements.title.value.trim(),creator:"Alibaba Collection Admin",type:form.elements.type.value,category:form.elements.category.value.trim(),price:Number(form.elements.price.value),description:`${file.name} · ${file.type || "Digital file"} · ${Math.max(1,Math.round(file.size/1024))} KB`,file_name:file.name,file_path:uploadedPath,image_url:file.type.startsWith("image/")?publicUrl:null}
      });
      if (!Array.isArray(row) || row.length !== 1) throw new Error("Supabase did not confirm the uploaded listing.");
      state.products.unshift(productFromRow(row[0])); progress.dataset.progress = "100";
      uploadDialog.close(); renderProducts(); location.hash="#images"; toast("Your work is now published in the shared collection.");
    } catch (error) {
      if (uploadedPath) {
        try { await deleteObject(uploadedPath); }
        catch (cleanupError) { error.message = `${error.message} The uploaded file also needs cleanup: ${cleanupError.message}`; }
      }
      $("#upload-error").textContent=error.message || "Could not upload this file. Check your connection and try again.";
      $("#upload-error").classList.remove("hidden");
    }
    finally { submit.disabled=false; }
  });
  function handleProductClick(event) {
    const favorite = event.target.closest("[data-favorite]");
    if (favorite) { event.stopPropagation(); const id=favorite.dataset.favorite; state.favorites=state.favorites.includes(id)?state.favorites.filter(item=>item!==id):[...state.favorites,id]; save("ac-favorites",state.favorites); renderProducts(); toast(state.favorites.includes(id)?"Saved to your collection.":"Removed from saved items."); return; }
    const card=event.target.closest("[data-id]");
    if(card) {
      showProduct(card.dataset.id);
    }
  }
  [imageGrid,documentGrid].forEach(grid=>{
    grid.addEventListener("click",handleProductClick);
    grid.addEventListener("keydown",event=>{if((event.key==="Enter"||event.key===" ")&&event.target.matches(".product-card")){event.preventDefault();showProduct(event.target.dataset.id);}});
  });
  async function showProduct(id) {
    const product=state.products.find(p=>p.id===id); if(!product)return;
    const image=isSafeImageUrl(product.image)?product.image:"";
    $("#detail-content").innerHTML=`${image?`<img class="detail-image" src="${escapeHtml(image)}" alt="${escapeHtml(product.title)}">`:""}<div class="detail-copy"><div class="detail-topline"><span>${escapeHtml(product.type)} · ${escapeHtml(product.category)}</span><span>By ${escapeHtml(product.creator)}</span></div><h2>${escapeHtml(product.title)}</h2><p>${escapeHtml(product.description || "A thoughtful addition to the collection.").replace(/\n/g,"<br><br>")}</p><div class="detail-bottom"><span class="detail-price">${money(product.price)}</span><button class="button button-dark detail-download" data-product="${escapeHtml(id)}">${product.filePath?"Download file":"Explore this work"} <span>↗</span></button></div>${product.filePath?'<p class="detail-local-note">This published file is publicly downloadable. Secure checkout and purchase entitlements are not configured.</p>':''}</div>`;
    $("#detail-content").querySelector(".detail-download").addEventListener("click", async () => {
      if (!product.filePath) { toast("Purchases are not enabled for this sample listing.", true); return; }
      const link=document.createElement("a"); link.href=product.image && product.type==="Images"?product.image:`${supabaseConfig.url.replace(/\/$/,"")}/storage/v1/object/public/${storageBucket}/${product.filePath.split("/").map(encodeURIComponent).join("/")}`; link.download=product.fileName || "alibaba-collection-download"; link.rel="noopener"; link.click();
      toast("Your file download has started.");
    });
    $("#detail-dialog").showModal();
  }
  $("#search-input").addEventListener("input", event => { state.query=event.target.value; renderProducts();renderStories(); });
  $(".search-form").addEventListener("submit", event => {
    event.preventDefault();
    state.query=$("#search-input").value.trim();
    const destination=$("#search-type").value==="Articles"?"stories":$("#search-type").value.toLowerCase();
    location.hash=`#${destination}`;
  });
  $$(".popular-searches button").forEach(button=>button.addEventListener("click",()=>{
    $("#search-input").value=button.dataset.query;state.query=button.dataset.query;renderProducts();renderStories();location.hash="#images";
  }));
  $$(".sort-select").forEach(select=>select.addEventListener("change",renderProducts));
  $$("[data-favorites]").forEach(button=>button.addEventListener("click",()=>{
    state.favoritesView=state.favoritesView===button.dataset.favorites?"":button.dataset.favorites;
    button.classList.toggle("is-active",state.favoritesView===button.dataset.favorites);
    renderProducts();
  }));
  $$(".clear-search").forEach(button=>button.addEventListener("click",()=>{
    $("#search-input").value="";state.query="";renderProducts();renderStories();
  }));
  function showArticle(id) {
    const story=state.stories.find(item=>item.id===id); if(!story)return;
    const storyImage=isSafeImageUrl(story.image)?`<img class="detail-image" src="${escapeHtml(story.image)}" alt="">`:"";
    $("#detail-content").innerHTML=`${storyImage}<div class="detail-copy"><div class="detail-topline"><span>${escapeHtml(story.category || "COMMUNITY NOTES")}</span><span>By ${escapeHtml(story.creator || "You")}</span></div><h2>${escapeHtml(story.title)}</h2><p>${escapeHtml(story.body).replace(/\n/g,"<br><br>")}</p></div>`;
    $("#detail-dialog").showModal();
  }
  storyGrid.addEventListener("click",event=>{const card=event.target.closest("[data-story]");if(card)showArticle(card.dataset.story);});
  storyGrid.addEventListener("keydown",event=>{const card=event.target.closest("[data-story]");if(card&&(event.key==="Enter"||event.key===" ")){event.preventDefault();showArticle(card.dataset.story);}});
  function showArticleWritingPage() {
    const route=location.hash.slice(1);
    const writing=route==="write-story-page";
    if (writing && !isAdmin()) {
      toast("Log in as admin to write or publish stories.", true);
      location.hash = "#stories";
      return;
    }
    const page=route==="images"?"images":route==="documents"?"documents":route==="stories"?"stories":"home";
    $("#storefront-view").classList.toggle("hidden",writing||page!=="home");
    $("#images-page").classList.toggle("hidden",writing||page!=="images");
    $("#documents-page").classList.toggle("hidden",writing||page!=="documents");
    $("#stories-page").classList.toggle("hidden",writing||page!=="stories");
    $("#write-story-page").classList.toggle("hidden", !writing);
    $(".footer").classList.toggle("hidden", writing);
    $$(".nav-link").forEach(link => link.classList.toggle("active",!writing&&link.dataset.view===page));
    if (writing||page!=="home") window.scrollTo(0,0);
  }
  function navigateToArticleWritingPage() {
    if (!requireAdmin()) return;
    if (location.hash === "#write-story-page") showArticleWritingPage();
    else location.hash = "#write-story-page";
  }
  $("#write-story").addEventListener("click",navigateToArticleWritingPage);
  $("#story-cover-input").addEventListener("change",event=>{
    const file=event.target.files[0], preview=$("#story-cover-preview");
    if(state.storyCoverUrl)URL.revokeObjectURL(state.storyCoverUrl);
    state.storyCoverUrl="";
    if(!file){preview.removeAttribute("src");preview.classList.add("hidden");return;}
    if(!/^image\/(jpeg|png|webp|gif)$/.test(file.type)||file.size>15*1024*1024){
      event.target.value="";preview.removeAttribute("src");preview.classList.add("hidden");
      $("#article-error").textContent="Choose a JPG, PNG, WebP, or GIF image no larger than 15 MB.";
      $("#article-error").classList.remove("hidden");return;
    }
    $("#article-error").classList.add("hidden");
    state.storyCoverUrl=URL.createObjectURL(file);preview.src=state.storyCoverUrl;preview.classList.remove("hidden");
  });
  $("#article-form").addEventListener("submit",async event=>{
    event.preventDefault();
    if (!requireAdmin()) return;
    const form=event.currentTarget,submit=form.querySelector('[type="submit"]'),error=$("#article-error"),cover=form.elements.cover.files[0];
    const storyId=crypto.randomUUID(),story={id:storyId,title:form.elements.title.value.trim(),category:form.elements.category.value.trim()||"COMMUNITY NOTES",creator:"Alibaba Collection Admin",image:"https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=700&q=80",body:form.elements.body.value.trim()};
    submit.disabled=true;error.classList.add("hidden");
    let coverPath="";
    try{
      if(story.title.length<1||story.title.length>110)throw new Error("Story titles must be between 1 and 110 characters.");
      if(story.body.length<30||story.body.length>50000)throw new Error("Story text must be between 30 and 50,000 characters.");
      if(cover){
        if(!/^image\/(jpeg|png|webp|gif)$/.test(cover.type)||cover.size>15*1024*1024)throw new Error("Choose a JPG, PNG, WebP, or GIF image no larger than 15 MB.");
        const extension=cover.name.split(".").pop().toLowerCase(),safeName=`cover.${extension}`;
        coverPath=`${state.adminSession.user.id}/${storyId}/${safeName}`;
        story.image=await uploadObject(coverPath,cover);
      }
      const inserted=await supabaseRequest("/rest/v1/stories",{method:"POST",token:await currentAdminToken(),headers:{Prefer:"return=representation"},body:{id:storyId,title:story.title,category:story.category,creator:story.creator,image_url:story.image,body:story.body}});
      if(!Array.isArray(inserted)||inserted.length!==1)throw new Error("Supabase did not confirm the story publication.");
      state.stories.unshift(story);renderStories();renderProducts();form.reset();
      $("#story-cover-preview").removeAttribute("src");$("#story-cover-preview").classList.add("hidden");state.storyCoverUrl="";
      toast("Your story is now published in the shared journal.");
      location.hash="#stories";
    }catch(cause){
      if(coverPath){
        try{await deleteObject(coverPath);}
        catch(cleanupError){cause.message=`${cause.message} The uploaded cover also needs cleanup: ${cleanupError.message}`;}
      }
      error.textContent=cause.message||"Could not publish your story. Check available browser storage and try again.";
      error.classList.remove("hidden");
    }finally{submit.disabled=false;}
  });
  function showAccount() {
    const uploads=state.products.filter(product=>product.isAdminUpload);
    const saved=state.favorites.map(id=>state.products.find(item=>item.id===id)||state.stories.find(item=>item.id===id)).filter(Boolean);
    const itemRow=item=>`<div class="account-item"><span>${escapeHtml(item.title)}${item.price===undefined?"":` · ${money(item.price)}`}</span><button data-open-product="${escapeHtml(item.id)}">View ↗</button></div>`;
    $("#account-content").innerHTML=uploads.length||saved.length?`${uploads.length?`<h3 class="account-section-title">Published by admin (${uploads.length})</h3>${uploads.map(itemRow).join("")}`:""}<h3 class="account-section-title">Saved (${saved.length})</h3>${saved.length?saved.map(itemRow).join(""):'<p class="modal-intro">Your saved items will appear here.</p>'}`:'<div class="empty-state"><div class="empty-icon">✳</div><h3>A fresh start.</h3><p>Save work you love or explore the public collection to find something you like.</p></div>';
    $("#account-content").querySelectorAll("[data-open-product]").forEach(button=>button.addEventListener("click",()=>{ $("#account-dialog").close();const id=button.dataset.openProduct;if(state.stories.some(story=>story.id===id))showArticle(id);else showProduct(id);}));
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
  window.addEventListener("hashchange",showArticleWritingPage);
  try { localStorage.removeItem("ac-admin-credential"); }
  catch (error) { toast(`Could not remove the old local admin credential: ${error.message}`, true); }
  updateAdminControls();renderProducts();renderStories();showArticleWritingPage();loadMarketplaceContent();
})();
