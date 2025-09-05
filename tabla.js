function inicializarMesas() {
  if (!localStorage.getItem("mesasRestaurante")) {
    const mesasIniciales = [
      {
        id: "mesa1",
        capacidad: 2,
        ubicacion: "Ventana",
        estado: "disponible",
      },
      {
        id: "mesa2",
        capacidad: 4,
        ubicacion: "Jardín",
        estado: "disponible",
      },
      {
        id: "mesa3",
        capacidad: 6,
        ubicacion: "Interior",
        estado: "disponible",
      },
      {
        id: "mesa4",
        capacidad: 2,
        ubicacion: "Ventana",
        estado: "disponible",
      },
      {
        id: "mesa5",
        capacidad: 4,
        ubicacion: "Terraza",
        estado: "disponible",
      },
      {
        id: "mesa6",
        capacidad: 8,
        ubicacion: "VIP",
        estado: "disponible",
      },
    ];

    localStorage.setItem("mesasRestaurante", JSON.stringify(mesasIniciales));
    console.log("✅ Mesas inicializadas correctamente");
  }

  if (!localStorage.getItem("reservasRestaurante")) {
    localStorage.setItem("reservasRestaurante", JSON.stringify([]));
    console.log("✅ Reservas inicializadas correctamente");
  }
}

function obtenerMesas() {
  const mesas = localStorage.getItem("mesasRestaurante");
  return mesas ? JSON.parse(mesas) : [];
}

function guardarMesas(mesas) {
  localStorage.setItem("mesasRestaurante", JSON.stringify(mesas));
}

function actualizarEstadoMesa(idMesa, nuevoEstado) {
  const mesas = obtenerMesas();
  const indice = mesas.findIndex((mesa) => mesa.id === idMesa);

  if (indice !== -1) {
    const estadosValidos = [
      "disponible",
      "ocupada",
      "deshabilitada",
      "reservada",
    ];
    if (estadosValidos.includes(nuevoEstado)) {
      mesas[indice].estado = nuevoEstado;
      guardarMesas(mesas);
      return true;
    }
  }
  return false;
}

function obtenerMesasPorEstado(estado) {
  const mesas = obtenerMesas();
  return mesas.filter((mesa) => mesa.estado === estado);
}

function buscarMesa(idMesa) {
  const mesas = obtenerMesas();
  return mesas.find((mesa) => mesa.id === idMesa);
}

function agregarMesa(capacidad, ubicacion, estado = "disponible") {
  const mesas = obtenerMesas();
  const nuevaMesa = {
    id: `mesa${mesas.length + 1}`,
    capacidad: capacidad,
    ubicacion: ubicacion,
    estado: estado,
  };

  mesas.push(nuevaMesa);
  guardarMesas(mesas);
  return nuevaMesa;
}

function eliminarMesa(idMesa) {
  let mesas = obtenerMesas();
  const mesasFiltradas = mesas.filter((mesa) => mesa.id !== idMesa);

  if (mesasFiltradas.length < mesas.length) {
    guardarMesas(mesasFiltradas);
    return true;
  }
  return false;
}

function mostrarMesas() {
  const mesas = obtenerMesas();
  console.log("=== ESTADO ACTUAL DE MESAS ===");
  mesas.forEach((mesa) => {
    console.log(
      `${mesa.id} - Capacidad: ${mesa.capacidad} - Ubicación: ${mesa.ubicacion} - Estado: ${mesa.estado}`
    );
  });
}

document.addEventListener("DOMContentLoaded", function () {
  inicializarMesas();
  mostrarMesas();
  actualizarBadgeReservas();
});

function eliminarMesaConConfirmacion(idMesa) {
  const mesa = buscarMesa(idMesa);
  if (!mesa) {
    mostrarAlerta("Mesa no encontrada", "danger");
    return;
  }

  mostrarConfirmacion(
    `¿Está seguro de que desea eliminar la ${mesa.id.toUpperCase()}?\n\n` +
      `Capacidad: ${mesa.capacidad} personas\n` +
      `Ubicación: ${mesa.ubicacion}\n` +
      `Estado: ${mesa.estado}\n\n` +
      `Esta acción no se puede deshacer.`,
    () => {
      if (window.sistemaMesas.eliminarMesa(idMesa)) {
        mostrarAlerta(
          `✅ ${mesa.id.toUpperCase()} ha sido eliminada exitosamente`,
          "success"
        );
        renderizarMesas();
      } else {
        mostrarAlerta("❌ Error al eliminar la mesa", "danger");
      }
    }
  );
}

