"use strict";

/* =========================================================
   NSI HUB — SERVICE WORKER
   Sert uniquement à afficher les rappels de cours (obligatoire
   sur Android pour les notifications). Il ne met rien en cache.
   ========================================================= */

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", event => event.waitUntil(self.clients.claim()));

// Clic sur une notification : ouvrir (ou retrouver) NSI Hub
self.addEventListener("notificationclick", event => {
    event.notification.close();
    const url = new URL("index.html", self.registration.scope).href;
    event.waitUntil(
        self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(windows => {
            const open = windows.find(w => w.url.startsWith(self.registration.scope));
            return open ? open.focus() : self.clients.openWindow(url);
        })
    );
});
