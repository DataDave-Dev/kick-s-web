document.addEventListener("DOMContentLoaded", function () {
    const inputNombre = document.getElementById("filtroNombre");
    const selectMarca = document.getElementById("filtroMarca");
    const selectEstilo = document.getElementById("filtroEstilo");
    const selectCategoria = document.getElementById("filtroCategoria");
    const inputPrecioMin = document.getElementById("precioMin");
    const inputPrecioMax = document.getElementById("precioMax");
    const ordenarPor = document.getElementById("ordenarPor");
    const btnLimpiarFiltros = document.getElementById("limpiarFiltros");
    const numResultados = document.getElementById("numResultados");
    const toggleFiltros = document.getElementById("toggleFiltros");
    const filtrosContainer = document.getElementById("filtrosContainer");
    const productosGrid = document.getElementById("productosGrid");

    function filtrarProductos() {
        const nombre = inputNombre.value.toLowerCase();
        const marca = selectMarca.value;
        const estilo = selectEstilo.value;
        const categoria = selectCategoria.value;
        const precioMin = parseFloat(inputPrecioMin.value) || 0;
        const precioMax = parseFloat(inputPrecioMax.value) || Infinity;

        let contador = 0;
        let productosVisibles = [];

        const tarjetas = productosGrid.querySelectorAll("div[data-nombre]");

        tarjetas.forEach((tarjeta) => {
            const nombreProducto = tarjeta.getAttribute("data-nombre");
            const marcaProducto = tarjeta.getAttribute("data-marca");
            const estiloProducto = tarjeta.getAttribute("data-estilo");
            const categoriaProducto = tarjeta.getAttribute("data-categoria");
            const precioProducto = parseFloat(tarjeta.getAttribute("data-precio"));

            const coincideNombre = nombreProducto.toLowerCase().includes(nombre);
            const coincideMarca = !marca || marcaProducto === marca;
            const coincideEstilo = !estilo || estiloProducto === estilo;
            const coincideCategoria = !categoria || categoriaProducto === categoria;
            const coincidePrecio = precioProducto >= precioMin && precioProducto <= precioMax;

            if (coincideNombre && coincideMarca && coincideEstilo && coincideCategoria && coincidePrecio) {
                tarjeta.style.display = "block";
                contador++;
                productosVisibles.push(tarjeta);
            } else {
                tarjeta.style.display = "none";
            }
        });

        numResultados.textContent = contador;
        ordenarProductos(productosVisibles);
    }

    function ordenarProductos(productosVisibles) {
        const orden = ordenarPor.value;

        productosVisibles.sort((a, b) => {
            if (orden === "precioAsc") {
                return parseFloat(a.getAttribute("data-precio")) - parseFloat(b.getAttribute("data-precio"));
            } else if (orden === "precioDesc") {
                return parseFloat(b.getAttribute("data-precio")) - parseFloat(a.getAttribute("data-precio"));
            } else if (orden === "nombreAsc") {
                return a.getAttribute("data-nombre").localeCompare(b.getAttribute("data-nombre"));
            } else if (orden === "nombreDesc") {
                return b.getAttribute("data-nombre").localeCompare(a.getAttribute("data-nombre"));
            }
            return 0;
        });

        productosVisibles.forEach((producto) => {
            productosGrid.appendChild(producto);
        });
    }

    function limpiarFiltros() {
        inputNombre.value = "";
        selectMarca.value = "";
        selectEstilo.value = "";
        selectCategoria.value = "";
        inputPrecioMin.value = "";
        inputPrecioMax.value = "";
        ordenarPor.value = "relevancia";
        filtrarProductos();
    }

    function toggleFiltrosMovil() {
        const isHidden = filtrosContainer.classList.contains("hidden");

        if (isHidden) {
            filtrosContainer.classList.remove("hidden");
            toggleFiltros.querySelector("span").textContent = "Ocultar filtros";
        } else {
            filtrosContainer.classList.add("hidden");
            toggleFiltros.querySelector("span").textContent = "Mostrar filtros";
        }
    }

    inputNombre.addEventListener("input", filtrarProductos);
    selectMarca.addEventListener("change", filtrarProductos);
    selectEstilo.addEventListener("change", filtrarProductos);
    selectCategoria.addEventListener("change", filtrarProductos);
    inputPrecioMin.addEventListener("input", filtrarProductos);
    inputPrecioMax.addEventListener("input", filtrarProductos);
    ordenarPor.addEventListener("change", filtrarProductos);
    btnLimpiarFiltros.addEventListener("click", limpiarFiltros);
    toggleFiltros.addEventListener("click", toggleFiltrosMovil);

    filtrarProductos();
});
