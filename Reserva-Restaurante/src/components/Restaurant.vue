<template>
  <div class="container py-3">
    <div class="header-container">
      <h1>🍽️ Gestión de Mesas - Restaurante</h1>
      <div class="header-buttons">
        <button class="add-table-btn" @click="showAddModal = true">
          ➕ Agregar Mesa
        </button>
        <button class="reserve-table-btn" @click="showSelectModal = true">
          📅 Reservar Mesa
        </button>
        <button
          class="view-reservations-btn"
          @click="showReservationsModal = true"
        >
          📋 Ver Reservas
          <span class="reservations-badge" id="reservations-badge">{{
            reservasActivas.length
          }}</span>
        </button>
      </div>
    </div>

    <div class="stats">
      <div
        class="stat-item"
        v-for="estado in [
          'disponible',
          'reservada',
          'ocupada',
          'deshabilitada',
        ]"
        :key="estado"
      >
        <div class="stat-number">{{ countByState(estado) }}</div>
        <div class="stat-label">
          {{ estado.charAt(0).toUpperCase() + estado.slice(1) }}
        </div>
      </div>
    </div>

    <h2>Estado de Mesas</h2>
    <div class="table-grid">
      <div
        v-for="mesa in mesas"
        :key="mesa.id"
        class="table-card"
        :class="mesa.estado"
      >
        <div class="table-header">
          <div class="table-id">{{ mesa.id.toUpperCase() }}</div>
        </div>
        <div class="table-info">Capacidad: {{ mesa.capacidad }}</div>
        <div class="table-info">Ubicación: {{ mesa.ubicacion }}</div>
        <select
          v-model="mesa.estado"
          @change="guardarMesas"
          class="status-select"
        >
          <option value="disponible">Disponible</option>
          <option value="reservada">Reservada</option>
          <option value="ocupada">Ocupada</option>
          <option value="deshabilitada">Deshabilitada</option>
        </select>
        <button class="delete-btn" @click="eliminarMesa(mesa.id)">
          🗑️ Eliminar
        </button>
        <button
          v-if="mesa.estado === 'disponible'"
          class="reserve-btn"
          @click="abrirReserva(mesa)"
        >
          📅 Reservar
        </button>
      </div>
    </div>

    <!-- MODALES -->
    <!-- Add Table Modal -->
    <div v-if="showAddModal" class="modal" @click.self="showAddModal = false">
      <div class="modal-content">
        <span class="close" @click="showAddModal = false">&times;</span>
        <h2>Agregar Nueva Mesa</h2>
        <form @submit.prevent="agregarMesa">
          <div class="form-group">
            <label for="table-capacity">Capacidad:</label>
            <input
              type="number"
              id="table-capacity"
              v-model="newTable.capacity"
              min="1"
              max="20"
              required
            />
          </div>
          <div class="form-group">
            <label for="table-location">Ubicación:</label>
            <select id="table-location" v-model="newTable.location" required>
              <option value="">Seleccionar ubicación...</option>
              <option value="Ventana">Ventana</option>
              <option value="Jardín">Jardín</option>
              <option value="Interior">Interior</option>
              <option value="Terraza">Terraza</option>
              <option value="VIP">VIP</option>
            </select>
          </div>
          <div class="form-actions">
            <button type="button" @click="showAddModal = false">
              Cancelar
            </button>
            <button type="submit">Agregar Mesa</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Reserve Modal -->
    <div
      v-if="showReserveModal"
      class="modal"
      @click.self="showReserveModal = false"
    >
      <div class="modal-content">
        <span class="close" @click="showReserveModal = false">&times;</span>
        <h2>Reservar Mesa</h2>
        <form @submit.prevent="crearReserva">
          <div class="form-group">
            <label for="reserve-name">Nombre:</label>
            <input
              type="text"
              id="reserve-name"
              v-model="reservation.name"
              required
            />
          </div>
          <div class="form-group">
            <label for="reserve-day">Día:</label>
            <input
              type="date"
              id="reserve-day"
              v-model="reservation.day"
              :min="today"
              required
            />
          </div>
          <div class="form-group">
            <label for="reserve-time">Hora:</label>
            <input
              type="time"
              id="reserve-time"
              v-model="reservation.time"
              required
            />
          </div>
          <div class="form-group">
            <label for="reserve-location">Lugar:</label>
            <select
              id="reserve-location"
              v-model="reservation.location"
              required
            >
              <option value="">Seleccionar lugar...</option>
              <option value="Ventana">Ventana</option>
              <option value="Jardín">Jardín</option>
              <option value="Interior">Interior</option>
              <option value="Terraza">Terraza</option>
              <option value="VIP">VIP</option>
            </select>
          </div>
          <div class="form-group">
            <label for="reserve-occasion">Tipo de Reserva:</label>
            <select
              id="reserve-occasion"
              v-model="reservation.occasion"
              required
            >
              <option value="">Seleccionar ocasión...</option>
              <option value="Cumpleaños">🎂 Cumpleaños</option>
              <option value="Aniversario">💍 Aniversario</option>
              <option value="Graduación">🎓 Graduación</option>
              <option value="Reunión Familiar">👨‍👩‍👧‍👦 Reunión Familiar</option>
              <option value="Cena de Negocios">💼 Cena de Negocios</option>
              <option value="Compromiso">💑 Compromiso</option>
              <option value="Amigos">👥 Amigos</option>
            </select>
          </div>
          <div class="form-actions">
            <button type="button" @click="showReserveModal = false">
              Cancelar
            </button>
            <button type="submit">Reservar</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Select Table Modal -->
    <div
      v-if="showSelectModal"
      class="modal"
      @click.self="showSelectModal = false"
    >
      <div class="modal-content large-modal">
        <span class="close" @click="showSelectModal = false">&times;</span>
        <h2>📅 Seleccionar Mesa para Reservar</h2>
        <div class="available-tables-list">
          <div v-if="mesasDisponibles.length === 0" class="no-tables">
            <p>No hay mesas disponibles para reservar en este momento.</p>
          </div>
          <div
            v-for="mesa in mesasDisponibles"
            :key="mesa.id"
            class="available-table-card"
            @click="abrirReserva(mesa)"
          >
            <div class="available-table-header">
              <div class="available-table-id">{{ mesa.id.toUpperCase() }}</div>
            </div>
            <div class="available-table-info">
              <div class="available-table-info-item">
                <strong>Capacidad:</strong> {{ mesa.capacidad }} personas
              </div>
              <div class="available-table-info-item">
                <strong>Ubicación:</strong> {{ mesa.ubicacion }}
              </div>
            </div>
            <button class="select-table-btn" @click.stop="abrirReserva(mesa)">
              Seleccionar Mesa
            </button>
          </div>
        </div>
        <div class="modal-actions">
          <button @click="showSelectModal = false">Cancelar</button>
        </div>
      </div>
    </div>

    <!-- Reservations Modal -->
    <div
      v-if="showReservationsModal"
      class="modal"
      @click.self="showReservationsModal = false"
    >
      <div class="modal-content large-modal">
        <span class="close" @click="showReservationsModal = false"
          >&times;</span
        >
        <h2>📋 Reservas Activas</h2>
        <div class="reservations-list">
          <div v-if="reservasActivas.length === 0" class="no-reservations">
            <p>No hay reservas activas en este momento.</p>
          </div>
          <div
            v-for="res in reservasActivas"
            :key="res.id"
            class="reservation-card"
          >
            <div class="reservation-header">
              <h3>{{ res.id }}</h3>
              <span
                class="reservation-status"
                :class="getReservationStatusClass(res)"
                >{{ getReservationStatusText(res) }}</span
              >
            </div>
            <div class="reservation-info">
              <div class="info-item">
                <strong>Cliente:</strong> {{ res.nombre }}
              </div>
              <div class="info-item">
                <strong>Mesa:</strong> {{ res.mesaId.toUpperCase() }}
              </div>
              <div class="info-item"><strong>Fecha:</strong> {{ res.dia }}</div>
              <div class="info-item"><strong>Hora:</strong> {{ res.hora }}</div>
              <div class="info-item">
                <strong>Lugar:</strong> {{ res.lugar }}
              </div>
              <div class="info-item">
                <strong>Ocasion:</strong> {{ res.ocasion }}
              </div>
              <div v-if="getTableById(res.mesaId)" class="info-item">
                <strong>Capacidad:</strong>
                {{ getTableById(res.mesaId).capacidad }} personas
              </div>
              <div v-if="getTableById(res.mesaId)" class="info-item">
                <strong>Ubicación:</strong>
                {{ getTableById(res.mesaId).ubicacion }}
              </div>
            </div>
            <div class="reservation-actions">
              <button
                class="delete-reservation-btn"
                @click="eliminarReserva(res.id)"
              >
                🗑️ Eliminar Reserva
              </button>
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <button @click="showReservationsModal = false">Cerrar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";

