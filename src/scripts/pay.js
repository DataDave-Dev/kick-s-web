document.addEventListener("astro:page-load", function () {
    renderOrderSummary();
    setupModalListeners();
    setupFormSubmission();
});

function setupFormSubmission() {
    const form = document.getElementById("checkoutForm");
    if (!form) return;

    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        document.getElementById("cartItems").value = localStorage.getItem("cart") || "[]";

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Procesando...
        `;

        const messages = document.getElementById("order-messages");
        if (messages) messages.innerHTML = "";

        try {
            const formData = new FormData(form);

            const response = await fetch("/api/scripts/order", {
                method: "POST",
                body: formData
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Ha ocurrido un error al procesar tu orden.");
            }

            localStorage.setItem("cart", "[]");
            if (window.updateCartCount) window.updateCartCount();

            if (result.redirect) {
                window.location.href = result.redirect;
            } else {
                const successMessage = document.createElement("div");
                successMessage.className = "bg-green-50 border border-green-100 rounded-xl p-3 mb-4 flex items-center animate-fade-in";
                successMessage.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span class="text-green-700 text-sm font-medium">¡Orden completada con éxito! Referencia: ${result.orderReference}</span>
                `;
                if (messages) {
                    messages.appendChild(successMessage);
                }
                form.reset();
            }
        } catch (error) {
            console.error("Error submitting order:", error);
            const errorMessage = document.createElement("div");
            errorMessage.id = "order-error-message";
            errorMessage.className = "bg-red-50 border border-red-100 rounded-xl p-3 mb-4 flex items-center animate-fade-in";
            errorMessage.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span class="text-red-700 text-sm font-medium">${error.message}</span>
            `;
            if (messages) {
                messages.appendChild(errorMessage);
            }
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }
    });
}

function getCart() {
    try {
        return JSON.parse(localStorage.getItem("cart") || "[]");
    } catch {
        return [];
    }
}

function formatCurrency(amount) {
    return new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
        minimumFractionDigits: 2,
    }).format(amount);
}

function renderOrderSummary() {
    const cart = getCart();
    const $items = document.getElementById("order-summary-items");
    const $totals = document.getElementById("order-summary-totals");
    const $total = document.getElementById("order-summary-total");

    if (!$items || !$totals || !$total) return;

    let subTotal = 0;
    let html = "";

    if (cart.length) {
        cart.forEach((item) => {
            const itemTotal = Number(item.Precio) * item.Cantidad;
            subTotal += itemTotal;
            html += `
                <div class="flex items-center justify-between py-2">
                    <div class="flex items-center gap-3">
                        <div class="w-12 h-12 rounded-lg bg-gray-50 p-1 flex items-center justify-center">
                            <img src="${item.Imagen}" class="max-w-full max-h-full object-contain" alt="${item.Producto}" />
                        </div>
                        <div>
                            <p class="font-bold text-sm">${item.Producto}</p>
                            <p class="text-gray-500 text-xs">Cantidad: ${item.Cantidad}</p>
                        </div>
                    </div>
                    <span class="font-medium">${formatCurrency(itemTotal)}</span>
                </div>
            `;
        });
    } else {
        html = `<div class="text-center py-6 text-gray-500">No hay productos en el carrito.</div>`;
    }

    $items.innerHTML = html;

    const impuestos = subTotal * 0.16;
    const total = subTotal + impuestos;

    $totals.innerHTML = `
        <div class="flex justify-between items-center">
            <span class="text-gray-600">Subtotal</span>
            <span class="font-medium">${formatCurrency(subTotal)}</span>
        </div>
        <div class="flex justify-between items-center">
            <span class="text-gray-600">Impuestos</span>
            <span class="font-medium">${formatCurrency(impuestos)}</span>
        </div>
    `;
    $total.textContent = formatCurrency(total);
}

function setupModalListeners() {
    const openModalBtn = document.getElementById("openModal");
    const closeModalBtn = document.getElementById("closeModal");
    const modal = document.getElementById("creditCardModal");
    const saveCardBtn = document.getElementById("saveCard");
    const cardNumberInput = document.getElementById("cardNumber");
    const cardNameInput = document.getElementById("cardName");
    const cardExpiryInput = document.getElementById("cardExpiry");
    const cardCvvInput = document.getElementById("cardCvv");

    if (!openModalBtn || !closeModalBtn || !modal || !saveCardBtn) {
        console.error("Modal elements not found");
        return;
    }

    openModalBtn.addEventListener("click", () => {
        modal.classList.remove("hidden");
        document.body.style.overflow = "hidden";
    });

    closeModalBtn.addEventListener("click", () => {
        modal.classList.add("hidden");
        document.body.style.overflow = "auto";
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && !modal.classList.contains("hidden")) {
            modal.classList.add("hidden");
            document.body.style.overflow = "auto";
        }
    });

    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.classList.add("hidden");
            document.body.style.overflow = "auto";
        }
    });

    if (cardNumberInput) {
        cardNumberInput.addEventListener("input", (e) => {
            let value = e.target.value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
            let formatted = value.replace(/(\d{4})/g, "$1 ").trim();
            e.target.value = formatted.substring(0, 19);

            const cardNumberDisplay = document.getElementById("cardNumberDisplay");
            if (cardNumberDisplay) {
                if (value.length > 0) {
                    let hiddenPart = "•••• •••• •••• ";
                    let visiblePart = value.slice(-4);
                    if (visiblePart.length > 0) {
                        cardNumberDisplay.textContent = hiddenPart + visiblePart;
                    } else {
                        cardNumberDisplay.textContent = "•••• •••• •••• ••••";
                    }
                } else {
                    cardNumberDisplay.textContent = "•••• •••• •••• ••••";
                }
            }

            const creditCard = document.querySelector(".credit-card");
            if (creditCard) {
                creditCard.classList.add("credit-card-focused");
            }
        });
    }

    if (cardNameInput) {
        cardNameInput.addEventListener("input", (e) => {
            const cardNameDisplay = document.getElementById("cardNameDisplay");
            if (cardNameDisplay) {
                cardNameDisplay.textContent = e.target.value.toUpperCase() || "NOMBRE APELLIDO";
            }

            const creditCard = document.querySelector(".credit-card");
            if (creditCard) {
                creditCard.classList.add("credit-card-focused");
            }
        });
    }

    if (cardExpiryInput) {
        cardExpiryInput.addEventListener("input", (e) => {
            let value = e.target.value.replace(/[^0-9]/g, "");

            if (value.length > 2) {
                value = value.substring(0, 2) + "/" + value.substring(2, 4);
            }

            e.target.value = value.substring(0, 5);

            const cardExpiryDisplay = document.getElementById("cardExpiryDisplay");
            if (cardExpiryDisplay) {
                cardExpiryDisplay.textContent = value || "MM/AA";
            }

            const creditCard = document.querySelector(".credit-card");
            if (creditCard) {
                creditCard.classList.add("credit-card-focused");
            }
        });
    }

    const inputIds = ["cardNumber", "cardName", "cardExpiry", "cardCvv"];
    inputIds.forEach((id) => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener("blur", () => {
                const creditCard = document.querySelector(".credit-card");
                if (creditCard) {
                    creditCard.classList.remove("credit-card-focused");
                }
            });
        }
    });

    if (saveCardBtn) {
        saveCardBtn.addEventListener("click", () => {
            const cardNumber = cardNumberInput ? cardNumberInput.value : '';
            const cardName = cardNameInput ? cardNameInput.value : '';
            const cardExpiry = cardExpiryInput ? cardExpiryInput.value : '';
            const cardCvv = cardCvvInput ? cardCvvInput.value : '';

            if (!cardNumber || !cardName || !cardExpiry || !cardCvv) {
                alert("Por favor, completa todos los campos de la tarjeta");
                return;
            }

            saveCardBtn.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Procesando...
                `;

            setTimeout(() => {
                saveCardBtn.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                        ¡Tarjeta guardada!
                    `;
                saveCardBtn.classList.remove("bg-purple-600", "hover:bg-purple-700");
                saveCardBtn.classList.add("bg-green-500", "hover:bg-green-600");

                setTimeout(() => {
                    modal.classList.add("hidden");
                    document.body.style.overflow = "auto";

                    if (openModalBtn) {
                        openModalBtn.innerHTML = `
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                </svg>
                                Método de Pago Añadido
                            `;
                        openModalBtn.classList.remove(
                            "bg-white",
                            "hover:bg-gray-50",
                            "border-gray-300",
                            "text-gray-800",
                        );
                        openModalBtn.classList.add(
                            "bg-gray-50",
                            "border-green-100",
                            "text-green-700",
                        );
                    }

                    const formContainer = document.querySelector(".lg\\:col-span-3");
                    if (formContainer) {
                        const successMessage = document.createElement("div");
                        successMessage.className = "bg-green-50 border border-green-100 rounded-xl p-3 mb-4 flex items-center animate-fade-in";
                        successMessage.innerHTML = `
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                </svg>
                                <span class="text-green-700 text-sm font-medium">Tarjeta guardada correctamente</span>
                            `;
                        formContainer.insertBefore(successMessage, formContainer.firstChild);

                        setTimeout(() => {
                            successMessage.style.opacity = "0";
                            successMessage.style.transition = "opacity 0.5s ease";
                            setTimeout(() => successMessage.remove(), 500);
                        }, 4000);
                    }
                }, 1000);
            }, 1500);
        });
    }
}