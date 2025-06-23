// --- Referencias a Elementos del DOM (Actualizado) ---

// Elementos Generales y Vistas
const loader = document.getElementById('loader');
const adminContentArea = document.getElementById('adminContentArea');
const productManagementView = document.getElementById('productManagementView');
const orderManagementView = document.getElementById('orderManagementView'); // Para futura gestión de pedidos

// Contenedores y Controles de la Vista de Productos
const productContainerAdmin = document.getElementById('productContainerAdmin');
const categoryFilterSelect = document.getElementById('categoryFilter'); // Filtro de categorías
const addNewProductBtn = document.getElementById('addNewProductBtn'); // Botón "Añadir Nuevo Producto"

// Modal de Añadir/Editar Producto y su Formulario
const adminProductModal = document.getElementById('adminProductModal');
const adminProductForm = document.getElementById('adminProductForm');
const adminModalTitle = document.getElementById('adminModalTitle');

// Campos del Formulario del Modal de Producto
const adminProductId = document.getElementById('adminProductId'); // Campo oculto para ID
const adminProductName = document.getElementById('adminProductName');
const adminProductDescription = document.getElementById('adminProductDescription');
const adminProductCategory = document.getElementById('adminProductCategory');
const adminProductImage = document.getElementById('adminProductImage');
const adminProductExtrasLimit = document.getElementById('adminProductExtrasLimit'); // Campo para Límite de Extras
const adminProductStatus = document.getElementById('adminProductStatus'); // ELIMINADO - Ya no existe el campo Estado

// Contenedores Dinámicos dentro del Modal de Producto
const adminSizesPricesContainer = document.getElementById('adminSizesPricesContainer');
const adminExtrasContainer = document.getElementById('adminExtrasContainer');

// Modal de Confirmación de Eliminación
const confirmDeleteModal = document.getElementById('confirmDeleteModal');
const productNameToDelete = document.getElementById('productNameToDelete'); // Span para mostrar nombre
const deleteProductId = document.getElementById('deleteProductId'); // Campo oculto para ID a eliminar
const confirmDeleteProductBtnFinal = document.getElementById('confirmDeleteProductBtnFinal'); // Botón final de eliminar

// --- Fin Referencias a Elementos del DOM ---

// ... (Resto de tu código: Variables Globales, Funciones, Inicialización) ...

// --- Variables Globales ---
let currentProducts = []; // Para almacenar los productos cargados

// --- Funciones de Utilidad ---
const showLoader = () => { if (loader) loader.style.display = 'flex'; };
const hideLoader = () => { if (loader) loader.style.display = 'none'; };

// --- Funciones de Gestión de Vistas ---
function showView(viewElement) {
    // Ocultar todas las vistas principales dentro de adminContentArea
    const views = adminContentArea.querySelectorAll(':scope > div'); // :scope para hijos directos
    views.forEach(v => v.style.display = 'none');
    // Mostrar la vista deseada
    if (viewElement) {
        viewElement.style.display = 'block';
    } else {
        console.error("Elemento de vista no encontrado");
    }
}

function loadProductManagementView() {
    showView(productManagementView);
    console.log("Cargando vista de gestión de productos...");
    fetchAndRenderAdminProducts(); // Cargar productos al mostrar la vista
}

function loadOrderManagementView() {
    showView(orderManagementView);
    console.log("Cargando vista de gestión de pedidos...");
    // TODO: Aquí iría la lógica para cargar y mostrar pedidos
    orderManagementView.innerHTML = '<h2>Gestión de Pedidos</h2><p>Cargando pedidos...</p>';
    // fetchAndRenderOrders(); // Función a crear
    alert("Vista de gestión de pedidos aún no implementada.");
}

function logout() {
    console.log("Cerrando sesión...");
    // TODO: Implementar lógica de logout real (limpiar tokens/sesión, redirigir)
    alert("Función de Cerrar Sesión no implementada aún.");
}

