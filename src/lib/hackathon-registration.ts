import type { Hackathon } from "@/types/hackathon";

export interface HackathonRegistrationState {
  canRegister: boolean;
  statusKey:
    | "open"
    | "not_started"
    | "closed"
    | "ended"
    | "paused"
    | "finished"
    | "full";
  badgeText: string;
  badgeVariant: "default" | "secondary" | "destructive" | "outline";
  buttonText: string;
  detailMessage: string | null;
  startDateFormatted: string | null;
  endDateFormatted: string | null;
  diffStartMs: number | null;
  diffEndMs: number | null;
  countdownStart: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null;
}

export function formatDateTime(
  iso: string | null | undefined,
  lang: "uz" | "ru" = "uz"
): string {
  if (!iso) return lang === "ru" ? "Не указано" : "Belgilanmagan";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime()))
    return lang === "ru" ? "Не указано" : "Belgilanmagan";
  return d.toLocaleString(lang === "ru" ? "ru-RU" : "uz-UZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRemainingTime(
  ms: number,
  lang: "uz" | "ru" = "uz"
): string {
  if (ms <= 0) return lang === "ru" ? "0 мин." : "0 daqiqa";
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));

  const parts: string[] = [];
  if (days > 0) {
    parts.push(lang === "ru" ? `${days} дн.` : `${days} kun`);
  }
  if (hours > 0 || days > 0) {
    parts.push(lang === "ru" ? `${hours} ч.` : `${hours} soat`);
  }
  parts.push(lang === "ru" ? `${mins} мин.` : `${mins} daqiqa`);

  return parts.join(" ");
}

