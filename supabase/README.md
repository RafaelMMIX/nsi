# Mise en service de Quiz en classe

Le site reste hébergé statiquement (par exemple sur GitHub Pages). Les rooms, réponses et scores sont stockés dans Supabase ; le navigateur ne conserve que les pseudos, jetons de reconnexion et l'historique local du professeur.

## Configuration initiale

1. Créer un projet Supabase.
2. Dans **SQL Editor**, exécuter `supabase/quiz-en-classe.sql` en entier. Le script crée les tables privées, les fonctions RPC et l'autorisation Realtime pour les notifications.
3. Dans **Project Settings → API**, copier l'URL du projet et la clé **anon/publishable** dans `supabase-config.js` (`supabaseUrl`, `supabaseAnonKey`). Cette clé est publique par conception. Ne jamais mettre une clé `service_role` dans le site.
4. Publier le site en HTTPS. Charger `quiz-classe.html` avec le profil Professeur, puis les élèves rejoignent le lien/QR de la salle avec `rejoindre.html`.

Sans ces étapes, l'interface affiche que le service n'est pas configuré et ne prétend pas créer une partie.

## Données et contrôles

- `jeux-data.js` est la source commune des activités et questions. `jeux.js` l'utilise pour Quiz & Jeux ; le mode classe transforme ses quiz en questions avec IDs stables `QUIZ-…-Q01`.
- La réponse correcte est retirée de l'état transmis aux joueurs. `classroom_submit` reçoit l'heure de réception dans PostgreSQL ; `classroom_teacher_action(..., 'results')` attribue les points serveur et traite les temps égaux avec le même rang.
- Le code de partie est public, mais le contrôle professeur est associé à un secret aléatoire conservé dans le navigateur de création. Les tables ne donnent aucun accès direct à `anon`; seuls les RPC autorisés sont accessibles.
- Un heartbeat de 10 secondes sert à estimer les joueurs actifs. Le score et le pseudo restent dans la salle si un appareil se déconnecte ; le même navigateur peut revenir avec son jeton local.
- Les parties expirent après 24 h quand leur état est consulté. L'historique professeur et les statistiques restent locales à son appareil.

Les limites du plan Supabase et ses conditions évoluent. Pour une classe, consulter le tableau de bord du projet et les limites d'usage du fournisseur.