function populateCategoryFilter(products) {
    console.log('--- Entrando a populateCategoryFilter ---'); // 1. ¿Se llama la función?
    console.log('Productos recibidos:', products ? products.length : 'null/undefined'); // 2. ¿Recibe productos?

    // 3. ¿Se encuentra el elemento <select>?
    // Asegúrate que categoryFilterSelect esté definida globalmente o pásala como argumento
    console.log('Elemento categoryFilterSelect:', categoryFilterSelect);
    if (!categoryFilterSelect) {
        console.error("Error: Elemento select 'categoryFilter' no encontrado.");
        return; // Salir si no se encuentra
    }

    const categories = new Set();
    if (products && products.length > 0) {
        products.forEach((p, index) => {
            // 4. ¿Existe la propiedad 'Categoría' y tiene valor?
            // console.log(`Producto ${index}, Categoría: ${p.Categoría} (Tipo: ${typeof p.Categoría})`); // Descomenta si necesitas detalle
            if (p.Categoría && typeof p.Categoría === 'string' && p.Categoría.trim() !== '') {
                categories.add(p.Categoría.trim()); // Añadir sin espacios extra
            }
        });
    }

    // 5. ¿Cuántas categorías únicas se encontraron?
    console.log('Categorías únicas encontradas:', categories);

    if (categories.size === 0) {
        console.warn("No se encontraron categorías válidas para popular el filtro.");
        // Limpiar por si había opciones viejas (excepto "Todas")
        while (categoryFilterSelect.options.length > 1) {
            categoryFilterSelect.remove(1);
        }
        return; // Salir si no hay nada que añadir
    }

    // -- Lógica de comparación y actualización (simplificada para debug) --
    // Por ahora, vamos a limpiar y añadir siempre para asegurarnos que la adición funciona
    console.log('Limpiando opciones existentes y añadiendo nuevas...');

    // Limpiar opciones existentes (excepto la primera "Todas")
    while (categoryFilterSelect.options.length > 1) {
        categoryFilterSelect.remove(1);
    }

    // Añadir nuevas opciones ordenadas
    const sortedCategories = Array.from(categories).sort();
    sortedCategories.forEach(category => {
        try {
            // 6. ¿Se crea y añade cada opción?
            console.log('Añadiendo opción:', category);
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilterSelect.appendChild(option);
        } catch (error) {
            // 7. ¿Hay algún error durante la adición?
            console.error(`Error al añadir la opción "${category}":`, error);
        }
    });

    console.log('--- Saliendo de populateCategoryFilter ---');
}

function filterProductsByCategory() {
    if (!categoryFilterSelect || !productContainerAdmin) return;

    const selectedCategory = categoryFilterSelect.value;
    const productItems = productContainerAdmin.querySelectorAll('.menu-item-admin');
    let count = 0;

    console.log(`Filtrando por: ${selectedCategory}`);

    productItems.forEach(item => {
        const itemCategory = item.dataset.category; // Leer desde data-category
        // Mostrar si es "Todas" o si la categoría coincide (ignorando mayúsculas/minúsculas)
        if (selectedCategory === 'all' || (itemCategory && itemCategory.toLowerCase() === selectedCategory.toLowerCase())) {
            item.style.display = 'flex'; // O 'block' según tu layout de tarjeta
             count++;
        } else {
            item.style.display = 'none';
        }
    });
     console.log(`${count} productos mostrados.`);
     // Podrías añadir un mensaje si count es 0
}


// --- Funciones de Gestión de Productos (API y Renderizado) ---

// --- Funciones de Gestión de Productos (API y Renderizado) ---

async function fetchProductsAdmin() {
    showLoader();          // Muestra el indicador de carga
    try {
        // Nueva llamada a la API interna en Vercel
        const response = await fetch('/api/admin-products');   // GET simple

        // Verifica si la petición fue exitosa
        if (!response.ok) {
            const errorData = await response
                .json()
                .catch(() => ({ message: response.statusText }));
            console.error(
                "Error API al obtener productos:",
                response.status,
                errorData
            );
            throw new Error(
                `Error API [${response.status}]: ${
                    errorData.message || response.statusText
                }`
            );
        }

        // Convierte la respuesta a JSON
        const data = await response.json();
        currentProducts = data;                 // Almacena globalmente
        console.log("Productos cargados para admin:", currentProducts);
        return currentProducts;                 // Devuelve los productos
    } catch (error) {
        console.error("Error en fetchProductsAdmin:", error);
        if (productContainerAdmin) {
            productContainerAdmin.innerHTML =
                `<p style="color:#ef4444;text-align:center;">` +
                `Error al cargar productos: ${error.message}</p>`;
        }
        currentProducts = [];                   // Resetea en caso de error
        return [];                              // Devuelve array vacío
    } finally {
        hideLoader();                           // Oculta el loader
    }
}


/**
 * Renderiza las tarjetas de administración para cada producto en el contenedor principal.
 * @param {Array} products - El array de objetos de producto a renderizar.
 */
