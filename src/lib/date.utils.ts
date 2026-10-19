import { Temporal, Intl as TemporalIntl } from "@js-temporal/polyfill";

const DEFAULT_LOCALE: string = "es-ES";
const DEFAULT_TZ: string = "Europe/Madrid";

type DateInput =
  | Temporal.Instant
  | Temporal.ZonedDateTime
  | Date
  | string
  | number;

function toTemporal(
  input: DateInput,
  tz: string = DEFAULT_TZ,
): Temporal.ZonedDateTime {
  if (typeof input === "string") {
    return Temporal.Instant.from(input).toZonedDateTimeISO(tz);
  }
  if (typeof input === "number") {
    return Temporal.Instant.fromEpochMilliseconds(
      Math.round(input < 1e12 ? input * 1000 : input),
    ).toZonedDateTimeISO(tz);
  }
  if (input instanceof Temporal.Instant) {
    return input.toZonedDateTimeISO(tz);
  }
  if (input instanceof Temporal.ZonedDateTime) {
    return input.withTimeZone(tz);
  }

  return Temporal.ZonedDateTime.from(
    new Date(input).toISOString().replace("Z", `+00:00[${tz}]`),
  );
}

export function formatDate(
  input: DateInput,
  options: Intl.DateTimeFormatOptions & {
    relative?: false;
    locale?: string;
  } = {},
): string {
  const dt = toTemporal(input, options.timeZone);

  const formatter = new TemporalIntl.DateTimeFormat(options.locale ?? "es-ES", {
    year: options.year ?? "numeric",
    month: options.month ?? "short",
    day: options.day ?? "numeric",
    hour: options.hour ?? "2-digit",
    minute: options.minute ?? "2-digit",
    second: options.second ?? "2-digit",
    timeZoneName: options.timeZoneName ?? "short",
    ...options,
  });

  return formatter.format(dt.toPlainDateTime());
}

export function formatRelative(
  input: DateInput,
  options: { locale?: string; maxUnits?: Intl.RelativeTimeFormatUnit } = {},
) {
  const locale = options.locale ?? "es-ES";
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  const dt = toTemporal(input);
  const now = Temporal.Now.zonedDateTimeISO(DEFAULT_TZ);

  const diff = dt.since(now);

  const units = options.maxUnits ?? "day";

  function getValue(unit: Intl.RelativeTimeFormatUnit): number {
    switch (unit) {
      case "year":
        return Math.round(diff.years);
      case "month":
        return Math.round(diff.months);
      case "day":
        return Math.round(diff.days);
      case "hour":
        return Math.round(diff.hours);
      case "minute":
        return Math.round(diff.minutes);
      case "second":
        return Math.round(diff.seconds);
      default:
        return 0;
    }
  }

  const value = getValue(units);

  if (value === 0) {
    return formatDate(input, { locale });
  }

  return rtf.format(value, units);
}

export function formatDateShort(input: DateInput, locale?: string) {
  formatDate(input, { locale, month: "numeric", day: "numeric" });
}

export function formatDateLong(input: DateInput, locale?: string) {
  formatDate(input, { locale, month: "long", day: "numeric", year: "numeric" });
}

export function formatDateTime(input: DateInput, locale?: string) {
  formatDate(input, { locale, hour: "2-digit", minute: "2-digit" });
}

export function formatRelativeNow(input: DateInput, locale?: string) {
  formatRelative(input, { locale, maxUnits: "day" });
}

export function isToday(input: DateInput): boolean {
  const dt = toTemporal(input);
  const today = Temporal.Now.zonedDateTimeISO(DEFAULT_TZ).toPlainDate();

  return dt.toPlainDate().equals(today);
}

export function isFuture(input: DateInput): boolean {
  const dt = toTemporal(input);
  const now = Temporal.Now.zonedDateTimeISO(DEFAULT_TZ);
  return dt.since(now).total({ unit: "second" }) > 0;
}

export function isPast(input: DateInput): boolean {
  return !isFuture(input);
}

export function addDays(input: DateInput, days: number) {
  const dt = toTemporal(input);
  dt.add({ days });
}

export function subDays(input: DateInput, days: number) {
  const dt = toTemporal(input);
  dt.subtract({ days });
}

export function startOfDay(input: DateInput) {
  const dt = toTemporal(input);
  const plainDate = dt.toPlainDate();
  return plainDate.toPlainDateTime("00:00:00").toZonedDateTime(dt.offset);
}

export function endOfDay(input: DateInput) {
  const dt = toTemporal(input);
  const plainDate = dt.toPlainDate();
  return plainDate
    .add({ days: 1 })
    .toPlainDateTime("00:00:00")
    .toZonedDateTime(dt.offset)
    .subtract({ nanoseconds: 1 });
}

export function differenceInDays(input: DateInput, other?: DateInput): number {
  const dt = toTemporal(input);
  const otherDt = other
    ? toTemporal(other)
    : Temporal.Now.zonedDateTimeISO(DEFAULT_TZ);
  return Math.abs(dt.since(otherDt).days);
}
