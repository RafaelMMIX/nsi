"use strict";

/* =========================================================
   NSI HUB — HORAIRES DE NSI ET RAPPELS
   - nsiHoraires        : créneaux, zone de vacances, rappels choisis
   - nsiHorairesEnvoyes : rappels déjà envoyés (pour ne pas les répéter)

   Chargé par la page Paramètres, et par preferences.js sur toutes les
   pages quand les notifications sont activées : les rappels du site
   ne peuvent partir que lorsqu'une page de NSI Hub est ouverte.
   Pour des rappels même site fermé : export .ics vers l'agenda.
   ========================================================= */

(() => {
    if (window.nsiHoraires) return;

    const KEY = "nsiHoraires";
    const SENT_KEY = "nsiHorairesEnvoyes";

    const DAYS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
    const ICS_DAYS = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

    // Rappels proposés (minutes avant le début du cours)
    const BEFORE_OPTIONS = [60, 30, 15, 10, 5];

    /* Calendrier scolaire (France métropolitaine). Une période [début, reprise] :
       les vacances commencent après les cours du jour de début, la reprise a lieu
       le matin du jour de reprise. À compléter chaque année (arrêté publié au JO). */
    const CALENDARS = [
        {
            year: "2026-2027",
            start: "2026-09-01",
            end: "2027-07-03",
            common: [["2026-10-17", "2026-11-02"], ["2026-12-19", "2027-01-04"]],
            zones: {
                A: [["2027-02-13", "2027-03-01"], ["2027-04-10", "2027-04-26"]],
                B: [["2027-02-20", "2027-03-08"], ["2027-04-17", "2027-05-03"]],
                C: [["2027-02-06", "2027-02-22"], ["2027-04-03", "2027-04-19"]]
            },
            // Jours fériés en semaine + pont de l'Ascension (pas de cours le 7 mai 2027)
            holidays: ["2026-11-11", "2027-03-29", "2027-05-06", "2027-05-07", "2027-05-17"]
        }
    ];

    const DEFAULTS = {
        slots: [],
        weekARef: null,
        zone: "aucune",
        reminders: { eve: true, eveTime: "19:00", before: [60, 10] },
        notifications: false
    };

    /* ---------- Stockage ---------- */

    function load() {
        let data = null;
        try { data = JSON.parse(localStorage.getItem(KEY)); } catch (_) {}
        if (!data || typeof data !== "object") data = {};
        const reminders = Object.assign({}, DEFAULTS.reminders, data.reminders || {});
        reminders.before = Array.isArray(reminders.before) ? reminders.before.filter(m => BEFORE_OPTIONS.includes(m)) : [];
        return {
            slots: Array.isArray(data.slots) ? data.slots.filter(validSlotShape) : [],
            weekARef: typeof data.weekARef === "string" ? data.weekARef : null,
            zone: ["A", "B", "C"].includes(data.zone) ? data.zone : "aucune",
            reminders,
            notifications: data.notifications === true
        };
    }

    function save(config) {
        try { localStorage.setItem(KEY, JSON.stringify(config)); return true; } catch (_) { return false; }
    }

    function validSlotShape(slot) {
        return slot && Number.isInteger(slot.day) && slot.day >= 1 && slot.day <= 6
            && /^\d{2}:\d{2}$/.test(slot.start) && /^\d{2}:\d{2}$/.test(slot.end);
    }

    function isValidSlot(slot) {
        return validSlotShape(slot) && toMinutes(slot.end) > toMinutes(slot.start);
    }

    /* ---------- Dates ---------- */

    const pad = n => String(n).padStart(2, "0");
    const toMinutes = time => { const [h, m] = time.split(":").map(Number); return h * 60 + m; };
    const dayKey = date => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    const parseDay = key => { const [y, m, d] = key.split("-").map(Number); return new Date(y, m - 1, d); };
    const addDays = (date, n) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + n);

    function atTime(date, time) {
        const [h, m] = time.split(":").map(Number);
        return new Date(date.getFullYear(), date.getMonth(), date.getDate(), h, m);
    }

    function mondayOf(date) {
        const day = (date.getDay() + 6) % 7; // lundi = 0
        return addDays(date, -day);
    }

    // "A" ou "B" pour la semaine de date, selon la semaine A de référence
    function weekType(date, ref) {
        if (!ref) return null;
        const weeks = Math.round((mondayOf(date) - mondayOf(parseDay(ref))) / (7 * 86400000));
        return ((weeks % 2) + 2) % 2 === 0 ? "A" : "B";
    }

    function calendarFor(date) {
        const key = dayKey(date);
        return CALENDARS.find(c => key >= c.start && key <= c.end) || null;
    }

    function lastKnownEnd() {
        return CALENDARS.reduce((max, c) => (c.end > max ? c.end : max), "");
    }

    // Vrai si pas de cours ce jour-là (vacances, jour férié, été)
    function isOff(date, zone) {
        if (zone === "aucune") return false;
        const key = dayKey(date);
        const cal = calendarFor(date);
        if (!cal) {
            // Hors des années connues : on coupe au moins l'été
            const month = date.getMonth();
            return month === 7 || (month === 6 && date.getDate() > 4);
        }
        if (cal.holidays.includes(key)) return true;
        const periods = cal.common.concat(cal.zones[zone] || []);
        return periods.some(([start, back]) => key > start && key < back);
    }

    /* ---------- Cours ---------- */

    // Cours entre from et to (Date), triés
    function occurrences(config, from, to, { ignoreHolidays = false } = {}) {
        const list = [];
        const slots = config.slots.filter(isValidSlot);
        if (!slots.length) return list;
        for (let day = new Date(from.getFullYear(), from.getMonth(), from.getDate()); day <= to; day = addDays(day, 1)) {
            const offDay = !ignoreHolidays && isOff(day, config.zone);
            for (const slot of slots) {
                if (slot.day !== day.getDay()) continue;
                if (slot.week === "A" || slot.week === "B") {
                    if (weekType(day, config.weekARef) !== slot.week) continue;
                }
                if (offDay) continue;
                const start = atTime(day, slot.start);
                const end = atTime(day, slot.end);
                if (end < from || start > to) continue;
                list.push({ slot, start, end });
            }
        }
        return list.sort((a, b) => a.start - b.start);
    }

    function nextCourse(config, now = new Date()) {
        const list = occurrences(config, now, addDays(now, 60));
        return list.find(o => o.end > now) || null;
    }

    function formatTime(time) {
        const [h, m] = time.split(":");
        return `${Number(h)} h ${m}`;
    }

    function describe(occurrence) {
        const { slot } = occurrence;
        return `${formatTime(slot.start)} – ${formatTime(slot.end)}${slot.room ? ` · salle ${slot.room}` : ""}`;
    }

    function relative(date, now = new Date()) {
        const minutes = Math.round((date - now) / 60000);
        if (minutes <= 0) return "en ce moment";
        if (minutes < 60) return `dans ${minutes} min`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `dans ${hours} h${minutes % 60 ? ` ${pad(minutes % 60)}` : ""}`;
        const days = Math.round(hours / 24);
        return `dans ${days} jour${days > 1 ? "s" : ""}`;
    }

    function beforeLabel(minutes) {
        return minutes >= 60 ? `${minutes / 60} h` : `${minutes} minutes`;
    }

    /* ---------- Rappels ---------- */

    const EVE_TIPS = [
        "Pense à revoir le dernier cours !",
        "Prépare ta clé USB et ton cahier.",
        "Un petit quiz sur NSI Hub pour réviser ?",
        "Vérifie que tu as fait les exercices.",
        "Un bon développeur dort la veille 😴"
    ];

    // Rappels dont l'heure tombe entre from et to
    function reminders(config, from, to) {
        const list = [];
        const { eve, eveTime, before } = config.reminders;
        const courses = occurrences(config, addDays(from, -1), addDays(to, 2));

        before.forEach(minutes => {
            courses.forEach(course => {
                const when = new Date(course.start - minutes * 60000);
                if (when < from || when > to) return;
                list.push({
                    when,
                    course,
                    key: `${course.slot.id}|${course.start.getTime()}|${minutes}`,
                    title: `NSI dans ${beforeLabel(minutes)} ⏰`,
                    body: describe(course)
                });
            });
        });

        if (eve && /^\d{2}:\d{2}$/.test(eveTime)) {
            // Un seul rappel la veille, même s'il y a plusieurs cours le lendemain
            const byDay = new Map();
            courses.forEach(course => {
                const key = dayKey(course.start);
                if (!byDay.has(key)) byDay.set(key, []);
                byDay.get(key).push(course);
            });
            byDay.forEach((dayCourses, key) => {
                const when = atTime(addDays(parseDay(key), -1), eveTime);
                if (when < from || when > to) return;
                list.push({
                    when,
                    course: dayCourses[0],
                    key: `veille|${key}`,
                    title: "Demain : cours de NSI 📚",
                    body: `${dayCourses.map(describe).join(" et ")}\n${EVE_TIPS[parseDay(key).getDate() % EVE_TIPS.length]}`
                });
            });
        }
        return list.sort((a, b) => a.when - b.when);
    }

    /* ---------- Notifications du site ---------- */

    const notificationsSupported = () => "Notification" in window;

    async function registration() {
        if (!("serviceWorker" in navigator)) return null;
        try {
            return (await navigator.serviceWorker.getRegistration()) || (await navigator.serviceWorker.register("sw.js"));
        } catch (_) {
            return null;
        }
    }

    async function notify(title, body, tag) {
        if (!notificationsSupported() || Notification.permission !== "granted") return false;
        const options = { body, tag, icon: "favicon.ico", lang: "fr" };
        // Sur Android, les notifications doivent passer par le service worker
        const reg = await registration();
        if (reg && reg.showNotification) {
            try { await reg.showNotification(title, options); return true; } catch (_) {}
        }
        try { new Notification(title, options); return true; } catch (_) { return false; }
    }

    function readSent() {
        try { return JSON.parse(localStorage.getItem(SENT_KEY)) || {}; } catch (_) { return {}; }
    }

    function markSent(key) {
        const sent = readSent();
        const limit = Date.now() - 3 * 86400000;
        Object.keys(sent).forEach(k => { if (sent[k] < limit) delete sent[k]; });
        sent[key] = Date.now();
        try { localStorage.setItem(SENT_KEY, JSON.stringify(sent)); } catch (_) {}
    }

    let timers = [];
    const MISSED_WINDOW = 10 * 60000; // rappel manqué de moins de 10 min : envoyé à l'ouverture

    function schedule() {
        timers.forEach(clearTimeout);
        timers = [];
        const config = load();
        if (!config.notifications || !notificationsSupported() || Notification.permission !== "granted") return;
        const now = new Date();
        const horizon = new Date(now.getTime() + 26 * 3600000);
        reminders(config, new Date(now - MISSED_WINDOW), horizon).forEach(reminder => {
            if (reminder.course.start <= now) return;
            const fire = () => {
                if (readSent()[reminder.key]) return; // déjà envoyé (autre onglet)
                markSent(reminder.key);
                notify(reminder.title, reminder.body, reminder.key);
            };
            const delay = reminder.when - now;
            if (delay <= 0) fire();
            else timers.push(setTimeout(fire, delay));
        });
    }

    function startScheduler() {
        schedule();
        setInterval(schedule, 30 * 60000);
        document.addEventListener("visibilitychange", () => { if (!document.hidden) schedule(); });
        window.addEventListener("storage", event => { if (event.key === KEY) schedule(); });
    }

    /* ---------- Export agenda (.ics) ---------- */

    const icsDate = date => `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;
    const icsLocal = date => `${icsDate(date)}T${pad(date.getHours())}${pad(date.getMinutes())}00`;
    const icsUTC = date => date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    const icsText = text => String(text).replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/([,;])/g, "\\$1");

    // Lignes de 75 octets maximum (RFC 5545)
    function fold(line) {
        const bytes = new TextEncoder();
        if (bytes.encode(line).length <= 75) return line;
        const parts = [];
        let current = "";
        for (const char of line) {
            const limit = parts.length ? 74 : 75;
            if (bytes.encode(current + char).length > limit) {
                parts.push(current);
                current = char;
            } else current += char;
        }
        parts.push(current);
        return parts.join("\r\n ");
    }

    const VTIMEZONE = [
        "BEGIN:VTIMEZONE", "TZID:Europe/Paris",
        "BEGIN:DAYLIGHT", "TZOFFSETFROM:+0100", "TZOFFSETTO:+0200", "TZNAME:CEST",
        "DTSTART:19700329T020000", "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU", "END:DAYLIGHT",
        "BEGIN:STANDARD", "TZOFFSETFROM:+0200", "TZOFFSETTO:+0100", "TZNAME:CET",
        "DTSTART:19701025T030000", "RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU", "END:STANDARD",
        "END:VTIMEZONE"
    ];

    // Fin de la période exportée : fin de l'année scolaire connue, sinon dans un an
    function exportEnd(now = new Date()) {
        const cal = calendarFor(now) || CALENDARS.find(c => c.start > dayKey(now));
        return cal ? parseDay(cal.end) : addDays(now, 365);
    }

    function buildICS(config, now = new Date()) {
        const end = exportEnd(now);
        const until = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59);
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const lines = [
            "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//NSI Hub//Horaires NSI//FR", "CALSCALE:GREGORIAN",
            "METHOD:PUBLISH", "X-WR-CALNAME:Cours de NSI", "X-WR-TIMEZONE:Europe/Paris", ...VTIMEZONE
        ];
        let count = 0;

        config.slots.filter(isValidSlot).forEach(slot => {
            const single = Object.assign({}, config, { slots: [slot] });
            // Toutes les dates du créneau (vacances comprises), puis celles à exclure
            const all = occurrences(single, today, until, { ignoreHolidays: true });
            if (!all.length) return;
            const kept = new Set(occurrences(single, today, until).map(o => o.start.getTime()));
            const first = all[0];
            const excluded = all.filter(o => !kept.has(o.start.getTime()));
            const firstEnd = atTime(first.start, slot.end);
            const interval = slot.week === "A" || slot.week === "B" ? 2 : 1;

            lines.push(
                "BEGIN:VEVENT",
                `UID:nsi-${slot.id}@nsi-hub`,
                `DTSTAMP:${icsUTC(now)}`,
                `DTSTART;TZID=Europe/Paris:${icsLocal(first.start)}`,
                `DTEND;TZID=Europe/Paris:${icsLocal(firstEnd)}`,
                `RRULE:FREQ=WEEKLY;INTERVAL=${interval};BYDAY=${ICS_DAYS[slot.day]};UNTIL=${icsUTC(until)}`
            );
            for (let i = 0; i < excluded.length; i += 10) {
                lines.push(`EXDATE;TZID=Europe/Paris:${excluded.slice(i, i + 10).map(o => icsLocal(o.start)).join(",")}`);
            }
            lines.push(
                `SUMMARY:${icsText(`Cours de NSI${slot.room ? ` (${slot.room})` : ""}`)}`,
                ...(slot.room ? [`LOCATION:${icsText(`Salle ${slot.room}`)}`] : []),
                `DESCRIPTION:${icsText(`Créneau ajouté depuis NSI Hub${interval === 2 ? ` (semaine ${slot.week})` : ""}.`)}`,
                "TRANSP:OPAQUE"
            );

            config.reminders.before.forEach(minutes => {
                lines.push("BEGIN:VALARM", "ACTION:DISPLAY", `DESCRIPTION:${icsText(`NSI dans ${beforeLabel(minutes)}`)}`, `TRIGGER:-PT${minutes}M`, "END:VALARM");
            });
            if (config.reminders.eve && /^\d{2}:\d{2}$/.test(config.reminders.eveTime)) {
                const minutes = toMinutes(slot.start) + 24 * 60 - toMinutes(config.reminders.eveTime);
                lines.push("BEGIN:VALARM", "ACTION:DISPLAY", "DESCRIPTION:Demain : cours de NSI", `TRIGGER:-PT${minutes}M`, "END:VALARM");
            }
            lines.push("END:VEVENT");
            count += 1;
        });

        lines.push("END:VCALENDAR");
        return { text: lines.map(fold).join("\r\n") + "\r\n", events: count, until: end };
    }

    window.nsiHoraires = {
        KEY, DAYS, BEFORE_OPTIONS, CALENDARS,
        load, save, isValidSlot, toMinutes, formatTime, dayKey, parseDay, addDays, mondayOf, weekType,
        calendarFor, lastKnownEnd, isOff, occurrences, nextCourse, describe, relative, beforeLabel,
        reminders, notify, notificationsSupported, registration, schedule, startScheduler, buildICS, exportEnd
    };

    startScheduler();
})();
