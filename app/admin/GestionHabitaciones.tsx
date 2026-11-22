"use client";

import { useState, type FormEvent } from "react";
import { BedDouble, Pencil, Plus, Power, RotateCcw, X } from "lucide-react";

import { useAdmin } from "../../contexto/AdminContext";
import { useAuth } from "../../contexto/AuthContext";
import type {
  DatosHabitacion,
  EstadoHabitacion,
  HabitacionAdmin,
} from "../../servicios/adminService";
import styles from "./admin.module.css";

const roomLabel = {
  AVAILABLE: "Disponible",
  OCCUPIED: "Ocupada",
  CLEANING: "Limpieza",
  MAINTENANCE: "Mantenimiento",
} as const;

type HabitacionFormData = {
  number: string;
  floor: string;
  name: string;
  category: string;
  description: string;
  pricePerNight: string;
  capacity: string;
  imageUrl: string;
  highlights: string;
  status: EstadoHabitacion;
  active: boolean;
};

const emptyRoom: HabitacionFormData = {
  number: "",
  floor: "1",
  name: "",
  category: "",
  description: "",
  pricePerNight: "",
  capacity: "2",
  imageUrl: "/imagenes/habitaciones/Hbasica.jpg",
  highlights: "",
  status: "AVAILABLE",
  active: true,
};

function roomToForm(room: HabitacionAdmin): HabitacionFormData {
  return {
    number: room.number,
    floor: String(room.floor),
    name: room.name,
    category: room.category,
    description: room.description,
    pricePerNight: String(room.pricePerNight),
    capacity: String(room.capacity),
    imageUrl: room.imageUrl,
    highlights: room.highlights.join(", "),
    status: room.status,
    active: room.active,
  };
}

function validarHabitacion(form: HabitacionFormData): string | null {
  if (!form.number.trim()) return "El número de habitación es obligatorio.";
  if (!form.name.trim()) return "El nombre de la habitación es obligatorio.";
  if (!form.category.trim()) return "La categoría es obligatoria.";
  if (!form.description.trim()) return "La descripción es obligatoria.";
  if (!form.imageUrl.trim()) return "La imagen es obligatoria.";

  const floor = Number(form.floor);
  const capacity = Number(form.capacity);
  const pricePerNight = Number(form.pricePerNight);

  if (!Number.isInteger(floor) || floor < 0) {
    return "El piso debe ser un número entero mayor o igual a cero.";
  }
  if (!Number.isInteger(capacity) || capacity < 1) {
    return "La capacidad debe ser un número entero mayor o igual a uno.";
  }
  if (!Number.isFinite(pricePerNight) || pricePerNight <= 0) {
    return "El precio por noche debe ser mayor que cero.";
  }
  if (
    !form.imageUrl.startsWith("/") &&
    !form.imageUrl.startsWith("https://")
  ) {
    return "La imagen debe ser una ruta local o una URL HTTPS.";
  }
  return null;
}

function formToRoom(form: HabitacionFormData): DatosHabitacion {
  return {
    number: form.number.trim(),
    floor: Number(form.floor),
    name: form.name.trim(),
    category: form.category.trim(),
    description: form.description.trim(),
    pricePerNight: Number(form.pricePerNight),
    capacity: Number(form.capacity),
    imageUrl: form.imageUrl.trim(),
    highlights: form.highlights
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    status: form.status,
    active: form.active,
  };
}

function roomStatusClass(status: EstadoHabitacion): string {
  if (status === "AVAILABLE") return styles.available;
  if (status === "OCCUPIED") return styles.occupied;
  if (status === "MAINTENANCE") return "bg-[#eee6ff] text-[#66429a]";
  return styles.cleaning;
}

