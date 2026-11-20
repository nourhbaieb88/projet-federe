export const DEFAULT_LOCATION = { lat: 36.8065, lng: 10.1815 };

export const reverseGeocode = async (lat, lng) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=fr`
    );
    const data = await response.json();

    if (data?.display_name) {
      return data.display_name.split(", ").slice(0, 4).join(", ");
    }
  } catch (error) {
    console.error("Erreur localisation:", error);
  }

  return "";
};
