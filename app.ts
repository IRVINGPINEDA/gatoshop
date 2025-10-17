
interface Producto {
    id: number;
    nombre: string;
    descripcion: string;
    precio: number;
    imagen: string;
    stock: number;
}

interface Usuario {
    id: string;
    nombre: string;
    email: string;
    password: string;
}

interface ItemCarrito {
    producto: Producto;
    cantidad: number;
}

interface ResumenCarrito {
    subtotal: number;
    envio: number;
    iva: number;
    total: number;
}

class GestorCarrito {
    private productos: Producto[] = [];
    private carrito: ItemCarrito[] = [];
    private usuarios: Usuario[] = [];
    private usuarioActual: Usuario | null = null;

    constructor() {
        this.cargarDatosIniciales();
        this.inicializarPagina();
    }

    private cargarDatosIniciales(): void {
        const usuariosGuardados = localStorage.getItem('usuarios');
        this.usuarios = usuariosGuardados ? JSON.parse(usuariosGuardados) : [];

        const sesionActual = localStorage.getItem('usuarioActual');
        this.usuarioActual = sesionActual ? JSON.parse(sesionActual) : null;

        const carritoGuardado = localStorage.getItem('carrito');
        this.carrito = carritoGuardado ? JSON.parse(carritoGuardado) : [];
    }

    private inicializarPagina(): void {
        const pagina = window.location.pathname;

        this.actualizarBadgeCarrito();

        this.actualizarEnlaceAuth();

        if (pagina.includes('index.html') || pagina === '/') {
            this.cargarProductos();
        } else if (pagina.includes('cart.html')) {
            this.mostrarCarrito();
        } else if (pagina.includes('login.html')) {
            this.inicializarLogin();
        } else if (pagina.includes('register.html')) {
            this.inicializarRegistro();
        }
    }

    private async cargarProductos(): Promise<void> {
        try {
            const response = await fetch('productos.json');
            const data = await response.json();
            this.productos = data.productos;
            this.renderizarProductos();
        } catch (error) {
            console.error('Error al cargar productos:', error);
            this.mostrarNotificacion('Error al cargar los productos', 'error');
        }
    }

    private renderizarProductos(): void {
        const contenedor = document.getElementById('products-grid');
        if (!contenedor) return;

        contenedor.innerHTML = '';

        this.productos.forEach(producto => {
            const card = this.crearTarjetaProducto(producto);
            contenedor.appendChild(card);
        });
    }

    private crearTarjetaProducto(producto: Producto): HTMLElement {
        const card = document.createElement('div');
        card.className = 'product-card';

        const enCarrito = this.carrito.some(item => item.producto.id === producto.id);
        const sinStock = producto.stock === 0;

        card.innerHTML = `
            <img src="${producto.imagen}" alt="${producto.nombre}" class="product-image">
            <div class="product-info">
                <h3>${producto.nombre}</h3>
                <p>${producto.descripcion}</p>
                <div class="product-footer">
                    <span class="price">$${producto.precio.toFixed(2)}</span>
                    <button 
                        class="btn-add" 
                        ${sinStock || enCarrito ? 'disabled' : ''}
                        onclick="gestor.agregarAlCarrito(${producto.id})"
                    >
                        ${sinStock ? 'Sin Stock' : enCarrito ? 'En Carrito' : 'Agregar'}
                    </button>
                </div>
            </div>
        `;

        return card;
    }

    public agregarAlCarrito(idProducto: number): void {
        const producto = this.productos.find(p => p.id === idProducto);
        if (!producto) return;

        const itemExistente = this.carrito.find(item => item.producto.id === idProducto);

        if (itemExistente) {
            if (itemExistente.cantidad < producto.stock) {
                itemExistente.cantidad++;
            } else {
                this.mostrarNotificacion('No hay más stock disponible', 'error');
                return;
            }
        } else {
            this.carrito.push({
                producto: producto,
                cantidad: 1
            });
        }

        this.guardarCarrito();
        this.actualizarBadgeCarrito();
        this.mostrarNotificacion(`${producto.nombre} agregado al carrito`, 'success');
        this.renderizarProductos();
    }

