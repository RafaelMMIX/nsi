(() => {
  "use strict";
  const config = window.NSI_CLASSROOM_CONFIG || {};
  window.nsiClassroom = {
    configured: Boolean(config.supabaseUrl && config.supabaseAnonKey && window.supabase),
    client: config.supabaseUrl && config.supabaseAnonKey && window.supabase
      ? window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey)
      : null,
    async rpc(name, params) {
      if (!this.client) throw new Error("Le service Quiz en classe n’est pas configuré. Renseigne l’URL et la clé publique Supabase dans supabase-config.js.");
      const { data, error } = await this.client.rpc(name, params);
      if (error) {
        const details = [error.message, error.details, error.hint, error.code ? `Code ${error.code}` : ""]
          .filter(Boolean)
          .join(" · ");
        throw new Error(details || "Erreur du service temps réel.");
      }
      return data;
    },
    subscribe(code, refresh) {
      if (!this.client) return () => {};
      const channel = this.client.channel(`classroom:${code}`, { config: { private: true } })
        .on("broadcast", { event: "change" }, refresh)
        .subscribe();
      const poll = setInterval(refresh, 3000);
      return () => { clearInterval(poll); this.client.removeChannel(channel); };
    },
    token(key) {
      let token = localStorage.getItem(key);
      if (!token) {
        const bytes = new Uint8Array(32); crypto.getRandomValues(bytes);
        token = Array.from(bytes, value => value.toString(16).padStart(2, "0")).join("");
        localStorage.setItem(key, token);
      }
      return token;
    }
  };
})();
