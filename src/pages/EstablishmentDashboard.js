import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import Button from "../components/Button";
import Input from "../components/Input";
import { establishmentService, reservationService, serviceService } from "../services/api";
import { formatTnd, normalizePriceRange } from "../utils/currency";
import {
  buildOccupancySnapshot,
  formatReservationDate,
  formatReservationTime,
  getReservationStatusMeta,
  sortReservationsByDate,
} from "../utils/reservations";

const emptyServiceForm = { id: null, name: "", description: "", price: "", duration: "" };
const fallbackCoverImage =
  "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80";
const dayLabels = {
  monday: "Lundi",
  tuesday: "Mardi",
  wednesday: "Mercredi",
  thursday: "Jeudi",
  friday: "Vendredi",
  saturday: "Samedi",
  sunday: "Dimanche",
};
const orderedDays = Object.keys(dayLabels);
const defaultOpeningHours = {
  monday: { open: "09:00", close: "18:00", closed: false },
  tuesday: { open: "09:00", close: "18:00", closed: false },
  wednesday: { open: "09:00", close: "18:00", closed: false },
  thursday: { open: "09:00", close: "18:00", closed: false },
  friday: { open: "09:00", close: "18:00", closed: false },
  saturday: { open: "10:00", close: "16:00", closed: false },
  sunday: { open: "10:00", close: "16:00", closed: true },
};

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const normalizeOpeningHours = (rawHours = {}) =>
  orderedDays.reduce((accumulator, day) => {
    const currentDay = rawHours?.[day] || {};
    accumulator[day] = {
      open: currentDay.open || defaultOpeningHours[day].open,
      close: currentDay.close || defaultOpeningHours[day].close,
      closed: Boolean(currentDay.closed),
    };
    return accumulator;
  }, {});

