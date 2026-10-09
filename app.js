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
  const state = { products: [...seedProducts, ...safeRead("ac-products", [])], stories: [...seedStories, ...safeRead("ac-stories", [])], favorites: safeRead("ac-favorites", []), filter:"All", query:"", onlyFavorites:false, selectedFile:null, selectedFileUrl:"", storyCoverUrl:"" };
  const productGrid = $("#product-grid"), storyGrid = $("#story-grid"), emptyState = $("#empty-state");
  const money = amount => Number(amount) === 0 ? "Free" : `$${Number(amount).toFixed(2)}`;
  const escapeHtml = text => String(text).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  function toast(message, error = false) {
    const node = document.createElement("div"); node.className = `toast${error ? " error" : ""}`; node.textContent = message;
    $(".toast-region").append(node); setTimeout(() => node.remove(), 3200);
  }
  function save(key, data) { try { localStorage.setItem(key, JSON.stringify(data)); return true; } catch { toast("Your browser storage is full. Remove some uploads and try again.", true); return false; } }
  function renderProducts() {
    $(".tab-count").textContent = state.products.length + state.stories.length;
    const term = state.query.trim().toLowerCase();
    let products = [...state.products, ...state.stories.map(story => ({...story, type:"Articles", price:0, description:story.body}))].filter(p => (state.filter === "All" || p.type === state.filter || (state.filter === "Photography" && p.type === "Images") || (state.filter === "Design" && p.category.toLowerCase().includes("design")) || (state.filter === "Stories" && p.type === "Articles")) &&
      (!term || `${p.title} ${p.creator} ${p.category} ${p.description || ""}`.toLowerCase().includes(term)) &&
      (!state.onlyFavorites || state.favorites.includes(p.id)));
    const sort = $("#sort-select").value;
    if (sort === "newest") products = [...products].reverse();
    if (sort === "price-low") products = [...products].sort((a,b) => Number(a.price)-Number(b.price));
    if (sort === "price-high") products = [...products].sort((a,b) => Number(b.price)-Number(a.price));
    $("#collection-heading").innerHTML = state.query ? `Results for <span class="serif">“${escapeHtml(state.query)}”</span>` : state.onlyFavorites ? `Your <span class="serif">saved things.</span>` : "Made to be <span class=\"serif\">found.</span>";
    productGrid.innerHTML = products.map(product => `<article class="product-card" data-id="${escapeHtml(product.id)}" tabindex="0" role="button" aria-label="View ${escapeHtml(product.title)}"><div class="product-image-wrap">${product.image ? `<img class="product-image" src="${escapeHtml(product.image)}" alt="${escapeHtml(product.title)}" loading="lazy">` : `<div class="image-placeholder">${product.type === "Documents" ? "A little something to read" : "Made to be found"}</div>`}<span class="type-chip">${escapeHtml(product.type === "Images" ? product.category : product.type === "Documents" ? "DIGITAL DOWNLOAD" : "STORY")}</span><button class="favorite-button ${state.favorites.includes(product.id) ? "is-favorite" : ""}" data-favorite="${escapeHtml(product.id)}" aria-label="${state.favorites.includes(product.id) ? "Remove from" : "Add to"} saved items">${state.favorites.includes(product.id) ? "♥" : "♡"}</button></div><div class="product-info"><div><h3 class="product-title">${escapeHtml(product.title)}</h3><p class="product-creator">By ${escapeHtml(product.creator)}</p><div class="product-category">${escapeHtml(product.category)}</div></div><span class="product-price">${money(product.price)}</span></div></article>`).join("");
    emptyState.classList.toggle("hidden", products.length > 0); productGrid.classList.toggle("hidden", products.length === 0);
  }
  function renderStories() {
    storyGrid.innerHTML = state.stories.slice(-3).reverse().map(story => `<article class="story-card" data-story="${escapeHtml(story.id)}" tabindex="0" role="button"><div class="story-image" style="background-image:url('${escapeHtml(story.image || "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=700&q=80")}')"></div><div class="story-content"><span class="story-category">${escapeHtml(story.category || "COMMUNITY NOTES")}</span><h3>${escapeHtml(story.title)}</h3><p>${escapeHtml(story.body.slice(0, 100))}${story.body.length > 100 ? "…" : ""}</p><div class="story-byline">A story by ${escapeHtml(story.creator || "You")}</div></div></article>`).join("");
  }
  function setFilter(filter) {
    state.filter = filter; state.onlyFavorites = false;
    $$(".filter-tab").forEach(tab => tab.classList.toggle("is-active", tab.dataset.filter === filter));
    $$(".category-pill").forEach(tab => tab.classList.toggle("selected", tab.dataset.filter === filter));
    $("#favorites-toggle").classList.remove("is-active"); renderProducts();
  }
  function initDB() {
    return new Promise((resolve, reject) => {
      if (!("indexedDB" in window)) { reject(new Error("This browser does not support local file storage.")); return; }
      const request = indexedDB.open("AlibabaCollectionFiles", 1);
      request.onupgradeneeded = () => request.result.createObjectStore("uploads", {keyPath:"id"});
      request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error);
    });
  }
  async function putFile(id, file) {
    const db = await initDB();
    return new Promise((resolve, reject) => { const tx = db.transaction("uploads", "readwrite"); tx.objectStore("uploads").put({id, file}); tx.oncomplete = resolve; tx.onerror = () => reject(tx.error); });
  }
  async function getFile(id) {
    const db = await initDB();
    return new Promise((resolve, reject) => { const tx = db.transaction("uploads", "readonly"), request = tx.objectStore("uploads").get(id); request.onsuccess = () => resolve(request.result && request.result.file); request.onerror = () => reject(request.error); });
  }
  async function removeFile(id) {
    const db = await initDB();
    return new Promise((resolve, reject) => { const tx = db.transaction("uploads", "readwrite"); tx.objectStore("uploads").delete(id); tx.oncomplete = resolve; tx.onerror = () => reject(tx.error); });
  }
  const uploadDialog = $("#upload-dialog");
  function openUpload() {
    const form = $("#product-form");
    form.reset(); form.classList.add("hidden");
    $("#upload-error").classList.add("hidden"); $("#upload-progress").classList.add("hidden");
    $("#file-input").value=""; state.selectedFile=null;
    if (state.selectedFileUrl) URL.revokeObjectURL(state.selectedFileUrl);
    state.selectedFileUrl=""; uploadDialog.showModal();
  }
  function chooseFile(file) {
    if (!file) return;
    const allowed = /\.(jpe?g|png|webp|gif|svg|tiff?|pdf|docx?|pptx?|xlsx?|epub|zip)$/i.test(file.name);
    if (!allowed) { $("#upload-error").textContent="That file type is not supported. Choose an image or a PDF or Office document."; $("#upload-error").classList.remove("hidden"); return; }
    if (file.size > 15 * 1024 * 1024) { $("#upload-error").textContent="This file is larger than 15 MB. Choose a smaller file and try again."; $("#upload-error").classList.remove("hidden"); return; }
    state.selectedFile = file; state.selectedFileUrl = file.type.startsWith("image/") ? URL.createObjectURL(file) : "";
    const form = $("#product-form"); form.classList.remove("hidden"); form.elements.title.value = file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g," ");
    form.elements.type.value = file.type.startsWith("image/") ? "Images" : "Documents";
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
    event.preventDefault(); if (!state.selectedFile) return;
    const form = event.currentTarget, submit = form.querySelector('[type="submit"]'), progress = $("#upload-progress"), bar = $("span", progress);
    submit.disabled = true; progress.classList.remove("hidden"); let width = 0;
    const timer = setInterval(() => { width = Math.min(90, width + 18); bar.style.width = `${width}%`; }, 100);
    const file = state.selectedFile, id = `upload-${Date.now()}`;
    try {
      await putFile(id, file); clearInterval(timer); bar.style.width="100%";
      const fileDescription=`${file.name} · ${file.type || "Digital file"} · ${Math.max(1,Math.round(file.size/1024))} KB`;
      const product={id,title:form.elements.title.value.trim(),creator:"You",type:form.elements.type.value,category:form.elements.category.value.trim(),price:Number(form.elements.price.value),image:state.selectedFileUrl,description:fileDescription,fileName:file.name};
      const uploaded = safeRead("ac-products", []); uploaded.push(product);
      if (!save("ac-products", uploaded)) return;
      state.products.push(product); uploadDialog.close(); setFilter("All"); renderProducts(); toast("Your work is in the collection on this device.");
    } catch (error) { clearInterval(timer); $("#upload-error").textContent=error.message || "Could not store this file. Check available browser storage and try again."; $("#upload-error").classList.remove("hidden"); }
    finally { submit.disabled=false; }
  });
  productGrid.addEventListener("click", event => {
    const favorite = event.target.closest("[data-favorite]");
    if (favorite) { event.stopPropagation(); const id=favorite.dataset.favorite; state.favorites=state.favorites.includes(id)?state.favorites.filter(item=>item!==id):[...state.favorites,id]; save("ac-favorites",state.favorites); renderProducts(); toast(state.favorites.includes(id)?"Saved to your collection.":"Removed from saved items."); return; }
    const card=event.target.closest("[data-id]");
    if(card) {
      if (state.stories.some(story => story.id === card.dataset.id)) showArticle(card.dataset.id);
      else showProduct(card.dataset.id);
    }
  });
  productGrid.addEventListener("keydown", event => { if ((event.key==="Enter"||event.key===" ") && event.target.matches(".product-card")) { event.preventDefault(); if (state.stories.some(story => story.id === event.target.dataset.id)) showArticle(event.target.dataset.id); else showProduct(event.target.dataset.id); } });
  async function showProduct(id) {
    const product=state.products.find(p=>p.id===id); if(!product)return;
    const image=product.image || "";
    $("#detail-content").innerHTML=`<img class="detail-image" src="${escapeHtml(image)}" alt="${escapeHtml(product.title)}"><div class="detail-copy"><div class="detail-topline"><span>${escapeHtml(product.type)} · ${escapeHtml(product.category)}</span><span>By ${escapeHtml(product.creator)}</span></div><h2>${escapeHtml(product.title)}</h2><p>${escapeHtml(product.description || "A thoughtful addition to the collection.").replace(/\n/g,"<br><br>")}</p><div class="detail-bottom"><span class="detail-price">${money(product.price)}</span><button class="button button-dark detail-download" data-product="${escapeHtml(id)}">${product.id.startsWith("upload-")?"Download your file":"Explore this work"} <span>↗</span></button></div>${product.id.startsWith("upload-")?'<p class="detail-local-note">Your upload is stored only in this browser. Paid downloads and checkout are not enabled.</p>':''}</div>`;
    $("#detail-content").querySelector(".detail-download").addEventListener("click", async () => {
      if (!product.id.startsWith("upload-")) { toast("Purchases are not enabled. Connect a secure payment provider to sell this item.", true); return; }
      try { const file=await getFile(id); if (!file) throw new Error("The original file is no longer available in this browser."); const url=URL.createObjectURL(file), link=document.createElement("a"); link.href=url; link.download=product.fileName || "alibaba-collection-download"; link.click(); setTimeout(()=>URL.revokeObjectURL(url),1000); toast("Your file download has started."); }
      catch(error) { toast(error.message || "Could not download this file.", true); }
    });
    $("#detail-dialog").showModal();
  }
  $("#search-input").addEventListener("input", event => { state.query=event.target.value; renderProducts(); });
  $(".search-form").addEventListener("submit", event => { event.preventDefault(); state.query=$("#search-input").value; state.filter=$("#search-type").value==="Articles"?"Articles":$("#search-type").value; renderProducts(); $("#collection").scrollIntoView({behavior:"smooth"}); });
  $$(".popular-searches button").forEach(button=>button.addEventListener("click",()=>{$("#search-input").value=button.dataset.query;state.query=button.dataset.query;setFilter("All");}));
  $$(".filter-tab,.category-pill").forEach(button=>button.addEventListener("click",()=>setFilter(button.dataset.filter)));
  $("#sort-select").addEventListener("change",renderProducts);
  $("#favorites-toggle").addEventListener("click",event=>{state.onlyFavorites=!state.onlyFavorites;event.currentTarget.classList.toggle("is-active",state.onlyFavorites);renderProducts();});
  $("#clear-filters").addEventListener("click",()=>{$("#search-input").value="";state.query="";setFilter("All");});
  $("#load-more").addEventListener("click",()=>{$("#stories").scrollIntoView({behavior:"smooth"});});
  function showArticle(id) {
    const story=state.stories.find(item=>item.id===id); if(!story)return;
    $("#detail-content").innerHTML=`${story.image?`<img class="detail-image" src="${escapeHtml(story.image)}" alt="">`:""}<div class="detail-copy"><div class="detail-topline"><span>${escapeHtml(story.category || "COMMUNITY NOTES")}</span><span>By ${escapeHtml(story.creator || "You")}</span></div><h2>${escapeHtml(story.title)}</h2><p>${escapeHtml(story.body).replace(/\n/g,"<br><br>")}</p></div>`;
    $("#detail-dialog").showModal();
  }
  storyGrid.addEventListener("click",event=>{const card=event.target.closest("[data-story]");if(card)showArticle(card.dataset.story);});
  storyGrid.addEventListener("keydown",event=>{const card=event.target.closest("[data-story]");if(card&&(event.key==="Enter"||event.key===" ")){event.preventDefault();showArticle(card.dataset.story);}});
  $("#view-stories").addEventListener("click",()=>{$("#stories").scrollIntoView({behavior:"smooth"});});
  function showArticleWritingPage() {
    const writing = location.hash === "#write-story-page";
    $("#storefront-view").classList.toggle("hidden", writing);
    $("#write-story-page").classList.toggle("hidden", !writing);
    $(".footer").classList.toggle("hidden", writing);
    $$(".nav-link").forEach(link => link.classList.toggle("active", writing
      ? link.dataset.view === "write-story"
      : link.dataset.view === "discover" && location.hash !== "#stories"));
    if (writing) window.scrollTo(0, 0);
  }
  function navigateToArticleWritingPage() {
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
    const form=event.currentTarget,submit=form.querySelector('[type="submit"]'),error=$("#article-error"),cover=form.elements.cover.files[0];
    const story={id:`story-${Date.now()}`,title:form.elements.title.value.trim(),category:form.elements.category.value.trim()||"COMMUNITY NOTES",creator:"You",image:cover?"":"https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=700&q=80",body:form.elements.body.value.trim()};
    const stories=safeRead("ac-stories",[]),coverId=cover?`story-cover-${story.id}`:"";
    if(cover)story.coverId=coverId;
    stories.push(story);submit.disabled=true;error.classList.add("hidden");
    try{
      if(cover)await putFile(coverId,cover);
      if(!save("ac-stories",stories)){
        if(cover)await removeFile(coverId);
        error.textContent="Your story could not be saved because browser storage is full. Remove some saved content and try again.";
        error.classList.remove("hidden");return;
      }
      if(cover)story.image=state.storyCoverUrl;
      state.stories.push(story);renderStories();renderProducts();form.reset();
      $("#story-cover-preview").removeAttribute("src");$("#story-cover-preview").classList.add("hidden");state.storyCoverUrl="";
      toast("Your story has been published in the community journal.");
      location.hash="#stories";
      setTimeout(()=>$("#stories").scrollIntoView({behavior:"smooth"}),0);
    }catch(cause){
      error.textContent=cause.message||"Could not publish your story. Check available browser storage and try again.";
      error.classList.remove("hidden");
    }finally{submit.disabled=false;}
  });
  function showAccount() {
    const uploads=state.products.filter(product=>product.id.startsWith("upload-"));
    const saved=state.favorites.map(id=>state.products.find(item=>item.id===id)||state.stories.find(item=>item.id===id)).filter(Boolean);
    const itemRow=item=>`<div class="account-item"><span>${escapeHtml(item.title)}${item.price===undefined?"":` · ${money(item.price)}`}</span><button data-open-product="${escapeHtml(item.id)}">View ↗</button></div>`;
    $("#account-content").innerHTML=uploads.length||saved.length?`${uploads.length?`<h3 style="font-size:12px;margin:18px 0 8px">Your uploads (${uploads.length})</h3>${uploads.map(itemRow).join("")}`:""}<h3 style="font-size:12px;margin:22px 0 8px">Saved (${saved.length})</h3>${saved.length?saved.map(itemRow).join(""):'<p class="modal-intro">Your saved items will appear here.</p>'}`:'<div class="empty-state"><div class="empty-icon">✳</div><h3>A fresh start.</h3><p>Save work you love or add something of your own to see it here.</p></div>';
    $("#account-content").querySelectorAll("[data-open-product]").forEach(button=>button.addEventListener("click",()=>{ $("#account-dialog").close();const id=button.dataset.openProduct;if(state.stories.some(story=>story.id===id))showArticle(id);else showProduct(id);}));
    $("#account-dialog").showModal();
  }
  $(".sign-in").addEventListener("click",showAccount);
  $(".theme-toggle").addEventListener("click",()=>{document.body.classList.toggle("dark");save("ac-dark",document.body.classList.contains("dark"));});
  if(safeRead("ac-dark",false))document.body.classList.add("dark");
  $(".mobile-menu").addEventListener("click",()=>$(".main-nav").classList.toggle("menu-open"));
  $$(".nav-link").forEach(link=>link.addEventListener("click",event=>{
    $(".main-nav").classList.remove("menu-open");
    if(link.dataset.category){event.preventDefault();setFilter(link.dataset.category);$("#collection").scrollIntoView({behavior:"smooth"});}
    else if(link.dataset.view==="write-story"){event.preventDefault();navigateToArticleWritingPage();}
    else if(link.dataset.view==="creators"){event.preventDefault();$("#creators").scrollIntoView({behavior:"smooth"});}
    $$(".nav-link").forEach(item=>item.classList.toggle("active",item===link));
  }));
  window.addEventListener("hashchange",showArticleWritingPage);
  async function restoreUploadedPreviews() {
    const uploads = state.products.filter(product => product.id.startsWith("upload-"));
    for (const product of uploads) {
      try {
        const file = await getFile(product.id);
        if (file && file.type.startsWith("image/")) product.image = URL.createObjectURL(file);
      } catch (error) { toast(error.message || "Could not restore a saved upload preview.", true); }
    }
    for(const story of state.stories){
      if(!story.coverId)continue;
      try{
        const file=await getFile(story.coverId);
        if(file)story.image=URL.createObjectURL(file);
      }catch(error){toast(error.message||"Could not restore a saved story cover.",true);}
    }
    const productsById = new Map(uploads.map(product => [product.id, product]));
    for (const story of state.stories) {
      if (story.productId && productsById.has(story.productId)) story.image = productsById.get(story.productId).image;
    }
    renderProducts(); renderStories();
  }
  renderProducts();renderStories();showArticleWritingPage();restoreUploadedPreviews();
})();