// === Estado ===
const mesas = ref([]);
const reservas = ref([]);

const mesaSeleccionada = ref(null);
const showAddModal = ref(false);
const showReserveModal = ref(false);
const showSelectModal = ref(false);
const showReservationsModal = ref(false);

const newTable = ref({
  capacity: "",
  location: "",
});

const reservation = ref({
  name: "",
  day: "",
  time: "",
  location: "",
  occasion: "",
});

const today = computed(() => {
  const date = new Date();
  return date.toISOString().split("T")[0];
});

// === Funciones de persistencia ===
function inicializarMesas() {
  if (!localStorage.getItem("mesasRestaurante")) {
    const mesasIniciales = [
      { id: "mesa1", capacidad: 2, ubicacion: "Ventana", estado: "disponible" },
      { id: "mesa2", capacidad: 4, ubicacion: "Jardín", estado: "disponible" },
      {
        id: "mesa3",
        capacidad: 6,
        ubicacion: "Interior",
        estado: "disponible",
      },
      { id: "mesa4", capacidad: 2, ubicacion: "Ventana", estado: "disponible" },
      { id: "mesa5", capacidad: 4, ubicacion: "Terraza", estado: "disponible" },
      { id: "mesa6", capacidad: 8, ubicacion: "VIP", estado: "disponible" },
    ];
    localStorage.setItem("mesasRestaurante", JSON.stringify(mesasIniciales));
  }

  if (!localStorage.getItem("reservasRestaurante")) {
    localStorage.setItem("reservasRestaurante", JSON.stringify([]));
  }
}

