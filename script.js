
const menu = [
    {
        id: 1,
        name: "Cappuccino",
        category: "Coffee",
        price: 120,
        emoji: "☕",
        description: "Rich espresso with creamy steamed milk."
    },
    {
        id: 2,
        name: "Cafe Latte",
        category: "Coffee",
        price: 140,
        emoji: "🥛",
        description: "Smooth espresso blended with warm milk."
    },
    {
        id: 3,
        name: "Americano",
        category: "Coffee",
        price: 100,
        emoji: "🫖",
        description: "Classic espresso with hot water."
    },
    {
        id: 4,
        name: "Cold Coffee",
        category: "Beverages",
        price: 150,
        emoji: "🥤",
        description: "Chilled coffee for a refreshing break."
    },
    {
        id: 5,
        name: "Iced Tea",
        category: "Beverages",
        price: 90,
        emoji: "🧋",
        description: "Refreshing tea served over ice."
    },
    {
        id: 6,
        name: "Hot Chocolate",
        category: "Beverages",
        price: 130,
        emoji: "🍫",
        description: "Warm chocolate with a creamy finish."
    },
    {
        id: 7,
        name: "Veg Sandwich",
        category: "Snacks",
        price: 100,
        emoji: "🥪",
        description: "Fresh vegetables in toasted bread."
    },
    {
        id: 8,
        name: "French Fries",
        category: "Snacks",
        price: 90,
        emoji: "🍟",
        description: "Crispy golden fries, served hot."
    },
    {
        id: 9,
        name: "Cheese Burger",
        category: "Snacks",
        price: 160,
        emoji: "🍔",
        description: "A delicious burger with melted cheese."
    },
    {
        id: 10,
        name: "Chocolate Cake",
        category: "Desserts",
        price: 140,
        emoji: "🍰",
        description: "Soft chocolate cake for your sweet tooth."
    },
    {
        id: 11,
        name: "Chocolate Brownie",
        category: "Desserts",
        price: 110,
        emoji: "🍫",
        description: "A rich and fudgy chocolate brownie."
    },
    {
        id: 12,
        name: "Vanilla Ice Cream",
        category: "Desserts",
        price: 80,
        emoji: "🍨",
        description: "Classic vanilla ice cream."
    }
];

const cart = {};
let nextOrderNumber = 1001;

function formatPrice(amount) {
    return "₹" + amount.toFixed(2);
}

function displayMenu(category = "All") {
    const container = document.getElementById("menu-items");

    const items = category === "All"
        ? menu
        : menu.filter(item => item.category === category);

    container.innerHTML = items.map(item => `
        <article class="menu-card">
            <div class="food-image" aria-hidden="true">
                ${item.emoji}
            </div>
            <div class="food-info">
                <span class="food-category">${item.category}</span>
                <h3>${item.name}</h3>
                <p class="food-description">${item.description}</p>
                <div class="food-bottom">
                    <span class="food-price">
                        ${formatPrice(item.price)}
                    </span>
                    <button class="add-button"
                        onclick="addToCart(${item.id})">
                        + Add to Cart
                    </button>
                </div>
            </div>
        </article>
    `).join("");
}

function addToCart(id) {
    if (!cart[id]) {
        cart[id] = 0;
    }

    cart[id]++;
    updateCart();
}

function changeQuantity(id, amount) {
    if (!cart[id]) {
        return;
    }

    cart[id] += amount;

    if (cart[id] <= 0) {
        delete cart[id];
    }

    updateCart();
}

function removeItem(id) {
    delete cart[id];
    updateCart();
}

function updateCart() {
    const container = document.getElementById("cart-items");
    const ids = Object.keys(cart);

    let itemCount = 0;
    let subtotal = 0;

    ids.forEach(id => {
        const item = menu.find(product => product.id === Number(id));

        if (item) {
            itemCount += cart[id];
            subtotal += item.price * cart[id];
        }
    });

    document.getElementById("cart-count").textContent = itemCount;
    document.getElementById("subtotal").textContent =
        formatPrice(subtotal);
    document.getElementById("total").textContent =
        formatPrice(subtotal);

    if (ids.length === 0) {
        container.innerHTML = `
            <p class="empty-message">
                Your cart is empty. Add something delicious!
            </p>
        `;
        return;
    }

    container.innerHTML = ids.map(id => {
        const item = menu.find(product => product.id === Number(id));
        const quantity = cart[id];

        return `
            <div class="cart-item">
                <div>
                    <h3>${item.name}</h3>
                    <p>${formatPrice(item.price)} each</p>
                    <strong>${formatPrice(item.price * quantity)}</strong>
                </div>

                <div class="quantity-controls">
                    <button onclick="changeQuantity(${item.id}, -1)"
                        aria-label="Decrease ${item.name} quantity">−</button>
                    <span>${quantity}</span>
                    <button onclick="changeQuantity(${item.id}, 1)"
                        aria-label="Increase ${item.name} quantity">+</button>
                    <button class="remove-button"
                        onclick="removeItem(${item.id})">
                        Remove
                    </button>
                </div>
            </div>
        `;
    }).join("");
}

function showCart() {
    document.getElementById("order").scrollIntoView({
        behavior: "smooth"
    });
}

document.querySelectorAll(".filter").forEach(button => {
    button.addEventListener("click", () => {
        document.querySelectorAll(".filter").forEach(filter => {
            filter.classList.remove("active");
        });

        button.classList.add("active");
        displayMenu(button.dataset.category);
    });
});

document.getElementById("order-form").addEventListener("submit", event => {
    event.preventDefault();

    const message = document.getElementById("form-message");
    const name = document.getElementById("customer-name").value.trim();
    const orderType = document.getElementById("order-type").value;
    const ids = Object.keys(cart);

    if (!name) {
        message.textContent = "Please enter your name.";
        return;
    }

    if (ids.length === 0) {
        message.textContent = "Please add at least one item to your cart.";
        return;
    }

    const invalidItem = ids.some(id => {
        const item = menu.find(product => product.id === Number(id));
        return !item || !Number.isInteger(cart[id]) || cart[id] < 1;
    });

    if (invalidItem) {
        message.textContent = "Please check your cart and try again.";
        return;
    }

    const total = ids.reduce((sum, id) => {
        const item = menu.find(product => product.id === Number(id));
        return sum + item.price * cart[id];
    }, 0);

    const orderNumber = nextOrderNumber++;

    document.getElementById("confirmation-details").textContent =
        `Order #${orderNumber} for ${name}. ` +
        `${orderType} · Total: ${formatPrice(total)}.`;

    document.getElementById("confirmation").hidden = false;
    message.textContent = "";
});

function closeConfirmation() {
    document.getElementById("confirmation").hidden = true;

    Object.keys(cart).forEach(id => delete cart[id]);

    updateCart();
    document.getElementById("order-form").reset();

    document.getElementById("menu").scrollIntoView({
        behavior: "smooth"
    });
}

displayMenu();
updateCart();
