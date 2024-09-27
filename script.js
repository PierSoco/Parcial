document.addEventListener("DOMContentLoaded", () => {
    const sections = {
        clientes: document.getElementById('section-clientes'),
        productos: document.getElementById('section-productos'),
        ventas: document.getElementById('section-ventas')
    };

    let data = {
        clientes: [],
        productos: [],
        ventas: []
    };

    let previousData = {
        clientes: [],
        productos: [],
        ventas: []
    };

    let idCounterClientes = 1;
    let idCounterProductos = 1;
    let idCounterVentas = 1;

    let currentOpenForm = null;
    let currentOpenAction = null;

    window.openSection = function(section) {
        document.querySelectorAll('.section').forEach(function(sec) {
            sec.classList.add('d-none');
        });
        
        const selectedSection = document.getElementById(`section-${section}`);
        if (selectedSection) {
            selectedSection.classList.remove('d-none');
        }
        
        document.getElementById('main-menu').classList.add('d-none');
    }

    window.goBack = function() {
        document.querySelectorAll('.section').forEach(function(sec) {
            sec.classList.add('d-none');
        });
        
        document.getElementById('main-menu').classList.remove('d-none');
    
        document.querySelectorAll('.form-container').forEach(function(form) {
            form.classList.remove('active');
        });
    
        document.querySelectorAll('.dashboard-container').forEach(function(dashboard) {
            dashboard.classList.remove('active');
        });
    
        currentOpenForm = null;
    }

    window.showForm = function (section, action) {
        const formContainer = document.getElementById(`form-container-${section}`);
        const dashboardContainer = document.querySelector(`#section-${section} .dashboard-container`);

        // Si se toca el mismo botón del formulario abierto, cerrar el formulario
        if (currentOpenForm === formContainer && currentOpenAction === action) {
            formContainer.classList.remove('active');
            if (window.innerWidth > 768) {
                dashboardContainer.classList.remove('active');
            }
            currentOpenForm = null;
            currentOpenAction = null;
            return;
        }

        // Ocultar el formulario actual si existe
        if (currentOpenForm) {
            currentOpenForm.classList.remove('active');
            const currentDashboard = currentOpenForm.closest('.section').querySelector('.dashboard-container');
            if (currentDashboard && window.innerWidth > 768) {
                currentDashboard.classList.remove('active');
            }
        }

        // Limpiar y actualizar el contenido del formulario
        formContainer.innerHTML = '';
        let formHtml = '';

        switch (action) {
            case 'load':
                formHtml = generateForm(section);
                break;
            case 'consult':
                formHtml = `<h3>Consultar ${capitalize(section)}</h3>
                            <div id="consult-result-${section}"></div>`;
                setTimeout(() => consultData(section), 0);
                break;
            case 'search':
                formHtml = `<h3>Buscar ${capitalize(section)}</h3>
                            <input type="text" id="search-${section}" placeholder="Buscar ${capitalize(section)}">
                            <button onclick="searchData('${section}')">Buscar</button>
                            <div id="search-result-${section}"></div>`;
                break;
            case 'modify':
                formHtml = `<h3>Modificar ${capitalize(section)}</h3>
                            <input type="number" id="modify-id-${section}" placeholder="ID a modificar">
                            ${generateForm(section, true)}
                            <button onclick="modifyData('${section}')">Modificar</button>`;
                break;
            case 'delete':
                formHtml = `<h3>Eliminar ${capitalize(section)}</h3>
                            <input type="number" id="delete-id-${section}" placeholder="ID a eliminar">
                            <button onclick="deleteData('${section}')">Eliminar</button>`;
                break;
            case 'undo':
                formHtml = `<h3>Deshacer última acción</h3>
                            <button onclick="undoAction('${section}')">Deshacer</button>`;
                break;
        }            
        formContainer.innerHTML = formHtml;

        // Mostrar el nuevo formulario
        formContainer.classList.add('active');
        if (window.innerWidth > 768) {
            dashboardContainer.classList.add('active');
        }

        // Actualizar el formulario actual y la acción actual
        currentOpenForm = formContainer;
        currentOpenAction = action;
    };

    function generateForm(section, isModify = false) {
        if (section === 'clientes') {
            return `<h3> Clientes </h3>
                <input type="text" id="${section}-nombre" placeholder="Nombre">
                <input type="text" id="${section}-apellido" placeholder="Apellido">
                <input type="text" id="${section}-direccion" placeholder="Dirección">
                <input type="text" id="${section}-localidad" placeholder="Localidad">
                ${isModify ? '' : `<button onclick="saveData('${section}')">Guardar</button>`}`;
        } else if (section === 'productos') {
            return `<h3> Productos </h3>
                <input type="text" id="${section}-nombre" placeholder="Nombre del producto">
                <input type="text" id="${section}-descripcion" placeholder="Descripción">
                <input type="date" id="${section}-vencimiento" placeholder="Fecha de Vencimiento">
                <input type="number" id="${section}-precio" placeholder="Precio">
                ${isModify ? '' : `<button onclick="saveData('${section}')">Guardar</button>`}`;
        } else if (section === 'ventas') {
            return `<h3> Ventas </h3>
                <select id="venta-cliente">${generateOptions('clientes')}</select>
                <select id="venta-producto">${generateOptions('productos')}</select>
                <input type="number" id="venta-cantidad" placeholder="Cantidad">
                ${isModify ? '' : `<button onclick="saveData('ventas')">Guardar</button>`}`;
        }
    }

    function generateOptions(section) {
        return data[section].map((item, index) => `<option value="${index}">${item.nombre}</option>`).join('');
    }

    window.consultData = function (section) {
        const resultContainer = document.getElementById(`consult-result-${section}`);
        let tableHtml = `<table class="custom-table">
                            <thead>
                                <tr>${generateTableHeaders(section)}</tr>
                            </thead>
                            <tbody>`;
    
        data[section].forEach((item) => {
            tableHtml += `<tr>${generateTableRows(item, section)}</tr>`;
        });
    
        tableHtml += `</tbody></table>`;
        resultContainer.innerHTML = tableHtml;
    };
    
    function generateTableHeaders(section) {
        switch (section) {
            case 'clientes':
                return '<th>ID</th><th>Nombre</th><th>Apellido</th><th>Dirección</th><th>Localidad</th>';
            case 'productos':
                return '<th>ID</th><th>Nombre</th><th>Descripción</th><th>Fecha de Vencimiento</th><th>Precio</th>';
            case 'ventas':
                return '<th>ID</th><th>Cliente</th><th>Producto</th><th>Cantidad</th><th>Total</th>';
            default:
                return '';
        }
    }
    
    function generateTableRows(item, section) {
        switch (section) {
            case 'clientes':
                return `<td>${item.id}</td><td>${item.nombre}</td><td>${item.apellido}</td><td>${item.direccion}</td><td>${item.localidad}</td>`;
            case 'productos':
                return `<td>${item.id}</td><td>${item.nombre}</td><td>${item.descripcion}</td><td>${item.vencimiento}</td><td>$${item.precio.toFixed(2)}</td>`;
            case 'ventas':
                return `<td>${item.id}</td><td>${item.cliente.nombre} ${item.cliente.apellido}</td><td>${item.producto.nombre}</td><td>${item.cantidad}</td><td>$${item.total.toFixed(2)}</td>`;
            default:
                return '';
        }
    }

    window.searchData = function (section) {
        const searchQuery = document.getElementById(`search-${section}`).value.trim().toLowerCase();
        const resultContainer = document.getElementById(`search-result-${section}`);
    
        let filteredData = data[section].filter(item => 
            Object.values(item).some(val => 
                val.toString().toLowerCase().includes(searchQuery)
            )
        );
    
        let tableHtml = `<table class="custom-table">
                            <thead>
                                <tr>${generateTableHeaders(section)}</tr>
                            </thead>
                            <tbody>`;
    
        filteredData.forEach((item) => {
            tableHtml += `<tr>${generateTableRows(item, section)}</tr>`;
        });
    
        tableHtml += `</tbody></table>`;
        resultContainer.innerHTML = tableHtml;

        // Activar la animación del formulario
        setTimeout(() => {
            formContainer.classList.add('active');
        }, 50);
    };

    window.modifyData = function (section) {
        const id = document.getElementById(`modify-id-${section}`).value;

        const itemIndex = data[section].findIndex(item => item.id === parseInt(id));
        if (itemIndex === -1) {
            alert("ID no encontrado");
            return;
        }

        const modifiedData = { ...data[section][itemIndex] };
        if (section === 'clientes') {
            modifiedData.nombre = document.getElementById('clientes-nombre').value || modifiedData.nombre;
            modifiedData.apellido = document.getElementById('clientes-apellido').value || modifiedData.apellido;
            modifiedData.direccion = document.getElementById('clientes-direccion').value || modifiedData.direccion;
            modifiedData.localidad = document.getElementById('clientes-localidad').value || modifiedData.localidad;
        } else if (section === 'productos') {
            modifiedData.nombre = document.getElementById('productos-nombre').value || modifiedData.nombre;
            modifiedData.descripcion = document.getElementById('productos-descripcion').value || modifiedData.descripcion;
            modifiedData.vencimiento = document.getElementById('productos-vencimiento').value || modifiedData.vencimiento;
            modifiedData.precio = document.getElementById('productos-precio').value || modifiedData.precio;
        } else if (section === 'ventas') {
            const clienteIndex = document.getElementById('venta-cliente').value;
            const productoIndex = document.getElementById('venta-producto').value;
            modifiedData.cliente = data.clientes[clienteIndex] || modifiedData.cliente;
            modifiedData.producto = data.productos[productoIndex] || modifiedData.producto;
            modifiedData.cantidad = document.getElementById('venta-cantidad').value || modifiedData.cantidad;
            modifiedData.total = modifiedData.cantidad * modifiedData.producto.precio || modifiedData.total;
        }

        previousData[section] = [...data[section]];

        data[section][itemIndex] = modifiedData;

        alert(`${capitalize(section.slice(0, -1))} modificado exitosamente`);    
    };

    window.deleteData = function (section) {
        const id = document.getElementById(`delete-id-${section}`).value;

        const itemIndex = data[section].findIndex(item => item.id === parseInt(id));
        if (itemIndex === -1) {
            alert("ID no encontrado");
            return;
        }

        previousData[section] = [...data[section]];

        data[section].splice(itemIndex, 1);

        alert(`${capitalize(section.slice(0, -1))} eliminado exitosamente`);    
    };

    window.undoAction = function (section) {
        if (previousData[section].length === 0) {
            alert("No hay acciones para deshacer");
            return;
        }

        data[section] = [...previousData[section]];

        alert(`Última acción deshecha`);   
    };

    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    function showErrorMessage(inputId, message) {
        const inputElement = document.getElementById(inputId);
        inputElement.classList.add('error');
        
        let errorMessageElement = document.getElementById(`${inputId}-error`);
        
        if (!errorMessageElement) {
            errorMessageElement = document.createElement('div');
            errorMessageElement.id = `${inputId}-error`;
            errorMessageElement.classList.add('error-message');
            inputElement.insertAdjacentElement('afterend', errorMessageElement);
        }
        
        errorMessageElement.textContent = message;
        errorMessageElement.style.display = 'block';    
    }
    
    function hideErrorMessage(inputId) {
        const inputElement = document.getElementById(inputId);
        inputElement.classList.remove('error');
        
        const errorMessageElement = document.getElementById(`${inputId}-error`);
        if (errorMessageElement) {
            errorMessageElement.style.display = 'none';
        }    
    }
    
    function isValidName(name) {
        const regex = /^[a-zA-Z\s]+$/; // Solo permite letras y espacios
        return regex.test(name);    }
    
    window.saveData = function (section) {
        const newData = {};
        let hasError = false;
    
        if (section === 'clientes') {
            const nombre = document.getElementById('clientes-nombre').value.trim();
            const apellido = document.getElementById('clientes-apellido').value.trim();
            const direccion = document.getElementById('clientes-direccion').value.trim();
            const localidad = document.getElementById('clientes-localidad').value.trim();
    
            // Validación de nombre
            if (!isValidName(nombre)) {
                showErrorMessage('clientes-nombre', 'El nombre no puede contener números ni caracteres especiales.');
                hasError = true;
            } else if (!nombre) {
                showErrorMessage('clientes-nombre', 'El campo de nombre no puede estar vacío.');
                hasError = true;
            } else {
                hideErrorMessage('clientes-nombre');
            }
    
            // Validación de apellido
            if (!isValidName(apellido)) {
                showErrorMessage('clientes-apellido', 'El apellido no puede contener números ni caracteres especiales.');
                hasError = true;
            } else if (!apellido) {
                showErrorMessage('clientes-apellido', 'El campo de apellido no puede estar vacío.');
                hasError = true;
            } else {
                hideErrorMessage('clientes-apellido');
            }
    
            // Validación de dirección
            if (!direccion) {
                showErrorMessage('clientes-direccion', 'El campo de dirección no puede estar vacío.');
                hasError = true;
            } else {
                hideErrorMessage('clientes-direccion');
            }
    
            // Validación de localidad
            if (!localidad) {
                showErrorMessage('clientes-localidad', 'El campo de localidad no puede estar vacío.');
                hasError = true;
            } else {
                hideErrorMessage('clientes-localidad');
            }
    
            if (hasError) return;
    
            newData.id = idCounterClientes++;
            newData.nombre = nombre;
            newData.apellido = apellido;
            newData.direccion = direccion;
            newData.localidad = localidad;

            const nombreHTML = document.getElementById('clientes-nombre')
            const apellidoHTML = document.getElementById('clientes-apellido')
            const direccionHTML = document.getElementById('clientes-direccion')
            const localidadHTML = document.getElementById('clientes-localidad')

            nombreHTML.value = '';
            apellidoHTML.value = '';
            direccionHTML.value = '';
            localidadHTML.value = '';
        }
    
        if (section === 'productos') {
            const nombreProducto = document.getElementById('productos-nombre').value.trim();
            const descripcion = document.getElementById('productos-descripcion').value.trim();
            const vencimiento = document.getElementById('productos-vencimiento').value.trim();
            const precio = document.getElementById('productos-precio').value.trim();
    
            if (!nombreProducto) {
                showErrorMessage('productos-nombre', 'El nombre del producto no puede estar vacío.');
                hasError = true;
            } else {
                hideErrorMessage('productos-nombre');
            }
    
            if (!descripcion) {
                showErrorMessage('productos-descripcion', 'El campo de descripción no puede estar vacío.');
                hasError = true;
            } else {
                hideErrorMessage('productos-descripcion');
            }
    
            if (!vencimiento) {
                showErrorMessage('productos-vencimiento', 'El campo de vencimiento no puede estar vacío.');
                hasError = true;
            } else {
                hideErrorMessage('productos-vencimiento');
            }
    
            if (!precio) {
                showErrorMessage('productos-precio', 'El campo de precio no puede estar vacío.');
                hasError = true;
            } else {
                hideErrorMessage('productos-precio');
            }
    
            if (hasError) return;
    
            newData.id = idCounterProductos++;
            newData.nombre = nombreProducto;
            newData.descripcion = descripcion;
            newData.vencimiento = vencimiento;
            newData.precio = parseFloat(precio);

            const nombreProductoHTML = document.getElementById('productos-nombre')
            const descripcionHTML = document.getElementById('productos-descripcion')
            const vencimientoHTML = document.getElementById('productos-vencimiento')
            const precioHTML = document.getElementById('productos-precio')

            nombreProductoHTML.value = ''
            descripcionHTML.value = ''
            vencimientoHTML.value = ''
            precioHTML.value = ''
        }
    
        if (section === 'ventas') {
            const clienteIndex = document.getElementById('venta-cliente').value;
            const productoIndex = document.getElementById('venta-producto').value;
            const cantidad = document.getElementById('venta-cantidad').value.trim();
    
            if (!clienteIndex) {
                showErrorMessage('venta-cliente', 'Debe seleccionar un cliente.');
                hasError = true;
            } else {
                hideErrorMessage('venta-cliente');
            }
    
            if (!productoIndex) {
                showErrorMessage('venta-producto', 'Debe seleccionar un producto.');
                hasError = true;
            } else {
                hideErrorMessage('venta-producto');
            }
    
            if (!cantidad || parseInt(cantidad) <= 0) {
                showErrorMessage('venta-cantidad', 'La cantidad debe ser mayor que 0.');
                hasError = true;
            } else {
                hideErrorMessage('venta-cantidad');
            }
    
            if (hasError) return;
    
            const cliente = data.clientes[clienteIndex];
            const producto = data.productos[productoIndex];
    
            newData.id = idCounterVentas++;
            newData.cliente = cliente;
            newData.producto = producto;
            newData.cantidad = parseInt(cantidad);
            newData.total = newData.cantidad * producto.precio;

            const clienteIndexHTML = document.getElementById('venta-cliente')
            const productoIndexHTML = document.getElementById('venta-producto')
            const cantidadHTML = document.getElementById('venta-cantidad')

            clienteIndexHTML.value = ''
            productoIndexHTML.value = ''
            cantidadHTML.value = ''
        }
    
        // Si no hay errores, guardar los datos
        previousData[section] = [...data[section]];
        data[section].push(newData);
        alert(`${capitalize(section.slice(0, -1))} guardado exitosamente`);
    };

    // Agregar event listeners para los botones de "Volver al Menú"
    document.querySelectorAll('.btn-primary[onclick="goBack()"]').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            goBack();
        });
    });
});