export default function GestionHabitaciones() {
  const { usuario } = useAuth();
  const {
    rooms,
    createRoom,
    updateRoom,
    setRoomActive,
    setRoomStatus,
  } = useAdmin();
  const [editingRoom, setEditingRoom] = useState<HabitacionAdmin | null>(null);
  const [roomForm, setRoomForm] = useState<HabitacionFormData | null>(null);
  const [roomError, setRoomError] = useState<string | null>(null);
  const [savingRoom, setSavingRoom] = useState(false);
  const isAdmin = usuario?.rol === "admin";

  function openNewRoom() {
    setEditingRoom(null);
    setRoomError(null);
    setRoomForm(emptyRoom);
  }

  function openEditRoom(room: HabitacionAdmin) {
    setEditingRoom(room);
    setRoomError(null);
    setRoomForm(roomToForm(room));
  }

  async function submitRoom(event: FormEvent) {
    event.preventDefault();
    if (!roomForm || !isAdmin || savingRoom) return;

    const validationError = validarHabitacion(roomForm);
    if (validationError) {
      setRoomError(validationError);
      return;
    }

    setSavingRoom(true);
    setRoomError(null);
    try {
      if (editingRoom) {
        await updateRoom(editingRoom.id, formToRoom(roomForm));
      } else {
        await createRoom(formToRoom(roomForm));
      }
      setRoomForm(null);
      setEditingRoom(null);
    } catch (cause) {
      setRoomError(
        cause instanceof Error
          ? cause.message
          : "No se pudo guardar la habitación.",
      );
    } finally {
      setSavingRoom(false);
    }
  }

  async function toggleRoomActivity(room: HabitacionAdmin) {
    if (!isAdmin) return;
    const action = room.active ? "retirar" : "reactivar";
    if (
      !confirm(
        "¿Deseas " +
          action +
          " la habitación " +
          room.number +
          "? Las reservas históricas no se modificarán.",
      )
    ) {
      return;
    }

    setRoomError(null);
    try {
      await setRoomActive(room.id, !room.active);
    } catch (cause) {
      setRoomError(
        cause instanceof Error
          ? cause.message
          : "No se pudo actualizar la habitación.",
      );
    }
  }

  async function changeRoomStatus(roomId: string, status: EstadoHabitacion) {
    setRoomError(null);
    try {
      await setRoomStatus(roomId, status);
    } catch {
      setRoomError("No se pudo cambiar el estado de la habitación.");
    }
  }

  return (
    <>
      <section className={styles.panel} id="habitaciones">
        <div className={styles.panelHead}>
          <div>
            <h2>Gestión de habitaciones</h2>
            <p>
              Actualiza el estado operativo. Crear, editar y retirar está
              limitado a administradores.
            </p>
          </div>
          {isAdmin ? (
            <button className={styles.primary} onClick={openNewRoom}>
              <Plus />
              Nueva habitación
            </button>
          ) : null}
        </div>

        {roomError ? (
          <p className="mb-3.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-800">
            {roomError}
          </p>
        ) : null}

        <div className={styles.rooms}>
          {rooms.map((room) => (
            <article
              key={room.id}
              className={!room.active ? "opacity-65" : undefined}
            >
              <div
                className={styles.roomImage + " min-h-[120px] bg-cover bg-center bg-no-repeat"}
                style={{ backgroundImage: "url(" + room.imageUrl + ")" }}
                role="img"
                aria-label={room.name}
              >
                {!room.imageUrl ? <BedDouble /> : null}
              </div>
              <div className={styles.roomBody}>
                <div>
                  <small>
                    {room.number} · Piso {room.floor}
                  </small>
                  <h3>{room.title}</h3>
                  <small>
                    {"$"}
                    {room.pricePerNight.toFixed(2)} · {room.capacity} personas
                  </small>
                </div>
                <span
                  className={
                    styles.roomStatus + " " + roomStatusClass(room.status)
                  }
                >
                  {room.active ? roomLabel[room.status] : "Inactiva"}
                </span>

                <select
                  value={room.status}
                  disabled={!room.active}
                  onChange={(event) =>
                    void changeRoomStatus(
                      room.id,
                      event.target.value as EstadoHabitacion,
                    )
                  }
                >
                  <option value="AVAILABLE">Disponible</option>
                  <option value="OCCUPIED">Ocupada</option>
                  <option value="CLEANING">Limpieza</option>
                  <option value="MAINTENANCE">Mantenimiento</option>
                </select>

                {isAdmin ? (
                  <div className="col-span-2 flex flex-wrap gap-2 [&>button]:flex-1 [&_svg]:h-3.5 [&_svg]:w-3.5">
                    <button
                      type="button"
                      className={styles.secondary}
                      onClick={() => openEditRoom(room)}
                    >
                      <Pencil />
                      Editar
                    </button>
                    <button
                      type="button"
                      className={room.active ? styles.reject : styles.secondary}
                      onClick={() => void toggleRoomActivity(room)}
                    >
                      {room.active ? <Power /> : <RotateCcw />}
                      {room.active ? "Retirar" : "Reactivar"}
                    </button>
                  </div>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </section>

      {roomForm ? (
        <div className={styles.overlay}>
          <form className={styles.modal + " max-h-[92vh] overflow-y-auto"} onSubmit={submitRoom}>
            <button
              type="button"
              className={styles.close}
              onClick={() => setRoomForm(null)}
              aria-label="Cerrar"
            >
              <X />
            </button>
            <h2>{editingRoom ? "Editar habitación" : "Nueva habitación"}</h2>
            <p>Completa los datos que se mostrarán en el catálogo.</p>

            {roomError ? (
              <p className="mb-3.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-800">
                {roomError}
              </p>
            ) : null}

            <div className={styles.formGrid}>
              <label>
                Número
                <input
                  required
                  maxLength={20}
                  value={roomForm.number}
                  onChange={(event) =>
                    setRoomForm({ ...roomForm, number: event.target.value })
                  }
                />
              </label>
              <label>
                Piso
                <input
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={roomForm.floor}
                  onChange={(event) =>
                    setRoomForm({ ...roomForm, floor: event.target.value })
                  }
                />
              </label>
              <label>
                Nombre
                <input
                  required
                  value={roomForm.name}
                  onChange={(event) =>
                    setRoomForm({ ...roomForm, name: event.target.value })
                  }
                />
              </label>
              <label>
                Categoría
                <input
                  required
                  placeholder="individual, doble, suite…"
                  value={roomForm.category}
                  onChange={(event) =>
                    setRoomForm({ ...roomForm, category: event.target.value })
                  }
                />
              </label>
              <label>
                Capacidad
                <input
                  type="number"
                  min="1"
                  step="1"
                  required
                  value={roomForm.capacity}
                  onChange={(event) =>
                    setRoomForm({ ...roomForm, capacity: event.target.value })
                  }
                />
              </label>
              <label>
                Precio por noche ($)
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  value={roomForm.pricePerNight}
                  onChange={(event) =>
                    setRoomForm({
                      ...roomForm,
                      pricePerNight: event.target.value,
                    })
                  }
                />
              </label>
              <label>
                Estado
                <select
                  value={roomForm.status}
                  onChange={(event) =>
                    setRoomForm({
                      ...roomForm,
                      status: event.target.value as EstadoHabitacion,
                    })
                  }
                >
                  <option value="AVAILABLE">Disponible</option>
                  <option value="OCCUPIED">Ocupada</option>
                  <option value="CLEANING">Limpieza</option>
                  <option value="MAINTENANCE">Mantenimiento</option>
                </select>
              </label>
              <label className="flex items-center gap-2 self-end pb-2.5 [&_input]:m-0 [&_input]:w-auto">
                <input
                  type="checkbox"
                  checked={roomForm.active}
                  onChange={(event) =>
                    setRoomForm({ ...roomForm, active: event.target.checked })
                  }
                />
                Publicar en el catálogo
              </label>
              <label className="col-span-2 max-[760px]:col-span-1">
                Imagen
                <input
                  required
                  placeholder="/imagenes/habitaciones/archivo.jpg"
                  value={roomForm.imageUrl}
                  onChange={(event) =>
                    setRoomForm({ ...roomForm, imageUrl: event.target.value })
                  }
                />
              </label>
              <label className="col-span-2 max-[760px]:col-span-1">
                Descripción
                <textarea
                  required
                  rows={4}
                  className="mt-1.5 w-full resize-y rounded-lg border border-[#cfdee2] p-2.5 font-[inherit]"
                  value={roomForm.description}
                  onChange={(event) =>
                    setRoomForm({
                      ...roomForm,
                      description: event.target.value,
                    })
                  }
                />
              </label>
              <label className="col-span-2 max-[760px]:col-span-1">
                Amenidades
                <input
                  placeholder="Wi-Fi, TV, balcón, aire acondicionado"
                  value={roomForm.highlights}
                  onChange={(event) =>
                    setRoomForm({ ...roomForm, highlights: event.target.value })
                  }
                />
                <small className="mt-1 block font-normal text-[#789097]">
                  Separa cada amenidad con una coma.
                </small>
              </label>
            </div>
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.secondary}
                onClick={() => setRoomForm(null)}
              >
                Cancelar
              </button>
              <button className={styles.primary} disabled={savingRoom}>
                {savingRoom ? "Guardando…" : "Guardar habitación"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}