export function getHackathonRegistrationState(
  hackathon: Hackathon | null | undefined,
  lang: "uz" | "ru" = "uz",
  currentTimeMs: number = Date.now()
): HackathonRegistrationState {
  if (!hackathon) {
    return {
      canRegister: false,
      statusKey: "closed",
      badgeText: lang === "ru" ? "Регистрация закрыта" : "Hozircha yopiq",
      badgeVariant: "secondary",
      buttonText: lang === "ru" ? "Регистрация закрыта" : "Hozircha yopiq",
      detailMessage: null,
      startDateFormatted: null,
      endDateFormatted: null,
      diffStartMs: null,
      diffEndMs: null,
      countdownStart: null,
    };
  }

  const now = currentTimeMs;
  const regStartMs = hackathon.registration_start_at
    ? new Date(hackathon.registration_start_at).getTime()
    : null;
  const regEndMs = hackathon.registration_end_at
    ? new Date(hackathon.registration_end_at).getTime()
    : null;
  const endMs = hackathon.end_at
    ? new Date(hackathon.end_at).getTime()
    : null;

  const startDateFormatted = formatDateTime(hackathon.registration_start_at, lang);
  const endDateFormatted = formatDateTime(hackathon.registration_end_at, lang);

  const diffStartMs =
    regStartMs !== null && !Number.isNaN(regStartMs) ? regStartMs - now : null;
  const diffEndMs =
    regEndMs !== null && !Number.isNaN(regEndMs) ? regEndMs - now : null;

  let countdownStart = null;
  if (diffStartMs !== null && diffStartMs > 0) {
    const days = Math.floor(diffStartMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (diffStartMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((diffStartMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffStartMs % (1000 * 60)) / 1000);
    countdownStart = { days, hours, minutes, seconds };
  }

  // 1. Paused
  if (hackathon.status === "paused") {
    return {
      canRegister: false,
      statusKey: "paused",
      badgeText:
        lang === "ru" ? "Приостановлен" : "Vaqtincha to'xtatilgan",
      badgeVariant: "destructive",
      buttonText:
        lang === "ru" ? "Хакатон приостановлен" : "Vaqtincha to'xtatilgan",
      detailMessage:
        lang === "ru"
          ? "Хакатон и регистрация временно приостановлены организаторами."
          : "Hakaton va ro'yxatdan o'tish tashkilotchilar tomonidan vaqtincha to'xtatilgan.",
      startDateFormatted,
      endDateFormatted,
      diffStartMs,
      diffEndMs,
      countdownStart,
    };
  }

  // 2. Finished or End time passed
  if (
    hackathon.status === "finished" ||
    hackathon.status === "cancelled" ||
    (endMs !== null && now > endMs)
  ) {
    return {
      canRegister: false,
      statusKey: "finished",
      badgeText: lang === "ru" ? "Завершен" : "Yakunlangan",
      badgeVariant: "secondary",
      buttonText: lang === "ru" ? "Хакатон завершен" : "Hakaton yakunlangan",
      detailMessage:
        lang === "ru"
          ? "Данный хакатон уже завершен."
          : "Ushbu hakaton allaqachon yakunlangan.",
      startDateFormatted,
      endDateFormatted,
      diffStartMs,
      diffEndMs,
      countdownStart,
    };
  }

  // 3. Registration not started yet (future registration_start_at)
  if (diffStartMs !== null && diffStartMs > 0) {
    const remainingStr = formatRemainingTime(diffStartMs, lang);
    return {
      canRegister: false,
      statusKey: "not_started",
      badgeText:
        lang === "ru"
          ? `Открытие через: ${remainingStr}`
          : `Ochilishiga: ${remainingStr}`,
      badgeVariant: "outline",
      buttonText:
        lang === "ru"
          ? `Регистрация откроется через ${remainingStr}`
          : `Ochilishiga: ${remainingStr} qoldi`,
      detailMessage:
        lang === "ru"
          ? `Регистрация еще не открыта. Дата открытия: ${startDateFormatted} (осталось: ${remainingStr}).`
          : `Ro'yxatdan o'tish hali ochilmagan. Ochilish sanasi: ${startDateFormatted} (qolgan vaqt: ${remainingStr}).`,
      startDateFormatted,
      endDateFormatted,
      diffStartMs,
      diffEndMs,
      countdownStart,
    };
  }

  // 4. Registration period ended (past registration_end_at)
  if (diffEndMs !== null && diffEndMs < 0) {
    return {
      canRegister: false,
      statusKey: "ended",
      badgeText:
        lang === "ru" ? "Срок регистрации истек" : "Qabul muddati tugagan",
      badgeVariant: "secondary",
      buttonText:
        lang === "ru" ? "Регистрация закрыта" : "Ro'yxatdan o'tish yopilgan",
      detailMessage:
        lang === "ru"
          ? `Срок регистрации завершился ${endDateFormatted}.`
          : `Ro'yxatdan o'tish muddati ${endDateFormatted} da yakunlangan.`,
      startDateFormatted,
      endDateFormatted,
      diffStartMs,
      diffEndMs,
      countdownStart,
    };
  }

  // 5. Explicitly closed via is_registration_open flag
  if (!hackathon.is_registration_open) {
    return {
      canRegister: false,
      statusKey: "closed",
      badgeText: lang === "ru" ? "Регистрация закрыта" : "Hozircha yopiq",
      badgeVariant: "secondary",
      buttonText: lang === "ru" ? "Регистрация закрыта" : "Hozircha yopiq",
      detailMessage:
        lang === "ru"
          ? "Регистрация в данный хакатон в настоящее время закрыта."
          : "Ushbu hakatonga ro'yxatdan o'tish hozircha yopiq.",
      startDateFormatted,
      endDateFormatted,
      diffStartMs,
      diffEndMs,
      countdownStart,
    };
  }

  // 6. Max participants limit reached
  if (
    hackathon.max_participants &&
    (hackathon.participants_count || 0) >= hackathon.max_participants
  ) {
    return {
      canRegister: false,
      statusKey: "full",
      badgeText: lang === "ru" ? "Мест нет" : "Joylar to'lgan",
      badgeVariant: "destructive",
      buttonText:
        lang === "ru"
          ? "Лимит мест исчерпан"
          : "Joylar to'lgan (Limitga yetgan)",
      detailMessage:
        lang === "ru"
          ? `Достигнут максимальный лимит участников (${hackathon.max_participants}).`
          : `Maksimal ishtirokchilar soni limitiga yetdi (${hackathon.max_participants} ta joy to'ldi).`,
      startDateFormatted,
      endDateFormatted,
      diffStartMs,
      diffEndMs,
      countdownStart,
    };
  }

  // 7. OPEN for registration!
  const closeRemainingStr =
    diffEndMs !== null && diffEndMs > 0
      ? formatRemainingTime(diffEndMs, lang)
      : null;

  return {
    canRegister: true,
    statusKey: "open",
    badgeText: lang === "ru" ? "Регистрация открыта" : "Qabul ochiq",
    badgeVariant: "default",
    buttonText:
      lang === "ru"
        ? "Зарегистрироваться в хакатоне"
        : "Hakatondan ro'yxatdan o'tish",
    detailMessage: closeRemainingStr
      ? lang === "ru"
        ? `До закрытия регистрации осталось: ${closeRemainingStr}`
        : `Ro'yxatdan o'tish yopilishiga qoldi: ${closeRemainingStr}`
      : null,
    startDateFormatted,
    endDateFormatted,
    diffStartMs,
    diffEndMs,
    countdownStart: null,
  };
}