function renderizarMesas() {
  const container = document.getElementById("tables-container");
  if (!container) return;

  const mesas = window.sistemaMesas.obtenerMesas();
  container.innerHTML = "";

  mesas.forEach((mesa) => {
    const card = document.createElement("div");
    card.className = `table-card ${mesa.estado}`;

    card.innerHTML = `
      <div class="table-id">${mesa.id.toUpperCase()}</div>
      <div class="table-info"><strong>Capacidad:</strong> ${
        mesa.capacidad
      } personas</div>
      <div class="table-info"><strong>Ubicación:</strong> ${
        mesa.ubicacion
      }</div>
      <div class="table-info"><strong>Estado:</strong> ${mesa.estado}</div>
      <select class="status-select" data-mesa-id="${mesa.id}">
        <option value="disponible" ${
          mesa.estado === "disponible" ? "selected" : ""
        }>Disponible</option>
        <option value="reservada" ${
          mesa.estado === "reservada" ? "selected" : ""
        }>Reservada</option>
        <option value="ocupada" ${
          mesa.estado === "ocupada" ? "selected" : ""
        }>Ocupada</option>
        <option value="deshabilitada" ${
          mesa.estado === "deshabilitada" ? "selected" : ""
        }>Deshabilitada</option>
      </select>
      <button class="reserve-btn" data-mesa-id="${
        mesa.id
      }" onclick="mostrarFormularioReserva('${mesa.id}')">
        📅 Reservar
      </button>
      <button class="delete-btn" data-mesa-id="${
        mesa.id
      }" onclick="eliminarMesaConConfirmacion('${mesa.id}')">
        🗑️ Eliminar Mesa
      </button>
    `;

    container.appendChild(card);
  });

  const availableCount = document.getElementById("available-count");
  const reservedCount = document.getElementById("reserved-count");
  const occupiedCount = document.getElementById("occupied-count");
  const disabledCount = document.getElementById("disabled-count");

  if (availableCount)
    availableCount.textContent =
      window.sistemaMesas.obtenerMesasPorEstado("disponible").length;
  if (reservedCount)
    reservedCount.textContent =
      window.sistemaMesas.obtenerMesasPorEstado("reservada").length;
  if (occupiedCount)
    occupiedCount.textContent =
      window.sistemaMesas.obtenerMesasPorEstado("ocupada").length;
  if (disabledCount)
    disabledCount.textContent =
      window.sistemaMesas.obtenerMesasPorEstado("deshabilitada").length;
}

// Funciones para reservas
function obtenerReservas() {
  const reservas = localStorage.getItem("reservasRestaurante");
  return reservas ? JSON.parse(reservas) : [];
}

function guardarReservas(reservas) {
  localStorage.setItem("reservasRestaurante", JSON.stringify(reservas));
}

function agregarReserva(idMesa, nombre, dia, hora, lugar, ocasion = "Otro") {
  // Validar que la fecha no sea anterior al día actual
  const fechaReserva = new Date(`${dia}T${hora}`);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0); // Resetear hora para comparar solo fechas

  if (fechaReserva < hoy) {
    mostrarAlerta(
      "❌ No se puede reservar para fechas anteriores al día actual.",
      "danger"
    );
    return false;
  }

  // Validar que la hora esté dentro del horario de atención (8:00am - 8:00pm)
  const horaSeleccionada = parseInt(hora.split(":")[0]);
  const minutoSeleccionado = parseInt(hora.split(":")[1]);

  if (
    horaSeleccionada < 8 ||
    (horaSeleccionada === 20 && minutoSeleccionado > 0) ||
    horaSeleccionada > 20
  ) {
    mostrarAlerta(
      "❌ El horario de reservas es de 8:00am a 8:00pm. Por favor selecciona una hora dentro de este rango.",
      "danger"
    );
    return false;
  }

  const reservas = obtenerReservas();
  const nuevaReserva = {
    id: `reserva${reservas.length + 1}`,
    mesaId: idMesa,
    nombre: nombre,
    dia: dia,
    hora: hora,
    lugar: lugar,
    ocasion: ocasion,
    estado: "activa",
    fechaCreacion: new Date().toISOString(),
  };

  reservas.push(nuevaReserva);
  guardarReservas(reservas);

  // Cambiar el estado de la mesa a reservada inmediatamente
  actualizarEstadoMesa(idMesa, "reservada");

  // Actualizar el badge de reservas
  actualizarBadgeReservas();

  return nuevaReserva;
}