function renderAdminProducts(products) {
    if (!productContainerAdmin) {
        console.error("Contenedor 'productContainerAdmin' no encontrado en el DOM.");
        return;
    }
    productContainerAdmin.innerHTML = '';

    if (!products || products.length === 0) {
        productContainerAdmin.innerHTML = '<p style="color: #aaa; text-align: center;">No hay productos para mostrar.</p>';
        return;
    }

    const fragment = document.createDocumentFragment();

    products.forEach(product => {
        const productId = product.id;
        if (!productId) {
            console.warn("Producto omitido por no tener un ID válido:", product);
            return;
        }

        const productName = product.Nombre || 'Producto Sin Nombre';
        const productDescription = product.Descripción || 'Sin descripción disponible.';
        const productCategory = product.Categoría || 'Sin Categoría';
        const productImage = product.Imagen || 'https://via.placeholder.com/300x200?text=No+Imagen';
        const productPrice = product.Precio !== null && product.Precio !== undefined ? `L${parseFloat(product.Precio).toFixed(2)}` : '(Sin Precio)';
        const productSize = product.Tamaño;
        // No hay campo Estado, así que lo quitamos de la lógica y el HTML

        const productDiv = document.createElement('div');
        productDiv.classList.add('menu-item', 'menu-item-admin');
        productDiv.dataset.productId = productId;
        productDiv.dataset.category = productCategory; // Para el filtro

        // Construye el HTML interno SIN la sección de Estado
        productDiv.innerHTML = `
            <img src="${productImage}" alt="${productName}" class="item-image">
            <div class="item-info">
                <div class="item-header">
                    <div class="item-title">
                        <h2>${productName} ${productSize ? `(${productSize})` : ''}</h2>
                        <p class="price">${productPrice}</p>
                    </div>
                </div>
                <div class="item-description"><p>${productDescription}</p></div>
                <div class="item-status">
                    <span>Cat: ${productCategory}</span>
                    <span style="margin-left:8px;">Estado: ${product.Estado || 'Activo'}</span>
                    <!-- Estado eliminado -->
                </div>
                 <div class="item-admin-actions">
                     <!-- Botones se añaden abajo -->
                 </div>
            </div>
        `;

        const actionsContainer = productDiv.querySelector('.item-admin-actions');

        const editButton = document.createElement('button');
        editButton.classList.add('edit-btn');
        editButton.innerHTML = '<i data-feather="edit-2"></i> Editar';
        editButton.onclick = () => openAdminProductModal(productId);
        actionsContainer.appendChild(editButton);

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('delete-btn');
        deleteButton.innerHTML = '<i data-feather="trash-2"></i> Eliminar';
        deleteButton.onclick = () => confirmDeleteProduct(productId, productName); // Asumiendo que confirmDeleteProduct existe
        actionsContainer.appendChild(deleteButton);

        fragment.appendChild(productDiv);
    });

    productContainerAdmin.appendChild(fragment);
    feather.replace();
}

// --- Modificar fetchAndRenderAdminProducts ---
async function fetchAndRenderAdminProducts() {
    const products = await fetchProductsAdmin();
    renderAdminProducts(products);
    populateCategoryFilter(products); // <--- LLAMAR AQUÍ para llenar el select
    filterProductsByCategory(); // <--- Aplicar filtro inicial (mostrar todo)
}

// Añadir un listener al campo de nombre para verificar existentes
adminProductName.oninput = () => {
    const currentName = adminProductName.value.trim();
    const referenceDisplay = document.getElementById('existingProductReference'); // Necesitas añadir este div en el HTML

    if (currentName.length > 2 && currentProducts.length > 0) { // Buscar si hay nombre y productos cargados
        const existingVariant = currentProducts.find(p => p.Nombre && p.Nombre.toLowerCase() === currentName.toLowerCase());
        if (existingVariant && referenceDisplay) {
            let extrasInfo = "Ninguno";
            if (existingVariant.Extras) {
                extrasInfo = existingVariant.Extras.split(',').map(pair => pair.split(':')[0].trim()).join(', ');
            }
            referenceDisplay.innerHTML = `
                <p style="font-size: 0.85em; color: #aaa; margin-top: 5px; border: 1px dashed #444; padding: 5px;">
                    <strong>Referencia encontrada:</strong><br>
                    <em>Desc:</em> ${existingVariant.Descripción || 'N/A'}<br>
                    <em>Extras:</em> ${extrasInfo}
                </p>`;
            referenceDisplay.style.display = 'block';
        } else if (referenceDisplay) {
            referenceDisplay.style.display = 'none';
        }
    } else if (referenceDisplay) {
        referenceDisplay.style.display = 'none';
    }
};

