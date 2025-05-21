/**
 * Функція для отримання і відображення турнірів з Challonge API
 * @param {string} API_KEY - API ключ Challonge
 */
async function loadTournaments(API_KEY) {
    const API_KEY_VALUE = API_KEY || 'LDcXInEMrYOhjAAFpCz5O2gMYXntnhDJHOqOq1Xu'; // Використайте ваш API ключ
    
    // Список турнірів з вашого профілю
    const tournamentIDs = [
        '4drkrgm2',
		'r1k0myu8',
        '6wsl43sh',
        '1pcvgbqh',
        '4kpl40hv',
        '2f1yns1h',
        '1oibzd89',
        'v63fii44'
    ];
    
    const container = document.getElementById("tournaments");
    if (!container) {
        console.error("Контейнер для турнірів не знайдено");
        return;
    }
    
    // Показуємо індикатор завантаження
    container.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Завантаження турнірів...</div>';
    
    try {
        // Отримуємо дані про кожен турнір паралельно
        const tournamentsPromises = tournamentIDs.map(id => 
            fetchTournamentData(id, API_KEY_VALUE)
        );
        
        // Чекаємо завершення всіх запитів
        const tournamentsData = await Promise.all(tournamentsPromises);
        
        // Фільтруємо успішні результати
        const validTournaments = tournamentsData.filter(data => data !== null);
        
        // Сортуємо за датою - найновіші спочатку
        validTournaments.sort((a, b) => {
            const dateA = new Date(a.tournament.started_at || a.tournament.created_at);
            const dateB = new Date(b.tournament.started_at || b.tournament.created_at);
            return dateB - dateA;
        });
        
        if (validTournaments.length > 0) {
            // Відображаємо турніри
            displayTournaments(validTournaments, container);
        } else {
            // Якщо турніри не знайдено, виводимо повідомлення
            container.innerHTML = `
                <div class="no-tournaments-message">
                    <p>Не вдалося отримати дані турнірів. Перевірте API ключ або доступ до турнірів.</p>
                </div>
            `;
        }
    } catch (error) {
        console.error("Помилка завантаження турнірів:", error);
        container.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i> 
                Не вдалося завантажити турніри. Помилка: ${error.message}
            </div>
        `;
    }
}

/**
 * Отримати дані про турнір за його ID
 * @param {string} tournamentId - ID турніру
 * @param {string} apiKey - API ключ
 * @returns {Promise<Object|null>} - Дані турніру або null у випадку помилки
 */
async function fetchTournamentData(tournamentId, apiKey) {
    try {
        // Формуємо URL для запиту
        const url = `https://api.challonge.com/v1/tournaments/${tournamentId}.json?api_key=${apiKey}&include_participants=1&include_matches=1`;
        
        // Використовуємо CORS-проксі для обходу обмежень
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
        
        console.log(`Запит даних для турніру ${tournamentId}...`);
        const response = await fetch(proxyUrl);
        
        if (!response.ok) {
            throw new Error(`Помилка запиту: ${response.status}`);
        }
        
        const data = await response.json();
        console.log(`Отримано дані турніру ${tournamentId}:`, data);
        
        return data;
    } catch (error) {
        console.error(`Помилка отримання даних турніру ${tournamentId}:`, error);
        return null;
    }
}

/**
 * Відображає турніри в контейнері
 * @param {Array} tournaments - Масив даних турнірів
 * @param {HTMLElement} container - HTML-контейнер для відображення
 */
function displayTournaments(tournaments, container) {
    // Очищаємо контейнер
    container.innerHTML = '';
    
    // Додаємо заголовок
    const header = document.createElement("div");
    header.className = "tournament-header";
    header.innerHTML = `
        <h3>Мої турніри</h3>
        <p>Беріть участь у турнірах, вигравайте призи та покажіть свою майстерність!</p>
    `;
    container.appendChild(header);
    
    // Створюємо контейнер для карток турнірів
    const cardsContainer = document.createElement("div");
    cardsContainer.className = "tournament-cards";
    container.appendChild(cardsContainer);
    
    // Створюємо картки для кожного турніру
    tournaments.forEach(tournamentData => {
        createTournamentCard(tournamentData, cardsContainer);
    });
}