const toCoordinateNumber = (value) => {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

function EstablishmentDashboard() {
  const [activeTab, setActiveTab] = useState("reservations");
  const [establishment, setEstablishment] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [editInfoData, setEditInfoData] = useState(null);
  const [serviceForm, setServiceForm] = useState(emptyServiceForm);
  const [isSavingService, setIsSavingService] = useState(false);
  const [isSavingInfo, setIsSavingInfo] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadDashboard = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }
      const myEstablishment = await establishmentService.getMine().catch(() => null);
      const [reservationData, servicesData] = await Promise.all([
        reservationService.getAll().catch(() => []),
        myEstablishment ? serviceService.getAll({ establishment: myEstablishment.id }).catch(() => []) : Promise.resolve([]),
      ]);

      const normalizedEstablishment = myEstablishment
        ? {
            ...myEstablishment,
            opening_hours: normalizeOpeningHours(myEstablishment.opening_hours),
          }
        : null;

      setEstablishment(normalizedEstablishment);
      setEditInfoData((current) => (isEditingInfo ? current : normalizedEstablishment));
      setReservations(Array.isArray(reservationData) ? reservationData : reservationData.results || []);
      setServices(Array.isArray(servicesData) ? servicesData : servicesData.results || []);
      setLastUpdated(new Date());
    } catch (error) {
      console.error(error);
      toast.error("Impossible de charger le tableau de bord.");
    } finally {
      if (showLoader) {
        setLoading(false);
      } else {
        setIsRefreshing(false);
      }
    }
  }, [isEditingInfo]);

  useEffect(() => {
    let isMounted = true;

    const runInitialLoad = async () => {
      try {
        await loadDashboard(true);
      } finally {
        if (!isMounted) {
          return;
        }
      }
    };

    runInitialLoad();
    const intervalId = setInterval(() => {
      if (isMounted) {
        loadDashboard(false);
      }
    }, 30000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [loadDashboard]);

  const sortedReservations = useMemo(() => sortReservationsByDate(reservations, "asc"), [reservations]);
  const pendingReservations = sortedReservations.filter((item) => item.status === "pending");
  const confirmedReservations = sortedReservations.filter((item) => item.status === "confirmed");
  const historyReservations = sortReservationsByDate(
    sortedReservations.filter((item) => ["completed", "rejected", "cancelled"].includes(item.status)),
    "desc"
  );
  const occupancySnapshot = useMemo(
    () => buildOccupancySnapshot(sortedReservations, establishment?.capacity || 0),
    [sortedReservations, establishment]
  );
  const profileCompletion = useMemo(() => {
    const source = (isEditingInfo ? editInfoData : establishment) || {};
    const openingHours = normalizeOpeningHours(source.opening_hours);
    const visibleOpeningDays = Object.values(openingHours).filter((day) => !day.closed);
    const total = 10;

    const checks = [
      Boolean(source.name?.trim()),
      Boolean(source.category?.trim()),
      Boolean(source.address?.trim()),
      Boolean(source.phone?.trim()),
      Boolean(source.email?.trim()),
      Boolean(source.description?.trim()),
      Boolean(source.price_range?.trim()),
      Number(source.capacity) > 0,
      Boolean(source.profile_image),
      visibleOpeningDays.length > 0,
    ];

    const filled = checks.filter(Boolean).length;
    return {
      filled,
      total,
      percent: Math.round((filled / total) * 100),
    };
  }, [isEditingInfo, editInfoData, establishment]);
  const mapUrl = useMemo(() => {
    const latitude = toCoordinateNumber((isEditingInfo ? editInfoData : establishment)?.latitude);
    const longitude = toCoordinateNumber((isEditingInfo ? editInfoData : establishment)?.longitude);
    if (latitude === null || longitude === null) {
      return null;
    }

    return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=16/${latitude}/${longitude}`;
  }, [isEditingInfo, editInfoData, establishment]);

  const updateReservationStatus = async (id, status, successMessage) => {
    try {
      const updated = await reservationService.update(id, { status });
      setReservations((current) => current.map((item) => (item.id === id ? updated : item)));
      toast.success(successMessage);
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Impossible de modifier cette reservation.");
    }
  };

  const handleProfileImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const dataUrl = await fileToDataUrl(file);
      setEditInfoData((current) => ({ ...current, profile_image: dataUrl, profile_image_base64: dataUrl }));
    } catch (error) {
      console.error(error);
      toast.error("Impossible de charger cette image.");
    }
  };

  const handleInfoFieldChange = (field, value) => {
    setEditInfoData((current) => ({ ...current, [field]: value }));
  };

  const handleOpeningHoursChange = (day, field, value) => {
    setEditInfoData((current) => ({
      ...current,
      opening_hours: {
        ...normalizeOpeningHours(current?.opening_hours),
        [day]: {
          ...normalizeOpeningHours(current?.opening_hours)[day],
          [field]: value,
        },
      },
    }));
  };

  const handleDayClosedChange = (day, closed) => {
    setEditInfoData((current) => ({
      ...current,
      opening_hours: {
        ...normalizeOpeningHours(current?.opening_hours),
        [day]: {
          ...normalizeOpeningHours(current?.opening_hours)[day],
          closed,
        },
      },
    }));
  };

  const copyWeekdayHoursToAllOpenDays = () => {
    setEditInfoData((current) => {
      const normalizedHours = normalizeOpeningHours(current?.opening_hours);
      const weekdayReference = normalizedHours.monday;
      const updatedHours = orderedDays.reduce((accumulator, day) => {
        accumulator[day] = {
          ...normalizedHours[day],
          open: weekdayReference.open,
          close: weekdayReference.close,
        };
        return accumulator;
      }, {});

      return {
        ...current,
        opening_hours: updatedHours,
      };
    });
  };

  const setWeekendClosed = () => {
    setEditInfoData((current) => {
      const normalizedHours = normalizeOpeningHours(current?.opening_hours);
      return {
        ...current,
        opening_hours: {
          ...normalizedHours,
          saturday: { ...normalizedHours.saturday, closed: true },
          sunday: { ...normalizedHours.sunday, closed: true },
        },
      };
    });
  };

  const handleSaveInfo = async () => {
    if (!establishment || !editInfoData) {
      return;
    }

    if (!editInfoData.name?.trim() || !editInfoData.category?.trim() || !editInfoData.address?.trim()) {
      toast.error("Nom, categorie et adresse sont obligatoires.");
      return;
    }

    const normalizedOpeningHours = normalizeOpeningHours(editInfoData.opening_hours);
    const invalidDay = orderedDays.find((day) => {
      const dayData = normalizedOpeningHours[day];
      if (dayData.closed) {
        return false;
      }

      return !dayData.open || !dayData.close || dayData.open >= dayData.close;
    });

    if (invalidDay) {
      toast.error(`Horaire invalide pour ${dayLabels[invalidDay]}.`);
      return;
    }

    try {
      setIsSavingInfo(true);
      const payload = {
        name: editInfoData.name,
        category: editInfoData.category,
        description: editInfoData.description,
        address: editInfoData.address,
        phone: editInfoData.phone,
        email: editInfoData.email,
        price_range: editInfoData.price_range,
        capacity: Number(editInfoData.capacity) || 1,
        latitude: toCoordinateNumber(editInfoData.latitude),
        longitude: toCoordinateNumber(editInfoData.longitude),
        opening_hours: normalizedOpeningHours,
      };

      if (editInfoData.profile_image_base64?.startsWith("data:image")) {
        payload.profile_image_base64 = editInfoData.profile_image_base64;
      }

      const updated = await establishmentService.update(establishment.id, payload);
      const normalizedUpdated = {
        ...updated,
        opening_hours: normalizeOpeningHours(updated.opening_hours),
      };
      setEstablishment(normalizedUpdated);
      setEditInfoData(normalizedUpdated);
      setIsEditingInfo(false);
      toast.success("Informations de l'etablissement mises a jour.");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Impossible de sauvegarder les informations.");
    } finally {
      setIsSavingInfo(false);
    }
  };

  const handleSaveService = async (event) => {
    event.preventDefault();

    if (!serviceForm.name || !serviceForm.price || !serviceForm.duration) {
      toast.error("Nom, prix et duree sont obligatoires.");
      return;
    }

    try {
      setIsSavingService(true);
      const payload = {
        name: serviceForm.name,
        description: serviceForm.description,
        price: Number(serviceForm.price),
        duration: Number(serviceForm.duration),
        is_active: true,
      };

      if (serviceForm.id) {
        const updated = await serviceService.update(serviceForm.id, payload);
        setServices((current) => current.map((item) => (item.id === serviceForm.id ? updated : item)));
      } else {
        const created = await serviceService.create(payload);
        setServices((current) => [created, ...current]);
      }

      setServiceForm(emptyServiceForm);
      toast.success("Service enregistre avec succes.");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Impossible d'enregistrer ce service.");
    } finally {
      setIsSavingService(false);
    }
  };

  const handleDeleteService = async (serviceId) => {
    try {
      await serviceService.delete(serviceId);
      setServices((current) => current.filter((item) => item.id !== serviceId));
      if (serviceForm.id === serviceId) {
        setServiceForm(emptyServiceForm);
      }
      toast.success("Service supprime.");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Impossible de supprimer ce service.");
    }
  };

  const renderReservationCard = (reservation, actions = []) => {
    const statusMeta = getReservationStatusMeta(reservation.status, reservation.status_label);

    return (
      <div key={reservation.id} className="glass-panel" style={{ display: "grid", gap: "0.9rem", padding: "1.25rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
          <div>
            <strong>{reservation.client_name || reservation.client_username || "Client"}</strong>
            <div style={{ color: "var(--text-muted)", marginTop: "0.35rem" }}>Ref #{reservation.id}</div>
          </div>
          <span className={`status-badge ${statusMeta.className}`}>{statusMeta.label}</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "0.65rem 1rem", color: "var(--text-secondary)" }}>
          <div>Date : {formatReservationDate(reservation.date)}</div>
          <div>Heure : {formatReservationTime(reservation.time)}</div>
          <div>Personnes : {reservation.number_of_people}</div>
          <div>Creneau : {reservation.slot_reserved_people}/{reservation.slot_capacity || establishment?.capacity || "?"}</div>
          <div>Places libres : {reservation.remaining_capacity ?? "N/A"}</div>
          <div>Email : {reservation.client_email || "Non renseigne"}</div>
        </div>
        {reservation.special_requests && <div style={{ color: "var(--text-muted)" }}>Demande speciale : {reservation.special_requests}</div>}
        {actions.length > 0 && <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>{actions}</div>}
      </div>
    );
  };

  const lastUpdatedLabel = lastUpdated
    ? lastUpdated.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "--:--";
  const editableOpeningHours = normalizeOpeningHours(editInfoData?.opening_hours);
  const publicOpeningHours = normalizeOpeningHours(establishment?.opening_hours);

  if (loading) {
    return <div className="container" style={{ textAlign: "center", padding: "4rem" }}><div className="spinner"></div> Chargement du tableau de bord...</div>;
  }

  if (!establishment) {
    return (
      <div className="container">
        <div className="glass-panel" style={{ textAlign: "center", padding: "3rem" }}>
          <h2>Aucun etablissement</h2>
          <p>Votre compte partenaire existe, mais aucun etablissement n'est encore configure.</p>
          <div style={{ marginTop: "1rem" }}><Button text="Revenir a l'inscription partenaire" className="btn-primary" onClick={() => { window.location.href = "/establishment-register"; }} /></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="section-header" style={{ textAlign: "left" }}>
        <h1 className="section-title">Tableau de bord : {establishment.name}</h1>
        <p className="section-subtitle" style={{ margin: 0, maxWidth: "unset" }}>Gerer les demandes recues, les places libres, l'historique et vos services.</p>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "center", flexWrap: "wrap", marginBottom: "1.5rem" }}>
        <div style={{ color: "var(--text-muted)" }}>Derniere mise a jour : {lastUpdatedLabel}</div>
        <Button text={isRefreshing ? "Actualisation..." : "Actualiser"} className="btn-secondary" onClick={() => loadDashboard(false)} disabled={isRefreshing} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        <div className="glass-panel"><div style={{ color: "var(--text-muted)" }}>En attente</div><div style={{ fontSize: "2rem", fontWeight: 700 }}>{pendingReservations.length}</div></div>
        <div className="glass-panel"><div style={{ color: "var(--text-muted)" }}>Acceptees</div><div style={{ fontSize: "2rem", fontWeight: 700 }}>{confirmedReservations.length}</div></div>
        <div className="glass-panel"><div style={{ color: "var(--text-muted)" }}>Places libres prochain creneau</div><div style={{ fontSize: "2rem", fontWeight: 700 }}>{occupancySnapshot[0]?.remainingCapacity ?? establishment.capacity}</div></div>
        <div className="glass-panel"><div style={{ color: "var(--text-muted)" }}>Historique</div><div style={{ fontSize: "2rem", fontWeight: 700 }}>{historyReservations.length}</div></div>
      </div>

      <div className="glass-panel" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ display: "flex", flexWrap: "wrap", borderBottom: "1px solid var(--border-color)", background: "rgba(15, 23, 42, 0.35)" }}>
          {[["reservations", "Demandes"], ["history", "Historique"], ["services", "Services"], ["settings", "Informations"]].map(([value, label]) => (
            <button key={value} type="button" onClick={() => setActiveTab(value)} style={{ flex: 1, minWidth: "180px", padding: "1rem", background: "transparent", border: "none", color: activeTab === value ? "var(--accent-color)" : "var(--text-color)", borderBottom: activeTab === value ? "2px solid var(--accent-color)" : "2px solid transparent", fontWeight: activeTab === value ? 700 : 500, cursor: "pointer" }}>{label}</button>
          ))}
        </div>

        <div style={{ padding: "2rem", display: "grid", gap: "2rem" }}>
          {activeTab === "reservations" && (
            <>
              <section style={{ display: "grid", gap: "1rem" }}>
                <div><h3 style={{ marginBottom: "0.35rem" }}>Creneaux et places libres</h3><p style={{ color: "var(--text-muted)", margin: 0 }}>Chaque creneau indique les places deja reservees et celles qui restent.</p></div>
                {occupancySnapshot.length === 0 ? <div className="glass-panel" style={{ color: "var(--text-muted)" }}>Aucun creneau occupe pour le moment.</div> : <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>{occupancySnapshot.map((slot) => <div key={slot.key} style={{ padding: "1rem", borderRadius: "14px", border: "1px solid var(--border-color)", background: "rgba(255,255,255,0.03)", display: "grid", gap: "0.4rem" }}><strong>{formatReservationDate(slot.date)}</strong><div>{formatReservationTime(slot.time)}</div><div style={{ color: "var(--text-secondary)" }}>{slot.guests}/{slot.slotCapacity} places reservees</div><span className="status-badge status-confirmed" style={{ width: "fit-content" }}>{slot.remainingCapacity} place(s) libre(s)</span></div>)}</div>}
              </section>

              <section style={{ display: "grid", gap: "1rem" }}>
                <div><h3 style={{ marginBottom: "0.35rem" }}>Demandes en attente</h3><p style={{ color: "var(--text-muted)", margin: 0 }}>Acceptez ou refusez les nouvelles demandes de reservation.</p></div>
                {pendingReservations.length === 0 ? <div className="glass-panel" style={{ color: "var(--text-muted)" }}>Aucune demande en attente.</div> : pendingReservations.map((reservation) => renderReservationCard(reservation, [<Button key="accept" text="Accepter" className="btn-primary" onClick={() => updateReservationStatus(reservation.id, "confirmed", "Reservation acceptee.")} />, <Button key="reject" text="Refuser" className="btn-outline" onClick={() => updateReservationStatus(reservation.id, "rejected", "Reservation refusee.")} />]))}
              </section>

              <section style={{ display: "grid", gap: "1rem" }}>
                <div><h3 style={{ marginBottom: "0.35rem" }}>Reservations acceptees</h3><p style={{ color: "var(--text-muted)", margin: 0 }}>Suivi des reservations confirmees avant leur passage en historique.</p></div>
                {confirmedReservations.length === 0 ? <div className="glass-panel" style={{ color: "var(--text-muted)" }}>Aucune reservation acceptee pour le moment.</div> : confirmedReservations.map((reservation) => renderReservationCard(reservation, [<Button key="complete" text="Marquer terminee" className="btn-secondary" onClick={() => updateReservationStatus(reservation.id, "completed", "Reservation terminee.")} />, <Button key="cancel" text="Annuler" className="btn-outline" onClick={() => updateReservationStatus(reservation.id, "cancelled", "Reservation annulee.")} />]))}
              </section>
            </>
          )}

          {activeTab === "history" && (
            <section style={{ display: "grid", gap: "1rem" }}>
              <div><h3 style={{ marginBottom: "0.35rem" }}>Historique des reservations</h3><p style={{ color: "var(--text-muted)", margin: 0 }}>Reservations terminees, refusees ou annulees.</p></div>
              {historyReservations.length === 0 ? <div className="glass-panel" style={{ color: "var(--text-muted)" }}>Aucun historique pour le moment.</div> : historyReservations.map((reservation) => renderReservationCard(reservation))}
            </section>
          )}

          {activeTab === "services" && (
            <div style={{ display: "grid", gridTemplateColumns: "minmax(280px, 360px) minmax(0, 1fr)", gap: "2rem" }}>
              <form onSubmit={handleSaveService} style={{ display: "grid", gap: "1rem" }}>
                <h3 style={{ margin: 0 }}>{serviceForm.id ? "Modifier un service" : "Ajouter un service"}</h3>
                <div><label className="form-label">Nom</label><Input type="text" value={serviceForm.name} onChange={(event) => setServiceForm((current) => ({ ...current, name: event.target.value }))} /></div>
                <div><label className="form-label">Description</label><textarea className="form-input" rows={4} value={serviceForm.description} onChange={(event) => setServiceForm((current) => ({ ...current, description: event.target.value }))} /></div>
                <div><label className="form-label">Prix (TND)</label><Input type="number" min="0" step="0.01" value={serviceForm.price} onChange={(event) => setServiceForm((current) => ({ ...current, price: event.target.value }))} /></div>
                <div><label className="form-label">Duree (minutes)</label><Input type="number" min="1" value={serviceForm.duration} onChange={(event) => setServiceForm((current) => ({ ...current, duration: event.target.value }))} /></div>
                <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}><Button type="submit" text={isSavingService ? "Enregistrement..." : "Enregistrer"} className="btn-primary" disabled={isSavingService} /><Button text="Reinitialiser" className="btn-secondary" type="button" onClick={() => setServiceForm(emptyServiceForm)} /></div>
              </form>

              <div style={{ display: "grid", gap: "1rem" }}>
                <h3 style={{ margin: 0 }}>Services proposes</h3>
                {services.length === 0 ? <div className="glass-panel" style={{ color: "var(--text-muted)" }}>Aucun service configure.</div> : services.map((service) => <div key={service.id} style={{ padding: "1rem", borderRadius: "12px", border: "1px solid var(--border-color)", background: "rgba(255,255,255,0.03)", display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}><div><strong>{service.name}</strong><div style={{ color: "var(--text-muted)", marginTop: "0.35rem" }}>{service.description || "Aucune description"}</div><div style={{ marginTop: "0.5rem" }}>{formatTnd(service.price)} - {service.duration} min</div></div><div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}><Button text="Modifier" className="btn-secondary" onClick={() => setServiceForm({ id: service.id, name: service.name || "", description: service.description || "", price: service.price || "", duration: service.duration || "" })} /><Button text="Supprimer" className="btn-outline" onClick={() => handleDeleteService(service.id)} /></div></div>)}
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div style={{ display: "grid", gap: "1rem" }}>
              <div
                className="glass-panel"
                style={{
                  padding: "1.25rem",
                  background: "rgba(59, 130, 246, 0.08)",
                  border: "1px solid rgba(59, 130, 246, 0.25)",
                  display: "grid",
                  gap: "1rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "1rem",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <h3 style={{ margin: 0 }}>Profil public de l'etablissement</h3>
                    <p style={{ margin: "0.35rem 0 0", color: "var(--text-muted)" }}>
                      Completez les informations visibles par vos clients.
                    </p>
                  </div>
                  {!isEditingInfo && (
                    <Button
                      text="Modifier"
                      className="btn-secondary"
                      onClick={() => setIsEditingInfo(true)}
                    />
                  )}
                </div>
                <div style={{ display: "grid", gap: "0.5rem" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <span style={{ color: "var(--text-secondary)" }}>Niveau de completion</span>
                    <strong>{profileCompletion.percent}%</strong>
                  </div>
                  <div
                    style={{
                      width: "100%",
                      height: "10px",
                      borderRadius: "999px",
                      background: "rgba(255, 255, 255, 0.12)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${profileCompletion.percent}%`,
                        height: "100%",
                        background:
                          profileCompletion.percent === 100
                            ? "var(--success-color)"
                            : "var(--accent-color)",
                        transition: "width 0.3s ease",
                      }}
                    />
                  </div>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                    {profileCompletion.filled}/{profileCompletion.total} sections completes
                  </div>
                </div>
              </div>

              {isEditingInfo ? (
                <>
                  <div>
                    <label className="form-label">Image principale</label>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                        gap: "1rem",
                        alignItems: "center",
                      }}
                    >
                      <img
                        src={editInfoData?.profile_image || fallbackCoverImage}
                        alt="Apercu"
                        style={{
                          width: "100%",
                          maxWidth: "220px",
                          height: "130px",
                          objectFit: "cover",
                          borderRadius: "14px",
                        }}
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfileImageChange}
                        style={{
                          width: "100%",
                          padding: "0.75rem",
                          borderRadius: "8px",
                          border: "1px solid var(--border-color)",
                          background: "var(--panel-bg)",
                          color: "var(--text-color)",
                          fontSize: "1rem",
                        }}
                      />
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                      gap: "1rem",
                    }}
                  >
                    <div>
                      <label className="form-label">Nom</label>
                      <Input
                        type="text"
                        value={editInfoData?.name || ""}
                        onChange={(event) => handleInfoFieldChange("name", event.target.value)}
                      />
                    </div>
                    <div>
                      <label className="form-label">Categorie</label>
                      <Input
                        type="text"
                        value={editInfoData?.category || ""}
                        onChange={(event) => handleInfoFieldChange("category", event.target.value)}
                      />
                    </div>
                    <div>
                      <label className="form-label">Adresse</label>
                      <Input
                        type="text"
                        value={editInfoData?.address || ""}
                        onChange={(event) => handleInfoFieldChange("address", event.target.value)}
                      />
                    </div>
                    <div>
                      <label className="form-label">Capacite</label>
                      <Input
                        type="number"
                        min="1"
                        value={editInfoData?.capacity || ""}
                        onChange={(event) => handleInfoFieldChange("capacity", event.target.value)}
                      />
                    </div>
                    <div>
                      <label className="form-label">Telephone</label>
                      <Input
                        type="text"
                        value={editInfoData?.phone || ""}
                        onChange={(event) => handleInfoFieldChange("phone", event.target.value)}
                      />
                    </div>
                    <div>
                      <label className="form-label">Email</label>
                      <Input
                        type="email"
                        value={editInfoData?.email || ""}
                        onChange={(event) => handleInfoFieldChange("email", event.target.value)}
                      />
                    </div>
                    <div>
                      <label className="form-label">Gamme de prix (TND)</label>
                      <Input
                        type="text"
                        value={editInfoData?.price_range || ""}
                        onChange={(event) => handleInfoFieldChange("price_range", event.target.value)}
                      />
                    </div>
                    <div>
                      <label className="form-label">Latitude</label>
                      <Input
                        type="number"
                        step="0.000001"
                        value={editInfoData?.latitude ?? ""}
                        onChange={(event) => handleInfoFieldChange("latitude", event.target.value)}
                      />
                    </div>
                    <div>
                      <label className="form-label">Longitude</label>
                      <Input
                        type="number"
                        step="0.000001"
                        value={editInfoData?.longitude ?? ""}
                        onChange={(event) => handleInfoFieldChange("longitude", event.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-input"
                      rows={5}
                      value={editInfoData?.description || ""}
                      onChange={(event) => handleInfoFieldChange("description", event.target.value)}
                    />
                  </div>

                  <div className="glass-panel" style={{ padding: "1rem", display: "grid", gap: "0.9rem" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "1rem",
                        flexWrap: "wrap",
                      }}
                    >
                      <h4 style={{ margin: 0 }}>Horaires d'ouverture</h4>
                      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                        <Button
                          text="Copier lundi partout"
                          className="btn-outline"
                          onClick={copyWeekdayHoursToAllOpenDays}
                        />
                        <Button
                          text="Fermer week-end"
                          className="btn-outline"
                          onClick={setWeekendClosed}
                        />
                      </div>
                    </div>

                    <div style={{ display: "grid", gap: "0.55rem" }}>
                      {orderedDays.map((day) => {
                        const hours = editableOpeningHours[day];
                        return (
                          <div
                            key={day}
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              alignItems: "center",
                              gap: "0.75rem",
                              padding: "0.75rem",
                              borderRadius: "10px",
                              border: "1px solid var(--border-color)",
                              background: "rgba(255,255,255,0.02)",
                            }}
                          >
                            <strong style={{ minWidth: "110px" }}>{dayLabels[day]}</strong>
                            <label style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
                              <input
                                type="checkbox"
                                checked={hours.closed}
                                onChange={(event) => handleDayClosedChange(day, event.target.checked)}
                              />
                              Ferme
                            </label>
                            <div style={{ display: "flex", gap: "0.5rem", flex: "1 1 260px" }}>
                              <Input
                                type="time"
                                value={hours.open}
                                disabled={hours.closed}
                                onChange={(event) =>
                                  handleOpeningHoursChange(day, "open", event.target.value)
                                }
                              />
                              <Input
                                type="time"
                                value={hours.close}
                                disabled={hours.closed}
                                onChange={(event) =>
                                  handleOpeningHoursChange(day, "close", event.target.value)
                                }
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                    <Button
                      text={isSavingInfo ? "Sauvegarde..." : "Sauvegarder"}
                      className="btn-primary"
                      onClick={handleSaveInfo}
                      disabled={isSavingInfo}
                    />
                    <Button
                      text="Annuler"
                      className="btn-secondary"
                      onClick={() => {
                        setIsEditingInfo(false);
                        setEditInfoData(establishment);
                      }}
                    />
                  </div>
                </>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                    gap: "1.25rem",
                    alignItems: "start",
                  }}
                >
                  <div style={{ display: "grid", gap: "0.75rem" }}>
                    <img
                      src={establishment.profile_image || fallbackCoverImage}
                      alt={establishment.name}
                      style={{
                        width: "100%",
                        maxWidth: "280px",
                        height: "170px",
                        objectFit: "cover",
                        borderRadius: "14px",
                      }}
                    />
                    {mapUrl && (
                      <a
                        href={mapUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-outline"
                        style={{ width: "fit-content" }}
                      >
                        Voir sur la carte
                      </a>
                    )}
                  </div>

                  <div style={{ display: "grid", gap: "0.65rem" }}>
                    <div><strong>Categorie :</strong> {establishment.category || "Non renseignee"}</div>
                    <div><strong>Adresse :</strong> {establishment.address || "Non renseignee"}</div>
                    <div><strong>Telephone :</strong> {establishment.phone || "Non renseigne"}</div>
                    <div><strong>Email :</strong> {establishment.email || "Non renseigne"}</div>
                    <div><strong>Capacite :</strong> {establishment.capacity || "N/A"} personnes</div>
                    <div><strong>Prix :</strong> {normalizePriceRange(establishment.price_range) || "Non renseigne"}</div>
                    <div>
                      <strong>Coordonnees :</strong>{" "}
                      {toCoordinateNumber(establishment.latitude) !== null &&
                      toCoordinateNumber(establishment.longitude) !== null
                        ? `${Number(establishment.latitude).toFixed(5)}, ${Number(establishment.longitude).toFixed(5)}`
                        : "Non renseignees"}
                    </div>
                    <div><strong>Description :</strong> {establishment.description || "Aucune description"}</div>
                    <div>
                      <strong>Horaires :</strong>
                      <div style={{ display: "grid", gap: "0.35rem", marginTop: "0.4rem" }}>
                        {orderedDays.map((day) => {
                          const hours = publicOpeningHours[day];
                          return (
                            <div
                              key={day}
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                gap: "1rem",
                                color: "var(--text-secondary)",
                                borderBottom: "1px solid var(--border-color)",
                                paddingBottom: "0.25rem",
                              }}
                            >
                              <span>{dayLabels[day]}</span>
                              <span>
                                {hours.closed ? "Ferme" : `${hours.open} - ${hours.close}`}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EstablishmentDashboard;