// Al cerrar el modal o resetear, limpiar la referencia y quitar el listener
function resetAdminModal() {
    // ... (resto del reset) ...
    const referenceDisplay = document.getElementById('existingProductReference');
    if(referenceDisplay) referenceDisplay.style.display = 'none';
    adminProductName.oninput = null; // Quitar listener
}

// --- Funciones del Modal de Añadir/Editar Producto ---

function resetAdminModal() {
    adminProductForm.reset(); // Limpia campos estándar
    adminProductId.value = ''; // Limpia ID oculto
    adminSizesPricesContainer.innerHTML = ''; // Limpia tamaños/precios
    adminExtrasContainer.innerHTML = ''; // Limpia extras
    addSizePriceEntry(); // Añadir una fila vacía por defecto para tamaño/precio
}

function addSizePriceEntry(size = '', price = '') {
    const entryDiv = document.createElement('div');
    entryDiv.className = 'size-price-entry form-inline-group';
    // Usar name atributos para facilitar la recolección de datos
    entryDiv.innerHTML = `
        <input type="text" name="productSize[]" placeholder="Tamaño (ej. Regular)" value="${size}" style="flex-grow: 2; margin-right: 5px;">
        <input type="number" name="productPrice[]" placeholder="Precio" step="0.01" value="${price}" style="flex-grow: 1; margin-right: 5px;">
        <button type="button" class="delete-btn-inline" onclick="removeEntry(this)">X</button>
    `;
    adminSizesPricesContainer.appendChild(entryDiv);
}

function addExtraEntry(name = '', price = '') {
    const entryDiv = document.createElement('div');
    entryDiv.className = 'extra-entry form-inline-group';
     // Usar name atributos para facilitar la recolección de datos
    entryDiv.innerHTML = `
        <input type="text" name="extraName[]" placeholder="Nombre Extra (ej. Queso Extra)" value="${name}" style="flex-grow: 2; margin-right: 5px;">
        <input type="number" name="extraPrice[]" placeholder="Precio Extra" step="0.01" value="${price}" style="flex-grow: 1; margin-right: 5px;">
        <button type="button" class="delete-btn-inline" onclick="removeEntry(this)">X</button>
    `;
    adminExtrasContainer.appendChild(entryDiv);
}

function removeEntry(button) {
    button.closest('.form-inline-group').remove();
}

function resetAdminModal() {
    console.log("Resetting admin modal...");
    if (adminProductForm) adminProductForm.reset(); // Limpia campos estándar del formulario
    if (adminProductId) adminProductId.value = ''; // Limpia ID oculto
    if (adminSizesPricesContainer) adminSizesPricesContainer.innerHTML = ''; // Limpia tamaños/precios
    if (adminExtrasContainer) adminExtrasContainer.innerHTML = ''; // Limpia extras

    // Limpiar referencia de producto existente si la implementaste
    const referenceDisplay = document.getElementById('existingProductReference');
    if(referenceDisplay) referenceDisplay.style.display = 'none';
    // Quitar listener de input de nombre si existe
    const nameInput = document.getElementById('adminProductName');
    if (nameInput && nameInput.oninput) {
        nameInput.oninput = null;
    }

    // Asegurarse de que el botón de añadir tamaño esté oculto
    const addSizeBtn = document.querySelector('#adminProductForm button[onclick*="addSizePriceEntry"]');
     if (addSizeBtn) {
         addSizeBtn.style.display = 'none';
     }
}

// -----------------------------------------------------------------------------

/**
 * Abre el modal para añadir un nuevo producto o editar uno existente.
 * @param {number | string | null} productId - El ID del producto a editar, o null para añadir uno nuevo.
 */
