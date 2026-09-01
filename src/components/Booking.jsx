import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useLanguage } from "../i18n/LanguageContext";
import { professionals, services, locations, serviceApiId } from "../data";
import {
  slotPeriod,
  isSlotInPast,
  isBookableDay,
  isClosedDay,
  isPastDay,
  isSameDay,
  dateToISO,
  addDays,
  startOfDay,
} from "../lib/availability";
import { fetchDisponibilidad, crearReservaServicio, ReservaError } from "../lib/reservasApi";
import Icon from "./Icon";
import Reveal from "./Reveal";
import Blossom, { BranchWatermark, FallingPetals, PetalScatter, SakuraDivider } from "./Sakura";
import "./Booking.css";

const STEPS = ["professional", "service", "datetime", "review"];

// Deliberately permissive: the job of this check is to catch the typo the
// visitor can still fix, not to adjudicate RFC 5322.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MIN_PHONE_DIGITS = 8;

function validateContact({ name, email, phone }, errorText) {
  const errors = {};
  const trimmedName = name.trim();
  if (!trimmedName) errors.name = errorText.nameRequired;
  else if (trimmedName.length < 2) errors.name = errorText.nameShort;

  const trimmedEmail = email.trim();
  if (!trimmedEmail) errors.email = errorText.emailRequired;
  else if (!EMAIL_RE.test(trimmedEmail)) errors.email = errorText.emailInvalid;

  // Counted in digits, not characters, so "+54 11 5555 5555" and
  // "1155555555" are judged the same way.
  const phoneDigits = phone.replace(/\D/g, "");
  if (!phone.trim()) errors.phone = errorText.phoneRequired;
  else if (phoneDigits.length < MIN_PHONE_DIGITS) errors.phone = errorText.phoneInvalid;

  return errors;
}

function ContactField({ id, label, error, fieldRef, ...inputProps }) {
  return (
    <div className={`review-field ${error ? "has-error" : ""}`}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        ref={fieldRef}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        {...inputProps}
      />
      {error && (
        <p className="review-field__error" id={`${id}-error`}>
          <Icon name="alert" size={14} />
          {error}
        </p>
      )}
    </div>
  );
}

