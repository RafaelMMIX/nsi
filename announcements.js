const announcement = announcements[0];

document.getElementById("announcement-title").textContent =
    announcement.title;

document.getElementById("announcement-message").textContent =
    announcement.message;

document.getElementById("announcement-button-text").textContent =
    announcement.buttonText;

document.getElementById("announcement-button").href =
    announcement.buttonUrl;

const announcements = [
    {
        id: "important-01",
        title: "Information importante",
        message: "Une information importante concernant le lycée est disponible.",
        buttonText: "En savoir plus",
        buttonUrl: "#",
        date: "2026-09-30"
    }
];