function obtenerMesas() {
  const data = localStorage.getItem("mesasRestaurante");
  return data ? JSON.parse(data) : [];
}

function guardarMesas() {
  localStorage.setItem("mesasRestaurante", JSON.stringify(mesas.value));
}

function obtenerReservas() {
  const data = localStorage.getItem("reservasRestaurante");
  return data ? JSON.parse(data) : [];
}

function guardarReservas() {
  localStorage.setItem("reservasRestaurante", JSON.stringify(reservas.value));
}

// === CRUD de mesas ===
function agregarMesa() {
  const nueva = {
    capacidad: parseInt(newTable.value.capacity),
    ubicacion: newTable.value.location,
  };
  nueva.id = `mesa${mesas.value.length + 1}`;
  nueva.estado = "disponible";
  mesas.value.push(nueva);
  guardarMesas();
  showAddModal.value = false;
  newTable.value = { capacity: "", location: "" };
}

function eliminarMesa(id) {
  mesas.value = mesas.value.filter((m) => m.id !== id);
  guardarMesas();
}

function abrirReserva(mesa) {
  mesaSeleccionada.value = mesa;
  showReserveModal.value = true;
}

// === Reservas ===
function crearReserva() {
  const nuevaReserva = {
    nombre: reservation.value.name,
    dia: reservation.value.day,
    hora: reservation.value.time,
    lugar: reservation.value.location,
    ocasion: reservation.value.occasion,
    mesaId: mesaSeleccionada.value.id,
    estado: "activa",
  };
  nuevaReserva.id = `reserva${reservas.value.length + 1}`;
  reservas.value.push(nuevaReserva);

  // Cambiar mesa a reservada
  const mesa = mesas.value.find((m) => m.id === nuevaReserva.mesaId);
  if (mesa) mesa.estado = "reservada";

  guardarMesas();
  guardarReservas();
  showReserveModal.value = false;
  reservation.value = {
    name: "",
    day: "",
    time: "",
    location: "",
    occasion: "",
  };
}

function eliminarReserva(id) {
  const reserva = reservas.value.find((r) => r.id === id);
  if (!reserva) return;

  // Liberar mesa
  const mesa = mesas.value.find((m) => m.id === reserva.mesaId);
  if (mesa) mesa.estado = "disponible";

  reservas.value = reservas.value.filter((r) => r.id !== id);
  guardarMesas();
  guardarReservas();
}

const mesasDisponibles = computed(() =>
  mesas.value.filter((m) => m.estado === "disponible")
);

const reservasActivas = computed(() =>
  reservas.value.filter((r) => r.estado === "activa")
);

function countByState(estado) {
  return mesas.value.filter((m) => m.estado === estado).length;
}

function getTableById(id) {
  return mesas.value.find((m) => m.id === id);
}

function getReservationStatusClass(res) {
  return res.estado === "activa" ? "active" : "inactive";
}

function getReservationStatusText(res) {
  return res.estado === "activa" ? "Activa" : "Inactiva";
}

// === Ciclo de vida ===
onMounted(() => {
  inicializarMesas();
  mesas.value = obtenerMesas();
  reservas.value = obtenerReservas();
});

watch(mesas, guardarMesas, { deep: true });
watch(reservas, guardarReservas, { deep: true });
</script>

<style scoped>
@import "../style.css";
</style>
