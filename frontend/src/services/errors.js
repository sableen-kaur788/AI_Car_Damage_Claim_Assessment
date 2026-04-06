export function getApiErrorMessage(error, fallbackMessage) {
  const detail = error?.response?.data?.detail;

  if (!detail) {
    return fallbackMessage;
  }

  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        if (typeof item === "string") {
          return item;
        }

        if (item && typeof item === "object") {
          const fieldPath = Array.isArray(item.loc) ? item.loc.slice(1).join(" -> ") : "";
          return fieldPath ? `${fieldPath}: ${item.msg}` : item.msg;
        }

        return "";
      })
      .filter(Boolean)
      .join(", ") || fallbackMessage;
  }

  if (typeof detail === "object" && detail.msg) {
    return detail.msg;
  }

  return fallbackMessage;
}
