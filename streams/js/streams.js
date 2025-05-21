const API_KEY = "AIzaSyCFvzWwOCNwu9INz0vS34mTncjjSWV51fo";
        const CHANNEL_ID = "UCDpSl7XlLC6l0N5Y_-TTRYA";
      
        const SAMPLE_VIDEOS = [
            { id: '1a2b3c', title: 'Найкращі стратегії для T-54 | World of Tanks 2025', date: '2025-03-15', views: '12500' },
            { id: '4d5e6f', title: 'Ліга WoT України - Фінал турніру "Київський щит"', date: '2025-03-10', views: '8700' },
            { id: '7g8h9i', title: 'Спідран по карті "Ліс" - Нова мета 3:40!', date: '2025-03-05', views: '5200' },
            { id: 'j0k1l2', title: 'Огляд нових танків Патчу 12.0 - Що нас чекає?', date: '2025-02-28', views: '15600' },
            { id: 'm3n4o5', title: 'Dota 2 - Катка з глядачами! Стрім на новій карті', date: '2025-02-20', views: '6300' },
            { id: 'p6q7r8', title: 'S.T.A.L.K.E.R. 2 - Перші враження після релізу', date: '2025-02-15', views: '22800' },
            { id: 's9t0u1', title: 'Турнір "КЛІНЧ" - День 1 | Групова стадія', date: '2025-02-10', views: '9400' },
            { id: 'v2w3x4', title: 'Топ-10 саундтреків із World of Tanks 2025', date: '2025-02-05', views: '7100' }
        ];
    
        function formatDate(dateString) {
            try {
                const date = new Date(dateString);
                return date.toLocaleDateString('uk-UA', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                });
            } catch (error) {
                return dateString;
            }
        }
        

        function formatNumber(number) {
            try {
                return parseInt(number).toLocaleString('uk-UA');
            } catch (error) {
                return number; 
            }
        }
        
      
        function createVideoCard(videoId, videoTitle, publishedAt, viewCount) {
            const videoCard = document.createElement('div');
            videoCard.className = 'video-card';
            
            const formattedDate = formatDate(publishedAt);
            const formattedViews = formatNumber(viewCount);
            
            videoCard.innerHTML = `
                <div class="video-thumbnail">
                    <img src="https://img.youtube.com/vi/${videoId}/mqdefault.jpg" alt="${videoTitle}">
                    <div class="play-button">
                        <i class="fas fa-play"></i>
                    </div>
                </div>
                <div class="video-info">
                    <h3>${videoTitle}</h3>
                    <div class="video-meta">
                        <span class="meta-item">
                            <i class="far fa-calendar"></i> ${formattedDate}
                        </span>
                        <span class="meta-item">
                            <i class="far fa-eye"></i> ${formattedViews}
                        </span>
                    </div>
                </div>
            `;
            
            videoCard.addEventListener('click', function() {
                window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
            });
            
            return videoCard;
        }
        
      
        function fetchVideos() {
            const maxResults = 10;
            const videoList = document.getElementById('video-list');
            
            if (!videoList) return;
            
   
            videoList.innerHTML = '<div class="loader"><i class="fas fa-spinner"></i> Завантаження відео...</div>';
            
            fetch(`https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=${maxResults}&type=video`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Помилка мережі при запиті відео');
                    }
                    return response.json();
                })
                .then(data => {
             
                    const videoIds = data.items
                        .filter(item => item.id.kind === "youtube#video")
                        .map(item => item.id.videoId);
                    
                    if (videoIds.length === 0) {
                        throw new Error('Відео не знайдено');
                    }
                    
                 
                    return fetch(`https://www.googleapis.com/youtube/v3/videos?key=${API_KEY}&id=${videoIds.join(',')}&part=statistics,snippet`);
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Помилка мережі при запиті статистики відео');
                    }
                    return response.json();
                })
                .then(data => {
                
                    videoList.innerHTML = '';
                    
          
                    data.items.forEach(item => {
                        const videoCard = createVideoCard(
                            item.id, 
                            item.snippet.title, 
                            item.snippet.publishedAt, 
                            item.statistics.viewCount
                        );
                        videoList.appendChild(videoCard);
                    });
                })
                .catch(error => {
                    console.error('Помилка при отриманні відео:', error);
                    
                
                    videoList.innerHTML = `
                        <div class="error-message">
                            <p><i class="fas fa-exclamation-triangle"></i> Не вдалося завантажити останні відео. Використовуємо демонстраційні дані.</p>
                        </div>
                    `;
                    
                  
                    SAMPLE_VIDEOS.forEach(video => {
                        const videoCard = createVideoCard(
                            video.id, 
                            video.title, 
                            video.date, 
                            video.views
                        );
                        videoList.appendChild(videoCard);
                    });
                });
        }
        

        function createPlaylistCard(playlist, playlistId) {
            const playlistCard = document.createElement('div');
            playlistCard.className = 'playlist-card';

            let iconClass = "fas fa-list";
            const title = playlist.title.toLowerCase();
            
            if (title.includes("турнір") || title.includes("ліга") || title.includes("чемпіонат")) {
                iconClass = "fas fa-trophy";
            } else if (title.includes("спідран")) {
                iconClass = "fas fa-stopwatch";
            } else if (title.includes("dota")) {
                iconClass = "fas fa-gamepad";
            } else if (title.includes("stalker") || title.includes("сталкер")) {
                iconClass = "fas fa-radiation";
            } else if (title.includes("броню") || title.includes("боїв")) {
                iconClass = "fas fa-shield-alt";
            }
            
            playlistCard.innerHTML = `
                <div class="playlist-icon">
                    <i class="${iconClass}"></i>
                </div>
                <div class="playlist-info">
                    <h3>${playlist.title}</h3>
                    <div class="playlist-meta">
                        <span>${playlist.videoCount} відео</span> • <span>Оновлено ${playlist.publishedAt}</span>
                    </div>
                </div>
                <a href="https://www.youtube.com/playlist?list=${playlistId}" target="_blank" class="playlist-button">
                    Дивитись
                </a>
            `;
            
            return playlistCard;
        }
        
     
        function fetchPlaylists() {
            const maxResults = 50; 
            const playlistsContainer = document.getElementById('playlists');
            
            if (!playlistsContainer) return;
            
     
            playlistsContainer.innerHTML = '<div class="loader"><i class="fas fa-spinner"></i> Завантаження плейлістів...</div>';
            
            fetch(`https://www.googleapis.com/youtube/v3/playlists?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet,contentDetails&maxResults=${maxResults}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Помилка мережі при запиті плейлістів');
                    }
                    return response.json();
                })
                .then(data => {
                  
                    playlistsContainer.innerHTML = '';
                    
                    if (!data.items || data.items.length === 0) {
                        throw new Error('Плейлісти не знайдено');
                    }
                    
            
                   const filterRow = document.createElement('div');
						 filterRow.className = 'playlist-filter';
						filterRow.innerHTML = `
						<div class="playlist-search">
						<input type="text" id="playlist-search" placeholder="Пошук плейлістів...">
						</div>
						<div class="playlist-sort">
						<select id="playlist-sort">
						<option value="newest">Від найновіших</option>
						<option value="oldest">Від найстаріших</option>
						<option value="a-z">А-Я</option>
						<option value="z-a">Я-А</option>
						<option value="most-videos">Найбільше відео</option>
						</select>
						</div>
						`;
                    playlistsContainer.appendChild(filterRow);
                    
                    
                    const allPlaylistsContainer = document.createElement('div');
                    allPlaylistsContainer.id = 'all-playlists';
                    allPlaylistsContainer.className = 'playlist-section';
                    playlistsContainer.appendChild(allPlaylistsContainer);
                    
               
                    function sortPlaylists(method) {
                        const playlistCards = Array.from(allPlaylistsContainer.querySelectorAll('.playlist-card'));
                        
                        playlistCards.sort((a, b) => {
                            const titleA = a.querySelector('h3').textContent;
                            const titleB = b.querySelector('h3').textContent;
                            const countA = parseInt(a.querySelector('.playlist-meta span').textContent);
                            const countB = parseInt(b.querySelector('.playlist-meta span').textContent);
                            const dateA = new Date(a.dataset.date);
                            const dateB = new Date(b.dataset.date);
                            
                            switch(method) {
                                case 'newest':
                                    return dateB - dateA;
                                case 'oldest':
                                    return dateA - dateB;
                                case 'a-z':
                                    return titleA.localeCompare(titleB, 'uk');
                                case 'z-a':
                                    return titleB.localeCompare(titleA, 'uk');
                                case 'most-videos':
                                    return countB - countA;
                                default:
                                    return dateB - dateA;
                            }
                        });
                        
                       
                        allPlaylistsContainer.innerHTML = '';
                        playlistCards.forEach(card => {
                            allPlaylistsContainer.appendChild(card);
                        });
                    }
                    
               
                    document.getElementById('playlist-sort').addEventListener('change', function() {
                        sortPlaylists(this.value);
                    });
                    
                  
                    document.getElementById('playlist-search').addEventListener('input', function() {
                        const searchTerm = this.value.toLowerCase();
                        const playlistCards = allPlaylistsContainer.querySelectorAll('.playlist-card');
                        
                        playlistCards.forEach(card => {
                            const title = card.querySelector('h3').textContent.toLowerCase();
                            if (title.includes(searchTerm)) {
                                card.style.display = 'flex';
                            } else {
                                card.style.display = 'none';
                            }
                        });
                    });
                    
                   
                    data.items.forEach(item => {
                        const playlistTitle = item.snippet.title;
                        const playlistId = item.id;
                        const videoCount = item.contentDetails.itemCount;
                        const publishedAt = item.snippet.publishedAt;
                        const formattedDate = formatDate(publishedAt);
                        
             
                        const playlistData = {
                            title: playlistTitle,
                            videoCount: videoCount,
                            publishedAt: formattedDate
                        };
                        
                   
                        const playlistCard = createPlaylistCard(playlistData, playlistId);
                        playlistCard.dataset.date = publishedAt; // Зберігаємо дату для сортування
                        allPlaylistsContainer.appendChild(playlistCard);
                    });
                    
         
                    sortPlaylists('newest');
                })
                .catch(error => {
                    console.error('Помилка при отриманні плейлістів:', error);
                    
              
                    playlistsContainer.innerHTML = `
                        <div class="error-message">
                            <p><i class="fas fa-exclamation-triangle"></i> Не вдалося завантажити плейлісти. Спробуйте пізніше або перейдіть на канал YouTube.</p>
                        </div>
                        <div class="playlist-section" style="text-align: center;">
                            <a href="https://www.youtube.com/@PaLLaDin501_UA/playlists" target="_blank" class="playlist-button" style="display: inline-block; margin-top: 1rem;">
                                Переглянути всі плейлісти на YouTube
                            </a>
                        </div>
                    `;
                });
        }
        
       
        function setupTabs() {
            const tabBtns = document.querySelectorAll('.tab-btn');
            const tabContents = document.querySelectorAll('.tab-content');
            
            tabBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                  
                    tabBtns.forEach(b => b.classList.remove('active'));
                  
                    btn.classList.add('active');
                   
                    const tabId = btn.dataset.tab;
                    
               
                    tabContents.forEach(content => content.classList.remove('active'));
                    
             
                    const tabContent = document.getElementById(tabId);
                    if (tabContent) {
                        tabContent.classList.add('active');
                      
                        if (tabId === 'playlists' && tabContent.querySelector('.loader')) {
                            fetchPlaylists();
                        }
                    }
                });
            });
        }
        
      
        document.addEventListener('DOMContentLoaded', () => {
         
            setupTabs();
      
            fetchVideos();
            
          
        });