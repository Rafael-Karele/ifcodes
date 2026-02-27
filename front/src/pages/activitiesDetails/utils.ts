export function formatDate(dateString: string) {
  const date = new Date(dateString);

  if (!dateString || isNaN(date.getTime())) {
    return { formatted: "Data indispon\u00edvel", relative: "", isOverdue: false };
  }

  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const formatted = date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  let relative = "";
  let isOverdue = false;

  if (diffDays < 0) {
    relative = `${Math.abs(diffDays)} dias atr\u00e1s`;
    isOverdue = true;
  } else if (diffDays === 0) {
    relative = "Hoje";
  } else if (diffDays === 1) {
    relative = "Amanh\u00e3";
  } else {
    relative = `Em ${diffDays} dias`;
  }

  return { formatted, relative, isOverdue };
}
