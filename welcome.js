const welcomeMessage =
    document.getElementById("welcome-message");

const welcomeName =
    document.getElementById("welcome-name");

const firstName =
    localStorage.getItem("nsiFirstName");

const lastWelcome =
    Number(
        localStorage.getItem("nsiLastWelcome")
    );

const now = Date.now();

const cooldown = 20 * 60 * 1000; // 20 minutes


if (
    firstName &&
    (
        !lastWelcome ||
        now - lastWelcome >= cooldown
    )
) {

    welcomeName.textContent =
        `Bienvenue à nouveau, ${firstName} ! 👋`;


    localStorage.setItem(
        "nsiLastWelcome",
        now
    );
}