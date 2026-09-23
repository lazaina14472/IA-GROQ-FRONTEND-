const conversation =
    document.querySelector("#conversation");

const formulaire =
    document.querySelector("#formulaire");

const messageInput =
    document.querySelector("#message");

const chargement =
    document.querySelector("#chargement");

const btnEnvoyer =
    document.querySelector("#btnEnvoyer");

const supprimerTout =
    document.querySelector("#supprimerTout");

const btnTheme =
    document.querySelector("#btnTheme");

const themeIcon =
    document.querySelector("#themeIcon");


// =====================================
// LOCALSTORAGE
// =====================================

const CLE_CONVERSATION =
    "conversation_IA";

const CLE_THEME =
    "theme_IA";


let messages =
    JSON.parse(
        localStorage.getItem(
            CLE_CONVERSATION
        )
    ) || [];


// =====================================
// THEME
// =====================================

const themeSauvegarde =
    localStorage.getItem(
        CLE_THEME
    );


if (themeSauvegarde === "dark") {

    document.body.classList.add("dark");

    changerIconeTheme();

}


function changerIconeTheme() {

    if (
        document.body.classList.contains(
            "dark"
        )
    ) {

        themeIcon.className =
            "fi fi-rr-sun";

        btnTheme.title =
            "Activer le mode clair";

    } else {

        themeIcon.className =
            "fi fi-rr-moon";

        btnTheme.title =
            "Activer le mode sombre";

    }

}


// =====================================
// BOUTON THEME
// =====================================

btnTheme.addEventListener(
    "click",
    () => {

        document.body.classList.toggle(
            "dark"
        );


        const theme =
            document.body.classList.contains(
                "dark"
            )
                ? "dark"
                : "light";


        localStorage.setItem(
            CLE_THEME,
            theme
        );


        changerIconeTheme();

    }
);


// =====================================
// AFFICHER CONVERSATION
// =====================================

function afficherConversation() {

    conversation.innerHTML = "";


    if (
        messages.length === 0
    ) {

        conversation.innerHTML = `

            <div class="message-vide">

                <div class="message-vide-icon">

                    <i class="fi fi-rr-sparkles"></i>

                </div>

                <h2>
                    Comment puis-je vous aider ?
                </h2>

                <p>
                    Écrivez votre question pour commencer.
                </p>

            </div>

        `;

        return;

    }


    messages.forEach(
        (message, index) => {

            afficherMessage(
                message,
                index
            );

        }
    );


    allerEnBas();

}


// =====================================
// AFFICHER MESSAGE
// =====================================

function afficherMessage(
    message,
    index
) {

    const div =
        document.createElement("div");


    div.className =
        `message ${message.role}`;


    div.innerHTML = `

        <div class="message-contenu">

            <div class="message-texte">

                ${echapperHTML(
                    message.content
                )}

            </div>


            <div class="message-actions">

                <button
                    class="btn-supprimer"
                    onclick="supprimerMessage(${index})"
                    title="Supprimer ce message"
                >

                    <i class="fi fi-rr-trash"></i>

                    <span>Supprimer</span>

                </button>

            </div>

        </div>

    `;


    conversation.appendChild(div);

}


// =====================================
// PROTECTION HTML
// =====================================

function echapperHTML(texte) {

    const div =
        document.createElement("div");


    div.textContent =
        texte;


    return div.innerHTML;

}


// =====================================
// SAUVEGARDER CONVERSATION
// =====================================

function sauvegarderConversation() {

    localStorage.setItem(

        CLE_CONVERSATION,

        JSON.stringify(messages)

    );

}


// =====================================
// SUPPRIMER MESSAGE
// =====================================

function supprimerMessage(index) {

    messages.splice(
        index,
        1
    );


    sauvegarderConversation();

    afficherConversation();

}


// =====================================
// SUPPRIMER TOUT
// =====================================

supprimerTout.addEventListener(
    "click",
    () => {

        if (
            messages.length === 0
        ) {

            return;

        }


        const confirmation =
            confirm(
                "Voulez-vous supprimer toute la conversation ?"
            );


        if (!confirmation) {

            return;

        }


        messages = [];


        localStorage.removeItem(
            CLE_CONVERSATION
        );


        afficherConversation();

    }
);


// =====================================
// ENVOYER MESSAGE
// =====================================

formulaire.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const message =
            messageInput.value.trim();


        if (!message) {

            return;

        }


        // Ajouter utilisateur

        messages.push({

            role: "utilisateur",

            content: message

        });


        sauvegarderConversation();

        afficherConversation();


        messageInput.value = "";

        ajusterTextarea();


        // Loading

        afficherChargement(true);

        btnEnvoyer.disabled = true;


        try {

            const response =
                await fetch(
                    "https://ai-groq-backend.onrender.com/api/chat",
                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body:
                            JSON.stringify({

                                message: message

                            })

                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Erreur serveur"
                );

            }


            // Ajouter réponse IA

            messages.push({

                role: "ia",

                content:
                    data.response

            });


            sauvegarderConversation();

            afficherConversation();


        } catch (error) {

            console.error(error);


            messages.push({

                role: "ia",

                content:
                    "Une erreur est survenue lors de la communication avec le serveur."

            });


            sauvegarderConversation();

            afficherConversation();


        } finally {

            afficherChargement(false);

            btnEnvoyer.disabled = false;

            messageInput.focus();

        }

    }
);


// =====================================
// LOADING
// =====================================

function afficherChargement(
    afficher
) {

    if (afficher) {

        chargement.classList.remove(
            "cache"
        );

    } else {

        chargement.classList.add(
            "cache"
        );

    }

}


// =====================================
// SCROLL
// =====================================

function allerEnBas() {

    setTimeout(
        () => {

            conversation.scrollTo({

                top:
                    conversation.scrollHeight,

                behavior:
                    "smooth"

            });

        },
        50
    );

}


// =====================================
// TEXTAREA AUTO
// =====================================

messageInput.addEventListener(
    "input",
    ajusterTextarea
);


function ajusterTextarea() {

    messageInput.style.height =
        "auto";


    messageInput.style.height =
        Math.min(
            messageInput.scrollHeight,
            140
        ) + "px";

}


// =====================================
// CTRL + ENTER
// =====================================

messageInput.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Enter" &&
            event.ctrlKey
        ) {

            formulaire.requestSubmit();

        }

    }
);


// =====================================
// INITIALISATION
// =====================================

afficherConversation();
