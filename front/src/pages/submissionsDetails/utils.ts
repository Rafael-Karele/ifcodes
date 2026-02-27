// Formata a data e retorna tambem string relativa (ex: "2h atras")
export function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffTime / (1000 * 60));

  const formatted = date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  let relative = "";

  if (diffMinutes < 1) {
    relative = "Agora mesmo";
  } else if (diffMinutes < 60) {
    relative = `${diffMinutes}min atras`;
  } else if (diffHours < 24) {
    relative = `${diffHours}h atras`;
  } else if (diffDays === 1) {
    relative = "Ontem";
  } else if (diffDays < 7) {
    relative = `${diffDays} dias atras`;
  } else {
    relative = `${Math.floor(diffDays / 7)} semanas atras`;
  }

  return { formatted, relative };
}
