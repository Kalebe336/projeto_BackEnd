document.addEventListener("DOMContentLoaded", () => {
    // Referências do DOM
    const btnProfile = document.getElementById("btn-profile");
    const profileSidebar = document.getElementById("profile-sidebar");
    const sidebarOverlay = document.getElementById("sidebar-overlay");
    const btnCloseSidebar = document.getElementById("btn-close-sidebar");
    const btnUserRecipes = document.getElementById("btn-user-recipes");
    const btnLogout = document.getElementById("btn-logout");

    // Elementos do Perfil
    const sidebarName = document.getElementById("sidebar-name");
    const sidebarHandle = document.getElementById("sidebar-handle");
    const sidebarFavCount = document.getElementById("sidebar-fav-count");
    const sidebarRecipesCount = document.getElementById("sidebar-recipes-count");
    const sidebarUserImg = document.getElementById("sidebar-user-img");

    // Exemplo de Estado do Usuário Logado
    let currentUser = {
        name: "Chef Exemplo",
        username: "@chef1",
        type: "chef", // 'chef' para habilitar botão, 'comum' para desabilitar
        avatar: "anexos/imagens_usuarios/chef1.jpg",
        favoritesCount: 134,
        recipesCount: 3
    };

    // Atualiza estado do botão "Ver Perfil" conforme tipo de usuário
    function updateProfileButton() {
        if (currentUser && currentUser.type === "chef") {
            btnProfile.disabled = false;
        } else {
            btnProfile.disabled = true;
        }
    }

    // Carrega dados na Sidebar
    function loadSidebarData() {
        if (!currentUser) return;

        sidebarName.textContent = currentUser.name || "Chef";
        sidebarHandle.textContent = currentUser.username;
        sidebarFavCount.textContent = currentUser.favoritesCount;
        sidebarRecipesCount.textContent = currentUser.recipesCount;

        if (currentUser.avatar) {
            sidebarUserImg.src = currentUser.avatar;
        }
    }

    // Abrir Sidebar
    function openSidebar() {
        if (currentUser && currentUser.type === "chef") {
            loadSidebarData();
            profileSidebar.classList.add("open");
            sidebarOverlay.classList.add("active");
        }
    }

    // Fechar Sidebar
    function closeSidebar() {
        profileSidebar.classList.remove("open");
        sidebarOverlay.classList.remove("active");
    }

    // Eventos
    btnProfile.addEventListener("click", openSidebar);
    btnCloseSidebar.addEventListener("click", closeSidebar);
    sidebarOverlay.addEventListener("click", closeSidebar);

    // Ação: Botão "Suas Receitas" (filtra na tela apenas as receitas do chef logado)
    btnUserRecipes.addEventListener("click", () => {
        closeSidebar();
        const cards = document.querySelectorAll(".recipe-card");
        cards.forEach(card => {
            if (card.getAttribute("data-chef") === currentUser.username) {
                card.style.display = "block";
            } else {
                card.style.display = "none";
            }
        });
        document.getElementById("section-title").textContent = `Receitas de ${currentUser.username}`;
    });

    // Ação: Botão Logout (Redireciona/reseta a aplicação)
    btnLogout.addEventListener("click", () => {
        closeSidebar();
        window.location.reload(); // Redireciona para o estado inicial
    });

    // Inicialização
    updateProfileButton();
});