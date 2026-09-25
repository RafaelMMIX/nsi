const buttons = document.querySelectorAll(".copy-button");


buttons.forEach(button => {

    button.addEventListener("click", async () => {

        const prompt = button.dataset.prompt;

        await navigator.clipboard.writeText(prompt);


        const originalContent = button.innerHTML;


        button.classList.add("copied");

        button.innerHTML = `
            <i class="fa-solid fa-check"></i>
            Copié !
        `;


        setTimeout(() => {

            button.classList.remove("copied");

            button.innerHTML = originalContent;

        }, 1500);

    });

});