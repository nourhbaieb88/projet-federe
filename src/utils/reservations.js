const ACTIVE_STATUSES = ["pending", "confirmed"];
const HISTORY_STATUSES = ["completed", "rejected", "cancelled"];

const statusConfig = {
  pending: {
    label: "En attente",
    className: "status-pending",
    description: "La demande a ete envoyee et attend la reponse de l'etablissement.",
  },
  confirmed: {
    label: "Acceptee",
    className: "status-confirmed",
    description: "La reservation est confirmee par l'etablissement.",
  },
  rejected: {
    label: "Refusee",
    className: "status-rejected",
    description: "L'etablissement a refuse cette demande.",
  },
  cancelled: {
    label: "Annulee",
    className: "status-cancelled",
    description: "La reservation a ete annulee.",
  },
  completed: {
    label: "Terminee",
    className: "status-completed",
    description: "La reservation a ete finalisee.",
  },
};

export function getReservationStatusMeta(status, fallbackLabel) {
  return (
    statusConfig[status] || {
      label: fallbackLabel || status || "Inconnu",
      className: "status-pending",
      description: "",
    }
  );
}

export function formatReservationDate(dateString) {
  if (!dateString) {
    return "Date inconnue";
  }

  try {
    return new Date(`${dateString}T00:00:00`).toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch (error) {
    return dateString;
  }
}

export function formatReservationTime(timeString) {
  if (!timeString) {
    return "";
  }

  return String(timeString).slice(0, 5);
}

export function parseReservationDateTime(reservation) {
  const date = reservation?.date || "";
  const time = formatReservationTime(reservation?.time || "") || "00:00";
  return new Date(`${date}T${time}:00`);
}

export function sortReservationsByDate(reservations = [], order = "asc") {
  const direction = order === "desc" ? -1 : 1;

  return [...reservations].sort((left, right) => {
    const diff = parseReservationDateTime(left).getTime() - parseReservationDateTime(right).getTime();
    if (diff !== 0) {
      return diff * direction;
    }

    return (left.id - right.id) * direction;
  });
}

export function isReservationCancellable(status) {
  return ACTIVE_STATUSES.includes(status);
}

export function isReservationActive(status) {
  return ACTIVE_STATUSES.includes(status);
}

export function isReservationInHistory(status) {
  return HISTORY_STATUSES.includes(status);
}

export function buildOccupancySnapshot(reservations = [], capacity = 0) {
  const slots = new Map();

  reservations
    .filter((reservation) => isReservationActive(reservation.status))
    .forEach((reservation) => {
      const key = `${reservation.date}-${formatReservationTime(reservation.time)}`;
      const current = slots.get(key) || {
        key,
        date: reservation.date,
        time: formatReservationTime(reservation.time),
        reservations: 0,
        guests: 0,
        slotCapacity: Number(reservation.slot_capacity ?? capacity ?? 0),
        remainingCapacity: Number(reservation.remaining_capacity ?? capacity ?? 0),
      };

      current.reservations += 1;
      current.guests += Number(reservation.number_of_people || 0);
      current.slotCapacity = Number(reservation.slot_capacity ?? current.slotCapacity ?? capacity ?? 0);
      current.remainingCapacity = Number(
        reservation.remaining_capacity ?? Math.max(current.slotCapacity - current.guests, 0)
      );
      slots.set(key, current);
    });

  return [...slots.values()].sort((left, right) => {
    return new Date(`${left.date}T${left.time}:00`).getTime() - new Date(`${right.date}T${right.time}:00`).getTime();
  });
}
