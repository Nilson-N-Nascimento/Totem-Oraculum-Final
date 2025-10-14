/**
 * Oraculum Interativo - Belém COP 30
 * Versão Refatorada com APIs e Conteúdo
 * 
 * 🚨 CORREÇÕES DE SEGURANÇA APLICADAS:
 * ✅ Chave API removida do frontend por segurança
 * ✅ Modelo atualizado para gemini-1.5-flash (gemini-pro descontinuado)
 * ✅ Logs de segurança removidos
 * ✅ Rate limiting implementado
 * ✅ Fallback inteligente melhorado
 * ✅ Modo demonstração ativo
 * 
 * ⚠️ PRÓXIMOS PASSOS RECOMENDADOS:
 * 1. Criar endpoint no backend Django para proxy da API
 * 2. Configurar nova chave API no Google Cloud Console
 * 3. Implementar autenticação no backend
 * 4. Ativar modo API quando backend estiver pronto
 * 
 * 💡 ALERTA DE SEGURANÇA: Este script utiliza sistema de fallback local
 * para demonstração. Para produção, integre com backend seguro.
 */

// ===========================================
// MÓDULO DE UTILITÁRIOS (Helpers Genéricos)
// ===========================================
const Utils = (() => {
    /**
     * Validação de objeto
     * @param {*} obj - Objeto a validar
     * @returns {boolean} True se objeto válido
     */
    const isValidObject = (obj) => obj && typeof obj === 'object';

    /**
     * Validação de array
     * @param {*} arr - Array a validar
     * @returns {boolean} True se array válido e não vazio
     */
    const isValidArray = (arr) => Array.isArray(arr) && arr.length > 0;

    /**
     * Fetch seguro com tratamento de erros
     * @param {string} url - URL para fetch
     * @param {string} errorMsg - Mensagem de erro customizada
     * @returns {Promise<Object|null>} JSON parseado ou null
     */
    const safeFetch = async (url, errorMsg = 'Erro na requisição') => {
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.json();
        } catch (e) {
            console.error(errorMsg, e);
            return null;
        }
    };

    /**
     * Formata link do Google Maps
     * @param {Object} data - Objeto com google_maps_link ou nome
     * @returns {string} HTML formatado do link
     */
    const formatMapLink = (data) => {
        const link = data.google_maps_link || 
                     `https://maps.google.com/?q=${encodeURIComponent((data.nome || data.title || 'Belém') + ' Belém')}`;
        return `🗺️ Google Maps: ${link}\n`;
    };

    return { isValidObject, isValidArray, safeFetch, formatMapLink };
})();

// ===========================================
// MÓDULO DE CONFIGURAÇÃO E SERVIÇOS DE API
// ===========================================
const ApiService = (() => {
    // URL para converter o feed de notícias do G1 Pará para JSON. Serviço gratuito e sem chave.
    const G1_PARA_RSS_URL = 'https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fg1.globo.com%2Frss%2Fg1%2Fpa%2F';

    // API de tradução gratuita e sem chave (mantida do script original).
    const MYMEMORY_TRANSLATE_URL = 'https://api.mymemory.translated.net/get';

    // Função para buscar notícias
    const fetchNews = async () => {
        try {
            const response = await fetch(G1_PARA_RSS_URL);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            if (data.status !== 'ok' || !Array.isArray(data.items)) throw new Error('RSS feed could not be loaded.');
            // Formata os dados da API para o padrão do nosso app
            return data.items.slice(0, 10).map(item => ({
                title: item.title,
                link: item.link,
                pubDate: new Date(item.pubDate).toLocaleDateString('pt-BR'),
                thumbnail: item.thumbnail,
                description: item.description.replace(/<[^>]*>?/gm, '').substring(0, 120) + '...' // Limpa HTML e limita a descrição
            }));
        } catch (error) {
            console.error('Erro ao buscar notícias:', error);
            return []; // Retorna um array vazio em caso de erro
        }
    };

    // Função para buscar traduções
    const fetchTranslation = async (text, targetLang) => {
        const url = `${MYMEMORY_TRANSLATE_URL}?q=${encodeURIComponent(text)}&langpair=pt|${targetLang}`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.responseStatus === 200) {
            return data.responseData.translatedText;
        }
        throw new Error('Translation failed');
    };

    return {
        fetchNews,
        fetchTranslation
    };
})();


// ===========================================
// MÓDULO DE DADOS (AGORA DINÂMICO E COM CACHE)
// ===========================================
const DataModule = (() => {
    let cachedModules = null; // Cache para evitar múltiplas buscas

    // Dados que são locais (simulando uma API)
    const staticModulesData = {
        'pontos-turisticos': {
            id: 'pontos-turisticos',
            icone: 'fa-solid fa-landmark',
            bg: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjnD7sHk-SngUsHBi4A4xWKGz7wk6-w9BVQ_twiNlNs6NyU-NCghPLrsEGrtpB-B7LrsXqs88JstcgvHqO4GKiC1Qp75g0DF1zyNJSS__CGP2pdExyncnjA5i7DoVA60yru3TlnuyrKkR9P/s1600/Theatro+da+Paz_Eliseu+Dias+%25281%2529+-+SECOM+-+Ag.+Par%25C3%25A1.JPG',
            titulo: 'Pontos Turísticos',
            desc: 'Mergulhe na história e cultura de Belém. Descubra locais icônicos e suas histórias fascinantes. Toque em um local para ver no mapa.',
            items: [{
                title: 'Mercado Ver-o-Peso',
                image: 'https://www.gov.br/casacivil/pt-br/assuntos/noticias/2024/julho/equipe-da-secretaria-extraordinaria-para-a-cop30-visita-obras-do-mercado-ver-o-peso-em-belem/veropeso-expedicao-para.jpg',
                description: 'A maior feira ao ar livre da América Latina, um mosaico de cores, cheiros e sabores da Amazônia.',
                link: 'https://www.google.com/maps/search/?api=1&query=Mercado+Ver-o-Peso+Belém'
            }, {
                title: 'Theatro da Paz',
                image: 'https://s2-g1.glbimg.com/r0V33GXt-hc0kivnKy4m09g8Ows=/1200x/smart/filters:cover():strip_icc()/i.s3.glbimg.com/v1/AUTH_59edd422c0c84a879bd37670ae4f538a/internal_photos/bs/2019/z/0/B5yHKcTBAC7kAAB329UQ/pa.jpg',
                description: 'Um deslumbrante teatro de ópera do século XIX, com arquitetura neoclássica e programação cultural rica.',
                link: 'https://www.google.com/maps/search/?api=1&query=Theatro+da+Paz+Belém'
            }, {
                title: 'Mangal das Garças',
                image: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/06/64/46/45/mangal-das-garcas.jpg?w=900&h=500&s=1',
                description: 'Um oásis verde no centro da cidade, com aves, borboletário e uma vista panorâmica de Belém.',
                link: 'https://www.google.com/maps/search/?api=1&query=Mangal+das+Garças+Belém'
            }, {
                title: 'Estação das Docas',
                image: 'https://upload.wikimedia.org/wikipedia/commons/7/70/Brazil_Bel%C3%A9m_Las_Docas_02.jpg',
                description: 'Armazéns portuários restaurados que hoje abrigam restaurantes, lojas e um terminal fluvial, com um pôr do sol inesquecível.',
                link: 'https://www.google.com/maps/search/?api=1&query=Estação+das+Docas+Belém'
            }, {
                title: 'Basílica Santuário de Nazaré',
                image: 'https://upload.wikimedia.org/wikipedia/commons/a/aa/Bas%C3%ADlica_de_Nossa_Senhora_de_Nazar%C3%A9..jpg',
                description: 'Monumento religioso e também marco da fé paraense. Sua arquitetura inspirada em basílicas europeias, vitrais e interior em mármore tornam o local lindo e imponente. Ponto final do famoso Círio de Nazaré.',
                link: 'https://www.google.com/maps/search/?api=1&query=Av.+Nazaré,+1300+–+Nazaré,+Belém-PA'
            }, {
                title: 'Ilha do Combu',
                image: 'https://turismodenatureza.com.br/wp-content/uploads/2023/04/saldosa-maloca-1024x606.jpg',
                description: 'Um paraíso natural muito perto da cidade: cheia de igarapés, restaurantes à beira d\'água, pousadas ribeirinhas, contato direto com a natureza e artesanato local. Ótima para escapar um pouco do ritmo urbano.',
                link: 'https://www.google.com/maps/search/?api=1&query=Terminal+Ruy+Barata,+Praça+Princesa+Isabel,+Belém-PA'
            }, {
                title: 'Cidade Velha',
                image: 'https://alepa.quartertec.com.br/Content/Portal/Fotos/2021/up_ag_6847_img-20211206-wa0072.jpg',
                description: 'Caminhar por ruas de pedra, sobradinhos antigos, fachadas coloniais e azulejos portugueses — um mergulho no passado de Belém. A Cidade Velha preserva vestígios da fundação da cidade, ideal para roteiros históricos.',
                link: 'https://www.google.com/maps/search/?api=1&query=Cidade+Velha,+Belém-PA'
            }, {
                title: 'Praça Batista Campos',
                image: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0d/45/9b/b6/praca-batista-campos.jpg',
                description: 'Um dos espaços mais belos para relaxar e se encontrar com o público local. Jardins bem-cuidados, coretos, lagos, pista de caminhada e clima agradável. Ideal para fins de tarde ou passeios tranquilos.',
                link: 'https://www.google.com/maps/search/?api=1&query=Praça+Batista+Campos,+Belém-PA'
            }, {
                title: 'Parque da Residência',
                image: 'https://www.agenciapara.com.br/midias/2024/2/parquedaresidenciabelemdomundo1.jpg',
                description: 'Local de lazer com natureza urbana: áreas verdes, orquidário, anfiteatro, restaurante-buffet, espaço para estar com a família ou amigos. Excelente para momentos de descanso sem sair da cidade.',
                link: 'https://www.google.com/maps/search/?api=1&query=Av.+Magalhães+Barata,+830,+Belém-PA'
            }]
        },
        'culinaria-regional': {
            id: 'culinaria-regional',
            icone: 'fa-solid fa-shrimp',
            bg: 'https://turismo.santarem.pa.gov.br/images/IMG_4580.jpg',
            titulo: 'Culinária Regional',
            desc: 'A gastronomia paraense é um patrimônio de sabores. Desafie seu paladar com pratos autênticos e ingredientes da Amazônia.',
            items: [], // Carregado dinamicamente do JSON
            loadItems: async function() {
                return await Utils.safeFetch('/static/data/culinaria_regional.json', 'Erro ao carregar culinária') || [];
            }
        },
        'hoteis-hospedagem': {
            id: 'hoteis-hospedagem',
            icone: 'fa-solid fa-bed',
            bg: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop',
            titulo: 'Hotéis e Hospedagem',
            desc: 'Explore as melhores opções de hospedagem em Belém. Filtre por bairro e encontre o hotel ideal para sua estadia durante a COP 30.',
            items: [], // Carregado dinamicamente do JSON
            loadItems: async function() {
                return await Utils.safeFetch('/static/data/hoteis_hospedagem.json', 'Erro ao carregar hotéis') || [];
            }
        },
        'guia-turista': {
            id: 'guia-turista',
            icone: 'fa-solid fa-person-walking-luggage',
            bg: 'https://www.checkfront.com/wp-content/uploads/2022/06/tour-guide-rules.jpg',
            titulo: 'Guia do Visitante',
            desc: 'Informações essenciais para você explorar Belém com confiança e segurança. Consulte nossas dicas e aproveite sua visita ao máximo.',
            items: [], // Carregado dinamicamente do JSON
            loadItems: async function() {
                return await Utils.safeFetch('/static/data/guia_visitante.json', 'Erro ao carregar guia') || [];
            }
        },
        'oraculum-ai': {
            id: 'oraculum-ai',
            icone: 'fa-solid fa-robot',
            bg: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2070&auto=format&fit=crop',
            titulo: 'Oraculum AI',
            desc: 'Tire suas dúvidas sobre Belém do Pará e a COP 30! Nosso assistente de IA especializado está aqui para ajudar você com informações sobre turismo, cultura e sustentabilidade na capital paraense.',
            isChatbot: true,
            items: []
        }
    };

    // Função para carregar todos os módulos, combinando dados locais e da API
    // OTIMIZAÇÃO 3: Lazy Loading de Notícias
    let newsLoaded = false;
    
    const loadAllModules = async () => {
        if (cachedModules) {
            return cachedModules; // Retorna os dados do cache se já existirem
        }

        UIModule.toggleLoading(true, 'Carregando conteúdo...');

        try {
            // Carrega módulos locais PRIMEIRO (sem API)
            const localModules = Object.values(staticModulesData);

            // Módulo de notícias com lazy loading
            const newsModule = {
                id: 'noticias-eventos',
                icone: 'fa-solid fa-bullhorn',
                bg: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=2070&auto=format&fit=crop',
                titulo: 'Notícias e Eventos',
                desc: 'Fique por dentro de tudo que acontece em Belém. Acesse as últimas notícias sobre a COP 30, a agenda cultural da cidade e comunicados oficiais.',
                items: [], // Vazio inicialmente
                loadItems: async function() {
                    if (!newsLoaded) {
                        console.log('🔄 Carregando notícias (lazy)...');
                        this.items = await ApiService.fetchNews();
                        newsLoaded = true;
                        console.log('✅ Notícias carregadas:', this.items.length);
                    }
                    return this.items;
                }
            };

            // Combina e ordena os módulos
            const allModules = [...localModules, newsModule].sort((a, b) => {
                const order = ['pontos-turisticos', 'culinaria-regional', 'noticias-eventos', 'guia-turista', 'hoteis-hospedagem', 'oraculum-ai'];
                return order.indexOf(a.id) - order.indexOf(b.id);
            });

            cachedModules = allModules;
            return cachedModules;

        } catch (error) {
            console.error("Erro ao carregar módulos:", error);
            UIModule.showError('Não foi possível carregar o conteúdo. Tente novamente mais tarde.');
            return []; // Retorna vazio em caso de falha geral
        } finally {
            UIModule.toggleLoading(false);
        }
    };

    return {
        loadAllModules,
        getModuleById: async (id) => {
            const modules = await loadAllModules();
            return modules.find(m => m.id === id);
        }
    };
})();