/**
 * Створює картку турніру з реальними даними
 * @param {Object} tournamentData - Дані турніру
 * @param {HTMLElement} container - Контейнер для карток
 */
function createTournamentCard(tournamentData, container) {
    const tournament = tournamentData.tournament;
    
    // Створюємо елемент картки
    const card = document.createElement("div");
    card.className = "tournament-card";
    
    // Визначаємо статус для стилізації
    let statusClass, statusText;
    switch(tournament.state) {
        case 'complete':
            statusClass = 'finished';
            statusText = 'ЗАВЕРШЕНО';
            break;
        case 'underway':
            statusClass = 'ongoing';
            statusText = 'ТРИВАЄ';
            break;
        default:
            statusClass = 'upcoming';
            statusText = 'МАЙБУТНІЙ';
    }
    
    // Форматуємо дату за українською локалізацією
    let formattedDate = 'Дата невідома';
    try {
        const tournamentDate = tournament.started_at || tournament.created_at;
        if (tournamentDate) {
            formattedDate = new Date(tournamentDate).toLocaleDateString('uk-UA');
        }
    } catch (error) {
        console.error('Помилка форматування дати:', error);
    }
    
    // Знаходимо переможця
    let winnerName = "Не визначено";
    if (tournament.state === 'complete') {
        if (tournament.participants) {
            // Шукаємо учасника з final_rank = 1
            const winner = tournament.participants.find(p => 
                p.participant && p.participant.final_rank === 1
            );
            
            if (winner) {
                winnerName = winner.participant.name;
            }
        }
    }
    
    // Наповнюємо картку HTML-контентом
    card.innerHTML = `
        <div class="tournament-status ${statusClass}">${statusText}</div>
        <h4>${tournament.name}</h4>
        <div class="tournament-meta">
            <span><i class="fas fa-calendar"></i> ${formattedDate}</span>
            <span><i class="fas fa-users"></i> ${tournament.participants_count || 0} ${getParticipantsText(tournament.participants_count || 0)}</span>
        </div>
        <div class="winner-info">
            ${tournament.state === 'complete' ? `<span><i class="fas fa-trophy"></i> Переможець: ${winnerName}</span>` : ''}
        </div>
        <div class="tournament-actions">
            <a href="${tournament.full_challonge_url}" target="_blank" class="tournament-link">
                ${tournament.state === 'complete' ? 'Результати' : 'Дивитись сітку'}
            </a>
            <button class="cta-button secondary view-matches-btn" data-tournament-id="${tournament.id || tournament.url}" data-url="${tournament.url}">
                <i class="fas fa-list"></i> Матчі
            </button>
        </div>
    `;
    
    // Додаємо картку в контейнер
    container.appendChild(card);
    
    // Додаємо обробник для кнопки "Матчі"
    const matchesBtn = card.querySelector('.view-matches-btn');
    if (matchesBtn) {
        matchesBtn.addEventListener('click', function() {
            const tournamentId = this.getAttribute('data-tournament-id');
            const tournamentUrl = this.getAttribute('data-url');
            
            // Відображаємо реальні матчі турніру
            displayTournamentMatches(tournamentData);
        });
    }
}

/**
 * Отримати правильний текст для кількості учасників
 * @param {number} count - Кількість учасників
 * @returns {string} - Текст з правильним відмінком
 */
function getParticipantsText(count) {
    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;
    
    if (lastDigit === 1 && lastTwoDigits !== 11) {
        return 'учасник';
    } else if ([2, 3, 4].includes(lastDigit) && ![12, 13, 14].includes(lastTwoDigits)) {
        return 'учасники';
    } else {
        return 'учасників';
    }
}

/**
 * Відобразити матчі турніру з реальними даними
 * @param {Object} tournamentData - Дані турніру
 */