export default function Booking({ preset }) {
  const { t, lang } = useLanguage();
  const fieldId = useId();
  const [stepIndex, setStepIndex] = useState(0);
  // The branch lives outside the four-step wizard: switching it is not
  // progress through the flow, it is a standing choice the visitor can
  // revisit at any point without losing their place in the steps.
  const [branchId, setBranchId] = useState(locations[0].id);
  const [professionalId, setProfessionalId] = useState(null);
  const [serviceId, setServiceId] = useState(null);
  const [weekStart, setWeekStart] = useState(() => startOfDay(new Date()));
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [contact, setContact] = useState({ name: "", email: "", phone: "" });
  const [errors, setErrors] = useState({});
  const [attempted, setAttempted] = useState(false);
  const [confirmed, setConfirmed] = useState(null);
  const [slots, setSlots] = useState([]);
  const [slotsRaw, setSlotsRaw] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState(false);
  const [slotsRefreshKey, setSlotsRefreshKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const phoneRef = useRef(null);
  const fieldRefs = { name: nameRef, email: emailRef, phone: phoneRef };

  const locale = lang === "es" ? "es-ES" : "en-US";
  const errorText = t.booking.review.errors;

  useEffect(() => {
    if (!preset) return;
    if (preset.professionalId) {
      setProfessionalId(preset.professionalId);
      // A photo from Portfolio names a specific professional, who works out
      // of one specific house — so the branch switches with them instead of
      // silently hiding them from a picker filtered to whatever branch was
      // already selected.
      const presetPro = professionals.find((p) => p.id === preset.professionalId);
      if (presetPro) setBranchId(presetPro.branch);
    }
    if (preset.serviceId) setServiceId(preset.serviceId);
    setConfirmed(null);
    if (preset.professionalId && preset.serviceId) setStepIndex(2);
    else if (preset.professionalId) setStepIndex(1);
    else if (preset.serviceId) setStepIndex(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset?.nonce]);

  const branch = locations.find((l) => l.id === branchId);
  const professional = professionals.find((p) => p.id === professionalId);
  const service = services.find((s) => s.id === serviceId);
  const branchProfessionals = useMemo(
    () => professionals.filter((p) => p.branch === branchId),
    [branchId]
  );

  // The panel swaps its whole contents without moving focus, which a screen
  // reader would otherwise report as silence. Derived, not stored: the live
  // region announces on change, and the change is the render.
  const announcement = confirmed
    ? t.booking.confirmed.title
    : `${t.booking.stepOf
        .replace("{n}", String(stepIndex + 1))
        .replace("{total}", String(STEPS.length))}: ${t.booking.steps[STEPS[stepIndex]]}`;

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  // The strip shows seven bare numbers, so without this the visitor has no way
  // to tell which month they are paging into — and a week that straddles a
  // month boundary names both.
  const weekLabel = useMemo(() => {
    const first = days[0];
    const last = days[6];
    const cap = (text) => text.charAt(0).toUpperCase() + text.slice(1);
    const month = (d) => cap(d.toLocaleDateString(locale, { month: "long" }));
    if (first.getMonth() === last.getMonth()) return `${month(first)} ${first.getFullYear()}`;
    if (first.getFullYear() === last.getFullYear())
      return `${month(first)} – ${month(last)} ${last.getFullYear()}`;
    return `${month(first)} ${first.getFullYear()} – ${month(last)} ${last.getFullYear()}`;
  }, [days, locale]);

  // The week can never reach into the past: the back arrow stops at the week
  // that contains today, and today's own already-gone slots drop out below.
  const atFirstWeek = useMemo(() => {
    const today = startOfDay(new Date());
    return startOfDay(weekStart) <= today;
  }, [weekStart]);

  // The backend hands back exact bookable start times for this professional +
  // service + day (it already excludes anything already reserved), so there
  // is nothing left to compute here beyond turning each ISO timestamp into
  // the "HH:mm" label the rest of the wizard works with, and dropping
  // today's slots that have already elapsed — the endpoint returns those too.
  useEffect(() => {
    const negocioId = branch?.negocioId;
    const profApiId = professional?.profesionalId;
    const svcApiId = serviceId ? serviceApiId(branchId, serviceId) : null;
    if (!selectedDate || !negocioId || !profApiId || !svcApiId) {
      setSlots([]);
      setSlotsRaw([]);
      setSlotsError(false);
      return;
    }
    let cancelled = false;
    setSlotsLoading(true);
    setSlotsError(false);
    fetchDisponibilidad(negocioId, profApiId, dateToISO(selectedDate), svcApiId)
      .then((iso) => {
        if (cancelled) return;
        const labels = iso.map(
          (s) => `${String(new Date(s).getUTCHours()).padStart(2, "0")}:${String(new Date(s).getUTCMinutes()).padStart(2, "0")}`
        );
        setSlotsRaw(labels);
        setSlots(labels.filter((slot) => !isSlotInPast(selectedDate, slot)));
      })
      .catch(() => {
        if (cancelled) return;
        setSlotsRaw([]);
        setSlots([]);
        setSlotsError(true);
      })
      .finally(() => {
        if (!cancelled) setSlotsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedDate, branchId, branch, professional, serviceId, slotsRefreshKey]);

  // A slot picked for a professional/service/date that has since changed (or
  // was just booked out from under the visitor) should not silently survive
  // into the review step as an invisible, unconfirmable choice.
  useEffect(() => {
    if (selectedSlot && !slots.includes(selectedSlot)) setSelectedSlot(null);
  }, [slots, selectedSlot]);

  const slotsByPeriod = useMemo(() => {
    const grouped = { morning: [], afternoon: [], evening: [] };
    slots.forEach((slot) => grouped[slotPeriod(slot)].push(slot));
    return grouped;
  }, [slots]);

  const anySlotAvailable = slots.length > 0;
  const allSlotsElapsed =
    Boolean(selectedDate) &&
    isSameDay(selectedDate, new Date()) &&
    slotsRaw.length > 0 &&
    slots.length === 0;

  // Step 2 only lists what this professional actually does. The old filter
  // ended in "|| true", which offered every service and let a visitor book a
  // facial with the nail technician.
  const offeredServices = useMemo(
    () => (professional ? services.filter((s) => professional.services.includes(s.id)) : services),
    [professional]
  );

  function goTo(i) {
    setStepIndex(Math.max(0, Math.min(STEPS.length - 1, i)));
  }

  function pickProfessional(id) {
    setProfessionalId(id);
    // A service the new professional does not offer would silently survive
    // into the review panel, so it goes with the old choice.
    const next = professionals.find((p) => p.id === id);
    if (serviceId && next && !next.services.includes(serviceId)) {
      setServiceId(null);
      setSelectedSlot(null);
    }
  }

  function pickBranch(id) {
    if (id === branchId) return;
    setBranchId(id);
    // The professional picked at the old house is not necessarily on staff
    // at the new one, and a booked-but-invisible person is worse than an
    // empty step — clear the date/slot with them since both were only ever
    // valid against the old branch's hours.
    if (professional && professional.branch !== id) {
      setProfessionalId(null);
      setServiceId(null);
    }
    setSelectedDate(null);
    setSelectedSlot(null);
  }

  function updateContact(field, value) {
    const next = { ...contact, [field]: value };
    setContact(next);
    // Errors are only recomputed once the visitor has tried to confirm, so
    // nobody is scolded for a half-typed email.
    if (attempted) setErrors(validateContact(next, errorText));
  }

  async function handleConfirm() {
    if (confirmed || submitting) return;
    const found = validateContact(contact, errorText);
    setAttempted(true);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      const firstInvalid = ["name", "email", "phone"].find((field) => found[field]);
      fieldRefs[firstInvalid]?.current?.focus();
      return;
    }
    setSubmitError(null);
    setSubmitting(true);
    const dateISO = dateToISO(selectedDate);
    try {
      const reserva = await crearReservaServicio({
        negocioId: branch.negocioId,
        profesionalId: professional.profesionalId,
        servicioId: serviceApiId(branchId, serviceId),
        inicio: `${dateISO}T${selectedSlot}:00.000Z`,
        clienteNombre: contact.name.trim(),
        clienteEmail: contact.email.trim(),
        clienteTelefono: contact.phone.trim(),
      });
      setConfirmed({
        branch,
        professional,
        service,
        // The Date itself travels to the confirmation. Re-parsing the ISO
        // string there is what made the review and the receipt disagree by a
        // day for anyone west of UTC.
        date: selectedDate,
        dateISO,
        slot: selectedSlot,
        name: contact.name.trim(),
        email: contact.email.trim(),
        phone: contact.phone.trim(),
        ticketNo: reserva.id.slice(0, 8).toUpperCase(),
      });
    } catch (err) {
      if (err instanceof ReservaError && err.status === 409) {
        setSubmitError(t.booking.review.slotTaken);
        setSelectedSlot(null);
        setSlotsRefreshKey((k) => k + 1);
        goTo(2);
      } else {
        setSubmitError(t.booking.review.submitError);
      }
    } finally {
      setSubmitting(false);
    }
  }

  function resetBooking() {
    setConfirmed(null);
    setProfessionalId(null);
    setServiceId(null);
    setWeekStart(startOfDay(new Date()));
    setSelectedDate(null);
    setSelectedSlot(null);
    setContact({ name: "", email: "", phone: "" });
    setErrors({});
    setAttempted(false);
    setSubmitError(null);
    setStepIndex(0);
  }

  const canAdvance = {
    0: Boolean(professionalId),
    1: Boolean(serviceId),
    2: Boolean(selectedDate && selectedSlot),
  };

  return (
    <section id="reservar" className="booking-section petal-ground">
      {/* A thinner petal fall than the hero's — the same weather, seen from
          indoors — so the page's first and last screens rhyme without the
          booking flow turning into confetti. */}
      <FallingPetals className="booking-section__petals" count={9} scale={0.8} />
      <PetalScatter className="booking-section__fallen" count={8} />
      <BranchWatermark className="booking-section__branch" flip />
      <Reveal className="section">
        <h2 className="section-kicker-free-heading">{t.booking.title}</h2>
        <p className="booking-subtitle">{t.booking.subtitle}</p>

        <p className="sr-only" role="status" aria-live="polite">
          {announcement}
        </p>

        {confirmed ? (
          <ConfirmedCard confirmed={confirmed} t={t} lang={lang} onReset={resetBooking} />
        ) : (
          <div className="booking-card">
            {/* Outside the numbered steps on purpose: it is a standing choice,
                not progress through the wizard, and switching it mid-flow
                should not read as going backward. */}
            <div
              className="booking-branch"
              role="group"
              aria-labelledby={`${fieldId}-branch-label`}
              aria-describedby={`${fieldId}-branch-hint`}
            >
              <span className="booking-branch__label" id={`${fieldId}-branch-label`}>
                {t.booking.branch.label}
              </span>
              <div className="booking-branch__options">
                {locations.map((loc) => (
                  <button
                    key={loc.id}
                    type="button"
                    className={`booking-branch__pill ${branchId === loc.id ? "is-selected" : ""}`}
                    aria-pressed={branchId === loc.id}
                    onClick={() => pickBranch(loc.id)}
                  >
                    {loc[lang].area}
                  </button>
                ))}
              </div>
              <p className="booking-branch__hours">{branch[lang].hours}</p>
              <p className="booking-branch__hint" id={`${fieldId}-branch-hint`}>
                {t.booking.branch.hint}
              </p>
            </div>

            <ol className="booking-steps">
              {STEPS.map((key, i) => (
                <li
                  key={key}
                  className={`booking-step ${i === stepIndex ? "is-active" : ""} ${i < stepIndex ? "is-done" : ""}`}
                >
                  <button
                    type="button"
                    onClick={() => i < stepIndex && goTo(i)}
                    disabled={i > stepIndex}
                    aria-current={i === stepIndex ? "step" : undefined}
                  >
                    <span className="booking-step__num numerals">{i + 1}</span>
                    {/* Wrapped so the phone can drop the label from the page
                        without dropping it from the button's accessible name —
                        four labels across a 375px row computed to 9.92px, which
                        is not small type, it is unreadable type. */}
                    <span className="booking-step__label">{t.booking.steps[key]}</span>
                  </button>
                </li>
              ))}
            </ol>

            <div className="booking-panel">
              {stepIndex === 0 && (
                <div className="pick-grid">
                  <h3>{t.booking.choose.professionalTitle}</h3>
                  {service && (
                    <p className="pick-grid__hint">
                      {t.booking.choose.professionalHint}
                      <button type="button" className="link-button" onClick={() => setServiceId(null)}>
                        {t.booking.choose.clearService}
                      </button>
                    </p>
                  )}
                  <div className="pick-grid__options">
                    {branchProfessionals.map((p) => {
                      const offers = !serviceId || p.services.includes(serviceId);
                      return (
                        <button
                          key={p.id}
                          type="button"
                          className={`pick-pro ${professionalId === p.id ? "is-selected" : ""}`}
                          disabled={!offers}
                          onClick={() => pickProfessional(p.id)}
                        >
                          <img src={p.photoSmall} alt="" width="56" height="56" loading="lazy" />
                          <span>
                            <strong>{p.name}</strong>
                            <small>{offers ? p[lang].specialty : t.booking.choose.notOffered}</small>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {stepIndex === 1 && (
                <div className="pick-grid">
                  <h3>{t.booking.choose.serviceTitle}</h3>
                  {professional && (
                    <p className="pick-grid__hint">
                      {t.booking.choose.serviceHint}
                      <button type="button" className="link-button" onClick={() => goTo(0)}>
                        {t.booking.choose.changeProfessional}
                      </button>
                    </p>
                  )}
                  <div className="pick-grid__options pick-grid__options--services">
                    {offeredServices.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        className={`pick-service ${serviceId === s.id ? "is-selected" : ""}`}
                        onClick={() => setServiceId(s.id)}
                      >
                        <Icon name={s.icon} size={20} />
                        <span className="pick-service__name">{s[lang].name}</span>
                        <span className="pick-service__price numerals">${s.price}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {stepIndex === 2 && (
                <div className="date-picker">
                  <h3>{t.booking.calendar.title}</h3>
                  {/* The week arrows sit on their own line with the month rather
                      than flanking the days. Beside a seven-column grid they were
                      the two things a phone had no room for: at 375px the right
                      arrow landed 51px past the card's edge, inside a container
                      that clips — so the only control for reaching next week was
                      invisible and unreachable on the device most likely to need
                      it. Up here they also gain the width to be real targets, and
                      the strip finally says which month it is showing. */}
                  <div className="date-strip">
                    <div className="date-strip__head">
                      <p className="date-strip__month">{weekLabel}</p>
                      <div className="date-strip__nav">
                        <button
                          type="button"
                          className="date-strip__arrow"
                          disabled={atFirstWeek}
                          onClick={() => setWeekStart((d) => addDays(d, -7))}
                          aria-label={t.booking.calendar.prevWeek}
                        >
                          <Icon name="chevronLeft" size={18} />
                        </button>
                        <button
                          type="button"
                          className="date-strip__arrow"
                          onClick={() => setWeekStart((d) => addDays(d, 7))}
                          aria-label={t.booking.calendar.nextWeek}
                        >
                          <Icon name="chevronRight" size={18} />
                        </button>
                      </div>
                    </div>
                    <div className="date-strip__days">
                      {days.map((d) => {
                        const iso = dateToISO(d);
                        const isSelected = selectedDate && dateToISO(selectedDate) === iso;
                        const closed = isClosedDay(d, branch.closedWeekdays);
                        const past = isPastDay(d);
                        const bookable = isBookableDay(d, new Date(), branch.closedWeekdays);
                        return (
                          <button
                            key={iso}
                            type="button"
                            disabled={!bookable}
                            className={`date-chip ${isSelected ? "is-selected" : ""} ${bookable ? "" : "is-unavailable"}`}
                            onClick={() => {
                              setSelectedDate(d);
                              setSelectedSlot(null);
                            }}
                          >
                            <span className="date-chip__dow">
                              {d.toLocaleDateString(locale, { weekday: "short" })}
                            </span>
                            <span className="date-chip__num numerals">{d.getDate()}</span>
                            {!bookable && (
                              <span className="date-chip__badge">
                                {past ? t.booking.calendar.pastBadge : t.booking.calendar.closedBadge}
                              </span>
                            )}
                            {closed && !past && <span className="sr-only">{t.booking.calendar.closedNote}</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {selectedDate && (
                    <div className="slot-groups">
                      {slotsLoading ? (
                        <p className="slot-empty">{t.booking.calendar.loadingSlots}</p>
                      ) : slotsError ? (
                        <p className="review-error-summary" role="alert">
                          <Icon name="alert" size={15} />
                          {t.booking.calendar.slotsError}
                        </p>
                      ) : allSlotsElapsed ? (
                        <p className="slot-empty">{t.booking.calendar.noSlotsToday}</p>
                      ) : (
                        !anySlotAvailable && <p className="slot-empty">{t.booking.calendar.noSlots}</p>
                      )}
                      {!slotsLoading &&
                        !slotsError &&
                        ["morning", "afternoon", "evening"].map(
                          (period) =>
                            slotsByPeriod[period].length > 0 && (
                              <div className="slot-group" key={period}>
                                <span className="slot-group__label">{t.booking.calendar[period]}</span>
                                <div className="slot-group__row">
                                  {slotsByPeriod[period].map((slot) => (
                                    <button
                                      key={slot}
                                      type="button"
                                      className={`slot-btn numerals ${selectedSlot === slot ? "is-selected" : ""}`}
                                      onClick={() => setSelectedSlot(slot)}
                                    >
                                      {slot}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )
                        )}
                    </div>
                  )}
                </div>
              )}

              {stepIndex === 3 && (
                <div className="review-panel">
                  <h3>{t.booking.review.title}</h3>
                  <dl className="review-list">
                    <div>
                      <dt>{t.booking.review.branch}</dt>
                      <dd>{branch[lang].name}</dd>
                    </div>
                    <div>
                      <dt>{t.booking.review.professional}</dt>
                      <dd>{professional?.name}</dd>
                    </div>
                    <div>
                      <dt>{t.booking.review.service}</dt>
                      <dd>{service?.[lang].name}</dd>
                    </div>
                    <div>
                      <dt>{t.booking.review.date}</dt>
                      <dd>
                        {selectedDate?.toLocaleDateString(locale, {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                        })}
                      </dd>
                    </div>
                    <div>
                      <dt>{t.booking.review.time}</dt>
                      <dd className="numerals">{selectedSlot}</dd>
                    </div>
                    <div>
                      <dt>{t.booking.review.duration}</dt>
                      <dd className="numerals">
                        {t.booking.review.durationValue.replace("{n}", String(service?.duration))}
                      </dd>
                    </div>
                    <div>
                      <dt>{t.booking.review.price}</dt>
                      <dd className="numerals">${service?.price}</dd>
                    </div>
                  </dl>

                  <h4 className="review-contact__title">{t.booking.review.contactTitle}</h4>
                  <p className="review-contact__hint">{t.booking.review.contactHint}</p>

                  {attempted && Object.keys(errors).length > 0 && (
                    <p className="review-error-summary" role="alert">
                      <Icon name="alert" size={15} />
                      {t.booking.review.errorSummary}
                    </p>
                  )}

                  {submitError && (
                    <p className="review-error-summary" role="alert">
                      <Icon name="alert" size={15} />
                      {submitError}
                    </p>
                  )}

                  <div className="review-fields">
                    <ContactField
                      id={`${fieldId}-name`}
                      label={t.booking.review.name}
                      error={errors.name}
                      fieldRef={nameRef}
                      type="text"
                      name="name"
                      autoComplete="name"
                      maxLength={60}
                      value={contact.name}
                      placeholder={t.booking.review.namePlaceholder}
                      onChange={(e) => updateContact("name", e.target.value)}
                    />
                    <ContactField
                      id={`${fieldId}-email`}
                      label={t.booking.review.email}
                      error={errors.email}
                      fieldRef={emailRef}
                      type="email"
                      name="email"
                      autoComplete="email"
                      inputMode="email"
                      maxLength={120}
                      value={contact.email}
                      placeholder={t.booking.review.emailPlaceholder}
                      onChange={(e) => updateContact("email", e.target.value)}
                    />
                    <ContactField
                      id={`${fieldId}-phone`}
                      label={t.booking.review.phone}
                      error={errors.phone}
                      fieldRef={phoneRef}
                      type="tel"
                      name="phone"
                      autoComplete="tel"
                      inputMode="tel"
                      maxLength={30}
                      value={contact.phone}
                      placeholder={t.booking.review.phonePlaceholder}
                      onChange={(e) => updateContact("phone", e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="booking-nav">
              {stepIndex > 0 && (
                <button type="button" className="booking-nav__back" onClick={() => goTo(stepIndex - 1)}>
                  <Icon name="chevronLeft" size={16} />
                  {t.booking.review.back}
                </button>
              )}
              <div className="booking-nav__spacer" />
              {stepIndex < 3 ? (
                <span className="booking-nav__next-wrap">
                  {/* A disabled "Confirmar →" with no reason reads as broken,
                      not as "pick something first" — this names the one
                      thing still missing. */}
                  {!canAdvance[stepIndex] && (
                    <span className="booking-nav__hint" id={`${fieldId}-next-hint`}>
                      {t.booking.nextHint[STEPS[stepIndex]]}
                    </span>
                  )}
                  <button
                    type="button"
                    className="booking-nav__next"
                    disabled={!canAdvance[stepIndex]}
                    aria-describedby={!canAdvance[stepIndex] ? `${fieldId}-next-hint` : undefined}
                    onClick={() => goTo(stepIndex + 1)}
                  >
                    {t.booking.steps[STEPS[stepIndex + 1]]}
                    <Icon name="arrowRight" size={16} />
                  </button>
                </span>
              ) : (
                <button
                  type="button"
                  className="booking-nav__confirm"
                  disabled={submitting}
                  onClick={handleConfirm}
                >
                  {submitting ? t.booking.review.confirming : t.booking.review.confirm}
                  <Icon name="check" size={17} />
                </button>
              )}
            </div>
          </div>
        )}
      </Reveal>
    </section>
  );
}

function ConfirmedCard({ confirmed, t, lang, onReset }) {
  const headingRef = useRef(null);
  const dateLabel = confirmed.date.toLocaleDateString(lang === "es" ? "es-ES" : "en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  // The card replaces the whole wizard, so focus has to follow it; without
  // this the browser drops focus on <body> and a keyboard visitor lands back
  // at the top of the document with no idea the booking went through.
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <div className="confirmed-wrap">
      <div className="confirmed-card">
        <SakuraDivider />
        {/* The confirmation opens a blossom rather than ticking a checkmark:
            the booking's payoff moment is the one place the motif gets to be
            the message. The tick sits in the flower's heart, where the stamens
            would be — a pale tick straight on the petals had no contrast and
            read as a smudge. */}
        <div className="confirmed-card__bloom" aria-hidden="true">
          <Blossom size={86} color="var(--sakura)" stamens={false} className="confirmed-card__blossom" />
          <span className="confirmed-card__heart">
            <Icon name="check" size={19} />
          </span>
        </div>
        <h3 ref={headingRef} tabIndex={-1}>
          {t.booking.confirmed.title}
        </h3>
        <p className="confirmed-card__subtitle">{t.booking.confirmed.subtitle}</p>

        <div className="confirmed-card__panel">
          <div className="confirmed-card__panel-row">
            <span>{t.booking.confirmed.ticketNo}</span>
            <span className="numerals">{confirmed.ticketNo}</span>
          </div>
          <dl className="confirmed-card__details">
            <div className="confirmed-card__details-wide">
              <dt>{t.booking.review.branch}</dt>
              <dd>
                {confirmed.branch?.[lang].name} — {confirmed.branch?.[lang].address}
              </dd>
            </div>
            <div>
              <dt>{t.booking.review.professional}</dt>
              <dd>{confirmed.professional?.name}</dd>
            </div>
            <div>
              <dt>{t.booking.review.service}</dt>
              <dd>{confirmed.service?.[lang].name}</dd>
            </div>
            <div>
              <dt>{t.booking.review.date}</dt>
              <dd>{dateLabel}</dd>
            </div>
            <div>
              <dt>{t.booking.review.time}</dt>
              <dd className="numerals">{confirmed.slot}</dd>
            </div>
            <div>
              <dt>{t.booking.review.duration}</dt>
              <dd className="numerals">
                {t.booking.review.durationValue.replace("{n}", String(confirmed.service?.duration))}
              </dd>
            </div>
            <div>
              <dt>{t.booking.review.name}</dt>
              <dd>{confirmed.name}</dd>
            </div>
            <div>
              <dt>{t.booking.review.phone}</dt>
              <dd className="numerals">{confirmed.phone}</dd>
            </div>
            <div className="confirmed-card__details-wide">
              <dt>{t.booking.review.email}</dt>
              <dd>{confirmed.email}</dd>
            </div>
          </dl>
        </div>

        <p className="confirmed-card__footnote">{t.booking.confirmed.emailNote}</p>
        <button type="button" className="confirmed-card__reset" onClick={onReset}>
          {t.booking.confirmed.another}
        </button>
      </div>
    </div>
  );
}
