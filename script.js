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

    // Contadores de ID que comienzan en 1
    let idCounterClientes = 1;
    let idCounterProductos = 1;
    let idCounterVentas = 1;

    // Función para abrir la sección seleccionada
    window.openSection = function(section) {
        // Ocultar todas las secciones primero
        document.querySelectorAll('.section').forEach(function(sec) {
            sec.classList.add('d-none');
        });
        
        // Mostrar la sección seleccionada
        const selectedSection = document.getElementById(`section-${section}`);
        if (selectedSection) {
            selectedSection.classList.remove('d-none');
        }
        
        // Ocultar el menú principal
        document.getElementById('main-menu').classList.add('d-none');
    }

    // Función para volver al menú principal
    window.goBack = function() {
        // Ocultar todas las secciones
        document.querySelectorAll('.section').forEach(function(sec) {
            sec.classList.add('d-none');
        });
        
        // Mostrar el menú principal
        document.getElementById('main-menu').classList.remove('d-none');
    
        // Ocultar todos los formularios
        document.querySelectorAll('.form-container').forEach(function(form) {
            form.classList.remove('active');
        });
    
        // Quitar la clase para mover el dashboard
        document.querySelector('.dashboard-container').classList.remove('move-left');
    }
    

    // Función para mostrar los formularios
    window.showForm = function (section, action) {
        const formContainer = document.getElementById(`form-container-${section}`);
        const dashboardContainer = document.querySelector('.dashboard-container');
    
        // Verificar si el formulario ya está visible
        if (formContainer.classList.contains('active')) {
            // Ocultar el formulario
            formContainer.classList.remove('active');
            // Remover la clase active del dashboardContainer solo si no es móvil
            if (window.innerWidth > 768) {
                dashboardContainer.classList.remove('active');
            }
        } else {
            // Limpiar el contenido del formulario
            formContainer.innerHTML = '';
    
            let formHtml = '';
            switch (action) {
                case 'load':
                    formHtml = generateForm(section);
                    break;
                case 'consult':
                    consultData(section);
                    return;
                case 'search':
                    formHtml = `<input type="text" id="search-${section}" placeholder="Buscar ${capitalize(section)}">
                                <button onclick="searchData('${section}')">Buscar</button>`;
                    break;
                case 'modify':
                    formHtml = `<input type="number" id="modify-id-${section}" placeholder="ID a modificar">
                                ${generateForm(section, true)}
                                <button onclick="modifyData('${section}')">Modificar</button>`;
                    break;
                case 'delete':
                    formHtml = `<input type="number" id="delete-id-${section}" placeholder="ID a eliminar">
                                <button onclick="deleteData('${section}')">Eliminar</button>`;
                    break;
                case 'undo':
                    undoAction(section);
                    return;
            }            
            formContainer.innerHTML = formHtml;
    
            // Activar la animación del formulario
            setTimeout(() => {
                formContainer.classList.add('active');
                
                // Mover el dashboard solo si no es móvil
                if (window.innerWidth > 768) {
                    dashboardContainer.classList.add('active');
                }
            }, 50);
        }
    };
    

    
    function generateForm(section, isModify = false) {
        if (section === 'clientes') {
            return `
                <h3>${isModify ? 'Modificar' : 'Cargar'} Cliente</h3>
                <input type="text" id="${section}-nombre" placeholder="Nombre">
                <input type="text" id="${section}-apellido" placeholder="Apellido">
                <input type="text" id="${section}-direccion" placeholder="Dirección">
                <input type="text" id="${section}-localidad" placeholder="Localidad">
                ${isModify ? '' : `<button onclick="saveData('${section}')">Guardar</button>`}`;
        } else if (section === 'productos') {
            return `
                <h3>${isModify ? 'Modificar' : 'Cargar'} Producto</h3>
                <input type="text" id="${section}-nombre" placeholder="Nombre del producto">
                <input type="text" id="${section}-descripcion" placeholder="Descripción">
                <input type="date" id="${section}-vencimiento" placeholder="Fecha de Vencimiento">
                <input type="number" id="${section}-precio" placeholder="Precio">
                ${isModify ? '' : `<button onclick="saveData('${section}')">Guardar</button>`}`;
        } else if (section === 'ventas') {
            return `
                <h3>${isModify ? 'Modificar' : 'Cargar'} Venta</h3>
                <select id="venta-cliente">${generateOptions('clientes')}</select>
                <select id="venta-producto">${generateOptions('productos')}</select>
                <input type="number" id="venta-cantidad" placeholder="Cantidad">
                ${isModify ? '' : `<button onclick="saveData('ventas')">Guardar</button>`}`;
        }
    }

    function generateOptions(section) {
        return data[section].map((item, index) => `<option value="${index}">${item.nombre}</option>`).join('');
    }

    // Función para consultar datos
    window.consultData = function (section) {
        const formContainer = document.getElementById(`form-container-${section}`);
        let tableHtml = `<table>
                            <thead>
                                <tr>${generateTableHeaders(section)}</tr>
                            </thead>
                            <tbody>`;

        data[section].forEach((item) => {
            tableHtml += `<tr>${generateTableRows(item, section)}</tr>`;
        });

        tableHtml += `</tbody></table>`;
        formContainer.innerHTML = tableHtml;

        // Activar la animación del formulario
        setTimeout(() => {
            formContainer.classList.add('active');
        }, 50);
    };

    function generateTableHeaders(section) {
        if (section === 'clientes') {
            return '<th>ID</th><th>Nombre</th><th>Apellido</th><th>Dirección</th><th>Localidad</th>';
        } else if (section === 'productos') {
            return '<th>ID</th><th>Nombre</th><th>Descripción</th><th>Fecha de Vencimiento</th><th>Precio</th>';
        } else if (section === 'ventas') {
            return '<th>ID</th><th>Cliente</th><th>Producto</th><th>Cantidad</th><th>Total</th>';
        }
    }

    function generateTableRows(item, section) {
        if (section === 'clientes') {
            return `<td>${item.id}</td><td>${item.nombre}</td><td>${item.apellido}</td><td>${item.direccion}</td><td>${item.localidad}</td>`;
        } else if (section === 'productos') {
            return `<td>${item.id}</td><td>${item.nombre}</td><td>${item.descripcion}</td><td>${item.vencimiento}</td><td>$${item.precio}</td>`;
        } else if (section === 'ventas') {
            return `<td>${item.id}</td><td>${item.cliente.nombre}</td><td>${item.producto.nombre}</td><td>${item.cantidad}</td><td>$${item.total}</td>`;
        }
    }

    // Función para buscar datos
    window.searchData = function (section) {
        const searchQuery = document.getElementById(`search-${section}`).value.trim();

        let filteredData;
        if (!isNaN(searchQuery) && searchQuery !== '') {
            // Si el valor es un número, busca solo por ID
            const id = parseInt(searchQuery);
            filteredData = data[section].filter(item => item.id === id);
        } else {
            // Si no es un número, busca en todos los campos
            filteredData = data[section].filter(item => {
                return Object.values(item).some(val => val.toString().toLowerCase().includes(searchQuery.toLowerCase()));
            });
        }

        const formContainer = document.getElementById(`form-container-${section}`);
        let tableHtml = `<table>
                            <thead>
                                <tr>${generateTableHeaders(section)}</tr>
                            </thead>
                            <tbody>`;

        filteredData.forEach((item) => {
            tableHtml += `<tr>${generateTableRows(item, section)}</tr>`;
        });

        tableHtml += `</tbody></table>`;
        formContainer.innerHTML = tableHtml;

        // Activar la animación del formulario
        setTimeout(() => {
            formContainer.classList.add('active');
        }, 50);
    };

    // Función para modificar datos
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

    // Función para eliminar datos
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

    // Mostrar mensaje de error debajo del campo
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
    
    // Ocultar el mensaje de error
    function hideErrorMessage(inputId) {
        const inputElement = document.getElementById(inputId);
        inputElement.classList.remove('error');
        
        const errorMessageElement = document.getElementById(`${inputId}-error`);
        if (errorMessageElement) {
            errorMessageElement.style.display = 'none';
        }
    }
    
    // Función para validar nombre y apellido
    function isValidName(name) {
        const regex = /^[a-zA-Z\s]+$/; // Solo permite letras y espacios
        return regex.test(name);
    }
    
    // Modificar la función para guardar los datos y marcar los errores
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
        }
    
        // Si no hay errores, guardar los datos
        previousData[section] = [...data[section]];
        data[section].push(newData);
        alert(`${capitalize(section.slice(0, -1))} guardado exitosamente`);
    };
});