function displayTournamentMatches(tournamentData) {
    const tournament = tournamentData.tournament;
    
    // Знаходимо або створюємо секцію для матчів
    let matchesSection = document.querySelector('.matches-section');
    if (!matchesSection) {
        matchesSection = document.createElement('section');
        matchesSection.className = 'content-section matches-section';
        
        // Створюємо структуру секції
        matchesSection.innerHTML = `
            <h2 class="section-title">Матчі турніру</h2>
            <div class="matches-container">
                <div class="matches-filter">
                    <select id="matches-filter-status" class="filter-select">
                        <option value="all">Всі матчі</option>
                        <option value="pending">Очікуються</option>
                        <option value="open">Відкриті</option>
                        <option value="complete" selected>Завершені</option>
                    </select>
                    <button id="refresh-matches" class="cta-button secondary">
                        <i class="fas fa-sync-alt"></i> Оновити
                    </button>
                </div>
                <div id="tournament-matches">
                    <div class="loading">
                        <i class="fas fa-spinner fa-spin"></i> Завантаження матчів...
                    </div>
                </div>
            </div>
        `;
        
        // Додаємо секцію до сторінки
        const mainContent = document.querySelector('.content-section');
        if (mainContent) {
            mainContent.parentNode.insertBefore(matchesSection, mainContent.nextSibling);
        } else {
            document.querySelector('.main-content').appendChild(matchesSection);
        }
        
        // Додаємо обробники подій
        const filterSelect = matchesSection.querySelector('#matches-filter-status');
        if (filterSelect) {
            filterSelect.addEventListener('change', function() {
                const status = this.value;
                displayFilteredMatches(tournamentData, status);
            });
        }
        
        const refreshButton = matchesSection.querySelector('#refresh-matches');
        if (refreshButton) {
            refreshButton.addEventListener('click', function() {
                const filterSelect = document.getElementById('matches-filter-status');
                const status = filterSelect ? filterSelect.value : 'all';
                displayFilteredMatches(tournamentData, status);
            });
        }
    }
    
    // Відображаємо матчі з фільтром
    const filterSelect = document.getElementById('matches-filter-status');
    const status = filterSelect ? filterSelect.value : 'all';
    displayFilteredMatches(tournamentData, status);
    
    // Прокручуємо до секції матчів
    matchesSection.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Відображає матчі з фільтрацією за статусом
 * @param {Object} tournamentData - Дані турніру
 * @param {string} status - Статус для фільтрації
 */
function displayFilteredMatches(tournamentData, status) {
    const tournament = tournamentData.tournament;
    const matches = tournament.matches || [];
    const participants = tournament.participants || [];
    
    const matchesContainer = document.getElementById('tournament-matches');
    if (!matchesContainer) return;
    
    // Показуємо індикатор завантаження
    matchesContainer.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Завантаження матчів...</div>';
    
    // Створюємо мапу учасників для швидкого доступу
    const participantsMap = {};
    participants.forEach(p => {
        if (p.participant) {
            participantsMap[p.participant.id] = p.participant.name;
        }
    });
    
    // Фільтруємо матчі за статусом
    let filteredMatches = matches;
    if (status !== 'all') {
        filteredMatches = matches.filter(m => m.match && m.match.state === status);
    }
    
    // Знаходимо переможця турніру
    let winnerName = "Не визначено";
    if (tournament.state === 'complete') {
        if (tournament.participants) {
            const winner = tournament.participants.find(p => 
                p.participant && p.participant.final_rank === 1
            );
            
            if (winner) {
                winnerName = winner.participant.name;
            }
        }
    }
    
    // Формуємо HTML для матчів
    setTimeout(() => {
        let matchesHTML = `
            <div class="tournament-matches-header">
                <h3>${tournament.name}</h3>
                <div class="tournament-meta-info">
                    <span><i class="fas fa-list"></i> Матчів: ${matches.length}</span>
                    <a href="${tournament.full_challonge_url}" target="_blank" class="bracket-link">
                        <i class="fas fa-sitemap"></i> Сітка турніру
                    </a>
                </div>
            </div>
        `;
        
        // Додаємо переможця для завершених турнірів
        if (tournament.state === 'complete') {
            matchesHTML += `
                <div class="tournament-winner-banner">
                    <i class="fas fa-trophy"></i> Переможець турніру: <strong>${winnerName}</strong>
                </div>
            `;
        }
        
        // Якщо немає матчів з вибраним фільтром
        if (filteredMatches.length === 0) {
            matchesHTML += `
                <div class="no-matches-message">
                    <p>Для турніру "${tournament.name}" немає матчів${status !== 'all' ? ` зі статусом "${getStatusText(status)}"` : ''}.</p>
                    <a href="${tournament.full_challonge_url}" target="_blank" class="cta-button primary">
                        <i class="fas fa-sitemap"></i> Переглянути сітку на Challonge
                    </a>
                </div>
            `;
        } else {
            // Групуємо матчі за раундами
            const roundedMatches = {};
            filteredMatches.forEach(item => {
                if (!item.match) return;
                
                const round = item.match.round;
                if (!roundedMatches[round]) {
                    roundedMatches[round] = [];
                }
                roundedMatches[round].push(item.match);
            });
            
            // Визначаємо всі раунди і максимальні номери раундів
            const allRounds = Object.keys(roundedMatches);
            const positiveRounds = allRounds.filter(r => parseInt(r) > 0);
            const negativeRounds = allRounds.filter(r => parseInt(r) < 0);
            const maxPositiveRound = Math.max(...positiveRounds.map(r => parseInt(r)));
            const minNegativeRound = negativeRounds.length > 0 ? Math.min(...negativeRounds.map(r => parseInt(r))) : 0;
            
            // Групуємо раунди за фазами турніру
            const phases = groupRoundsByPhases(allRounds, roundedMatches, maxPositiveRound, minNegativeRound);
            
            // Формуємо HTML з групуванням за фазами турніру
            phases.forEach(phase => {
                // Додаємо заголовок фази
                matchesHTML += `
                    <div class="tournament-phase-section">
                        <div class="phase-title">
                            <i class="fas ${phase.icon}"></i> ${phase.title}
                        </div>
                `;
                
                // Додаємо раунди цієї фази
                phase.rounds.forEach(round => {
                    // Визначаємо назву раунду
                    const roundTitle = getRoundTitle(round, maxPositiveRound);
                    
                    // Додаємо заголовок раунду
                    matchesHTML += `
                        <div class="round-header">
                            <h4>${roundTitle}</h4>
                        </div>
                        <div class="round-matches">
                    `;
                    
                    // Додаємо матчі цього раунду
                    roundedMatches[round].forEach(match => {
                        // Отримуємо імена гравців
                        const player1Name = match.player1_id ? (participantsMap[match.player1_id] || `Гравець ${match.player1_id}`) : 'TBD';
                        const player2Name = match.player2_id ? (participantsMap[match.player2_id] || `Гравець ${match.player2_id}`) : 'TBD';
                        
                        // Визначаємо статус матчу
                        let statusClass, statusText;
                        switch(match.state) {
                            case 'complete':
                                statusClass = 'finished';
                                statusText = 'Завершено';
                                break;
                            case 'open':
                                statusClass = 'open';
                                statusText = 'Відкрито';
                                break;
                            default:
                                statusClass = 'pending';
                                statusText = 'Очікується';
                        }
                        
                        // Визначаємо переможця
                        const winnerName = match.winner_id ? (participantsMap[match.winner_id] || `Гравець ${match.winner_id}`) : '';
                        
                        // Додаємо HTML для матчу
                        matchesHTML += `
                            <div class="match-row">
                                <div class="match-header">
                                    <span class="match-identifier">Матч #${match.identifier || match.id}</span>
                                    <span class="match-status ${statusClass}">${statusText}</span>
                                </div>
                                <div class="match-players">
                                    <div class="player ${match.winner_id === match.player1_id ? 'winner' : ''}">
                                        ${player1Name}
                                        ${match.winner_id === match.player1_id ? '<i class="fas fa-trophy winner-icon"></i>' : ''}
                                    </div>
                                    <div class="vs">VS</div>
                                    <div class="player ${match.winner_id === match.player2_id ? 'winner' : ''}">
                                        ${player2Name}
                                        ${match.winner_id === match.player2_id ? '<i class="fas fa-trophy winner-icon"></i>' : ''}
                                    </div>
                                </div>
                                <div class="match-details">
                                    ${match.scores_csv ? `<div class="match-score">Рахунок: ${match.scores_csv}</div>` : ''}
                                    ${winnerName ? `<div class="match-winner">Переможець: ${winnerName}</div>` : ''}
                                </div>
                                <a href="${tournament.full_challonge_url}" target="_blank" class="match-link">
                                    Переглянути на Challonge
                                </a>
                            </div>
                        `;
                    });
                    
                    matchesHTML += `</div>`;
                });
                
                // Закриваємо секцію фази
                matchesHTML += `</div>`;
            });
        }
        
        // Оновлюємо контейнер матчів
        matchesContainer.innerHTML = matchesHTML;
        
        // Додаємо CSS для оптимізації відображення матчів
        addMatchesStyles();
        
    }, 300); // Невелика затримка для показу анімації завантаження
}

/**
 * Групуємо раунди за фазами турніру
 * @param {Array} rounds - Масив раундів
 * @param {Object} roundedMatches - Матчі, згруповані за раундами
 * @param {number} maxPositiveRound - Максимальний номер раунду у верхній сітці
 * @param {number} minNegativeRound - Мінімальний номер раунду у нижній сітці
 * @returns {Array} - Масив фаз турніру з раундами
 */
function groupRoundsByPhases(rounds, roundedMatches, maxPositiveRound, minNegativeRound) {
    // Визначаємо фази турніру
    const phases = {
        'upper_bracket': {
            title: 'Верхня сітка',
            rounds: [],
            icon: 'fa-arrow-up'
        },
        'lower_bracket': {
            title: 'Нижня сітка',
            rounds: [],
            icon: 'fa-arrow-down'
        },
        'finals': {
            title: 'Фінальна стадія',
            rounds: [],
            icon: 'fa-trophy'
        }
    };
    
    // Розподіляємо раунди за фазами
    rounds.forEach(round => {
        const roundNumber = parseInt(round);
        
        if (roundNumber < 0) {
            // Нижня сітка
            phases.lower_bracket.rounds.push(round);
        } else if (roundNumber >= maxPositiveRound - 1) {
            // Фінальні раунди (останні 2 раунди верхньої сітки)
            phases.finals.rounds.push(round);
        } else {
            // Верхня сітка
            phases.upper_bracket.rounds.push(round);
        }
    });
    
    // Сортуємо раунди в кожній фазі
    Object.values(phases).forEach(phase => {
        phase.rounds.sort((a, b) => {
            const aValue = parseInt(a);
            const bValue = parseInt(b);
            
            // Особлива логіка для нижньої сітки
            if (aValue < 0 && bValue < 0) {
                return Math.abs(aValue) - Math.abs(bValue);
            }
            
            return aValue - bValue;
        });
    });
    
    // Повертаємо тільки ті фази, де є раунди
    return Object.values(phases).filter(phase => phase.rounds.length > 0);
}

/**
 * Отримати назву раунду
 * @param {string} round - Номер раунду
 * @param {number} maxRound - Максимальний номер раунду
 * @returns {string} - Назва раунду
 */
function getRoundTitle(round, maxRound) {
    const roundNumber = parseInt(round);
    
    if (roundNumber < 0) {
        // Нижня сітка
        return `Матч програвших ${Math.abs(roundNumber)}`;
    }
    
    // Верхня сітка і фінали
    if (roundNumber === maxRound) {
        return 'Гранд-фінал';
    } else if (roundNumber === maxRound - 1) {
        return 'Фінал';
    } else if (roundNumber === maxRound - 2) {
        return 'Напівфінал';
    } else if (roundNumber === 1) {
        return 'Раунд 1';
    } else if (roundNumber === 2) {
        return 'Раунд 2';
    } else {
        return `Раунд ${roundNumber}`;
    }
}

/**
 * Отримати текстовий опис статусу
 * @param {string} status - Код статусу
 * @returns {string} - Текстовий опис
 */
function getStatusText(status) {
    switch(status) {
        case 'pending': return 'Очікуються';
        case 'open': return 'Відкриті';
        case 'complete': return 'Завершені';
        default: return 'Всі';
    }
}

/**
 * Додає стилі для покращення відображення матчів
 */
function addMatchesStyles() {
    // Перевіряємо, чи стилі вже додані
    if (document.getElementById('matches-custom-styles')) {
        return;
    }
    
    // Додаємо стилі
    const style = document.createElement('style');
    style.id = 'matches-custom-styles';
    style.textContent = `
        /* Стилі для контейнера матчів */
        .matches-container {
            max-width: 1000px;
            margin: 0 auto;
            padding: 0 15px;
        }

        /* Стилі для заголовку турніру у розділі матчів */
        .tournament-matches-header {
            background-color: #252525;
            border-radius: 8px 8px 0 0;
            padding: 15px 20px;
            margin-bottom: 0;
            border-bottom: 1px solid #333;
        }

        /* Стилі для сітки матчів у два стовпчики */
        .round-matches {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin-bottom: 25px;
        }

        /* Стилі для рядків матчів */
        .match-row {
            background-color: #222;
            border-radius: 8px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
            overflow: hidden;
        }

        /* Стилі для заголовку матчу */
        .match-header {
            background-color: #2a2a2a;
            padding: 10px 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #333;
        }

        /* Стилі для гравців матчу */
        .match-players {
            padding: 12px;
            display: grid;
            grid-template-columns: 1fr auto 1fr;
            align-items: center;
            gap: 8px;
        }

        /* Стилі для VS між гравцями */
        .vs {
            font-weight: bold;
            color: #777;
            text-align: center;
            margin: 0 5px;
        }

        /* Стилі для переможця */
        .winner {
            color: #FFD700;
            font-weight: bold;
        }

        .winner-icon {
            color: #FFD700;
            margin-left: 5px;
        }

        /* Стилі для статусу матчу */
        .match-status {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: bold;
        }

        /* Стилі для деталей матчу */
        .match-details {
            padding: 0 12px 12px;
            color: #aaa;
            font-size: 12px;
        }

        /* Стилі для заголовків раундів */
        .round-header {
            margin: 25px 0 15px;
            padding-bottom: 8px;
            border-bottom: 1px solid #333;
            grid-column: 1 / -1; /* Щоб заголовок займав обидва стовпчики */
        }

        .round-header h4 {
            color: #FFD700;
            font-size: 18px;
            margin: 0;
        }

        /* Стилі для кнопки "переглянути" */
        .match-link {
            display: block;
            text-align: center;
            padding: 8px 0;
            background-color: #2a2a2a;
            color: #FFD700;
            text-decoration: none;
            border-top: 1px solid #333;
            transition: background-color 0.2s;
            font-size: 12px;
        }

         .match-link:hover {
            background-color: #333;
        }

        /* Секції для групування кваліфікацій */
        .qualification-section {
            margin-bottom: 20px;
            border-left: 3px solid #FFD700;
            padding-left: 15px;
        }

        .qualification-title {
            color: #FFD700;
            font-size: 20px;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
        }

        .qualification-title i {
            margin-right: 10px;
        }

        /* Адаптивність для мобільних пристроїв */
        @media (max-width: 768px) {
            .round-matches {
                grid-template-columns: 1fr;
            }
            
            .match-players {
                grid-template-columns: 1fr auto 1fr;
            }
        }

        /* Менше сітка для невеликих екранів */
        @media (max-width: 500px) {
            .match-players {
                grid-template-columns: 1fr;
                text-align: center;
            }
            
            .vs {
                margin: 8px 0;
            }
        }
    `;
    
    document.head.appendChild(style);
}

/**
 * Отримати текстовий опис статусу
 * @param {string} status - Код статусу
 * @returns {string} - Текстовий опис
 */
function getStatusText(status) {
    switch(status) {
        case 'pending': return 'Очікуються';
        case 'open': return 'Відкриті';
        case 'complete': return 'Завершені';
        default: return 'Всі';
    }
}

// Точка входу - запуск з вашим API ключем
document.addEventListener('DOMContentLoaded', function() {
    // Додайте сюди ваш API ключ Challonge
    const API_KEY = 'LDcXInEMrYOhjAAFpCz5O2gMYXntnhDJHOqOq1Xu';
    
    // Завантажуємо турніри
    loadTournaments(API_KEY);
});