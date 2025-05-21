function checkStreamStatus() {
    const clientId = 'gp762nuuoqcoxypju8c569th9wz7q5';
    const accessToken = 'sgjrsfuu2ixeejs5qeocow87fnexwu';
    const twitchChannel = 'palladin501_ua';
    
    fetch(`https://api.twitch.tv/helix/streams?user_login=${twitchChannel}`, {
        headers: {
            'Client-ID': clientId,
            'Authorization': `Bearer ${accessToken}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        const twitchCard = document.getElementById('twitch-card');
        const liveIndicator = document.getElementById('twitch-status');
        const streamInfo = document.getElementById('twitch-description');
        const twitchButton = document.getElementById('twitch-button');
        
        if (data.data && data.data.length > 0) {
           
            twitchCard.classList.add('streaming');
            
          
            const viewerCount = data.data[0].viewer_count;
            const streamTitle = data.data[0].title;
            
           
            streamInfo.innerHTML = `
                <strong>${streamTitle}</strong>
                <div class="viewer-count">
                    <i class="fas fa-user"></i> Глядачів: ${viewerCount}
                </div>
            `;
            
          
            twitchButton.textContent = "Дивитись";
        } else {
           
            twitchCard.classList.remove('streaming');
            streamInfo.innerHTML = `
                <strong>Щоденні стріми з глядачами та спілкування в реальному часі</strong>
            `;
            
         
            twitchButton.textContent = "Слідкувати";
        }
    })
    .catch(error => {
        console.error('Помилка отримання даних Twitch API:', error);
    });
}


document.addEventListener('DOMContentLoaded', checkStreamStatus);


setInterval(checkStreamStatus, 60000);