// ===========================================
// MÓDULO DE TRADUÇÃO (COM MELHORIAS)
// ===========================================
const TranslationModule = (() => {
    const cache = new Map();
    // Termos que não devem ser traduzidos
    const EXCEPTIONS = [
        "Oraculum Belém", "Oráculo Belém", "Belém", "COP 30", "Theatro da Paz",
        "Ver-o-Peso", "Mangal das Garças", "Tacacá", "Maniçoba", "Açaí", "G1",
        "SAMU", "Ibis"
    ];

    const translate = async (text, targetLang) => {
        if (targetLang === 'pt' || !text) return text;
        const key = `${text}_${targetLang}`;
        if (cache.has(key)) return cache.get(key);
        if (EXCEPTIONS.some(exception => text.includes(exception))) return text;

        try {
            const translatedText = await ApiService.fetchTranslation(text, targetLang);
            cache.set(key, translatedText);
            return translatedText;
        } catch (e) {
            console.warn('Falha na tradução:', text, e);
            return text; // Retorna o texto original em caso de falha
        }
    };

    return {
        translate
    };
})();

// ===========================================
// MÓDULO DE UI (INTERFACE DO USUÁRIO)
// ===========================================
const UIModule = (() => {
    const elements = {
        container: document.querySelector('.container-modulos'),
        modal: document.getElementById('modal-container'),
        modalDialog: document.querySelector('.modal-dialogo'),
        modalImg: document.getElementById('modal-imagem-destaque'),
        modalTitle: document.getElementById('modal-titulo-destaque'),
        modalDesc: document.getElementById('modal-descricao-detalhada'),
        modalBody: document.querySelector('.modal-corpo'),
        loading: document.getElementById('loading-indicator'),
        loadingText: document.querySelector('#loading-indicator'),
        buttons: document.querySelectorAll('.btn-idioma')
    };

    // Adiciona um container para a lista dinâmica dentro do modal
    const itemListContainer = document.createElement('div');
    itemListContainer.className = 'modal-item-list';
    elements.modalBody.appendChild(itemListContainer);
    elements.itemListContainer = itemListContainer;

    const toggleLoading = (show, text = 'Traduzindo...') => {
        elements.loadingText.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> ${text}`;
        elements.loading.style.display = show ? 'flex' : 'none';
    };

    const showError = (message) => {
        elements.container.innerHTML = `<p class="error-message">${message}</p>`;
    };

    // Nova função para renderizar listas dinâmicas no Modal
    const renderItemList = (items, moduleId) => {
        elements.itemListContainer.innerHTML = ''; // Limpa a lista anterior
        if (!items || items.length === 0) return;

        items.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'item-card';

            const linkText = (moduleId === 'pontos-turisticos' || moduleId === 'hoteis-hospedagem') ? 'Ver no mapa' : 'Ler mais...';

            itemElement.innerHTML = `
                ${item.thumbnail || item.image ? `<img src="${item.thumbnail || item.image}" alt="${item.title}" class="item-card-image">` : ''}
                <div class="item-card-content">
                    <h4 class="item-card-title translatable" data-original="${item.title}">${item.title}</h4>
                    <p class="item-card-description translatable" data-original="${item.description || ''}">${item.description || ''}</p>
                    ${item.link ? `<a href="${item.link}" target="_blank" class="item-card-link">${linkText} <i class="fa-solid fa-arrow-up-right-from-square"></i></a>` : ''}
                </div>
            `;
            elements.itemListContainer.appendChild(itemElement);
        });
    };

    const setModalContentVisibility = (showList) => {
        elements.modalDesc.style.display = showList ? 'none' : 'block';
        elements.itemListContainer.style.display = showList ? 'block' : 'none';
    };

    return {
        elements,
        toggleLoading,
        showError,
        renderItemList,
        setModalContentVisibility,
        setButtonState: (lang) => {
            elements.buttons.forEach(btn => btn.classList.toggle('ativo', btn.dataset.lang === lang));
        },
        setButtonsLoading: (loading) => {
            elements.buttons.forEach(btn => btn.classList.toggle('carregando', loading));
        },
        updateTranslatable: async (elementsToUpdate, targetLang) => {
            const translationPromises = [];
            elementsToUpdate.forEach(el => {
                const originalText = el.getAttribute('data-original') || el.textContent;
                if (!el.getAttribute('data-original')) {
                    el.setAttribute('data-original', originalText);
                }
                translationPromises.push(TranslationModule.translate(originalText, targetLang));
            });
            const translations = await Promise.all(translationPromises);
            elementsToUpdate.forEach((el, i) => {
                el.textContent = translations[i];
            });
        },
        openModal: () => elements.modal.classList.add('visivel'),
        closeModal: () => elements.modal.classList.remove('visivel')
    };
})();

// ===========================================
// MÓDULO DE LINGUAGEM
// ===========================================
const LanguageModule = (() => {
    let currentLang = 'pt';

    const updateAllTexts = async (targetLang) => {
        UIModule.toggleLoading(true, 'Traduzindo...');
        UIModule.setButtonsLoading(true);

        try {
            const elements = document.querySelectorAll('.translatable');
            if (targetLang === 'pt') {
                elements.forEach(el => {
                    const original = el.getAttribute('data-original');
                    if (original) el.textContent = original;
                });
            } else {
                await UIModule.updateTranslatable(Array.from(elements), targetLang);
            }
        } catch (e) {
            console.error('Erro ao atualizar textos:', e);
        } finally {
            UIModule.toggleLoading(false);
            UIModule.setButtonsLoading(false);
        }
    };

    return {
        getCurrentLang: () => currentLang,
        setLang: async (newLang) => {
            if (currentLang === newLang) return;
            currentLang = newLang;
            document.documentElement.lang = newLang === 'pt' ? 'pt-br' : newLang;
            UIModule.setButtonState(newLang);
            await updateAllTexts(newLang);
            // Atualizar idioma do chatbot
            ChatbotModule.updateChatLanguage(newLang);
        }
    };
})();

// ===========================================
// MÓDULO DE CARDS
// ===========================================
const CardModule = (() => {
    const createCard = (mod, isPrincipal = false) => {
        const card = document.createElement('div');
        card.className = isPrincipal ? 'card-modulo principal' : 'card-modulo';
        card.dataset.id = mod.id;
        
        if (!isPrincipal) {
            card.style.backgroundImage = `url(${mod.bg})`;
        }

        if (isPrincipal) {
            card.innerHTML = `
                <div class="card-conteudo">
                    <!-- Chat será inserido aqui -->
                </div>
            `;
            
            // Inicializar chat no card principal
            setTimeout(() => {
                ChatbotModule.initChatInterface(card.querySelector('.card-conteudo'));
            }, 100);
        } else {
            card.innerHTML = `
                <div class="card-conteudo">
                    <i class="icone ${mod.icone}"></i>
                    <h3 class="translatable" data-original="${mod.titulo}">${mod.titulo}</h3>
                </div>
            `;
        }
        
        return card;
    };

    const render = async () => {
        const container = UIModule.elements.container;
        if (!container) return;

        const modules = await DataModule.loadAllModules();
        container.innerHTML = '';

        // Encontrar o módulo Oraculum AI
        const oraculumModule = modules.find(mod => mod.id === 'oraculum-ai');
        const otherModules = modules.filter(mod => mod.id !== 'oraculum-ai');

        // Criar container do módulo principal
        if (oraculumModule) {
            const principalContainer = document.createElement('div');
            principalContainer.className = 'modulo-principal-container';
            
            const principalCard = createCard(oraculumModule, true);
            principalContainer.appendChild(principalCard);
            container.appendChild(principalContainer);
        }

        // Criar grid dos outros módulos
        const gridContainer = document.createElement('div');
        gridContainer.className = 'modulos-grid';
        
        otherModules.forEach(mod => {
            const card = createCard(mod, false);
            gridContainer.appendChild(card);
        });
        
        container.appendChild(gridContainer);

        if (LanguageModule.getCurrentLang() !== 'pt') {
            const elementsToTranslate = container.querySelectorAll('.translatable');
            await UIModule.updateTranslatable(Array.from(elementsToTranslate), LanguageModule.getCurrentLang());
        }
    };

    return {
        render
    };
})();

// ===========================================
// MÓDULO DE MODAL (AGORA DINÂMICO)
// ===========================================
const ModalModule = (() => {
    let currentGame = null;

    const open = async (id) => {
        const mod = await DataModule.getModuleById(id);
        if (!mod) return;

        // Se for o Oraculum AI, não abrir modal (já está no card principal)
        if (mod.isChatbot && id === 'oraculum-ai') {
            console.log('Oraculum AI já está integrado no card principal');
            return;
        }

        console.log('Abrindo módulo:', id, mod); // Debug

        const {
            modalImg,
            modalTitle,
            modalDesc,
            itemListContainer
        } = UIModule.elements;
        const currentLang = LanguageModule.getCurrentLang();
        const gameCanvas = document.getElementById('gameCanvas');

        modalImg.src = mod.bg;
        modalImg.alt = mod.titulo;

        // Limpa e prepara para novo conteúdo
        UIModule.renderItemList([], id);

        const [titulo, desc] = await Promise.all([
            TranslationModule.translate(mod.titulo, currentLang),
            TranslationModule.translate(mod.desc, currentLang)
        ]);

        modalTitle.textContent = titulo;
        modalTitle.setAttribute('data-original', mod.titulo);
        modalTitle.classList.add('translatable');

        modalDesc.textContent = desc;
        modalDesc.setAttribute('data-original', mod.desc);
        modalDesc.classList.add('translatable');

        if (mod.isChatbot) {
            console.log('Iniciando modo chatbot'); // Debug
            modalImg.style.display = 'none';
            const gameCanvas = document.getElementById('gameCanvas');
            if (gameCanvas) {
                gameCanvas.style.display = 'none';
            }
            
            // Cria interface do chatbot
            ChatbotModule.initChatInterface();
            
            UIModule.setModalContentVisibility(true);
            modalDesc.style.display = 'block';
        } else if (mod.items && mod.items.length > 0) {
            modalImg.style.display = 'block';
            gameCanvas.style.display = 'none';
            UIModule.setModalContentVisibility(true);
            UIModule.renderItemList(mod.items, id);

            if (currentLang !== 'pt') {
                const itemElements = itemListContainer.querySelectorAll('.translatable');
                await UIModule.updateTranslatable(Array.from(itemElements), currentLang);
            }
        } else if (mod.loadItems) {
            // OTIMIZAÇÃO 3: Carrega notícias sob demanda (lazy)
            modalImg.style.display = 'block';
            gameCanvas.style.display = 'none';
            UIModule.setModalContentVisibility(true);
            
            console.log('📰 Carregando notícias lazy...');
            const items = await mod.loadItems();
            UIModule.renderItemList(items, id);
            
            if (currentLang !== 'pt') {
                const itemElements = itemListContainer.querySelectorAll('.translatable');
                await UIModule.updateTranslatable(Array.from(itemElements), currentLang);
            }
        } else {
            modalImg.style.display = 'block';
            gameCanvas.style.display = 'none';
            UIModule.setModalContentVisibility(false);
        }

        UIModule.openModal();
    };

    const close = () => {
        if (currentGame) {
            currentGame.destroy();
            currentGame = null;
        }
        const gameCanvas = document.getElementById('gameCanvas');
        if (gameCanvas) {
            gameCanvas.style.display = 'none';
        }
        if (UIModule.elements.modalImg) {
            UIModule.elements.modalImg.style.display = 'block';
        }
        // Limpa interface do chatbot
        ChatbotModule.clearChatInterface();
        UIModule.closeModal();
    };

    return {
        open,
        close
    };
})();

// ===========================================
// MÓDULO DE EVENTOS
// ===========================================
const EventModule = (() => {
    const init = () => {
        // Eventos de idioma
        UIModule.elements.buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const lang = e.target.dataset.lang;
                if (!btn.classList.contains('carregando')) {
                    LanguageModule.setLang(lang);
                }
            });
        });

        // Eventos de cards
        UIModule.elements.container.addEventListener('click', e => {
            const card = e.target.closest('.card-modulo');
            if (card && !card.classList.contains('principal')) {
                ModalModule.open(card.dataset.id);
            }
        });

        // Eventos de modal
        document.getElementById('modal-fechar-btn').addEventListener('click', ModalModule.close);
        UIModule.elements.modal.addEventListener('click', e => {
            if (e.target === UIModule.elements.modal) ModalModule.close();
        });
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') ModalModule.close();
        });
    };

    return {
        init
    };
})();

// ===========================================
// MÓDULO DO CHATBOT ORACULUM AI
// ===========================================
const ChatbotModule = (() => {
    // ⚠️ ALERTA DE SEGURANÇA: Esta chave deve ser movida para o backend
    // Por enquanto, usando modo de demonstração com fallback inteligente
    // Configuração da API - Use variáveis de ambiente em produção
    const API_KEY = window.GEMINI_API_KEY || 'SUA_CHAVE_AQUI'; // Configure em um arquivo separado
    const API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-lite:generateContent';
    
    let chatContainer = null;
    let messageHistory = [];
    let lastRequestTime = 0;
    const RATE_LIMIT_MS = 12000; // 12 segundos entre requisições para economia de cota
    
    // Sistema de cache local para respostas frequentes
    const responseCache = new Map();
    const CACHE_DURATION = 1000 * 60 * 60; // 1 hora
    
    // Função para gerar hash de pergunta (para cache)
    const hashQuestion = (question) => {
        return question.toLowerCase()
            .trim()
            .replace(/[^\w\s]/gi, '')
            .substring(0, 100);
    };

    // Sistema de prompt otimizado para economia de tokens
    // OTIMIZAÇÃO 2: Prompt ultra-comprimido (redução de ~15 tokens)
    const SYSTEM_PROMPT = `Guia Belém/COP30. PT. Curto, útil, prático.`;

    // Respostas de fallback locais - Sistema Inteligente Expandido
    // Sistema de Intenções Inteligentes - Carregado dinamicamente do JSON
    let INTENT_PATTERNS = [];
    
    // Carrega intent patterns do JSON
    const loadIntentPatterns = async () => {
        if (INTENT_PATTERNS.length > 0) return INTENT_PATTERNS;
        const data = await Utils.safeFetch('/static/data/intent_responses.json', 'Erro ao carregar intent patterns');
        if (data) {
            INTENT_PATTERNS = data;
            console.log('✅ Intent patterns carregados:', INTENT_PATTERNS.length);
        }
        return INTENT_PATTERNS;
    };
    
    // Inicializa patterns ao carregar módulo (eager loading para chat)
    loadIntentPatterns();
    
    const DEPRECATED_INTENT_PATTERNS = [
        // Deprecated: Intent patterns foram movidos para intent_responses.json
        // Este array foi mantido apenas por compatibilidade temporária
    ];

    const getFallbackResponse = (message) => {
        const msg = message.toLowerCase();
        const currentLang = LanguageModule.getCurrentLang();
        
        // Se não for português, traduzir a resposta automaticamente
        if (currentLang !== 'pt') {
            return getFallbackResponseTranslated(message, currentLang);
        }
        
        // SISTEMA DE INTENÇÕES - Verifica padrões inteligentes primeiro
        for (const pattern of INTENT_PATTERNS) {
            if (pattern.keywords.some(keyword => msg.includes(keyword))) {
                console.log(`✅ Intent detectada: ${pattern.intent}`);
                return pattern.response;
            }
        }
        
        // Cumprimentos e saudações
        if (msg.includes('bom dia') || msg.includes('boa tarde') || msg.includes('boa noite') || msg.includes('olá') || msg.includes('oi') || msg.includes('hey') || msg.includes('oiê')) {
            const saudacao = msg.includes('bom dia') ? '🌅 Bom dia' : 
                            msg.includes('boa tarde') ? '☀️ Boa tarde' : 
                            msg.includes('boa noite') ? '🌙 Boa noite' : '👋 Olá';
            return `${saudacao}! Bem-vindo a Belém, a porta de entrada da Amazônia! 🌿

Como posso te ajudar com informações sobre nossa bela cidade e a COP 30? Posso falar sobre pontos turísticos, restaurantes, hotéis, transporte ou qualquer coisa relacionada a Belém do Pará.

🗣️ **Dica**: Experimente perguntar "O que fazer em Belém?" ou "Onde comer tacacá?"`;
        }
        
        // Alimentação e restaurantes
        if (msg.includes('almoç') || msg.includes('jantar') || msg.includes('restaurante') || msg.includes('comida') || msg.includes('comer') || msg.includes('fome') || msg.includes('prato')) {
            return `🍽️ **Melhores Restaurantes em Belém:**

🏪 **Mercado Ver-o-Peso**: Tacacá autêntico, açaí tradicional e pratos regionais
🌊 **Estação das Docas**: Restaurantes sofisticados com vista para o rio Guamá
🥥 **Point do Açaí**: O melhor açaí tradicional paraense (servido salgado!)
🏠 **Lá em Casa**: Culinária regional familiar e aconchegante
🦋 **Mangal das Garças**: Restaurantes em ambiente natural exuberante
🍤 **Camarão do Elias**: Especialista em frutos do mar amazônicos
🌮 **Remanso do Bosque**: Alta gastronomia paraense

💡 **Dica especial**: Experimente o tacacá no final da tarde para a experiência mais autêntica!`;
        }
        
        // Hospedagem
        if (msg.includes('hotel') || msg.includes('hospedagem') || msg.includes('dormir') || msg.includes('ficar') || msg.includes('pousada') || msg.includes('pernoitar')) {
            return `🏨 **Hospedagem em Belém para todos os orçamentos:**

⭐ **LUXO (R$ 300+/noite):**
• Grand Mercure Belém do Pará (Nazaré)
• Vila Galé Collection Amazônia (temática)
• Radisson Hotel Maiorana Jr (executivo)

🏛️ **HISTÓRICO/BOUTIQUE (R$ 200-300/noite):**
• Atrium Quinta de Pedras (casarão colonial)
• Hotel Grão Pará (centro histórico)

💰 **ECONÔMICO (R$ 100-200/noite):**
• Ibis Styles Belém (moderno)
• Bristol Umarizal Hotel (beira-rio)
• Beira Rio Hotel (vista panorâmica)

📍 **Melhores bairros**: Nazaré (elegante), Umarizal (central), Batista Campos (tranquilo)`;
        }
        
        // Pontos turísticos
        if (msg.includes('pontos turísticos') || msg.includes('visitar') || msg.includes('turismo') || msg.includes('atrações') || msg.includes('passear') || msg.includes('conhecer')) {
            return `🏛️ **Pontos Turísticos Imperdíveis em Belém:**

🏪 **Ver-o-Peso** (parada obrigatória): Maior feira ao ar livre da América Latina

🎭 **Theatro da Paz** (1878): Teatro histórico com arquitetura neoclássica

🦋 **Mangal das Garças**: Parque natural urbano com borboletário

🚢 **Estação das Docas**: Complexo gastronômico à beira-rio

⛪ **Basílica Santuário de Nazaré**: Marco religioso do Círio

🏛️ **Cidade Velha**: Centro histórico com arquitetura colonial portuguesa

🏞️ **Ilha do Combu**: Paraíso natural a 15 min de barco

🌳 **Praça Batista Campos**: Área verde para relaxar

🌺 **Parque da Residência**: Orquidário e anfiteatro

⏰ **Roteiro de 1 dia**: Ver-o-Peso (manhã) → Cidade Velha (tarde) → Estação das Docas (pôr do sol)`;
        }
        
        // COP 30 e sustentabilidade
        if (msg.includes('cop 30') || msg.includes('cop30') || msg.includes('conferência') || msg.includes('clima') || msg.includes('sustentabilidade') || msg.includes('meio ambiente')) {
            return `🌍 **COP 30 - Belém 2025: A COP da Amazônia!**

A 30ª Conferência da ONU sobre Mudanças Climáticas será realizada em Belém!

🏗️ **Preparativos em andamento:**
• Novo centro de convenções no Hangar
• Infraestrutura sustentável ampliada
• Transporte público BRT expandido
• Hotéis com certificação eco-friendly

🌿 **Destaques únicos:**
• Primeira COP realizada na Amazônia
• Foco em soluções baseadas na natureza
• Programação cultural amazônica rica
• Turismo sustentável e responsável
• Participação de povos indígenas

📅 **Data**: Novembro de 2025
🎯 **Expectativa**: 40.000+ participantes de 190+ países`;
        }
        
        // Transporte
        if (msg.includes('transporte') || msg.includes('como chegar') || msg.includes('ônibus') || msg.includes('táxi') || msg.includes('uber') || msg.includes('metro') || msg.includes('brt')) {
            return `🚌 **Transporte completo em Belém:**

🚍 **BRT Belém**: Sistema de trânsito rápido moderno

🚕 **Táxi/Uber/99**: Disponível 24h, use apps para mais segurança

🚴 **Bike Belém**: Estações de bicicletas compartilhadas

⛵ **Barcos**: Para Ilha do Combu (Terminal Ruy Barata, R$ 3)

✈️ **Aeroporto**: Val-de-Cans, 15km do centro (táxi ~R$ 50)

🚌 **Ônibus urbano**: Extensa rede, passagem R$ 4,30

💡 **Dicas práticas**:
• Use BRT para trajetos longos (mais rápido)
• À noite, prefira Uber/99 (mais seguro)
• Para COP 30, haverá linhas especiais gratuitas
• Apps úteis: Moovit, Google Maps`;
        }
        
        // Segurança
        if (msg.includes('segurança') || msg.includes('cuidado') || msg.includes('perigo') || msg.includes('assalto') || msg.includes('roubo') || msg.includes('perigoso')) {
            return `🛡️ **Segurança em Belém - Guia Completo:**

⚠️ **Cuidados essenciais:**
• Não exiba objetos de valor (celular, joias)
• Evite andar sozinho após 20h
• Use transporte por app à noite
• Mantenha documentos em local seguro
• Prefira cartão a dinheiro em espécie

📱 **Emergências importantes:**
• Polícia Militar: 190
• SAMU (Ambulância): 192
• Bombeiros: 193
• Polícia Civil: 197

✅ **Áreas mais seguras:**
• Estação das Docas (policiamento)
• Mangal das Garças (área turística)
• Shopping centers (segurança privada)
• Hotéis da orla (movimento constante)
• Theatro da Paz (centro cultural)`;
        }
        
        // Culinária específica
        if (msg.includes('açaí') || msg.includes('tacacá') || msg.includes('maniçoba') || msg.includes('culinária') || msg.includes('comida típica') || msg.includes('prato paraense')) {
            return `🥣 **Culinária Paraense Autêntica - Imperdíveis:**

🍇 **Açaí**: Servido SALGADO com farinha d'água, peixe frito ou charque (esqueça o doce!)
🍲 **Tacacá**: Caldo quente com tucumã, jambu (deixa a boca dormente) e camarão seco
🥘 **Maniçoba**: "Feijoada paraense" - folhas de mandioca cozidas por 7 dias com carnes
🦆 **Pato no Tucumã**: Prato especial para ocasiões festivas
🦀 **Caranguejo**: Especialidade das ilhas, melhor época: junho-novembro
🐟 **Pirarucu**: Peixe gigante da Amazônia, preparado assado
🥥 **Cupuaçu**: Fruta amazônica para sobremesas

📍 **Onde experimentar**: Ver-o-Peso (autêntico), Point do Açaí (tradicional), Lá em Casa (caseiro)`;
        }
        
        // Clima e tempo
        if (msg.includes('clima') || msg.includes('tempo') || msg.includes('chuva') || msg.includes('calor') || msg.includes('temperatura')) {
            return `🌤️ **Clima tropical de Belém:**

🌡️ **Temperatura**: 24°C a 32°C (ano todo, pouca variação)

☔ **Estação mais chuvosa**: Dezembro a Maio (chuvas diárias)

☀️ **Menos chuva**: Junho a Novembro (melhor época)

💧 **Umidade**: Sempre alta (80-85%)

🌪️ **Ventos**: Brisas constantes do rio

👕 **O que levar sempre:**
• Roupas leves, claras e respiráveis
• Protetor solar FPS 60+ (sol forte)
• Capa de chuva ou guarda-chuva compacto
• Repelente (mosquitos são comuns)
• Calçado antiderrapante para chuva

💡 **Dica local**: As chuvas são intensas mas passam rápido!`;
        }
        
        // Compras e souvenirs
        if (msg.includes('compras') || msg.includes('shopping') || msg.includes('souvenirs') || msg.includes('lembranças') || msg.includes('artesanato')) {
            return '�️ **Compras e Souvenirs em Belém:**\\n\\n🏪 **Ver-o-Peso**: Artesanato amazônico, ervas, temperos, cerâmica marajoara\\n🛒 **Shopping Pátio Belém**: Lojas nacionais, praça de alimentação\\n🎨 **Casa das Artes**: Artesanato local e regional\\n🌿 **Mercado de São Brás**: Produtos naturais e plantas medicinais\\n\\n🎁 **Souvenirs autênticos:**\\n• Cerâmica marajoara (arte milenar)\\n• Joias com pedras amazônicas\\n• Redes de dormir tradicionais\\n• Açaí em pó ou polpa\\n• Cachaças artesanais regionais\\n• Óleos e essências amazônicas\\n\\n💰 **Dica**: Sempre negocie o preço no Ver-o-Peso!';
        }
        
        // Vida noturna
        if (msg.includes('noite') || msg.includes('balada') || msg.includes('bar') || msg.includes('festa') || msg.includes('diversão noturna')) {
            return '🌃 **Vida Noturna em Belém:**\\n\\n🍻 **Bares tradicionais:**\\n• Boteco Magnífico (chopp gelado)\\n• Bar do Parque (ambiente familiar)\\n• Cervejaria Belém (craft beer local)\\n\\n� **Música ao vivo:**\\n• Casa Tom (MPB e jazz)\\n• Estação das Docas (shows eventuais)\\n• Teatro Waldemar Henrique (cultura)\\n\\n🏖️ **Orla de Icoaraci** (fins de semana):\\n• Barracas na praia\\n• Música regional (brega, carimbó)\\n• Ambiente descontraído\\n\\n⚠️ **Segurança**: Sempre use Uber/táxi à noite e ande em grupo';
        }
        
        // Perguntas sobre preços/custos
        if (msg.includes('preço') || msg.includes('custa') || msg.includes('valor') || msg.includes('quanto') || msg.includes('barato') || msg.includes('caro')) {
            return '💰 **Custos em Belém (estimativas 2025):**\\n\\n🍽️ **Alimentação:**\\n• Tacacá: R$ 8-12\\n• Almoço simples: R$ 25-35\\n• Restaurante bom: R$ 60-100/pessoa\\n• Açaí tradicional: R$ 15-25\\n\\n🚌 **Transporte:**\\n• Ônibus urbano: R$ 4,30\\n• Uber (centro): R$ 15-30\\n• Táxi aeroporto: R$ 45-60\\n• Barco Ilha do Combu: R$ 3\\n\\n🎫 **Atrações:**\\n• Theatro da Paz: R$ 10-40\\n• Mangal das Garças: R$ 15\\n• Museus: R$ 5-15\\n• Ver-o-Peso: Gratuito\\n\\n� **Dica**: Belém é mais barata que capitais do Sul/Sudeste!';
        }
        
        // Perguntas sobre duração da visita
        if (msg.includes('quantos dias') || msg.includes('tempo ficar') || msg.includes('roteiro') || msg.includes('itinerário')) {
            return '📅 **Roteiros para Belém:**\\n\\n⚡ **2 dias (mínimo):**\\n• Dia 1: Ver-o-Peso + Cidade Velha + Estação das Docas\\n• Dia 2: Mangal das Garças + Theatro da Paz + Basílica\\n\\n🌟 **4-5 dias (ideal):**\\n• + Ilha do Combu\\n• + Mercado de São Brás\\n• + Icoaraci (cerâmica)\\n• + Mais restaurantes locais\\n\\n🏖️ **1 semana+ (completo):**\\n• + Salinópolis (praias)\\n• + Alter do Chão (Caribe Amazônico)\\n• + Marajó (búfalos)\\n\\n💡 **Recomendação**: 4 dias é perfeito para conhecer bem a cidade!';
        }
        
        // Fallback padrão mais inteligente
        return '👋 **Olá! Sou o Oraculum AI** 🤖\\n\\nEspecialista em **Belém do Pará** e **COP 30**. Seu guia local inteligente!\\n\\n🎯 **Perguntas populares que posso responder:**\\n\\n🍽️ \"Onde almoçar em Belém?\"\\n🏨 \"Melhores hotéis da cidade\"\\n🏛️ \"O que visitar em 3 dias?\"\\n🌍 \"Como será a COP 30?\"\\n🚌 \"Como me locomover?\"\\n🛡️ \"Belém é segura?\"\\n🥣 \"O que é tacacá?\"\\n💰 \"Quanto custa viajar para cá?\"\\n\\n💬 **Digite sua dúvida** e receba informações detalhadas e atualizadas sobre nossa bela cidade amazônica!';
    };

    // Respostas traduzidas para outros idiomas
    const getFallbackResponseTranslated = (message, lang) => {
        const msg = message.toLowerCase();
        
        if (lang === 'en') {
            // Cumprimentos
            if (msg.includes('hello') || msg.includes('hi') || msg.includes('good morning') || msg.includes('good afternoon') || msg.includes('good evening')) {
                return `👋 Hello! Welcome to Belém, the gateway to the Amazon! 🌿

How can I help you with information about our beautiful city and COP 30? I can talk about tourist attractions, restaurants, hotels, transportation or anything related to Belém do Pará.

🗣️ **Tip**: Try asking "What to do in Belém?" or "Where to eat tacacá?"`;
            }
            
            // Alimentação
            if (msg.includes('lunch') || msg.includes('dinner') || msg.includes('restaurant') || msg.includes('food') || msg.includes('eat') || msg.includes('hungry')) {
                return `🍽️ **Best Restaurants in Belém:**

🏪 **Mercado Ver-o-Peso**: Authentic tacacá, traditional açaí and regional dishes
🌊 **Estação das Docas**: Sophisticated restaurants with river view
🥥 **Point do Açaí**: The best traditional Pará açaí (served salty!)
🏠 **Lá em Casa**: Regional family cuisine
🦋 **Mangal das Garças**: Restaurants in exuberant natural environment
🍤 **Camarão do Elias**: Amazon seafood specialist
🌮 **Remanso do Bosque**: High-end Pará cuisine

💡 **Special tip**: Try tacacá in the late afternoon for the most authentic experience!`;
            }
            
            // Padrão
            return `👋 **Hello! I'm Oraculum AI** 🤖

**Belém do Pará** and **COP 30** specialist. Your intelligent local guide!

🎯 **Popular questions I can answer:**

🍽️ "Where to have lunch in Belém?"
🏨 "Best hotels in the city"
🏛️ "What to visit in 3 days?"
🌍 "How will COP 30 be?"
🚌 "How to get around?"
🛡️ "Is Belém safe?"
🥣 "What is tacacá?"
💰 "How much does it cost to travel here?"

💬 **Type your question** and receive detailed and updated information about our beautiful Amazonian city!`;
        }
        
        if (lang === 'es') {
            // Cumprimentos
            if (msg.includes('hola') || msg.includes('buenos días') || msg.includes('buenas tardes') || msg.includes('buenas noches')) {
                return `👋 ¡Hola! ¡Bienvenido a Belém, la puerta de entrada al Amazonas! 🌿

¿Cómo puedo ayudarte con información sobre nuestra hermosa ciudad y la COP 30? Puedo hablar sobre atracciones turísticas, restaurantes, hoteles, transporte o cualquier cosa relacionada con Belém do Pará.

🗣️ **Consejo**: Intenta preguntar "¿Qué hacer en Belém?" o "¿Dónde comer tacacá?"`;
            }
            
            // Alimentación
            if (msg.includes('almuerzo') || msg.includes('cena') || msg.includes('restaurante') || msg.includes('comida') || msg.includes('comer') || msg.includes('hambre')) {
                return `🍽️ **Mejores Restaurantes en Belém:**

🏪 **Mercado Ver-o-Peso**: Tacacá auténtico, açaí tradicional y platos regionales
🌊 **Estação das Docas**: Restaurantes sofisticados con vista al río
🥥 **Point do Açaí**: ¡El mejor açaí tradicional de Pará (servido salado!)
🏠 **Lá em Casa**: Cocina regional familiar
🦋 **Mangal das Garças**: Restaurantes en ambiente natural exuberante
🍤 **Camarão do Elias**: Especialista en mariscos amazónicos
🌮 **Remanso do Bosque**: Alta cocina paraense

💡 **Consejo especial**: ¡Prueba el tacacá al final de la tarde para la experiencia más auténtica!`;
            }
            
            // Padrão
            return `👋 **¡Hola! Soy Oraculum AI** 🤖

Especialista en **Belém do Pará** y **COP 30**. ¡Tu guía local inteligente!

🎯 **Preguntas populares que puedo responder:**

🍽️ "¿Dónde almorzar en Belém?"
🏨 "Mejores hoteles de la ciudad"
🏛️ "¿Qué visitar en 3 días?"
🌍 "¿Cómo será la COP 30?"
🚌 "¿Cómo moverse?"
🛡️ "¿Es seguro Belém?"
🥣 "¿Qué es el tacacá?"
💰 "¿Cuánto cuesta viajar aquí?"

💬 **Escribe tu pregunta** y recibe información detallada y actualizada sobre nuestra hermosa ciudad amazónica!`;
        }
        
        // Se não houver tradução, usar português
        return getFallbackResponse(message);
    };

    // Sistema de dados locais para Belém
    let localDatabase = null;
    
    const loadLocalDatabase = async () => {
        if (localDatabase) return localDatabase; // Cache para evitar múltiplas requisições
        
        try {
            const response = await fetch('/api/belem-data/');
            if (response.ok) {
                localDatabase = await response.json();
                console.log('💾 Base de dados local de Belém carregada com sucesso');
                return localDatabase;
            } else {
                console.warn('⚠️ Erro ao carregar dados locais, usando fallback');
                return null;
            }
        } catch (error) {
            console.warn('⚠️ Erro de rede ao carregar dados locais:', error.message);
            return null;
        }
    };
    
    // OTIMIZAÇÃO 4: Cache de busca local (memoização)
    const searchCache = new Map();
    const MAX_CACHE_SIZE = 100; // Limita tamanho do cache
    
    const searchLocalData = (message, database) => {
        if (!database) return null;
        
        // Verifica cache primeiro
        const cacheKey = message.toLowerCase().trim();
        if (searchCache.has(cacheKey)) {
            console.log('✅ Busca recuperada do cache:', cacheKey);
            return searchCache.get(cacheKey);
        }
        
        const msg = message.toLowerCase();
        let results = [];
        
        // FORÇA BUSCA POR HOTÉIS se mensagem contém palavras relacionadas
        if (msg.includes('hosped') || msg.includes('hotel') || msg.includes('ficar') || msg.includes('dormir') || msg.includes('acomod') || msg.includes('link de locais')) {
            if (database.hoteis && Array.isArray(database.hoteis)) {
                database.hoteis.slice(0, 4).forEach(hotel => {
                    results.push({
                        type: 'hoteis',
                        data: hotel,
                        score: 5
                    });
                });
                return results;
            }
        }
        
        // FORÇA BUSCA POR RESTAURANTES se mensagem contém palavras relacionadas
        if (msg.includes('comer') || msg.includes('restaurante') || msg.includes('comida') || msg.includes('almoç') || msg.includes('jantar')) {
            if (database.restaurantes && Array.isArray(database.restaurantes)) {
                database.restaurantes.slice(0, 4).forEach(rest => {
                    results.push({
                        type: 'restaurantes',
                        data: rest,
                        score: 5
                    });
                });
                return results;
            }
        }
        
        // Continua com busca normal se não forçou
        let searchScore = {};
        
        // Palavras-chave categorizadas com pesos
        const keywords = {
            'pontos_turisticos': {
                high: ['ver-o-peso', 'docas', 'theatro', 'mangal', 'basilica', 'museu', 'forte', 'casa onze janelas'],
                medium: ['onde visitar', 'turismo', 'ponto turistico', 'conhecer', 'o que fazer', 'passeio'],
                low: ['visitar', 'ver', 'lugar', 'local']
            },
            'restaurantes': {
                high: ['acai', 'tacaca', 'maniçoba', 'remanso', 'point', 'cairu', 'manjar'],
                medium: ['onde comer', 'restaurante', 'comida', 'almoco', 'jantar', 'gastronomia'],
                low: ['comer', 'prato', 'bar', 'lanche']
            },
            'hoteis': {
                high: ['atrium', 'radisson', 'mercure', 'ibis'],
                medium: ['onde ficar', 'hospedagem', 'hotel', 'pousada', 'hospedar', 'me hospedar', 'locais para me hospedar', 'link de locais'],
                low: ['dormir', 'pernoitar', 'ficar', 'estadia', 'acomodacao', 'quartos', 'reserva']
            },
            'transporte': {
                high: ['uber', '99', 'aeroporto', 'brt'],
                medium: ['como chegar', 'transporte', 'taxi', 'onibus'],
                low: ['ir', 'chegar']
            },
            'cop30': {
                high: ['cop30', 'cop 30', 'conferencia clima'],
                medium: ['onu', 'mudancas climaticas', 'conferencia'],
                low: ['evento', '2025']
            },
            'seguranca': {
                high: ['seguranca', 'seguro', 'cuidado', 'perigo'],
                medium: ['emergencia', 'policia', 'risco'],
                low: ['atencao']
            },
            'clima': {
                high: ['clima', 'tempo', 'chuva', 'quando visitar'],
                medium: ['temperatura', 'estacao', 'sol'],
                low: ['calor']
            },
            'compras': {
                high: ['shopping', 'comprar', 'boulevard', 'icoaraci'],
                medium: ['artesanato', 'souvenir', 'ceramica'],
                low: ['loja', 'mercado']
            }
        };
        
        // Calcula pontuação por categoria
        Object.keys(keywords).forEach(category => {
            let score = 0;
            keywords[category].high.forEach(term => {
                if (msg.includes(term)) score += 3;
            });
            keywords[category].medium.forEach(term => {
                if (msg.includes(term)) score += 2;
            });
            keywords[category].low.forEach(term => {
                if (msg.includes(term)) score += 1;
            });
            
            if (score > 0) {
                searchScore[category] = score;
            }
        });
        
        // Ordena categorias por relevância
        const sortedCategories = Object.keys(searchScore).sort((a, b) => searchScore[b] - searchScore[a]);
        
        // Limita a 2 categorias mais relevantes para economizar tokens
        const topCategories = sortedCategories.slice(0, 2);
        
        // Busca dados nas categorias relevantes
        topCategories.forEach(category => {
            const categoryData = database[category];
            if (!categoryData) return;
            
            if (Array.isArray(categoryData)) {
                // Para arrays, limita a 3 resultados mais relevantes
                const relevantItems = categoryData.slice(0, 3);
                relevantItems.forEach(item => {
                    results.push({
                        type: category,
                        data: item,
                        score: searchScore[category]
                    });
                });
            } else {
                results.push({
                    type: category,
                    data: categoryData,
                    score: searchScore[category]
                });
            }
        });
        
        // Se não encontrou nada específico, busca termo exato
        if (results.length === 0) {
            // Busca por palavras individuais na mensagem
            const words = msg.split(' ').filter(word => word.length > 2);
            
            Object.keys(database).forEach(category => {
                const data = database[category];
                if (Array.isArray(data)) {
                    data.slice(0, 3).forEach(item => { // Máximo 3 itens por categoria
                        let matches = 0;
                        words.forEach(word => {
                            if (item.nome && item.nome.toLowerCase().includes(word)) {
                                matches += 2;
                            }
                            if (item.descricao && item.descricao.toLowerCase().includes(word)) {
                                matches += 1;
                            }
                            if (item.tags && item.tags.some(tag => tag.toLowerCase().includes(word))) {
                                matches += 1;
                            }
                        });
                        
                        if (matches > 0) {
                            results.push({ type: category, data: item, score: matches });
                        }
                    });
                }
            });
        }
        
        // Se ainda não encontrou nada e a mensagem contém certas palavras-chave, retorna dados genéricos
        if (results.length === 0) {
            if (msg.includes('hotel') || msg.includes('hosped') || msg.includes('ficar') || msg.includes('dormir')) {
                const hoteis = database.hoteis;
                if (hoteis && Array.isArray(hoteis)) {
                    hoteis.slice(0, 3).forEach(hotel => {
                        results.push({ type: 'hoteis', data: hotel, score: 1 });
                    });
                }
            }
            
            if (msg.includes('comer') || msg.includes('restaurante') || msg.includes('comida')) {
                const restaurantes = database.restaurantes;
                if (restaurantes && Array.isArray(restaurantes)) {
                    restaurantes.slice(0, 3).forEach(rest => {
                        results.push({ type: 'restaurantes', data: rest, score: 1 });
                    });
                }
            }
            
            if (msg.includes('visitar') || msg.includes('turismo') || msg.includes('conhecer')) {
                const pontos = database.pontos_turisticos;
                if (pontos && Array.isArray(pontos)) {
                    pontos.slice(0, 3).forEach(ponto => {
                        results.push({ type: 'pontos_turisticos', data: ponto, score: 1 });
                    });
                }
            }
        }
        
        return results.length > 0 ? results.slice(0, 5) : null; // Máximo 5 resultados
    };
    
    // Nova função: Filtra e contextualiza resultados baseado na intent
    const filterAndContextualizeResults = (results, message, intent) => {
        if (!results || !Array.isArray(results)) return results;
        
        const msg = message.toLowerCase();
        let filtered = [...results];
        
        // Filtragem específica por intent
        switch(intent) {
            case 'acessibilidade_fisica':
                // Prioriza locais com informações de acessibilidade
                filtered = filtered.filter(r => {
                    const data = r.data;
                    return data.acessivel || data.rampa || data.elevador || 
                           (data.tags && data.tags.some(t => t.includes('acessível')));
                });
                break;
                
            case 'rico':
                // Filtra apenas alta gastronomia e luxo
                filtered = filtered.filter(r => {
                    if (r.type === 'restaurantes') {
                        return r.data.categoria === 'alta_gastronomia' || 
                               r.data.categoria === 'sofisticado' ||
                               (r.data.preco_medio && r.data.preco_medio.includes('R$ 200'));
                    }
                    if (r.type === 'hoteis') {
                        return r.data.categoria === 'luxo' || r.data.categoria === '5_estrelas';
                    }
                    return false;
                });
                break;
                
            case 'economico':
                // Filtra opções baratas
                filtered = filtered.filter(r => {
                    if (r.type === 'restaurantes') {
                        return r.data.categoria === 'popular' || r.data.categoria === 'tradicional' ||
                               (r.data.preco_medio && (r.data.preco_medio.includes('R$ 10') || 
                                r.data.preco_medio.includes('R$ 20') || r.data.preco_medio.includes('R$ 30')));
                    }
                    if (r.type === 'hoteis') {
                        return r.data.categoria === 'economico' || r.data.categoria === 'hostel';
                    }
                    return true;
                });
                break;
                
            case 'vegano':
            case 'vegetariano':
                // Filtra opções vegetarianas/veganas
                filtered = filtered.filter(r => {
                    const data = r.data;
                    return data.vegano || data.vegetariano || 
                           (data.especialidade && (data.especialidade.includes('vegano') || 
                            data.especialidade.includes('vegetariano'))) ||
                           (data.tags && data.tags.some(t => t.includes('vegano') || t.includes('vegetariano')));
                });
                break;
                
            case 'familia':
                // Prioriza locais kids-friendly
                filtered = filtered.filter(r => {
                    const data = r.data;
                    return data.kids_friendly || data.parque || data.familia ||
                           (data.tags && data.tags.some(t => t.includes('família') || t.includes('crianças') || t.includes('familiar')));
                });
                break;
                
            case 'areas_verdes':
                // Filtra apenas parques e áreas verdes
                filtered = filtered.filter(r => {
                    return r.type === 'pontos_turisticos' && 
                           (r.data.tags && r.data.tags.some(t => 
                               t.includes('parque') || t.includes('natureza') || 
                               t.includes('verde') || t.includes('jardim')
                           ));
                });
                break;
                
            case 'religioso':
                // Filtra apenas templos religiosos
                filtered = filtered.filter(r => {
                    return r.type === 'pontos_turisticos' && 
                           (r.data.tags && r.data.tags.some(t => 
                               t.includes('igreja') || t.includes('catedral') || 
                               t.includes('basílica') || t.includes('religioso')
                           ));
                });
                break;
        }
        
        return filtered.length > 0 ? filtered : results; // Se não encontrou nada específico, retorna tudo
    };

    const formatLocalDataResponse = (results, message = '', intent = null) => {
        try {
            if (!results || !Array.isArray(results) || results.length === 0) {
                return null;
            }
            
            // Filtra resultados baseado na intent
            if (intent) {
                results = filterAndContextualizeResults(results, message, intent);
            }
            
            // Retorna apenas respostas contextualizadas da intent, SEM dados do database
            if (intent && results.length === 0) {
                return null; // Deixa a intent response do fallback responder
            }
            
            // Se tem intent específica, não mostra lista genérica
            if (intent) {
                return null; // A resposta da intent já é suficiente
            }
            
            let response = '📍 **Sugestões:**\n\n';
            const maxResults = Math.min(3, results.length); // Reduzido para 3
            const processedResults = results.slice(0, maxResults);
            
            processedResults.forEach((result, index) => {
                try {
                    if (!result || typeof result !== 'object') {
                        return;
                    }
                    
                    const { type, data } = result;
                    
                    if (!data || typeof data !== 'object') {
                        return;
                    }
                    
                    // Formatação segura baseada no tipo
                    switch (type) {
                        case 'pontos_turisticos':
                            response += `🏛️ **${data.nome || 'Local'}**\n`;
                            if (data.endereco) response += `📍 Endereço: ${data.endereco}\n`;
                            if (data.google_maps_link) response += `🗺️ Google Maps: ${data.google_maps_link}\n`;
                            if (data.preco) response += `💰 Preço: ${data.preco}\n`;
                            if (data.horario) response += `🕒 Horário: ${data.horario}\n`;
                            if (data.website) response += `🌐 Website: ${data.website}\n`;
                            if (data.telefone) response += `📞 Telefone: ${data.telefone}\n`;
                            if (data.dicas) response += `💡 Dicas: ${data.dicas}\n`;
                            if (data.tags && Array.isArray(data.tags)) {
                                response += `🏷️ Tags: ${data.tags.slice(0, 4).join(', ')}\n`;
                            }
                            break;
                            
                        case 'restaurantes':
                            response += `🍽️ **${data.nome || 'Restaurante'}**\n`;
                            if (data.categoria) response += `🏷️ Categoria: ${data.categoria}\n`;
                            if (data.especialidade) response += `🍲 Especialidade: ${data.especialidade}\n`;
                            if (data.endereco) response += `📍 Endereço: ${data.endereco}\n`;
                            if (data.google_maps_link) response += `🗺️ Google Maps: ${data.google_maps_link}\n`;
                            if (data.preco_medio) response += `💰 Preço médio: ${data.preco_medio}\n`;
                            if (data.horario) response += `🕒 Horário: ${data.horario}\n`;
                            if (data.website) response += `🌐 Website: ${data.website}\n`;
                            if (data.telefone) response += `📞 Telefone: ${data.telefone}\n`;
                            if (data.pratos_famosos && Array.isArray(data.pratos_famosos)) {
                                response += `⭐ Pratos famosos: ${data.pratos_famosos.join(', ')}\n`;
                            }
                            if (data.dicas) response += `💡 Dicas: ${data.dicas}\n`;
                            break;
                            
                        case 'hoteis':
                            response += `🏨 **${data.nome || 'Hotel'}**\n`;
                            if (data.categoria) response += `⭐ Categoria: ${data.categoria.replace('_', ' ')}\n`;
                            if (data.endereco) response += `📍 **Endereço:** ${data.endereco}\n`;
                            if (data.google_maps_link) {
                                response += `🗺️ **Ver no Mapa:** [Abrir no Google Maps](${data.google_maps_link})\n`;
                            } else if (data.nome) {
                                const searchQuery = encodeURIComponent(`${data.nome} Belém Pará`);
                                const mapsUrl = `https://maps.google.com/?q=${searchQuery}`;
                                response += `🗺️ **Ver no Mapa:** [Buscar no Google Maps](${mapsUrl})\n`;
                            }
                            if (data.preco_diaria) response += `💰 **Preço da diária:** ${data.preco_diaria}\n`;
                            if (data.website) response += `🌐 **Website:** [${data.website}](${data.website})\n`;
                            if (data.telefone) response += `📞 Telefone: ${data.telefone}\n`;
                            if (data.comodidades && Array.isArray(data.comodidades)) {
                                response += `✨ Comodidades: ${data.comodidades.join(', ')}\n`;
                            }
                            if (data.dicas) response += `💡 Dicas: ${data.dicas}\n`;
                            break;
                            if (data.preco_diaria) response += `� ${data.preco_diaria}\n`;
                            break;
                            
                        case 'transporte':
                            response += `� **${data.tipo || 'Transporte'}**\n`;
                            if (data.descricao) response += `📝 ${data.descricao.substring(0, 80)}...\n`;
                            if (data.preco) response += `� ${data.preco}\n`;
                            break;
                            
                        case 'cop30':
                            if (Array.isArray(data)) {
                                const cop30Info = data[0];
                                response += `🌍 **COP 30 em Belém**\n`;
                                if (cop30Info.data) response += `� ${cop30Info.data}\n`;
                                if (cop30Info.local_principal) response += `� ${cop30Info.local_principal}\n`;
                            }
                            break;
                            
                        default:
                            response += `ℹ️ **${data.nome || 'Informação'}**\n`;
                            if (data.descricao) response += `📝 ${data.descricao.substring(0, 100)}\n`;
                            break;
                    }
                    
                    // Separador entre resultados
                    if (index < processedResults.length - 1) {
                        response += '\n---\n\n';
                    }
                    
                } catch (itemError) {
                    console.warn('Erro ao processar item:', itemError);
                    // Continua processando outros itens
                }
            });
            
            // Adiciona nota sobre mais resultados
            if (results.length > maxResults) {
                response += `\n\n💬 *Encontrei mais ${results.length - maxResults} opções adicionais. Para ver outras sugestões, faça uma pergunta mais específica ou me diga que tipo de experiência você procura!*`;
            }
            
            response += `\n\n🔗 *Todos os links do Google Maps são clicáveis para facilitar sua navegação!*`;
            
            const finalResponse = response.trim() ? response : null;
            
            // Armazenar no cache antes de retornar
            if (searchCache.size >= MAX_CACHE_SIZE) {
                const firstKey = searchCache.keys().next().value;
                searchCache.delete(firstKey); // LRU eviction
            }
            searchCache.set(cacheKey, finalResponse);
            console.log('✅ Busca armazenada no cache:', cacheKey);
            
            return finalResponse;
            
        } catch (error) {
            console.error('Erro ao formatar resposta local:', error);
            return null;
        }
    };

    const callGeminiAPI = async (message, localData = null) => {
        console.log('🧪 DEBUG: Iniciando callGeminiAPI');
        console.log('🔑 API_KEY disponível:', !!API_KEY);
        console.log('📝 Mensagem:', message);
        console.log('💾 LocalData disponível:', !!localData);
        
        if (!API_KEY) {
            console.error('❌ API Key não configurada');
            throw new Error('API Key não configurada');
        }
        
        // SISTEMA DE CACHE - Verifica cache antes de fazer requisição
        const cacheKey = hashQuestion(message);
        const cachedResponse = responseCache.get(cacheKey);
        
        if (cachedResponse && (Date.now() - cachedResponse.timestamp < CACHE_DURATION)) {
            console.log('✅ Resposta recuperada do cache (economizando API)');
            return cachedResponse.text;
        }
        
        // RATE LIMITING - Apenas para chamadas reais à API (não cache/fallback)
        const now = Date.now();
        if (now - lastRequestTime < RATE_LIMIT_MS) {
            const waitTime = Math.ceil((RATE_LIMIT_MS - (now - lastRequestTime)) / 1000);
            console.log(`⏳ Rate limit ativo. Aguarde ${waitTime}s antes de chamar API novamente`);
            throw new Error(`⏳ Aguarde ${waitTime} segundos antes de fazer outra consulta à API`);
        }
        lastRequestTime = now;
        
        try {
            // Prompt otimizado (menos tokens)
            let enhancedPrompt = SYSTEM_PROMPT;
            if (localData) {
                enhancedPrompt += `\n\nDados: ${localData.substring(0, 500)}\n\nUse as informações acima. Inclua links, preços, horários e dicas.`;
            }
            
            const requestBody = {
                contents: [{
                    parts: [{
                        text: `${enhancedPrompt}\n\nPergunta: ${message}`
                    }]
                }],
                generationConfig: {
                    maxOutputTokens: localData ? 250 : 180,
                    temperature: 0.7,
                    topP: 0.8,
                    topK: 40
                }
            };
            
            const response = await fetch(`${API_ENDPOINT}?key=${API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });
            
            console.log('🌐 Response status:', response.status);
            console.log('🌐 Response ok:', response.ok);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ HTTP error:', response.status, errorText);
                throw new Error(`HTTP error! status: ${response.status}, details: ${errorText}`);
            }

            const data = await response.json();
            console.log('📦 API Response data:', data);
            
            if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
                console.error('❌ Invalid API response structure:', data);
                throw new Error('Resposta inválida da API');
            }

            const resultText = data.candidates[0].content.parts[0].text;
            console.log('✅ API response text:', resultText);
            
            // Salvar no cache
            responseCache.set(cacheKey, {
                text: resultText,
                timestamp: Date.now()
            });
            console.log('💾 Resposta salva no cache');
            
            return resultText;
        } catch (error) {
            console.error('❌ Erro completo na API:', error);
            console.error('❌ Stack trace:', error.stack);
            throw error;
        }
    };

    const addMessage = (message, isUser = false) => {
        if (!chatContainer) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${isUser ? 'user-message' : 'bot-message'}`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        // Processa formatação de texto: converte \n em quebras de linha e ** em negrito
        const formattedMessage = message
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        messageContent.innerHTML = formattedMessage;
        
        const messageTime = document.createElement('div');
        messageTime.className = 'message-time';
        messageTime.textContent = new Date().toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        messageDiv.appendChild(messageContent);
        messageDiv.appendChild(messageTime);
        
        const messagesContainer = chatContainer.querySelector('.chat-messages');
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    };

    const handleUserMessage = async (message) => {
        console.log('💬 handleUserMessage iniciado com:', message);
        if (!message.trim()) return;
        
        addMessage(message, true);
        
        // Mostra indicador de digitação
        const typingDiv = document.createElement('div');
        typingDiv.className = 'chat-message bot-message typing-indicator';
        typingDiv.innerHTML = '<div class="message-content"><i class="fa-solid fa-comment-dots"></i> Oraculum está consultando a base de dados...</div>';
        
        const messagesContainer = chatContainer.querySelector('.chat-messages');
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // Simula tempo de "processamento" para melhor UX
        setTimeout(async () => {
            console.log('⏱️ Timeout iniciado, processando mensagem...');
            try {
                const msg = message.toLowerCase();
                
                // DETECÇÃO DE INTENT PRIMEIRO
                let detectedIntent = null;
                for (const pattern of INTENT_PATTERNS) {
                    if (pattern.keywords.some(keyword => msg.includes(keyword))) {
                        detectedIntent = pattern.intent;
                        console.log(`✅ Intent detectada: ${detectedIntent}`);
                        
                        // Retorna resposta da intent diretamente SEM buscar database
                        messagesContainer.removeChild(typingDiv);
                        addMessage(pattern.response, false);
                        messageHistory.push({ user: message, bot: pattern.response });
                        return; // IMPORTANTE: Sai aqui!
                    }
                }
                
                // Se não detectou intent específica, continua com busca normal
                console.log('📋 Carregando base de dados...');
                let database;
                try {
                    database = await loadLocalDatabase();
                    console.log('✅ Base de dados carregada:', !!database);
                } catch (dbError) {
                    console.warn('⚠️ Erro ao carregar base de dados local:', dbError);
                    database = window.localDatabase || null;
                }
                
                // 2. Busca por dados locais relevantes com proteção
                console.log('🔍 Iniciando busca por dados locais...');
                let localResults = null;
                if (database) {
                    try {
                        localResults = searchLocalData(message, database);
                        console.log('🎯 Resultados da busca local:', localResults);
                    } catch (searchError) {
                        console.warn('⚠️ Erro na busca de dados locais:', searchError);
                        localResults = null;
                    }
                } else {
                    console.warn('❌ Base de dados não disponível');
                }
                
                // 3. Se encontrou dados locais E não tem intent, processa
                if (localResults && Array.isArray(localResults) && localResults.length > 0) {
                    console.log('📋 Usando dados locais específicos:', localResults.length, 'resultados');
                    
                    let localResponse;
                    try {
                        localResponse = formatLocalDataResponse(localResults, message, detectedIntent);
                    } catch (formatError) {
                        console.warn('Erro ao formatar dados locais:', formatError);
                        localResponse = null;
                    }
                    
                    if (localResponse && localResponse.trim()) {
                        // Tenta enriquecer com IA (opcional)
                        try {
                            const aiResponse = await callGeminiAPI(message, localResponse);
                            if (aiResponse && aiResponse.trim()) {
                                messagesContainer.removeChild(typingDiv);
                                addMessage(aiResponse, false);
                                messageHistory.push({ user: message, bot: aiResponse });
                                return;
                            }
                        } catch (aiError) {
                            console.log('IA falhou, usando apenas dados locais:', aiError.message);
                            // Se foi rate limit, informa ao usuário de forma amigável
                            if (aiError.message && aiError.message.includes('Aguarde')) {
                                console.log('⏳ Rate limit detectado, mas dados locais disponíveis');
                            }
                        }
                        
                        // Usa dados locais como backup
                        messagesContainer.removeChild(typingDiv);
                        addMessage(localResponse + '\n\n💡 *Informações da nossa base de dados local de Belém*', false);
                        messageHistory.push({ user: message, bot: localResponse });
                        return;
                    }
                }
                
                // 4. Fallback: tenta IA sozinha
                console.log('🔄 Tentando IA sem dados locais...');
                try {
                    const response = await callGeminiAPI(message);
                    console.log('📝 Resposta da IA:', response);
                    if (response && response.trim()) {
                        messagesContainer.removeChild(typingDiv);
                        addMessage(response, false);
                        messageHistory.push({ user: message, bot: response });
                        console.log('✅ Resposta da IA enviada com sucesso');
                        return;
                    }
                } catch (aiError) {
                    console.error('❌ API falhou com erro completo:', aiError);
                    // Se foi rate limit, não mostra como erro - vai direto pro fallback
                    if (aiError.message && aiError.message.includes('Aguarde')) {
                        console.log('⏳ Rate limit ativo - usando fallback inteligente');
                    }
                }
                
                // 5. Último recurso: resposta padrão
                const fallbackResponse = getFallbackResponse(message);
                messagesContainer.removeChild(typingDiv);
                addMessage(fallbackResponse, false);
                messageHistory.push({ user: message, bot: fallbackResponse });
                
                // Mantém histórico limitado
                if (messageHistory.length > 10) {
                    messageHistory = messageHistory.slice(-10);
                }
                
            } catch (error) {
                console.error('Erro geral no handleUserMessage:', error);
                
                // Remove indicador de digitação com segurança
                try {
                    if (typingDiv && typingDiv.parentNode) {
                        messagesContainer.removeChild(typingDiv);
                    }
                } catch (removeError) {
                    console.warn('Não foi possível remover indicador de digitação:', removeError);
                }
                
                // Resposta de erro mais informativa
                const errorResponse = '🤖 **Sistema Temporariamente Indisponível**\n\n😔 Ocorreu um problema técnico, mas você pode tentar:\n\n• Reformular sua pergunta\n• Perguntar sobre pontos turísticos de Belém\n• Solicitar informações sobre restaurantes\n• Questionar sobre a COP 30\n\n💡 *O sistema será restabelecido automaticamente.*';
                addMessage(errorResponse, false);
                messageHistory.push({ user: message, bot: errorResponse });
            }
        }, 1000 + Math.random() * 1000); // 1-2 segundos de delay realístico
    };

    // OTIMIZAÇÃO 1: Debouncing para evitar chamadas duplicadas
    let typingTimer = null;
    const TYPING_DELAY = 800; // 800ms de delay
    
    const initChatInterface = (targetContainer = null) => {
        // Se targetContainer é fornecido, usar ele; senão usar o modal (compatibilidade)
        const container = targetContainer || UIModule.elements.itemListContainer;
        
        if (targetContainer) {
            // Modo card principal
            container.innerHTML = '';
            
            chatContainer = document.createElement('div');
            chatContainer.className = 'chat-container-principal';
        } else {
            // Modo modal (para outros módulos se necessário)
            container.innerHTML = '';
            
            chatContainer = document.createElement('div');
            chatContainer.className = 'chat-container';
        }
        
        const currentLang = LanguageModule.getCurrentLang();
        const headerText = getTranslatedText('Oraculum AI - Especialista em Belém', currentLang);
        const placeholderText = getTranslatedText('Digite sua pergunta sobre Belém...', currentLang);
        
        chatContainer.innerHTML = `
            <div class="chat-header">
                <i class="fa-solid fa-robot"></i>
                <span class="chat-header-text">${headerText}</span>
            </div>
            <div class="chat-messages">
                <div class="chat-message bot-message welcome-message">
                    <div class="message-content">
                        🤖 <strong>Olá! Sou o Oraculum AI</strong><br><br>
                        Seu assistente especialista em <strong>Belém do Pará</strong> e <strong>COP 30</strong>! 
                        <br><br>
                        ℹ️ <em>Modo demonstração - Respostas baseadas em conhecimento local</em><br><br>
                        📍 <strong>Posso te ajudar com:</strong><br>
                        • Pontos turísticos e atrações<br>
                        • Restaurantes e culinária paraense<br>
                        • Hotéis e hospedagem<br>
                        • Transporte na cidade<br>
                        • Informações sobre COP 30<br>
                        • Dicas de segurança<br>
                        <br>
                        💬 <strong>Digite sua pergunta abaixo!</strong><br>
                        <em>Ex: "Onde posso almoçar?" ou "O que visitar em Belém?"</em>
                    </div>
                </div>
            </div>
            <div class="chat-input-container">
                <input type="text" class="chat-input" placeholder="${placeholderText}" maxlength="200">
                <button class="chat-send-btn"><i class="fa-solid fa-paper-plane"></i></button>
            </div>
        `;
        
        container.appendChild(chatContainer);
        
        // Eventos
        const input = chatContainer.querySelector('.chat-input');
        const sendBtn = chatContainer.querySelector('.chat-send-btn');
        
        const sendMessage = () => {
            // Limpa timer anterior
            clearTimeout(typingTimer);
            
            // Aguarda usuário parar de digitar
            typingTimer = setTimeout(() => {
                const message = input.value.trim();
                if (message) {
                    handleUserMessage(message);
                    input.value = '';
                }
            }, TYPING_DELAY);
        };
        
        sendBtn.addEventListener('click', () => {
            clearTimeout(typingTimer); // Clique envia imediatamente
            const message = input.value.trim();
            if (message) {
                handleUserMessage(message);
                input.value = '';
            }
        });
        
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                clearTimeout(typingTimer); // Enter envia imediatamente
                const message = input.value.trim();
                if (message) {
                    handleUserMessage(message);
                    input.value = '';
                }
            }
        });
        
        // Foco automático no input
        setTimeout(() => input.focus(), 100);
        
        // Prefetch de queries comuns para cache
        setTimeout(() => {
            const commonQueries = [
                'onde comer',
                'o que visitar',
                'pontos turísticos',
                'hotéis em belém',
                'restaurantes típicos'
            ];
            
            console.log('🔄 Iniciando prefetch de queries comuns...');
            commonQueries.forEach(query => {
                searchLocalData(query, CACHED_DATABASE);
            });
            console.log('✅ Prefetch completo - cache aquecido');
        }, 2000); // Aguarda 2s após carregar página
    };

    const clearChatInterface = () => {
        if (chatContainer) {
            chatContainer = null;
        }
        messageHistory = [];
    };

    // Função para tradução de textos do chatbot
    const getTranslatedText = (text, lang) => {
        const translations = {
            'pt': {
                'Oraculum AI - Especialista em Belém': 'Oraculum AI - Especialista em Belém',
                'Digite sua pergunta sobre Belém...': 'Digite sua pergunta sobre Belém...'
            },
            'en': {
                'Oraculum AI - Especialista em Belém': 'Oraculum AI - Belém Expert',
                'Digite sua pergunta sobre Belém...': 'Type your question about Belém...'
            },
            'es': {
                'Oraculum AI - Especialista em Belém': 'Oraculum AI - Experto en Belém',
                'Digite sua pergunta sobre Belém...': 'Escribe tu pregunta sobre Belém...'
            }
        };
        
        return translations[lang] && translations[lang][text] ? translations[lang][text] : text;
    };

    // Função para atualizar idioma do chat
    const updateChatLanguage = (targetLang) => {
        if (chatContainer) {
            const headerElement = chatContainer.querySelector('.chat-header-text');
            const inputElement = chatContainer.querySelector('.chat-input');
            
            if (headerElement) {
                headerElement.textContent = getTranslatedText('Oraculum AI - Especialista em Belém', targetLang);
            }
            
            if (inputElement) {
                inputElement.placeholder = getTranslatedText('Digite sua pergunta sobre Belém...', targetLang);
            }
        }
    };

    // Inicialização do ChatbotModule
    const init = async () => {
        console.log('🤖 Inicializando Oraculum AI...');
        // Pré-carrega a base de dados local
        await loadLocalDatabase();
    };

    return {
        init,
        initChatInterface,
        clearChatInterface,
        updateChatLanguage
    };
})();

// ===========================================
// INICIALIZAÇÃO DA APLICAÇÃO
// ===========================================
const AppModule = (() => {
    const init = async () => {
        try {
            EventModule.init();
            await ChatbotModule.init(); // Inicializa o sistema de dados locais
            await CardModule.render();
        } catch (e) {
            console.error('Erro fatal na inicialização:', e);
            UIModule.showError('Ocorreu um erro inesperado ao iniciar a aplicação.');
        }
    };
    return {
        init
    };
})();

// Inicializar quando DOM estiver carregado
document.addEventListener('DOMContentLoaded', AppModule.init);