async function openAdminProductModal(productId = null) {
    // 1. Resetear SIEMPRE: Limpia todo
    resetAdminModal();

    // Referencias a elementos dentro del modal (mejor obtenerlas aquí por si acaso)
    const addSizeBtn = document.querySelector('#adminProductForm button[onclick*="addSizePriceEntry"]');
    const extrasLimitInput = document.getElementById('adminProductExtrasLimit');
    const modalTitle = document.getElementById('adminModalTitle'); // Usar variable local
    const productIdInput = document.getElementById('adminProductId'); // Usar variable local
    const productNameInput = document.getElementById('adminProductName');
    const productDescInput = document.getElementById('adminProductDescription');
    const productCatInput = document.getElementById('adminProductCategory');
    const productImageInput = document.getElementById('adminProductImage');
    const sizesContainer = document.getElementById('adminSizesPricesContainer'); // Usar variable local
    const extrasContainer = document.getElementById('adminExtrasContainer'); // Usar variable local

    // Verificar si los elementos esenciales del modal existen
    if (!adminProductModal || !modalTitle || !productIdInput || !productNameInput || !sizesContainer || !extrasContainer) {
        console.error("Error: No se encontraron elementos esenciales del modal.");
        alert("Error al intentar abrir el modal. Faltan elementos.");
        return;
    }


    // 2. OCULTAR SIEMPRE EL BOTÓN DE AÑADIR TAMAÑO (si existe)
    if (addSizeBtn) {
        addSizeBtn.style.display = 'none';
    }

    // 3. Añadir UNA SOLA fila vacía de tamaño/precio SIEMPRE
    sizesContainer.innerHTML = ''; // Limpiar explícitamente aquí
    addSizePriceEntry(); // Añade la fila vacía (asegúrate que addSizePriceEntry use 'sizesContainer')

    // 4. Limpiar contenedor de extras SIEMPRE
    extrasContainer.innerHTML = ''; // Limpiar explícitamente aquí

    if (productId) {
        // --- MODO EDICIÓN ---
        console.log("Opening modal in EDIT mode for ID:", productId);
        modalTitle.textContent = "Editar Variante de Producto";
        productIdInput.value = productId;
        showLoader();

        // Busca el producto. Asegúrate que `currentProducts` esté actualizado.
        const product = currentProducts.find(p => p.id === productId);

        if (product) {
            try {
                // Poblar campos estándar
                productNameInput.value = product.Nombre || '';
                productDescInput.value = product.Descripción || '';
                productCatInput.value = product.Categoría || '';
                productImageInput.value = product.Imagen || '';

                if (adminProductStatus) {
                    adminProductStatus.value = product.Estado || 'Activo';
                }
                if (extrasLimitInput) {
                    extrasLimitInput.value = (product['Limite de Extras'] !== null && product['Limite de Extras'] !== undefined) ? product['Limite de Extras'] : '';
                }

                // Poblar la ÚNICA fila de tamaño/precio
                const sizeInput = sizesContainer.querySelector('input[name="productSize[]"]');
                const priceInput = sizesContainer.querySelector('input[name="productPrice[]"]');
                if (sizeInput) sizeInput.value = product.Tamaño || '';
                if (priceInput) priceInput.value = (product.Precio !== null && product.Precio !== undefined) ? parseFloat(product.Precio) : '';

                // Poblar los Extras parseando el string
                if (product.Extras && typeof product.Extras === 'string' && product.Extras.trim() !== '') {
                    const extrasPairs = product.Extras.split(',');
                    extrasPairs.forEach((pair) => {
                        if (pair && pair.includes(':')) {
                            const [name, priceStr] = pair.split(':', 2);
                            if (name && priceStr !== undefined) {
                                const parsedPrice = parseFloat(priceStr.trim());
                                if (!isNaN(parsedPrice)) {
                                    // Llama a addExtraEntry (asegúrate que use 'extrasContainer')
                                    addExtraEntry(name.trim(), parsedPrice);
                                } else {
                                     console.warn(`Precio de extra inválido en '${pair}' para producto ID ${productId}`);
                                }
                            }
                        } else {
                            console.warn(`Par de extra inválido o vacío: "${pair}"`);
                        }
                    });
                }
                hideLoader();
            } catch (error) {
                 console.error("Error al poblar el formulario de edición:", error);
                 alert("Ocurrió un error al cargar los datos del producto.");
                 hideLoader();
                 return; // No mostrar modal si falla el llenado
            }

        } else {
            console.error(`Producto con ID ${productId} no encontrado en 'currentProducts'.`);
            alert("Error: No se pudieron cargar los datos del producto para editar. Intenta recargar la lista.");
            hideLoader();
            return; // Salir si no se encontró el producto
        }

    } else {
        // --- MODO AÑADIR NUEVO ---
        console.log("Opening modal in ADD mode");
        modalTitle.textContent = "Añadir Nuevo Producto/Variante";
        productIdInput.value = ""; // Asegurar ID vacío
        // Limpiar límite de extras (ya hecho por resetAdminModal)
        if(extrasLimitInput) extrasLimitInput.value = '';
        // La fila de tamaño/precio ya fue añadida arriba
        // El contenedor de extras ya fue limpiado arriba
        // Implementar listener para sugerencias si se desea
        if (productNameInput) {
             productNameInput.oninput = () => { /* ... tu lógica de sugerencias ... */ };
        }

    }

    // --- Mostrar el Modal y Reemplazar Iconos ---
    // Se ejecuta al final, tanto en modo añadir como en modo edición (si no hubo errores)
    adminProductModal.style.display = 'block';
    try {
        feather.replace(); // Re-renderizar iconos (ej: en botones de borrar extras)
    } catch (fe) {
        console.warn("Feather icons error on replace:", fe);
    }
}

