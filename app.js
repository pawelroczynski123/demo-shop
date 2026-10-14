// Demo Shop: prosty sklep bez śledzenia. Zdarzenia dataLayer dodasz sam w kolejnych etapach.
const PRODUCTS = [
  {id:"P001", name:"Kubek termiczny 350 ml", price:59, category:"Akcesoria", icon:"☕"},
  {id:"P002", name:"Plecak miejski 20 l", price:189, category:"Torby", icon:"🎒"},
  {id:"P003", name:"Butelka na wodę 750 ml", price:39, category:"Akcesoria", icon:"🥤"},
  {id:"P004", name:"Notes A5 w kropki", price:29, category:"Papeteria", icon:"📓"},
  {id:"P005", name:"Słuchawki bezprzewodowe", price:249, category:"Elektronika", icon:"🎧"},
  {id:"P006", name:"Lampka biurkowa LED", price:129, category:"Elektronika", icon:"💡"}
];
const money = n => n.toFixed(2).replace(".", ",") + " zł";
const getCart = () => JSON.parse(localStorage.getItem("cart") || "[]");
const saveCart = c => { localStorage.setItem("cart", JSON.stringify(c)); updateCount(); };
const findProduct = id => PRODUCTS.find(p => p.id === id);
function updateCount(){ const el=document.getElementById("cart-count"); if(el) el.textContent=getCart().reduce((s,i)=>s+i.qty,0); }
function addToCart(id){ const c=getCart(); const it=c.find(i=>i.id===id); if(it) it.qty++; else c.push({id,qty:1}); saveCart(c); }
function cartTotal(){ return getCart().reduce((s,i)=>s+findProduct(i.id).price*i.qty,0); }
 
function renderGrid(){
  const g=document.getElementById("product-grid"); if(!g) return;
  g.innerHTML = PRODUCTS.map(p => `<div class="card product-card" data-product-id="${p.id}">
    <div class="pic">${p.icon}</div><h3>${p.name}</h3><div>${p.category}</div>
    <div class="price">${money(p.price)}</div>
    <p><a class="btn secondary" href="product.html?id=${p.id}">Zobacz produkt</a></p></div>`).join("");
}
function renderProduct(){
  const box=document.getElementById("product-detail"); if(!box) return;
  const p=findProduct(new URLSearchParams(location.search).get("id")); if(!p){ box.textContent="Nie znaleziono produktu."; return; }
  box.innerHTML = `<div class="card"><div class="pic">${p.icon}</div><h1>${p.name}</h1><div>${p.category}</div>
    <p class="price">${money(p.price)}</p><button class="btn add-to-cart" data-product-id="${p.id}">Dodaj do koszyka</button></div>`;
    window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ ecommerce: null });
  window.dataLayer.push({
    event: "view_item",
    ecommerce: {
      currency: "PLN",
      value: p.price,
      items: [{ item_id: p.id, item_name: p.name, item_category: p.category, price: p.price, quantity: 1 }]
    }
  });
  box.querySelector(".add-to-cart").addEventListener("click", () => {
    addToCart(p.id);
    // Zdarzenie dla GTM/GA4 w formacie e-commerce GA4
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ ecommerce: null }); // czyści poprzednie dane e-commerce
    window.dataLayer.push({
      event: "add_to_cart",
      ecommerce: {
        currency: "PLN",
        value: p.price,
        items: [{ item_id: p.id, item_name: p.name, item_category: p.category, price: p.price, quantity: 1 }]
      }
    });
    alert("Dodano do koszyka");
  });
}
function renderCart(){
  const v=document.getElementById("cart-view"); if(!v) return; const c=getCart();
  if(!c.length){ v.innerHTML="<p>Koszyk jest pusty.</p>"; return; }
  v.innerHTML = `<table><tr><th>Produkt</th><th>Ilość</th><th>Cena</th><th></th></tr>` +
    c.map(i=>{const p=findProduct(i.id);return `<tr><td>${p.name}</td><td>${i.qty}</td><td>${money(p.price*i.qty)}</td>
    <td><button class="btn secondary remove" data-product-id="${p.id}">Usuń</button></td></tr>`}).join("") +
    `</table><p class="price">Razem: ${money(cartTotal())}</p><a class="btn" id="go-checkout" href="checkout.html">Przejdź do zamówienia</a>`;
  v.querySelectorAll(".remove").forEach(b=>b.addEventListener("click",()=>{ saveCart(getCart().filter(i=>i.id!==b.dataset.productId)); renderCart(); }));
}
function renderCheckout(){
  const s=document.getElementById("checkout-summary"); if(!s) return;
  s.innerHTML = `<p>Wartość zamówienia: <strong>${money(cartTotal())}</strong></p>`;
  document.getElementById("checkout-form").addEventListener("submit", e=>{
    e.preventDefault(); if(!getCart().length){ alert("Koszyk jest pusty"); return; }
    const order={id:"T"+Date.now(), total:cartTotal(), items:getCart()};
    localStorage.setItem("lastOrder", JSON.stringify(order)); saveCart([]);
    location.href="thanks.html?order="+order.id;
  });
}
function renderThanks(){
  const v=document.getElementById("thanks-view"); if(!v) return;
  const o=JSON.parse(localStorage.getItem("lastOrder")||"null");
  v.innerHTML = o ? `<h1>Dziękujemy za zamówienie!</h1><p>Numer zamówienia: <strong>${o.id}</strong></p><p>Wartość: ${money(o.total)}</p><a class="btn" href="index.html">Wróć do sklepu</a>` : "<p>Brak zamówienia.</p>";
}
function setupContact(){
  const f=document.getElementById("contact-form"); if(!f) return;
  f.addEventListener("submit", e=>{ e.preventDefault(); f.hidden=true; document.getElementById("contact-ok").hidden=false; });
}
updateCount(); renderGrid(); renderProduct(); renderCart(); renderCheckout(); renderThanks(); setupContact();