function marcarComoPagada(idReserva) {
  const reservas = obtenerReservas();
  const indice = reservas.findIndex((reserva) => reserva.id === idReserva);

  if (indice !== -1) {
    reservas[indice].estado = "pagada";
    guardarReservas(reservas);

    // Cambiar estado de la mesa a disponible
    const mesaId = reservas[indice].mesaId;
    actualizarEstadoMesa(mesaId, "disponible");

    // Actualizar el badge de reservas
    actualizarBadgeReservas();

    return true;
  }
  return false;
}

function buscarReservaPorMesa(idMesa) {
  const reservas = obtenerReservas();
  return reservas.find(
    (reserva) => reserva.mesaId === idMesa && reserva.estado === "activa"
  );
}

function obtenerReservasActivas() {
  const reservas = obtenerReservas();
  return reservas.filter((reserva) => reserva.estado === "activa");
}

function eliminarReserva(idReserva) {
  const reserva = obtenerReservas().find((r) => r.id === idReserva);
  if (!reserva) {
    mostrarAlerta("Reserva no encontrada", "danger");
    return;
  }

  mostrarConfirmacion(
    `¿Está seguro de que desea eliminar la reserva ${idReserva}?\n\n` +
      `Cliente: ${reserva.nombre}\n` +
      `Mesa: ${reserva.mesaId.toUpperCase()}\n` +
      `Fecha: ${reserva.dia} a las ${reserva.hora}\n\n` +
      `Esta acción no se puede deshacer.`,
    () => {
      const reservas = obtenerReservas();
      const reservasFiltradas = reservas.filter((r) => r.id !== idReserva);

      if (reservasFiltradas.length < reservas.length) {
        guardarReservas(reservasFiltradas);

        // Liberar la mesa si estaba reservada
        actualizarEstadoMesa(reserva.mesaId, "disponible");

        // Actualizar el badge de reservas
        actualizarBadgeReservas();

        mostrarAlerta(
          `✅ Reserva ${idReserva} eliminada exitosamente`,
          "success"
        );
        mostrarReservasActivas(); // Refrescar la lista
      } else {
        mostrarAlerta("❌ Error al eliminar la reserva", "danger");
      }
    }
  );
}

// Función para verificar y actualizar estados de mesas según reservas activas
function verificarReservasActivas() {
  const reservas = obtenerReservas();
  const ahora = new Date();

  reservas.forEach((reserva) => {
    if (reserva.estado === "activa") {
      const fechaReserva = new Date(reserva.dia + "T" + reserva.hora);

      // Si la fecha y hora de la reserva ya pasaron, marcar como reservada
      if (fechaReserva <= ahora) {
        reserva.estado = "reservada";
        actualizarEstadoMesa(reserva.mesaId, "reservada");
      }
    }
  });

  guardarReservas(reservas);
}

// Función para verificar reservas expiradas (para liberar mesas)
function verificarReservasExpiradas() {
  const reservas = obtenerReservas();
  const ahora = new Date();

  reservas.forEach((reserva) => {
    if (reserva.estado === "reservada") {
      const fechaReserva = new Date(reserva.dia + "T" + reserva.hora);
      // Agregar 2 horas a la hora de reserva para considerar la mesa libre
      const fechaFinReserva = new Date(
        fechaReserva.getTime() + 2 * 60 * 60 * 1000
      );

      // Si han pasado más de 2 horas desde la reserva, liberar la mesa
      if (fechaFinReserva <= ahora) {
        reserva.estado = "completada";
        actualizarEstadoMesa(reserva.mesaId, "disponible");
      }
    }
  });

  guardarReservas(reservas);
}

window.sistemaMesas = {
  obtenerMesas,
  actualizarEstadoMesa,
  obtenerMesasPorEstado,
  buscarMesa,
  agregarMesa,
  eliminarMesa,
  mostrarMesas,
  eliminarMesaConConfirmacion,
  renderizarMesas,
  obtenerReservas,
  guardarReservas,
  agregarReserva,
  marcarComoPagada,
  buscarReservaPorMesa,
  obtenerReservasActivas,
  verificarReservasActivas,
  verificarReservasExpiradas,
};

// Función para actualizar el badge de reservas
function actualizarBadgeReservas() {
  const reservasActivas = window.sistemaMesas.obtenerReservasActivas();
  const badge = document.getElementById("reservations-badge");
  if (badge) {
    const count = reservasActivas.length;
    badge.textContent = count;

    // Mostrar/ocultar badge según si hay reservas
    if (count > 0) {
      badge.style.display = "inline-block";
    } else {
      badge.style.display = "none";
    }
  }
}

// Modificar la función renderizarMesas para llamar actualizarBadgeReservas
const originalRenderizarMesas = window.sistemaMesas.renderizarMesas;
window.sistemaMesas.renderizarMesas = function () {
  originalRenderizarMesas();
  actualizarBadgeReservas();
};
