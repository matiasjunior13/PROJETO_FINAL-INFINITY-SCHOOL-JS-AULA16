// Seleção dos elementos do DOM
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const clearButton = document.getElementById("clearButton");
const scrollTopButton = document.getElementById("scrollTopButton");

// Containers para cada categoria
const emCartazContainer = document.getElementById("emCartaz");
const popularesContainer = document.getElementById("populares");
const avaliadosContainer = document.getElementById("avaliados");
const novidadesContainer = document.getElementById("novidades");
const resultadoPesquisaContainer = document.getElementById("resultadoPesquisa");

// Constantes da API
const API_KEY = "3e074b6d14a7158d77bae02b97da066e";
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_URL = "https://image.tmdb.org/t/p/w500";

// Variáveis globais
let allMovies = []; // Armazena todos os filmes

// Inicialização quando o DOM estiver carregado
document.addEventListener("DOMContentLoaded", async () => {
    // Esconder a seção de resultados de pesquisa inicialmente
    document.querySelector("section:nth-child(5)").style.display = "none";

    // Carregar e exibir os filmes
    await fetchAndRenderAllSections();

    // Configurar eventos
    setupEventListeners();

    // Criar modal para ficha técnica
    createMovieDetailsModal();
});

// Configuração de todos os event listeners
function setupEventListeners() {
    // Evento de pesquisa
    searchButton.addEventListener("click", () => {
        const query = searchInput.value.trim();
        if (query) {
            searchMovies(query);
        }
    });

    // Pesquisa ao pressionar Enter
    searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            const query = searchInput.value.trim();
            if (query) {
                searchMovies(query);
            }
        }
    });

    // Limpar pesquisa
    clearButton.addEventListener("click", () => {
        searchInput.value = "";
        document.querySelector("section:nth-child(5)").style.display = "none";
        document.querySelectorAll("section:not(:nth-child(5))").forEach(section => {
            section.style.display = "block";
        });
    });

    // Botão de voltar ao topo
    window.addEventListener("scroll", () => {
        scrollTopButton.style.display = window.scrollY > 300 ? "block" : "none";
    });

    scrollTopButton.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}