function addSizePriceEntry(size = '', price = '') {
    // const sizesContainer = document.getElementById('adminSizesPricesContainer'); // O usa la variable global
    if (!adminSizesPricesContainer) return; // Salir si el contenedor no existe
    const entryDiv = document.createElement('div');
    entryDiv.className = 'size-price-entry form-inline-group';
    entryDiv.innerHTML = `
        <input type="text" name="productSize[]" placeholder="Tamaño (ej. Regular)" value="${size}" style="flex-grow: 2; margin-right: 5px;">
        <input type="number" name="productPrice[]" placeholder="Precio" step="0.01" value="${price}" style="flex-grow: 1; margin-right: 5px;">
        <button type="button" class="delete-btn-inline" onclick="removeEntry(this)">X</button>
    `;
    adminSizesPricesContainer.appendChild(entryDiv);
}

function addExtraEntry(name = '', price = '') {
    // const extrasContainer = document.getElementById('adminExtrasContainer'); // O usa la variable global
    if (!adminExtrasContainer) return; // Salir si el contenedor no existe
    console.log(`Inside addExtraEntry - Adding: ${name}, ${price}`);
    const entryDiv = document.createElement('div');
    entryDiv.className = 'extra-entry form-inline-group';
    entryDiv.innerHTML = `
        <input type="text" name="extraName[]" placeholder="Nombre Extra" value="${name}" style="flex-grow: 2; margin-right: 5px;">
        <input type="number" name="extraPrice[]" placeholder="Precio Extra" step="0.01" value="${price}" style="flex-grow: 1; margin-right: 5px;">
        <button type="button" class="delete-btn-inline" onclick="removeEntry(this)">X</button>
    `;
    adminExtrasContainer.appendChild(entryDiv);
}

// (Recuerda tener también la función removeEntry definida)
function removeEntry(button) {
    button.closest('.form-inline-group')?.remove();
}

function closeAdminProductModal() {
    adminProductModal.style.display = 'none';
}

// --- Funciones de Guardado y Eliminación (Simulación API) ---

/**
 * Recolecta los datos del formulario del modal de producto.
 * @returns {object} Un objeto con los datos del producto listos para enviar.
 */
function collectFormData() {
    const formData = new FormData(adminProductForm); // Usa el formulario global
    const data = {};

    // ID es crucial para distinguir entre crear y actualizar
    // Si adminProductId.value está vacío, data.id será undefined
    data.id = adminProductId.value || undefined;

    // Campos estándar, usando null si están vacíos
    data.Nombre = formData.get('adminProductName')?.trim() || null;
    data.Descripción = formData.get('adminProductDescription')?.trim() || null;
    data.Categoría = formData.get('adminProductCategory')?.trim() || null;
    data.Imagen = formData.get('adminProductImage')?.trim() || null;
    data.Estado = formData.get('adminProductStatus')      || 'Activo';

    // --- Manejo de Tamaño/Precio (Para una sola fila) ---
    const sizes = formData.getAll('productSize[]'); // Obtiene todos los inputs con name="productSize[]"
    const prices = formData.getAll('productPrice[]'); // Obtiene todos los inputs con name="productPrice[]"
    // Tomamos solo la primera entrada válida
    data.Tamaño = sizes.length > 0 ? (sizes[0].trim() || null) : null; // null si está vacío
    // Intentar parsear el precio, null si no es un número válido
    data.Precio = prices.length > 0 ? (parseFloat(prices[0]) || null) : null;


    // --- Manejo de Limite de Extras ---
    // Asegúrate de que el ID 'adminProductExtrasLimit' exista en tu HTML
    const extrasLimitInput = document.getElementById('adminProductExtrasLimit');
    // Intenta parsear como entero, usa null si está vacío o no es número válido
    const parsedLimit = extrasLimitInput ? parseInt(extrasLimitInput.value, 10) : NaN;
    // Usa el nombre exacto de la columna en Supabase, incluyendo espacios si los tiene
    data['Limite de Extras'] = !isNaN(parsedLimit) ? parsedLimit : null;


    // --- Manejo de Extras (Formato "Nombre:Precio,Nombre:Precio") ---
    const extraNames = formData.getAll('extraName[]');
    const extraPrices = formData.getAll('extraPrice[]');
    const extrasArray = [];
    for (let i = 0; i < extraNames.length; i++) {
        const name = extraNames[i].trim();
        const price = parseFloat(extraPrices[i]);
        // Solo añadir si el nombre no está vacío y el precio es un número válido
        if (name && !isNaN(price)) {
            // Limpiar nombre por seguridad (quita ':' y ',')
            const cleanName = name.replace(/[:|,]/g, '');
            extrasArray.push(`${cleanName}:${price.toFixed(2)}`); // Guardar precio con 2 decimales
        }
    }
    // Guardar como string o null si no hay extras válidos
    data.Extras = extrasArray.length > 0 ? extrasArray.join(',') : null;

    console.log("Datos recolectados para enviar:", data);
    return data;
}


