"use strict";

/* =========================================================
   NSI HUB — PARAMÈTRES : MES COURS DE NSI
   Éditeur de créneaux, rappels, export agenda, notifications.
   Toute la logique de calcul est dans horaires.js.
   ========================================================= */

(() => {
    const H = window.nsiHoraires;
    if (!H) return;

    const $ = id => document.getElementById(id);
    const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
    const capitalize = text => text.charAt(0).toUpperCase() + text.slice(1);

    let config = H.load();
    let savedTimer = null;

    function persist(message = "Enregistré ✓") {
        const ok = H.save(config);
        const badge = $("horaires-saved");
        badge.textContent = ok ? message : "Impossible d'enregistrer (stockage plein ?)";
        badge.classList.toggle("error", !ok);
        badge.classList.add("visible");
        clearTimeout(savedTimer);
        savedTimer = setTimeout(() => badge.classList.remove("visible"), 1800);
        H.schedule();
    }

    /* ---------- Créneaux ---------- */

    const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

    function renderSlots() {
        const box = $("horaires-slots");
        if (!config.slots.length) {
            box.innerHTML = `<p class="horaires-empty"><i class="fa-regular fa-calendar"></i> Ajoute ton premier créneau de NSI avec le bouton ci-dessous.</p>`;
        } else {
            box.innerHTML = config.slots.map(slot => `
                <div class="horaires-slot${H.isValidSlot(slot) ? "" : " invalid"}" data-id="${slot.id}">
                    <select class="setting-input" data-field="day" aria-label="Jour">
                        ${[1, 2, 3, 4, 5, 6].map(d => `<option value="${d}"${slot.day === d ? " selected" : ""}>${capitalize(H.DAYS[d])}</option>`).join("")}
                    </select>
                    <span class="horaires-range">
                        <input type="time" class="setting-input" data-field="start" value="${slot.start}" aria-label="Début du cours" required>
                        <span aria-hidden="true">→</span>
                        <input type="time" class="setting-input" data-field="end" value="${slot.end}" aria-label="Fin du cours" required>
                    </span>
                    <input type="text" class="setting-input" data-field="room" value="${escapeHTML(slot.room || "")}" placeholder="Salle" maxlength="20" aria-label="Salle">
                    <select class="setting-input" data-field="week" aria-label="Semaines">
                        <option value="toutes"${!slot.week || slot.week === "toutes" ? " selected" : ""}>Toutes les semaines</option>
                        <option value="A"${slot.week === "A" ? " selected" : ""}>Semaine A</option>
                        <option value="B"${slot.week === "B" ? " selected" : ""}>Semaine B</option>
                    </select>
                    <button type="button" class="horaires-delete" data-delete aria-label="Supprimer ce créneau" title="Supprimer"><i class="fa-solid fa-trash"></i></button>
                    <p class="horaires-slot-error">L'heure de fin doit être après l'heure de début.</p>
                </div>`).join("");
        }
        renderWeekRow();
        renderNext();
    }

    $("horaires-slots").addEventListener("change", event => {
        const row = event.target.closest(".horaires-slot");
        const field = event.target.dataset.field;
        if (!row || !field) return;
        const slot = config.slots.find(s => s.id === row.dataset.id);
        if (!slot) return;
        const value = event.target.value;
        if (field === "day") slot.day = Number(value);
        else if (field === "room") slot.room = value.trim();
        else if (field === "week") slot.week = value;
        else if (/^\d{2}:\d{2}$/.test(value)) slot[field] = value;
        row.classList.toggle("invalid", !H.isValidSlot(slot));
        if ((field === "week") && (value === "A" || value === "B") && !config.weekARef) {
            config.weekARef = H.dayKey(H.mondayOf(new Date())); // par défaut : cette semaine est une semaine A
        }
        persist();
        renderWeekRow();
        renderNext();
    });

    $("horaires-slots").addEventListener("click", event => {
        const button = event.target.closest("[data-delete]");
        if (!button) return;
        const id = button.closest(".horaires-slot").dataset.id;
        config.slots = config.slots.filter(s => s.id !== id);
        persist("Créneau supprimé");
        renderSlots();
    });

    $("horaires-add").addEventListener("click", () => {
        // Le nouveau créneau reprend les horaires du précédent, le jour suivant
        const last = config.slots[config.slots.length - 1];
        config.slots.push({
            id: newId(),
            day: last ? (last.day % 6) + 1 : 1,
            start: last ? last.start : "08:00",
            end: last ? last.end : "10:00",
            room: last ? last.room || "" : "",
            week: "toutes"
        });
        persist("Créneau ajouté");
        renderSlots();
        const rows = document.querySelectorAll(".horaires-slot");
        rows[rows.length - 1].querySelector("select").focus();
    });

    /* ---------- Semaine A / B ---------- */

    function renderWeekRow() {
        const needed = config.slots.some(s => s.week === "A" || s.week === "B");
        $("horaires-week-row").hidden = !needed;
        if (!needed) return;
        const monday = H.mondayOf(new Date());
        const saturday = H.addDays(monday, 5);
        const format = date => date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
        $("horaires-week-label").textContent = `La semaine en cours (du ${format(monday)} au ${format(saturday)}) est une semaine :`;
        const current = H.weekType(new Date(), config.weekARef);
        document.querySelectorAll("[data-week]").forEach(button => {
            const active = button.dataset.week === current;
            button.classList.toggle("active", active);
            button.setAttribute("aria-checked", String(active));
        });
    }

    document.querySelectorAll("[data-week]").forEach(button => {
        button.addEventListener("click", () => {
            const monday = H.mondayOf(new Date());
            config.weekARef = H.dayKey(button.dataset.week === "A" ? monday : H.addDays(monday, -7));
            persist();
            renderWeekRow();
            renderNext();
        });
    });

    /* ---------- Vacances ---------- */

    function renderZoneHint() {
        const hint = $("horaires-zone-hint");
        if (config.zone === "aucune") {
            hint.textContent = "Choisis la zone de ton lycée pour couper les rappels pendant les vacances scolaires et les jours fériés.";
            return;
        }
        const known = H.calendarFor(new Date()) || H.CALENDARS.find(c => c.start > H.dayKey(new Date()));
        hint.textContent = known
            ? `Calendrier ${known.year} : vacances de la zone ${config.zone} et jours fériés pris en compte.`
            : "Le calendrier des vacances de cette année n'est pas encore dans NSI Hub : seules les vacances d'été sont prises en compte.";
    }

    $("horaires-zone").addEventListener("change", event => {
        config.zone = event.target.value;
        persist();
        renderZoneHint();
        renderNext();
    });

    /* ---------- Prochain cours ---------- */

    function renderNext() {
        const text = $("horaires-next");
        const valid = config.slots.filter(H.isValidSlot);
        if (!valid.length) {
            text.textContent = config.slots.length ? "Corrige les créneaux en rouge." : "Aucun créneau pour l'instant.";
            return;
        }
        const next = H.nextCourse(config);
        if (!next) {
            text.textContent = `${valid.length} créneau${valid.length > 1 ? "x" : ""} · pas de cours dans les 60 prochains jours (vacances ?)`;
            return;
        }
        const now = new Date();
        const date = next.start.toDateString() === now.toDateString()
            ? "aujourd'hui"
            : next.start.toDateString() === H.addDays(now, 1).toDateString()
                ? "demain"
                : next.start.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
        text.innerHTML = `Prochain cours : <strong>${escapeHTML(date)}, ${escapeHTML(H.describe(next))}</strong> (${escapeHTML(H.relative(next.start, now))})`;
    }

    /* ---------- Rappels ---------- */

    function renderReminders() {
        const box = $("horaires-reminders");
        box.querySelectorAll("[data-before]").forEach(el => el.remove());
        H.BEFORE_OPTIONS.forEach(minutes => {
            const label = document.createElement("label");
            label.className = "horaires-chip";
            label.dataset.before = minutes;
            label.innerHTML = `<input type="checkbox"${config.reminders.before.includes(minutes) ? " checked" : ""}><span>${minutes >= 60 ? `${minutes / 60} h` : `${minutes} min`} avant</span>`;
            box.appendChild(label);
        });
        $("horaires-eve").checked = config.reminders.eve;
        $("horaires-eve-time").value = config.reminders.eveTime;
        box.querySelectorAll(".horaires-chip").forEach(chip => chip.classList.toggle("checked", chip.querySelector("input[type=checkbox]").checked));
    }

    $("horaires-reminders").addEventListener("change", event => {
        const chip = event.target.closest(".horaires-chip");
        if (!chip) return;
        if (chip.dataset.before) {
            const minutes = Number(chip.dataset.before);
            const set = new Set(config.reminders.before);
            if (event.target.checked) set.add(minutes); else set.delete(minutes);
            config.reminders.before = H.BEFORE_OPTIONS.filter(m => set.has(m));
        } else if (event.target.id === "horaires-eve") {
            config.reminders.eve = event.target.checked;
        } else if (event.target.id === "horaires-eve-time" && /^\d{2}:\d{2}$/.test(event.target.value)) {
            config.reminders.eveTime = event.target.value;
            config.reminders.eve = true;
            $("horaires-eve").checked = true;
        }
        chip.classList.toggle("checked", chip.querySelector("input[type=checkbox]").checked);
        persist();
    });

    /* ---------- Export agenda ---------- */

    $("horaires-ics").addEventListener("click", () => {
        const status = $("horaires-ics-status");
        if (!config.slots.some(H.isValidSlot)) {
            status.textContent = "Ajoute d'abord au moins un créneau valide.";
            status.className = "horaires-hint error";
            return;
        }
        const ics = H.buildICS(config);
        const blob = new Blob([ics.text], { type: "text/calendar;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "cours-nsi.ics";
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 10000);
        const reminderCount = config.reminders.before.length + (config.reminders.eve ? 1 : 0);
        status.className = "horaires-hint success";
        status.textContent = `Fichier téléchargé : ${ics.events} créneau${ics.events > 1 ? "x" : ""} répété${ics.events > 1 ? "s" : ""} chaque semaine jusqu'au ${ics.until.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}, ${reminderCount ? `${reminderCount} rappel${reminderCount > 1 ? "s" : ""} par cours` : "sans rappel"}. Ouvre-le pour l'ajouter à ton agenda.`;
    });

    /* ---------- Notifications du site ---------- */

    function renderNotifications() {
        const toggle = $("horaires-notif");
        const desc = $("horaires-notif-desc");
        const test = $("horaires-test");
        if (!H.notificationsSupported()) {
            toggle.checked = false;
            toggle.disabled = true;
            test.hidden = true;
            desc.textContent = "Ton navigateur ne permet pas les notifications de sites web (sur iPhone, il faut d'abord ajouter le site à l'écran d'accueil). Utilise plutôt l'agenda.";
            return;
        }
        if (Notification.permission === "denied") {
            toggle.checked = false;
            test.hidden = true;
            desc.textContent = "Les notifications sont bloquées pour ce site. Autorise-les dans les réglages du navigateur (icône à gauche de l'adresse), puis réessaie.";
            return;
        }
        toggle.checked = config.notifications && Notification.permission === "granted";
        test.hidden = !toggle.checked;
        desc.textContent = toggle.checked
            ? "Activées. Elles ne partent que si une page de NSI Hub est ouverte (même en arrière-plan)."
            : "Elles ne partent que si une page de NSI Hub est ouverte (même en arrière-plan).";
    }

    $("horaires-notif").addEventListener("change", async event => {
        if (!event.target.checked) {
            config.notifications = false;
            persist("Notifications désactivées");
            renderNotifications();
            return;
        }
        let permission = Notification.permission;
        if (permission === "default") {
            try { permission = await Notification.requestPermission(); } catch (_) { permission = "denied"; }
        }
        config.notifications = permission === "granted";
        if (config.notifications) await H.registration();
        persist(config.notifications ? "Notifications activées" : "Notifications refusées");
        renderNotifications();
    });

    $("horaires-test").addEventListener("click", async () => {
        const next = H.nextCourse(config);
        const ok = await H.notify("NSI dans 10 minutes ⏰", next ? `${H.describe(next)} (notification de test)` : "Ceci est une notification de test.", "nsi-test");
        $("horaires-notif-desc").textContent = ok
            ? "Notification de test envoyée. Si tu ne la vois pas, vérifie le mode « Ne pas déranger »."
            : "La notification n'a pas pu être envoyée.";
    });

    /* ---------- Démarrage ---------- */

    $("horaires-zone").value = config.zone;
    renderSlots();
    renderReminders();
    renderZoneHint();
    renderNotifications();
    setInterval(renderNext, 60000);

    // Lien direct vers la section (parametres.html#horaires)
    if (location.hash === "#horaires") $("horaires").scrollIntoView();
})();