// Busca e renderiza todas as seções de filmes
async function fetchAndRenderAllSections() {
    try {
        // Buscar filmes em cartaz
        const nowPlayingMovies = await fetchMovies(`${BASE_URL}/movie/now_playing?api_key=${API_KEY}&language=pt-BR&page=1`);
        renderMovieSection(emCartazContainer, nowPlayingMovies, "emCartaz");

        // Buscar filmes populares
        const popularMovies = await fetchMovies(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=pt-BR&page=1`);
        renderMovieSection(popularesContainer, popularMovies, "populares");

        // Buscar filmes mais bem avaliados
        const topRatedMovies = await fetchMovies(`${BASE_URL}/movie/top_rated?api_key=${API_KEY}&language=pt-BR&page=1`);
        renderMovieSection(avaliadosContainer, topRatedMovies, "avaliados");

        // Buscar filmes que serão lançados em breve
        const upcomingMovies = await fetchMovies(`${BASE_URL}/movie/upcoming?api_key=${API_KEY}&language=pt-BR&page=1`);
        renderMovieSection(novidadesContainer, upcomingMovies, "novidades");

        // Atualizar a lista completa de filmes para pesquisa
        allMovies = [...nowPlayingMovies, ...popularMovies, ...topRatedMovies, ...upcomingMovies];
    } catch (error) {
        console.error("Erro ao carregar filmes:", error);
    }
}

// Busca filmes da API
async function fetchMovies(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.results.map(movie => ({
            id: movie.id,
            titulo: movie.title,
            imagem: movie.poster_path ? `${IMG_URL}${movie.poster_path}` : "https://via.placeholder.com/200x300?text=Sem+Imagem",
            data: movie.release_date,
            sinopse: movie.overview,
            nota: movie.vote_average,
            popularidade: movie.popularity,
            idioma_original: movie.original_language,
            titulo_original: movie.original_title,
            adulto: movie.adult,
            generos: movie.genre_ids
        }));
    } catch (error) {
        console.error("Erro ao buscar filmes:", error);
        return [];
    }
}

// Renderiza uma seção de filmes
function renderMovieSection(container, movies, sectionId) {
    // Limpar o container
    container.innerHTML = "";

    // Adicionar botões de navegação
    const prevButton = document.createElement("button");
    prevButton.classList.add("nav-button", "prev");
    prevButton.innerHTML = "&#10094;";
    prevButton.onclick = () => scrollSection(sectionId, -800);

    const nextButton = document.createElement("button");
    nextButton.classList.add("nav-button", "next");
    nextButton.innerHTML = "&#10095;";
    nextButton.onclick = () => scrollSection(sectionId, 800);

    // Adicionar botões ao container pai (categoria)
    const categorySection = container.parentElement;
    categorySection.appendChild(prevButton);
    categorySection.appendChild(nextButton);

    // Adicionar filmes ao container
    movies.forEach(movie => {
        const card = createMovieCard(movie);
        container.appendChild(card);
    });
}

// Função para rolar a seção horizontalmente
function scrollSection(sectionId, scrollAmount) {
    const container = document.getElementById(sectionId);
    container.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
    });
}

// Cria um card de filme
function createMovieCard(movie) {
    const card = document.createElement("div");
    card.classList.add("card_filme");
    card.dataset.movieId = movie.id;

    // Imagem do filme
    const img = document.createElement("img");
    img.src = movie.imagem;
    img.alt = movie.titulo;
    img.loading = "lazy";
    img.onerror = () => {
        img.src = "https://via.placeholder.com/200x300?text=Sem+Imagem";
    };

    // Informações do filme
    const infos = document.createElement("div");
    infos.classList.add("infos");

    // Formatar data
    let dataFormatada = "Data não disponível";
    if (movie.data) {
        const data = new Date(movie.data);
        dataFormatada = data.toLocaleDateString('pt-BR');
    }

    infos.innerHTML = `
    <h3>${movie.titulo}</h3>
    <p><strong>Estreia:</strong> ${dataFormatada}</p>
    <p><strong>Nota:</strong> ${movie.nota ? movie.nota.toFixed(1) : "N/A"}</p>
    <p>${movie.sinopse || "Sinopse não disponível."}</p>
`;

    // Ícones de ação
    const icones = document.createElement("div");
    icones.classList.add("icones");

    // Ícone de informações
    const infoIcon = document.createElement("span");
    infoIcon.classList.add("icone");
    infoIcon.innerHTML = "ℹ️";
    infoIcon.title = "Mais informações";
    infoIcon.addEventListener("click", (e) => {
        e.stopPropagation();
        showMovieDetails(movie.id);
    });

    const infoTooltip = document.createElement("span");
    infoTooltip.classList.add("tooltip");
    infoTooltip.textContent = "Ver mais informações";
    infoIcon.appendChild(infoTooltip);

    // Ícone de favorito
    const favIcon = document.createElement("span");
    favIcon.classList.add("icone");
    favIcon.innerHTML = "❤️";
    favIcon.title = "Adicionar aos favoritos";
    favIcon.addEventListener("click", (e) => {
        e.stopPropagation();
        alert(`${movie.titulo} adicionado aos favoritos!`);
    });

    const favTooltip = document.createElement("span");
    favTooltip.classList.add("tooltip");
    favTooltip.textContent = "Adicionar aos favoritos";
    favIcon.appendChild(favTooltip);

    // Ícone de assistir depois
    const watchIcon = document.createElement("span");
    watchIcon.classList.add("icone");
    watchIcon.innerHTML = "🕒";
    watchIcon.title = "Assistir depois";
    watchIcon.addEventListener("click", (e) => {
        e.stopPropagation();
        alert(`${movie.titulo} adicionado à lista para assistir depois!`);
    });

    const watchTooltip = document.createElement("span");
    watchTooltip.classList.add("tooltip");
    watchTooltip.textContent = "Adicionar à lista para assistir depois";
    watchIcon.appendChild(watchTooltip);

    // Adicionar ícones ao container
    icones.appendChild(infoIcon);
    icones.appendChild(favIcon);
    icones.appendChild(watchIcon);

    // Montar o card
    card.appendChild(img);
    card.appendChild(infos);
    card.appendChild(icones);

    // Adicionar evento de clique para exibir detalhes
    card.addEventListener("click", () => {
        showMovieDetails(movie.id);
    });

    return card;
}

// Cria o modal para detalhes do filme
function createMovieDetailsModal() {
    const modal = document.createElement("div");
    modal.id = "movieDetailsModal";
    modal.classList.add("movie-modal");

    modal.innerHTML = `
    <div class="modal-content">
    <span class="close-modal">&times;</span>
    <div class="modal-body">
        <div class="modal-loading">Carregando...</div>
    </div>
    </div>
`;

    document.body.appendChild(modal);

    // Fechar modal ao clicar no X
    const closeBtn = modal.querySelector(".close-modal");
    closeBtn.addEventListener("click", () => {
        modal.style.display = "none";
    });

    // Fechar modal ao clicar fora do conteúdo
    window.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.style.display = "none";
        }
    });
}

// Exibe detalhes do filme no modal
async function showMovieDetails(movieId) {
    const modal = document.getElementById("movieDetailsModal");
    const modalBody = modal.querySelector(".modal-body");

    // Mostrar modal com indicador de carregamento
    modal.style.display = "block";
    modalBody.innerHTML = `<div class="modal-loading">Carregando...</div>`;

    try {
        // Buscar detalhes do filme
        const response = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=pt-BR&append_to_response=credits,videos`);
        const movie = await response.json();

        // Formatar data
        let dataFormatada = "Data não disponível";
        if (movie.release_date) {
            const data = new Date(movie.release_date);
            dataFormatada = data.toLocaleDateString('pt-BR');
        }

        // Obter diretores
        const diretores = movie.credits?.crew
            .filter(person => person.job === "Director")
            .map(director => director.name)
            .join(", ") || "Não disponível";

        // Obter roteiristas
        const roteiristas = movie.credits?.crew
            .filter(person => ["Screenplay", "Writer", "Story"].includes(person.job))
            .map(writer => writer.name)
            .join(", ") || "Não disponível";

        // Obter elenco principal (primeiros 5)
        const elenco = movie.credits?.cast
            .slice(0, 5)
            .map(actor => actor.name)
            .join(", ") || "Não disponível";

        // Obter gêneros
        const generos = movie.genres
            .map(genre => genre.name)
            .join(", ") || "Não disponível";

        // Obter trailer (se disponível)
        const trailer = movie.videos?.results.find(video =>
            video.type === "Trailer" && video.site === "YouTube"
        );

        // Construir HTML do modal
        modalBody.innerHTML = `
    <div class="modal-header">
        <div class="modal-poster">
        <img src="${movie.poster_path ? `${IMG_URL}${movie.poster_path}` : 'https://via.placeholder.com/300x450?text=Sem+Imagem'}" 
            alt="${movie.title}" 
            onerror="this.src='https://via.placeholder.com/300x450?text=Sem+Imagem'">
        </div>
        <div class="modal-info">
        <h2>${movie.title}</h2>
        ${movie.title !== movie.original_title ? `<h3>(${movie.original_title})</h3>` : ''}
        <div class="modal-meta">
            <span>${dataFormatada}</span>
            <span>${movie.runtime ? `${movie.runtime} min` : 'Duração N/A'}</span>
            <span>${generos}</span>
        </div>
        <div class="modal-rating">
            <span class="star">⭐</span> ${movie.vote_average.toFixed(1)}/10
        </div>
        <div class="modal-overview">
            <h4>Sinopse</h4>
            <p>${movie.overview || 'Sinopse não disponível.'}</p>
        </div>
        </div>
    </div>
    
    <div class="modal-details">
        <h4>Ficha Técnica</h4>
        <table class="movie-details-table">
        <tr>
            <td><strong>Direção:</strong></td>
            <td>${diretores}</td>
        </tr>
        <tr>
            <td><strong>Roteiro:</strong></td>
            <td>${roteiristas}</td>
        </tr>
        <tr>
            <td><strong>Elenco Principal:</strong></td>
            <td>${elenco}</td>
        </tr>
        <tr>
            <td><strong>Gêneros:</strong></td>
            <td>${generos}</td>
        </tr>
        <tr>
            <td><strong>País de Origem:</strong></td>
            <td>${movie.production_countries.map(country => country.name).join(', ') || 'Não disponível'}</td>
        </tr>
        <tr>
            <td><strong>Idioma Original:</strong></td>
            <td>${movie.original_language?.toUpperCase() || 'Não disponível'}</td>
        </tr>
        <tr>
            <td><strong>Orçamento:</strong></td>
            <td>${movie.budget ? `$${movie.budget.toLocaleString()}` : 'Não disponível'}</td>
        </tr>
        <tr>
            <td><strong>Receita:</strong></td>
            <td>${movie.revenue ? `$${movie.revenue.toLocaleString()}` : 'Não disponível'}</td>
        </tr>
        </table>
    </div>
    
    ${trailer ? `
    <div class="modal-trailer">
        <h4>Trailer</h4>
        <div class="trailer-container">
        <iframe width="100%" height="315" src="https://www.youtube.com/embed/${trailer.key}" 
                frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; 
                gyroscope; picture-in-picture" allowfullscreen></iframe>
        </div>
    </div>
    ` : ''}
    `;

    } catch (error) {
        console.error("Erro ao carregar detalhes do filme:", error);
        modalBody.innerHTML = `
    <div class="modal-error">
        <p>Erro ao carregar detalhes do filme. Tente novamente mais tarde.</p>
    </div>
    `;
    }
}

// Pesquisa filmes
async function searchMovies(query) {
    try {
        // Buscar filmes que correspondem à pesquisa
        const url = `${BASE_URL}/search/movie?api_key=${API_KEY}&language=pt-BR&query=${encodeURIComponent(query)}&page=1`;
        const searchResults = await fetchMovies(url);

        // Mostrar seção de resultados e esconder outras
        document.querySelector("section:nth-child(5)").style.display = "block";
        document.querySelectorAll("section:not(:nth-child(5))").forEach(section => {
            section.style.display = "none";
        });

        // Limpar e renderizar resultados
        resultadoPesquisaContainer.innerHTML = "";

        if (searchResults.length > 0) {
            renderMovieSection(resultadoPesquisaContainer, searchResults, "resultadoPesquisa");
        } else {
            resultadoPesquisaContainer.innerHTML = `<p style="text-align:center; padding: 20px;">Nenhum filme encontrado para "${query}".</p>`;
        }
    } catch (error) {
        console.error("Erro ao pesquisar filmes:", error);
        resultadoPesquisaContainer.innerHTML = `<p style="text-align:center; padding: 20px;">Erro ao pesquisar filmes. Tente novamente.</p>`;
    }
}