async function handleAdminFormSubmit(event) {
    event.preventDefault();                         // Evita envío normal
    const productData = collectFormData();          // Datos del formulario

    /* Validaciones básicas ------------------------------------------------ */
    if (!productData.Nombre || !productData.Categoría) {
        alert("Por favor, completa los campos Nombre y Categoría.");
        return;
    }
    if (productData.Tamaño && productData.Precio === null) {
        alert("Si especificas un tamaño, ingresa un precio numérico válido.");
        return;
    }

    showLoader();
    try {
        const headers = { "Content-Type": "application/json" };
        const payload = { ...productData };         // Copia mutable

        /* Crear o actualizar según exista ID --------------------------------- */
        const response = await fetch('/api/admin-products', {
            method: productData.id ? 'PATCH' : 'POST',
            headers,
            body: JSON.stringify(payload)           // Incluye id en PATCH
        });

        if (!response.ok) {
            const err = await response
                .json()
                .catch(() => ({ message: response.statusText }));
            throw new Error(
                `Error ${response.status}: ${err.message || response.statusText}`
            );
        }

        const result = await response.json();
        console.log("Producto guardado:", result);
        alert(`Producto ${productData.id ? 'actualizado' : 'creado'} exitosamente.`);
        closeAdminProductModal();                   // Cierra modal
        fetchAndRenderAdminProducts();              // Refresca lista
    } catch (error) {
        console.error("Error al guardar:", error);
        alert(`Error al guardar el producto: ${error.message}`);
    } finally {
        hideLoader();
    }
}


function confirmDeleteProduct(productId, productName) {
    if (!productId) {
        console.error("ID de producto inválido para eliminar.");
        return;
    }
    productNameToDelete.textContent = productName || `Producto ID ${productId}`;
    deleteProductId.value = productId;
    confirmDeleteModal.style.display = 'block';
}

function closeConfirmDeleteModal() {
    confirmDeleteModal.style.display = 'none';
}

async function handleDeleteConfirmation() {
    const productId = deleteProductId.value;
    if (!productId) return;

    showLoader();
    closeConfirmDeleteModal();

    try {
        const response = await fetch(`/api/admin-products?id=${productId}`, {
            method: 'DELETE'
        });

        if (!response.ok && response.status !== 204) {
            const text = await response.text();
            throw new Error(
                `Error ${response.status}: ${text || response.statusText}`
            );
        }

        alert("Producto eliminado exitosamente.");
        fetchAndRenderAdminProducts();              // Refresca lista
    } catch (error) {
        console.error("Error al eliminar:", error);
        alert(`Error al eliminar producto: ${error.message}`);
    } finally {
        hideLoader();
    }
}


// admin-script.js

// ... (Definición de constantes SUPABASE_URL, SUPABASE_KEY) ...
// ... (Todas las referencias a elementos del DOM actualizadas) ...
// ... (Definición de variables globales como currentProducts) ...
// ... (Definición de todas tus funciones: showLoader, hideLoader, showView,
//      loadProductManagementView, loadOrderManagementView, logout,
//      fetchProductsAdmin, renderAdminProducts, populateCategoryFilter,
//      filterProductsByCategory, resetAdminModal, addSizePriceEntry,
//      addExtraEntry, removeEntry, openAdminProductModal, collectFormData,
//      handleAdminFormSubmit, confirmDeleteProduct, closeConfirmDeleteModal,
//      handleDeleteConfirmation, toggleMenu - si la defines aquí) ...


