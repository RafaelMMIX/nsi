document.addEventListener("DOMContentLoaded", () => {

    const revealButton = document.getElementById("reveal-button");
    const result = document.getElementById("celebration-result");
    const continueButton = document.getElementById("continue-button");
    const content = document.getElementById("celebration-content");
    const intro = document.getElementById("celebration-intro");
    const question = document.getElementById("question");
    const canvas = document.getElementById("confetti-canvas");

    const ctx = canvas.getContext("2d");

    const devMode = localStorage.getItem("nsiDevMode") === "true";
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /*
     * ---------------------------------------------------------
     * PROTECTION
     * ---------------------------------------------------------
     */

    const alreadySeen = localStorage.getItem("nsiTeacherApproved");

    if (alreadySeen === "true" && !devMode) {
        window.location.replace("index.html");
        return;
    }


    /*
     * ---------------------------------------------------------
     * CANVAS
     * ---------------------------------------------------------
     */

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    resizeCanvas();

    window.addEventListener("resize", resizeCanvas);


    /*
     * ---------------------------------------------------------
     * CONFETTIS
     * ---------------------------------------------------------
     */

    let confettis = [];
    let animationFrame = null;

    const confettiColors = [
        "#6366f1",
        "#8b5cf6",
        "#22c55e",
        "#facc15",
        "#f97316",
        "#ec4899",
        "#38bdf8"
    ];

    function createConfetti(amount = 180) {

        for (let i = 0; i < amount; i++) {

            confettis.push({
                x: Math.random() * canvas.width,
                y: -20 - Math.random() * canvas.height,

                width: Math.random() * 7 + 4,
                height: Math.random() * 12 + 5,

                speedY: Math.random() * 3 + 2,
                speedX: Math.random() * 2 - 1,

                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: Math.random() * 0.15 - 0.075,

                gravity: Math.random() * 0.04 + 0.02,

                color:
                    confettiColors[
                        Math.floor(Math.random() * confettiColors.length)
                    ],

                opacity: 1
            });

        }
    }


    function drawConfetti() {

        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        confettis.forEach((confetti) => {

            confetti.speedY += confetti.gravity;

            confetti.y += confetti.speedY;
            confetti.x += confetti.speedX;

            confetti.rotation += confetti.rotationSpeed;

            if (
                confetti.y >
                canvas.height + 30
            ) {
                confetti.opacity -= 0.03;
            }

            ctx.save();

            ctx.translate(
                confetti.x,
                confetti.y
            );

            ctx.rotate(
                confetti.rotation
            );

            ctx.globalAlpha =
                Math.max(0, confetti.opacity);

            ctx.fillStyle =
                confetti.color;

            ctx.fillRect(
                -confetti.width / 2,
                -confetti.height / 2,
                confetti.width,
                confetti.height
            );

            ctx.restore();

        });

        confettis =
            confettis.filter(
                confetti => confetti.opacity > 0
            );

        if (confettis.length > 0) {
            animationFrame =
                requestAnimationFrame(drawConfetti);
        } else {
            cancelAnimationFrame(animationFrame);
        }
    }


    function launchConfetti(amount = 180) {

        if (prefersReducedMotion) return;

        createConfetti(amount);

        if (!animationFrame) {
            animationFrame =
                requestAnimationFrame(drawConfetti);
        }
    }


    /*
     * ---------------------------------------------------------
     * RÉVÉLATION
     * ---------------------------------------------------------
     */

    revealButton.addEventListener("click", () => {

        revealButton.classList.add("hidden");
        revealButton.setAttribute("aria-expanded", "true");
        content.classList.add("is-revealed");

        result.classList.add("visible");

        window.setTimeout(() => {
            question.hidden = true;
            intro.hidden = true;
        }, prefersReducedMotion ? 0 : 360);

        /*
         * Petit délai pour que l'animation
         * de révélation soit plus agréable.
         */

        setTimeout(() => {
            launchConfetti(220);
        }, 250);

        window.setTimeout(() => continueButton.focus(), prefersReducedMotion ? 0 : 650);

    });


    /*
     * ---------------------------------------------------------
     * CONTINUER
     * ---------------------------------------------------------
     */

    continueButton.addEventListener("click", () => {

        localStorage.setItem(
            "nsiTeacherApproved",
            "true"
        );

        window.location.replace("index.html");

    });


    /*
     * ---------------------------------------------------------
     * MODE DEV
     * ---------------------------------------------------------
     *
     * En mode développeur :
     * la page est rejouable.
     */

    if (devMode) {

        console.log(
            "[NSI Hub] Mode développeur :",
            "la page de félicitations peut être rejouée."
        );

    }

});
