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
    <AddMesaModal
      v-if="showAddModal"
      @close="showAddModal = false"
      @add="agregarMesa"
    />
    <ReservarMesaModal
      v-if="showReserveModal"
      :mesa="mesaSeleccionada"
      @close="showReserveModal = false"
      @reservar="crearReserva"
    />
    <SeleccionarMesaModal
      v-if="showSelectModal"
      :mesas="mesasDisponibles"
      @close="showSelectModal = false"
      @seleccionar="abrirReserva"
    />
    <ReservasModal
      v-if="showReservationsModal"
      :reservas="reservasActivas"
      @close="showReservationsModal = false"
      @eliminar="eliminarReserva"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import AddMesaModal from "./components/AddMesaModal.vue";
import ReservarMesaModal from "./components/ReservarMesaModal.vue";
import SeleccionarMesaModal from "./components/SeleccionarMesaModal.vue";
import ReservasModal from "./components/ReservasModal.vue";

// === Estado ===
const mesas = ref([]);
const reservas = ref([]);

const mesaSeleccionada = ref(null);
const showAddModal = ref(false);
const showReserveModal = ref(false);
const showSelectModal = ref(false);
const showReservationsModal = ref(false);

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
function agregarMesa(nueva) {
  nueva.id = `mesa${mesas.value.length + 1}`;
  nueva.estado = "disponible";
  mesas.value.push(nueva);
  guardarMesas();
  showAddModal.value = false;
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
function crearReserva(reserva) {
  reservas.value.push({
    ...reserva,
    id: `reserva${reservas.value.length + 1}`,
    estado: "activa",
  });

  // Cambiar mesa a reservada
  const mesa = mesas.value.find((m) => m.id === reserva.mesaId);
  if (mesa) mesa.estado = "reservada";

  guardarMesas();
  guardarReservas();
  showReserveModal.value = false;
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
@import "./style.css";
</style>
