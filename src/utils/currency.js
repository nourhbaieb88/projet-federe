export const PRICE_RANGES = [
  { label: "Budget (0-20 TND)", value: "0-20 TND - Budget" },
  { label: "Moyen (20-50 TND)", value: "20-50 TND - Moyen" },
  { label: "Premium (50-100 TND)", value: "50-100 TND - Premium" },
  { label: "Prestige (+100 TND)", value: "+100 TND - Prestige" },
];

export const formatTnd = (value) => {
  if (value === null || value === undefined || value === "") {
    return "Prix non renseigne";
  }

  const amount = Number(value);
  if (Number.isNaN(amount)) {
    return String(value).includes("TND") ? String(value) : `${value} TND`;
  }

  const formatted = amount.toLocaleString("fr-FR", {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });

  return `${formatted} TND`;
};

export const normalizePriceRange = (value) => {
  if (!value) {
    return "";
  }

  const text = String(value).toLowerCase();
  if (text.includes("budget") || text.includes("â‚¬ -")) {
    return PRICE_RANGES[0].value;
  }

  if (text.includes("moyen")) {
    return PRICE_RANGES[1].value;
  }

  if (text.includes("premium") || text.includes("elev") || text.includes("ã‰lev")) {
    return PRICE_RANGES[2].value;
  }

  if (text.includes("prestige") || text.includes("tres") || text.includes("trã")) {
    return PRICE_RANGES[3].value;
  }

  return String(value).includes("TND") ? String(value) : `${value} TND`;
};
