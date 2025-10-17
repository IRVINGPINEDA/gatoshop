var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var GestorCarrito = /** @class */ (function () {
    function GestorCarrito() {
        this.productos = [];
        this.carrito = [];
        this.usuarios = [];
        this.usuarioActual = null;
        this.cargarDatosIniciales();
        this.inicializarPagina();
    }
    GestorCarrito.prototype.cargarDatosIniciales = function () {
        var usuariosGuardados = localStorage.getItem('usuarios');
        this.usuarios = usuariosGuardados ? JSON.parse(usuariosGuardados) : [];
        var sesionActual = localStorage.getItem('usuarioActual');
        this.usuarioActual = sesionActual ? JSON.parse(sesionActual) : null;
        var carritoGuardado = localStorage.getItem('carrito');
        this.carrito = carritoGuardado ? JSON.parse(carritoGuardado) : [];
    };
    GestorCarrito.prototype.inicializarPagina = function () {
        var pagina = window.location.pathname;
        this.actualizarBadgeCarrito();
        this.actualizarEnlaceAuth();
        if (pagina.includes('index.html') || pagina === '/') {
            this.cargarProductos();
        }
        else if (pagina.includes('cart.html')) {
            this.mostrarCarrito();
        }
        else if (pagina.includes('login.html')) {
            this.inicializarLogin();
        }
        else if (pagina.includes('register.html')) {
            this.inicializarRegistro();
        }
    };
    GestorCarrito.prototype.cargarProductos = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response, data, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, fetch('productos.json')];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        this.productos = data.productos;
                        this.renderizarProductos();
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        console.error('Error al cargar productos:', error_1);
                        this.mostrarNotificacion('Error al cargar los productos', 'error');
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    GestorCarrito.prototype.renderizarProductos = function () {
        var _this = this;
        var contenedor = document.getElementById('products-grid');
        if (!contenedor)
            return;
        contenedor.innerHTML = '';
        this.productos.forEach(function (producto) {
            var card = _this.crearTarjetaProducto(producto);
            contenedor.appendChild(card);
        });
    };
    GestorCarrito.prototype.crearTarjetaProducto = function (producto) {
        var card = document.createElement('div');
        card.className = 'product-card';
        var enCarrito = this.carrito.some(function (item) { return item.producto.id === producto.id; });
        var sinStock = producto.stock === 0;
        card.innerHTML = "\n            <img src=\"".concat(producto.imagen, "\" alt=\"").concat(producto.nombre, "\" class=\"product-image\">\n            <div class=\"product-info\">\n                <h3>").concat(producto.nombre, "</h3>\n                <p>").concat(producto.descripcion, "</p>\n                <div class=\"product-footer\">\n                    <span class=\"price\">$").concat(producto.precio.toFixed(2), "</span>\n                    <button \n                        class=\"btn-add\" \n                        ").concat(sinStock || enCarrito ? 'disabled' : '', "\n                        onclick=\"gestor.agregarAlCarrito(").concat(producto.id, ")\"\n                    >\n                        ").concat(sinStock ? 'Sin Stock' : enCarrito ? 'En Carrito' : 'Agregar', "\n                    </button>\n                </div>\n            </div>\n        ");
        return card;
    };
    GestorCarrito.prototype.agregarAlCarrito = function (idProducto) {
        var producto = this.productos.find(function (p) { return p.id === idProducto; });
        if (!producto)
            return;
        var itemExistente = this.carrito.find(function (item) { return item.producto.id === idProducto; });
        if (itemExistente) {
            if (itemExistente.cantidad < producto.stock) {
                itemExistente.cantidad++;
            }
            else {
                this.mostrarNotificacion('No hay más stock disponible', 'error');
                return;
            }
        }
        else {
            this.carrito.push({
                producto: producto,
                cantidad: 1
            });
        }
        this.guardarCarrito();
        this.actualizarBadgeCarrito();
        this.mostrarNotificacion("".concat(producto.nombre, " agregado al carrito"), 'success');
        this.renderizarProductos();
    };
    GestorCarrito.prototype.actualizarCantidad = function (idProducto, nuevaCantidad) {
        var item = this.carrito.find(function (item) { return item.producto.id === idProducto; });
        if (!item)
            return;
        if (nuevaCantidad <= 0) {
            this.eliminarDelCarrito(idProducto);
            return;
        }
        if (nuevaCantidad > item.producto.stock) {
            this.mostrarNotificacion('Cantidad excede el stock disponible', 'error');
            return;
        }
        item.cantidad = nuevaCantidad;
        this.guardarCarrito();
        this.mostrarCarrito();
    };
    GestorCarrito.prototype.eliminarDelCarrito = function (idProducto) {
        var index = this.carrito.findIndex(function (item) { return item.producto.id === idProducto; });
        if (index !== -1) {
            var nombreProducto = this.carrito[index].producto.nombre;
            this.carrito.splice(index, 1);
            this.guardarCarrito();
            this.actualizarBadgeCarrito();
            this.mostrarCarrito();
            this.mostrarNotificacion("".concat(nombreProducto, " eliminado del carrito"), 'success');
        }
    };
    GestorCarrito.prototype.mostrarCarrito = function () {
        var _this = this;
        var cartEmpty = document.getElementById('cart-empty');
        var cartContent = document.getElementById('cart-content');
        var cartItems = document.getElementById('cart-items');
        if (!cartEmpty || !cartContent || !cartItems)
            return;
        if (this.carrito.length === 0) {
            cartEmpty.style.display = 'block';
            cartContent.style.display = 'none';
            return;
        }
        cartEmpty.style.display = 'none';
        cartContent.style.display = 'grid';
        cartItems.innerHTML = '';
        this.carrito.forEach(function (item) {
            var itemElement = _this.crearElementoCarrito(item);
            cartItems.appendChild(itemElement);
        });
        this.actualizarResumenCarrito();
    };
    GestorCarrito.prototype.crearElementoCarrito = function (item) {
        var div = document.createElement('div');
        div.className = 'cart-item';
        var subtotal = item.producto.precio * item.cantidad;
        div.innerHTML = "\n            <img src=\"".concat(item.producto.imagen, "\" alt=\"").concat(item.producto.nombre, "\" class=\"cart-item-image\">\n            <div class=\"cart-item-info\">\n                <h3>").concat(item.producto.nombre, "</h3>\n                <p>").concat(item.producto.descripcion, "</p>\n                <div class=\"cart-item-actions\">\n                    <div class=\"quantity-controls\">\n                        <button onclick=\"gestor.actualizarCantidad(").concat(item.producto.id, ", ").concat(item.cantidad - 1, ")\">-</button>\n                        <span>").concat(item.cantidad, "</span>\n                        <button onclick=\"gestor.actualizarCantidad(").concat(item.producto.id, ", ").concat(item.cantidad + 1, ")\">+</button>\n                    </div>\n                    <button class=\"btn-remove\" onclick=\"gestor.eliminarDelCarrito(").concat(item.producto.id, ")\">Eliminar</button>\n                </div>\n            </div>\n            <div class=\"cart-item-price\">$").concat(subtotal.toFixed(2), "</div>\n        ");
        return div;
    };
    GestorCarrito.prototype.calcularResumen = function () {
        var subtotal = this.carrito.reduce(function (sum, item) {
            return sum + (item.producto.precio * item.cantidad);
        }, 0);
        var envio = subtotal > 500 ? 0 : 50;
        var iva = subtotal * 0.16;
        var total = subtotal + envio + iva;
        return { subtotal: subtotal, envio: envio, iva: iva, total: total };
    };
    GestorCarrito.prototype.actualizarResumenCarrito = function () {
        var resumen = this.calcularResumen();
        var subtotalEl = document.getElementById('subtotal');
        var shippingEl = document.getElementById('shipping');
        var taxEl = document.getElementById('tax');
        var totalEl = document.getElementById('total');
        if (subtotalEl)
            subtotalEl.textContent = "$".concat(resumen.subtotal.toFixed(2));
        if (shippingEl)
            shippingEl.textContent = resumen.envio === 0 ? 'GRATIS' : "$".concat(resumen.envio.toFixed(2));
        if (taxEl)
            taxEl.textContent = "$".concat(resumen.iva.toFixed(2));
        if (totalEl)
            totalEl.textContent = "$".concat(resumen.total.toFixed(2));
    };
    GestorCarrito.prototype.actualizarBadgeCarrito = function () {
        var badge = document.getElementById('cart-badge');
        if (badge) {
            var totalItems = this.carrito.reduce(function (sum, item) { return sum + item.cantidad; }, 0);
            badge.textContent = totalItems.toString();
        }
    };
    GestorCarrito.prototype.guardarCarrito = function () {
        localStorage.setItem('carrito', JSON.stringify(this.carrito));
    };
    GestorCarrito.prototype.finalizarCompra = function () {
        if (!this.usuarioActual) {
            this.mostrarNotificacion('Debes iniciar sesión para finalizar la compra', 'error');
            setTimeout(function () {
                window.location.href = 'login.html';
            }, 1500);
            return;
        }
        if (this.carrito.length === 0) {
            this.mostrarNotificacion('El carrito está vacío', 'error');
            return;
        }
        var resumen = this.calcularResumen();
        var confirmar = confirm("\u00BFConfirmar compra?\n\nTotal: $".concat(resumen.total.toFixed(2), "\n\nSe enviar\u00E1 a: ").concat(this.usuarioActual.email));
        if (confirmar) {
            this.carrito = [];
            this.guardarCarrito();
            this.actualizarBadgeCarrito();
            this.mostrarNotificacion('¡Compra realizada con éxito! Gracias por tu preferencia.', 'success');
            setTimeout(function () {
                window.location.href = 'index.html';
            }, 2000);
        }
    };
    GestorCarrito.prototype.inicializarLogin = function () {
        var _this = this;
        var form = document.getElementById('login-form');
        if (!form)
            return;
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            _this.procesarLogin(form);
        });
    };
    GestorCarrito.prototype.procesarLogin = function (form) {
        var email = form.querySelector('#email').value;
        var password = form.querySelector('#password').value;
        var usuario = this.usuarios.find(function (u) { return u.email === email && u.password === password; });
        if (usuario) {
            this.usuarioActual = usuario;
            localStorage.setItem('usuarioActual', JSON.stringify(usuario));
            this.mostrarNotificacion("\u00A1Bienvenido ".concat(usuario.nombre, "!"), 'success');
            setTimeout(function () {
                window.location.href = 'index.html';
            }, 1000);
        }
        else {
            this.mostrarError('Email o contraseña incorrectos');
        }
    };
    GestorCarrito.prototype.inicializarRegistro = function () {
        var _this = this;
        var form = document.getElementById('register-form');
        if (!form)
            return;
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            _this.procesarRegistro(form);
        });
    };
    GestorCarrito.prototype.procesarRegistro = function (form) {
        var nombre = form.querySelector('#name').value;
        var email = form.querySelector('#email').value;
        var password = form.querySelector('#password').value;
        var confirmPassword = form.querySelector('#confirm-password').value;
        if (password !== confirmPassword) {
            this.mostrarError('Las contraseñas no coinciden');
            return;
        }
        if (this.usuarios.some(function (u) { return u.email === email; })) {
            this.mostrarError('Este email ya está registrado');
            return;
        }
        var nuevoUsuario = {
            id: Date.now().toString(),
            nombre: nombre,
            email: email,
            password: password
        };
        this.usuarios.push(nuevoUsuario);
        localStorage.setItem('usuarios', JSON.stringify(this.usuarios));
        this.mostrarNotificacion('¡Cuenta creada con éxito!', 'success');
        setTimeout(function () {
            window.location.href = 'login.html';
        }, 1000);
    };
    GestorCarrito.prototype.cerrarSesion = function () {
        this.usuarioActual = null;
        localStorage.removeItem('usuarioActual');
        this.mostrarNotificacion('Sesión cerrada correctamente', 'success');
        setTimeout(function () {
            window.location.href = 'index.html';
        }, 1000);
    };
    GestorCarrito.prototype.actualizarEnlaceAuth = function () {
        var _this = this;
        var authLink = document.getElementById('auth-link');
        if (!authLink)
            return;
        if (this.usuarioActual) {
            authLink.textContent = 'Cerrar Sesión';
            authLink.onclick = function (e) {
                e.preventDefault();
                _this.cerrarSesion();
            };
        }
        else {
            authLink.textContent = 'Login';
            authLink.onclick = null;
        }
    };
    GestorCarrito.prototype.mostrarError = function (mensaje) {
        var errorDiv = document.getElementById('error-message');
        if (errorDiv) {
            errorDiv.textContent = mensaje;
            errorDiv.style.display = 'block';
            setTimeout(function () {
                errorDiv.style.display = 'none';
            }, 4000);
        }
    };
    GestorCarrito.prototype.mostrarNotificacion = function (mensaje, tipo) {
        var notificacion = document.getElementById('notificacion');
        if (!notificacion)
            return;
        notificacion.textContent = mensaje;
        notificacion.style.backgroundColor = tipo === 'success'
            ? 'var(--accent)'
            : 'var(--error)';
        notificacion.classList.add('mostrar');
        setTimeout(function () {
            notificacion.classList.remove('mostrar');
        }, 3000);
    };
    return GestorCarrito;
}());
var gestor = new GestorCarrito();
document.addEventListener('DOMContentLoaded', function () {
    var btnCheckout = document.getElementById('btn-checkout');
    if (btnCheckout) {
        btnCheckout.addEventListener('click', function () {
            gestor.finalizarCompra();
        });
    }
});