    public actualizarCantidad(idProducto: number, nuevaCantidad: number): void {
        const item = this.carrito.find(item => item.producto.id === idProducto);
        if (!item) return;

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
    }

    public eliminarDelCarrito(idProducto: number): void {
        const index = this.carrito.findIndex(item => item.producto.id === idProducto);
        if (index !== -1) {
            const nombreProducto = this.carrito[index].producto.nombre;
            this.carrito.splice(index, 1);
            this.guardarCarrito();
            this.actualizarBadgeCarrito();
            this.mostrarCarrito();
            this.mostrarNotificacion(`${nombreProducto} eliminado del carrito`, 'success');
        }
    }

    private mostrarCarrito(): void {
        const cartEmpty = document.getElementById('cart-empty');
        const cartContent = document.getElementById('cart-content');
        const cartItems = document.getElementById('cart-items');

        if (!cartEmpty || !cartContent || !cartItems) return;

        if (this.carrito.length === 0) {
            cartEmpty.style.display = 'block';
            cartContent.style.display = 'none';
            return;
        }

        cartEmpty.style.display = 'none';
        cartContent.style.display = 'grid';

        cartItems.innerHTML = '';
        this.carrito.forEach(item => {
            const itemElement = this.crearElementoCarrito(item);
            cartItems.appendChild(itemElement);
        });

        this.actualizarResumenCarrito();
    }

    private crearElementoCarrito(item: ItemCarrito): HTMLElement {
        const div = document.createElement('div');
        div.className = 'cart-item';

        const subtotal = item.producto.precio * item.cantidad;

        div.innerHTML = `
            <img src="${item.producto.imagen}" alt="${item.producto.nombre}" class="cart-item-image">
            <div class="cart-item-info">
                <h3>${item.producto.nombre}</h3>
                <p>${item.producto.descripcion}</p>
                <div class="cart-item-actions">
                    <div class="quantity-controls">
                        <button onclick="gestor.actualizarCantidad(${item.producto.id}, ${item.cantidad - 1})">-</button>
                        <span>${item.cantidad}</span>
                        <button onclick="gestor.actualizarCantidad(${item.producto.id}, ${item.cantidad + 1})">+</button>
                    </div>
                    <button class="btn-remove" onclick="gestor.eliminarDelCarrito(${item.producto.id})">Eliminar</button>
                </div>
            </div>
            <div class="cart-item-price">$${subtotal.toFixed(2)}</div>
        `;

        return div;
    }

    private calcularResumen(): ResumenCarrito {
        const subtotal = this.carrito.reduce((sum, item) => {
            return sum + (item.producto.precio * item.cantidad);
        }, 0);

        const envio = subtotal > 500 ? 0 : 50;
        const iva = subtotal * 0.16;
        const total = subtotal + envio + iva;

        return { subtotal, envio, iva, total };
    }

    private actualizarResumenCarrito(): void {
        const resumen = this.calcularResumen();

        const subtotalEl = document.getElementById('subtotal');
        const shippingEl = document.getElementById('shipping');
        const taxEl = document.getElementById('tax');
        const totalEl = document.getElementById('total');

        if (subtotalEl) subtotalEl.textContent = `$${resumen.subtotal.toFixed(2)}`;
        if (shippingEl) shippingEl.textContent = resumen.envio === 0 ? 'GRATIS' : `$${resumen.envio.toFixed(2)}`;
        if (taxEl) taxEl.textContent = `$${resumen.iva.toFixed(2)}`;
        if (totalEl) totalEl.textContent = `$${resumen.total.toFixed(2)}`;
    }

    private actualizarBadgeCarrito(): void {
        const badge = document.getElementById('cart-badge');
        if (badge) {
            const totalItems = this.carrito.reduce((sum, item) => sum + item.cantidad, 0);
            badge.textContent = totalItems.toString();
        }
    }

    private guardarCarrito(): void {
        localStorage.setItem('carrito', JSON.stringify(this.carrito));
    }