// --- Inicialización del Script y Event Listeners Principales ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM completamente cargado y parseado.");

    // --- Asignación de Listeners a Botones y Controles Principales ---

    // Botón "Añadir Nuevo Producto"
    if (addNewProductBtn) {
        addNewProductBtn.addEventListener('click', () => {
            console.log("Botón 'Añadir Nuevo Producto' clickeado.");
            // Llama a la función para abrir el modal en modo "añadir" (sin ID)
            openAdminProductModal();
        });
    } else {
        console.error("Error: Botón 'addNewProductBtn' no encontrado.");
    }

    // Formulario del Modal de Producto (para Crear/Actualizar)
    if (adminProductForm) {
        adminProductForm.addEventListener('submit', handleAdminFormSubmit);
    } else {
        console.error("Error: Formulario 'adminProductForm' no encontrado.");
    }

    // Botón Final de Confirmación de Eliminación
    if (confirmDeleteProductBtnFinal) {
        confirmDeleteProductBtnFinal.addEventListener('click', handleDeleteConfirmation);
    } else {
        console.error("Error: Botón 'confirmDeleteProductBtnFinal' no encontrado.");
    }

    // Filtro de Categoría
    if (categoryFilterSelect) {
        categoryFilterSelect.addEventListener('change', filterProductsByCategory);
    } else {
        console.warn("Advertencia: Filtro de categoría 'categoryFilterSelect' no encontrado.");
    }

    // --- Asignación de Listeners para Navegación (Menú Lateral) ---
    // (Asumiendo que los enlaces tienen el atributo data-view o se identifican de otra forma)
    const adminNavLinksContainer = document.getElementById('adminNavLinks');
    if (adminNavLinksContainer) {
        // Listener delegado para los enlaces de navegación
        adminNavLinksContainer.addEventListener('click', (event) => {
            const link = event.target.closest('a'); // Encuentra el enlace 'a' clickeado
            if (!link) return; // Salir si no se hizo clic en un enlace

            const viewId = link.dataset.view; // Obtener el ID de la vista desde data-view
            const logoutBtn = document.getElementById('logoutButton'); // Referencia al botón/enlace de logout

            if (viewId) {
                event.preventDefault(); // Prevenir navegación normal
                console.log(`Navegando a la vista: ${viewId}`);
                if (viewId === 'productManagementView') {
                    loadProductManagementView();
                } else if (viewId === 'orderManagementView') {
                    loadOrderManagementView();
                }
                // Añadir más vistas si es necesario
                // Marcar enlace activo (opcional)
                adminNavLinksContainer.querySelectorAll('a').forEach(a => a.classList.remove('active'));
                link.classList.add('active');
                toggleMenu(); // Cerrar menú después de seleccionar
            } else if (link === logoutBtn || link.id === 'logoutButton') {
                 event.preventDefault(); // Prevenir navegación normal
                 console.log("Botón/Enlace 'Cerrar Sesión' clickeado.");
                 logout(); // Llamar a la función de logout
                 toggleMenu(); // Cerrar menú
            }
        });
    } else {
         console.warn("Advertencia: Contenedor de enlaces de admin 'adminNavLinks' no encontrado.");
    }


    // --- Inicialización de la Aplicación ---

    // Cargar la vista inicial (Gestión de Productos)
    // Asegúrate que loadProductManagementView llama a fetchAndRenderAdminProducts
    loadProductManagementView();

    // Marcar el enlace inicial como activo (opcional)
    const initialLink = document.querySelector('#adminNavLinks a[data-view="productManagementView"]');
    if(initialLink) initialLink.classList.add('active');


    // Inicializar Feather Icons
    try {
        feather.replace();
        console.log("Feather icons reemplazados.");
    } catch(e) {
        console.error("Error al inicializar Feather icons:", e);
    }

    // --- Hacer Funciones Globales (si son llamadas desde HTML inline onclick) ---
    // Es mejor práctica usar addEventListener como se hizo arriba, pero si
    // todavía tienes onclick="closeAdminProductModal()" etc., necesitas esto:

    window.closeAdminProductModal = closeAdminProductModal; // Asumiendo que closeAdminProductModal está definida
    window.addSizePriceEntry = addSizePriceEntry;
    window.addExtraEntry = addExtraEntry;
    window.removeEntry = removeEntry;
    window.confirmDeleteProduct = confirmDeleteProduct; // Asumiendo que confirmDeleteProduct está definida
    window.closeConfirmDeleteModal = closeConfirmDeleteModal; // Asumiendo que closeConfirmDeleteModal está definida
     // Ya no necesitas hacer globales openAdminProductModal, handleAdminFormSubmit, handleDeleteConfirmation
     // si se llaman mediante addEventListener.
     // Tampoco loadProductManagementView, loadOrderManagementView, logout si se llaman desde el listener delegado.

    console.log("Script de administración inicializado.");
});
