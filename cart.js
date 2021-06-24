const productContainer = document.querySelector('.products .product-container');
const cartBtn = document.querySelector('.navbar .cart-btns');
const cartOverlay = document.querySelector('.cart-overlay');
const closeBtn = document.querySelector('.cart-overlay .close-btn');
const cartProducts = document.querySelector('.cart-products');
const cartTotal = document.querySelector('.cart-total');
const cartNumber = document.querySelector('.cart-number');
const clearCart = document.querySelector('.clear-cart-btn');

let cartArr = [];
let addCartBtns = [];
let productsArr = [];


async function getProducts() {
  const response = await fetch('products.json');
  let data = await response.json();
  data = data.items;

  data = data.map((product) => {
    const { title, price } = product.fields;
    const { id } = product.sys;
    const img = product.fields.image.fields.file.url;
    return { title, price, id, img};
  })
  return data;
}

function showProducts(products) {
  let result = '';
  result = products.map((product) => {
    return `<div class="product">
            <div class="img-container">
              <img src="${product.img}">
              <button class="cart-btn" type="button" data-id="${product.id}">
                  <i class="fa fa-shopping-cart"></i> add to cart
              </button>
            </div>
            <h4>${product.title}</h4>
            <p>$${product.price}</p>
        </div>`
  }).join('');

  productContainer.innerHTML = result;
}

function saveProducts() {
  localStorage.setItem("products" , JSON.stringify(productsArr) );
}

function saveCart() {
  localStorage.setItem("cart" , JSON.stringify(cartArr) );
}

function increaseAmount(id) {
  let item = cartArr.find( (product) => product.id === id);
  item.amount += 1;
  changeCartContent();
  saveCart();
}

function decreaseAmount(id) {
  let item = cartArr.find( (product) => product.id === id);
  item.amount -= 1;
  changeCartContent();

  if(item.amount === 0) {
    removeItem(id);
  }
  saveCart();
}

function showItemInCart(item) {

  cartProducts.innerHTML += `<div class="cart-product">
              <img src="${item.img}">
              <div class="product-details">
                  <h4>${item.title}</h4>
                  <h5>$${item.price}</h5>
                  <p class="remove-btn" data-id="${item.id}">remove</p>
              </div>
              <div class="product-amount">
                  <i class="fa fa-chevron-up" data-id="${item.id}"></i>
                  <p class="item-amount">${item.amount}</p>
                  <i class="fa fa-chevron-down" data-id="${item.id}"></i>
              </div>
            </div>`;
}

function changeCartContent() {
  let amountTotal = 0;
  let cartPriceTotal = 0;

  cartArr.forEach( (item) => {
    amountTotal += item.amount;
    cartPriceTotal += ( item.amount * item.price ); 
  });

  cartPriceTotal = parseFloat(cartPriceTotal.toFixed(2));
  cartTotal.innerHTML = cartPriceTotal;
  cartNumber.innerHTML = amountTotal;
}

function addItemToCart (id) {
  let item = productsArr.find( product => product.id === id);
  item = {...item,amount: 1};
  cartArr = [...cartArr,item];

  showItemInCart(item);
  saveCart();
  cartOverlay.classList.add('open');
  changeCartContent();
}

function setApp() {
    cartArr = localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : []; 
  cartArr.forEach( (item) => {
    showItemInCart(item);
  });
  changeCartContent();

  cartBtn.addEventListener('click', () => {
    cartOverlay.classList.add('open');
  });
  closeBtn.addEventListener('click', () => {
    cartOverlay.classList.remove('open');
  });
}

function removeItem(id) {
  cartArr = cartArr.filter( (item) => item.id !== id);
  cartProducts.innerHTML = "";
  cartArr.forEach( (item) => {
    showItemInCart(item);
  });
  changeCartContent();
  saveCart();

  let itemBtn = addCartBtns.find((btn) => btn.dataset.id === id);
  itemBtn.innerHTML = '<i class="fa fa-shopping-cart"></i> add to cart';
  itemBtn.disabled = false;

  if(cartProducts.children.length === 0) {
    cartOverlay.classList.remove('open');
  }
}

// EventListeners.

cartProducts.addEventListener('click', (e) => {
  let btn = e.target;
  let id = btn.dataset.id;
  let classList = [...btn.classList];

  if(classList.includes('remove-btn')) {
    removeItem(id);
  } else if(classList.includes('fa-chevron-up')) {
    increaseAmount(id);
    let nextSibling = btn.nextElementSibling;
    let item = cartArr.find( item => item.id === id);
    nextSibling.innerHTML = item.amount;
  } else if(classList.includes('fa-chevron-down')) {
    decreaseAmount(id);
    let prevSibling = btn.previousElementSibling;
    let item = cartArr.find( item => item.id === id);
    prevSibling.innerHTML = item.amount;
  }
});

clearCart.addEventListener('click', () => {
  let idArr = cartArr.map( item => item.id);
  idArr.forEach( (id) => removeItem(id) );
  cartOverlay.classList.remove('open');
});

cartBtn.addEventListener('click', () => {
  cartOverlay.classList.add('open');
});

closeBtn.addEventListener('click', () => {
  cartOverlay.classList.remove('open');
});

document.addEventListener('DOMContentLoaded',() => {
  
  setApp();
  getProducts().then( (products) => {
    productsArr = products;
    showProducts(productsArr);
    saveProducts();
  }).then( () => { 
    addCartBtns = [...document.querySelectorAll('.product .cart-btn')];
    addCartBtns.forEach( (btn) => {
      let btnId = btn.dataset.id;
      let inCart = cartArr.find( (item) => item.id === btnId);
      if(inCart) {
        btn.innerHTML = "In cart";
        btn.disabled = true;
      } else {
        btn.addEventListener( "click", (e) => {
          e.target.innerHTML = "In cart";
          e.target.disabled = true;
          addItemToCart(btnId);
        });
      }
    });
  });
});