    public finalizarCompra(): void {
        if (!this.usuarioActual) {
            this.mostrarNotificacion('Debes iniciar sesión para finalizar la compra', 'error');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
            return;
        }

        if (this.carrito.length === 0) {
            this.mostrarNotificacion('El carrito está vacío', 'error');
            return;
        }

        const resumen = this.calcularResumen();
        const confirmar = confirm(
            `¿Confirmar compra?\n\nTotal: $${resumen.total.toFixed(2)}\n\nSe enviará a: ${this.usuarioActual.email}`
        );

        if (confirmar) {
            this.carrito = [];
            this.guardarCarrito();
            this.actualizarBadgeCarrito();
            
            this.mostrarNotificacion('¡Compra realizada con éxito! Gracias por tu preferencia.', 'success');
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        }
    }

    private inicializarLogin(): void {
        const form = document.getElementById('login-form') as HTMLFormElement;
        if (!form) return;

        form.addEventListener('submit', (e: Event) => {
            e.preventDefault();
            this.procesarLogin(form);
        });
    }

    private procesarLogin(form: HTMLFormElement): void {
        const email = (form.querySelector('#email') as HTMLInputElement).value;
        const password = (form.querySelector('#password') as HTMLInputElement).value;

        const usuario = this.usuarios.find(u => u.email === email && u.password === password);

        if (usuario) {
            this.usuarioActual = usuario;
            localStorage.setItem('usuarioActual', JSON.stringify(usuario));
            this.mostrarNotificacion(`¡Bienvenido ${usuario.nombre}!`, 'success');
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            this.mostrarError('Email o contraseña incorrectos');
        }
    }

    private inicializarRegistro(): void {
        const form = document.getElementById('register-form') as HTMLFormElement;
        if (!form) return;

        form.addEventListener('submit', (e: Event) => {
            e.preventDefault();
            this.procesarRegistro(form);
        });
    }

    private procesarRegistro(form: HTMLFormElement): void {
        const nombre = (form.querySelector('#name') as HTMLInputElement).value;
        const email = (form.querySelector('#email') as HTMLInputElement).value;
        const password = (form.querySelector('#password') as HTMLInputElement).value;
        const confirmPassword = (form.querySelector('#confirm-password') as HTMLInputElement).value;

        if (password !== confirmPassword) {
            this.mostrarError('Las contraseñas no coinciden');
            return;
        }

        if (this.usuarios.some(u => u.email === email)) {
            this.mostrarError('Este email ya está registrado');
            return;
        }

        const nuevoUsuario: Usuario = {
            id: Date.now().toString(),
            nombre,
            email,
            password
        };

        this.usuarios.push(nuevoUsuario);
        localStorage.setItem('usuarios', JSON.stringify(this.usuarios));

        this.mostrarNotificacion('¡Cuenta creada con éxito!', 'success');
        
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
    }

    public cerrarSesion(): void {
        this.usuarioActual = null;
        localStorage.removeItem('usuarioActual');
        this.mostrarNotificacion('Sesión cerrada correctamente', 'success');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }

    private actualizarEnlaceAuth(): void {
        const authLink = document.getElementById('auth-link');
        if (!authLink) return;

        if (this.usuarioActual) {
            authLink.textContent = 'Cerrar Sesión';
            authLink.onclick = (e) => {
                e.preventDefault();
                this.cerrarSesion();
            };
        } else {
            authLink.textContent = 'Login';
            authLink.onclick = null;
        }
    }

    private mostrarError(mensaje: string): void {
        const errorDiv = document.getElementById('error-message');
        if (errorDiv) {
            errorDiv.textContent = mensaje;
            errorDiv.style.display = 'block';
            
            setTimeout(() => {
                errorDiv.style.display = 'none';
            }, 4000);
        }
    }

    private mostrarNotificacion(mensaje: string, tipo: 'success' | 'error'): void {
        const notificacion = document.getElementById('notificacion');
        if (!notificacion) return;

        notificacion.textContent = mensaje;
        notificacion.style.backgroundColor = tipo === 'success' 
            ? 'var(--accent)' 
            : 'var(--error)';
        
        notificacion.classList.add('mostrar');

        setTimeout(() => {
            notificacion.classList.remove('mostrar');
        }, 3000);
    }
}

const gestor = new GestorCarrito();

document.addEventListener('DOMContentLoaded', () => {
    const btnCheckout = document.getElementById('btn-checkout');
    if (btnCheckout) {
        btnCheckout.addEventListener('click', () => {
            gestor.finalizarCompra();
        });
    }
});