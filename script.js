// Виправлений код для script.js
document.addEventListener('DOMContentLoaded', function() {
    const players = document.querySelectorAll('.player');
    players.forEach(player => {
        player.addEventListener('mouseover', () => {
            const playerId = player.getAttribute('data-player-id');
            // Підсвічуємо всіх гравців з однаковим ID (того самого гравця в різних раундах)
            document.querySelectorAll(`.player[data-player-id="${playerId}"]`).forEach(p => {
                if (!p.classList.contains('tbd')) {
                    p.classList.add('highlighted');
                }
            });
            
            // Знаходимо батьківський матч
            const parentMatch = player.closest('.match');
            if (parentMatch) {
                const groupId = parentMatch.getAttribute('data-group-id');
                const status = player.getAttribute('data-status');
                const nextRound = player.getAttribute('data-next-round');
                
                // Додаткова логіка підсвічування по групах
                if (groupId && status) {
                    // Шукаємо всіх гравців у цій групі
                    const groupPlayers = document.querySelectorAll(`.match[data-group-id="${groupId}"] .player`);
                    
                    // Для переможців і тих, хто йде в нижню сітку
                    if (status === 'winner' && nextRound === 'upper') {
                        // Підсвічуємо місце, куди перейшов переможець
                        document.querySelectorAll(`.player[data-player-id="${playerId}"]`).forEach(p => {
                            if (!p.classList.contains('tbd')) {
                                p.classList.add('highlighted');
                            }
                        });
                    } else if (status === 'loser' && nextRound === 'lower') {
                        // Підсвічуємо місце, куди перейшов гравець, що програв
                        document.querySelectorAll(`.player[data-player-id="${playerId}"]`).forEach(p => {
                            if (!p.classList.contains('tbd')) {
                                p.classList.add('highlighted');
                            }
                        });
                    }
                }
            }
        });

        player.addEventListener('mouseout', () => {
            // Видаляємо підсвічування з усіх елементів
            document.querySelectorAll('.player.highlighted').forEach(p => {
                p.classList.remove('highlighted');
            });
        });
    });

    // Функція для оновлення статусу гравця та його переміщення в наступний раунд
    function updatePlayerStatus(playerId, status, score, nextRound, place) {
        // Знаходимо всіх гравців з цим ID (може бути декілька, якщо гравець уже переміщений)
        const players = document.querySelectorAll(`.player[data-player-id="${playerId}"]`);
        if (players.length === 0) return;
        
        // Знаходимо основного гравця (першого раунду)
        const player = players[0];
        const matchElement = player.closest('.match');
        if (!matchElement) return;
        
        // Встановлюємо атрибути гравця
        player.setAttribute('data-status', status);
        player.setAttribute('data-score', score);
        player.setAttribute('data-next-round', nextRound);
        if (place) player.setAttribute('data-place', place);
        
        // Додаємо відповідний клас
        if (status === 'winner') {
            player.classList.add('winner');
        } else if (status === 'loser') {
            player.classList.add('loser');
        }
        
        // Отримуємо ID групи та номер групи
        const groupId = matchElement.getAttribute('data-group-id');
        if (!groupId) return;
        
        const groupNumber = parseInt(groupId.replace('group', ''));
        
        // Обробка переможців - переміщення у верхню сітку
        if (status === 'winner' && nextRound === 'upper') {
            let upperMatchId, position;
            
            // Визначаємо, в який матч верхньої сітки переходить гравець
            if (groupNumber <= 3) {
                upperMatchId = 'upper1';
                position = groupNumber;
            } else if (groupNumber <= 6) {
                upperMatchId = 'upper2';
                position = groupNumber - 3;
            } else {
                upperMatchId = 'upper3';
                position = groupNumber - 6;
            }
            
            // Знаходимо відповідний слот у верхній сітці
            const targetSlot = document.querySelector(`.match[data-match-id="${upperMatchId}"] .player[data-player-id="upper${upperMatchId.substring(5)}-${position}"]`);
            if (targetSlot) {
                // Оновлюємо слот
                targetSlot.textContent = player.textContent;
                targetSlot.setAttribute('data-player-id', playerId);
                targetSlot.setAttribute('data-status', status);
                targetSlot.setAttribute('data-next-round', 'upper');
                targetSlot.classList.remove('tbd');
                targetSlot.classList.add('winner');
            }
        } 
        // Обробка тих, хто програв - переміщення в нижню сітку
        else if (status === 'loser' && nextRound === 'lower') {
            // Визначаємо, в який матч нижньої сітки переходить гравець
            const lowerMatchId = `lower1-${Math.ceil(groupNumber / 3)}`;
            
            // Визначаємо позицію в цьому матчі
            let position;
            if (groupNumber % 3 === 1) position = 1;
            else if (groupNumber % 3 === 2) position = 2;
            else position = 3;
            
            // Знаходимо цільовий слот у нижній сітці
            const targetSlot = document.querySelector(`.match[data-match-id="${lowerMatchId}"] .player[data-player-id="lower1-${Math.ceil(groupNumber / 3)}-${position}"]`);
            if (targetSlot) {
                // Оновлюємо слот
                targetSlot.textContent = player.textContent;
                targetSlot.setAttribute('data-player-id', playerId);
                targetSlot.setAttribute('data-status', 'active');
                targetSlot.setAttribute('data-next-round', 'lower');
                targetSlot.classList.remove('tbd');
            }
        }
    }

    // Оновлюємо статуси всіх гравців
    updatePlayerStatus('p1', 'loser', '5', 'lower', '');
    updatePlayerStatus('p2', 'winner', '10', 'upper', '');
    updatePlayerStatus('p3', 'loser', '4', 'lower', '');
    updatePlayerStatus('p4', 'winner', '11', 'upper', '');
    updatePlayerStatus('p5', 'loser', '4', 'lower', '');
    updatePlayerStatus('p6', 'loser', '4', 'lower', '');
    updatePlayerStatus('p7', 'loser', '4', 'lower', '');
    updatePlayerStatus('p8', 'winner', '9', 'upper', '');
    updatePlayerStatus('p9', 'loser', '4', 'lower', '');
    updatePlayerStatus('p10', 'loser', '4', 'lower', '');
    updatePlayerStatus('p11', 'winner', '8', 'upper', '');
    updatePlayerStatus('p12', 'loser', '4', 'lower', '');
    updatePlayerStatus('p13', 'loser', '4', 'lower', '');
    updatePlayerStatus('p14', 'winner', '9', 'upper', '');
    updatePlayerStatus('p15', 'loser', '4', 'lower', '');
    updatePlayerStatus('p16', 'loser', '4', 'lower', '');
    updatePlayerStatus('p17', 'winner', '8', 'upper', '');
    updatePlayerStatus('p18', 'loser', '4', 'lower', '');
    updatePlayerStatus('p19', 'loser', '4', 'lower', '');
    updatePlayerStatus('p20', 'winner', '9', 'upper', '');
    updatePlayerStatus('p21', 'loser', '4', 'lower', '');
    updatePlayerStatus('p22', 'loser', '4', 'lower', '');
    updatePlayerStatus('p23', 'winner', '8', 'upper', '');
    updatePlayerStatus('p24', 'loser', '4', 'lower', '');
    updatePlayerStatus('p25', 'loser', '4', 'lower', '');
    updatePlayerStatus('p26', 'winner', '7', 'upper', '');
    updatePlayerStatus('p27', 'loser', '4', 'lower', '');
});