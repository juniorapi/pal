// Оновлений код для script.js
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
                const matchId = parentMatch.getAttribute('data-match-id');
                const status = player.getAttribute('data-status');
                const nextRound = player.getAttribute('data-next-round');
                
                // Додаткова логіка підсвічування для переможців і тих, хто йде в нижню сітку
                if (status === 'winner' || status === 'loser') {
                    // Підсвічуємо всі екземпляри цього гравця
                    document.querySelectorAll(`.player[data-player-id="${playerId}"]`).forEach(p => {
                        if (!p.classList.contains('tbd')) {
                            p.classList.add('highlighted');
                        }
                    });
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
    function updatePlayerStatus(playerId, status, score, nextRound, nextMatchId = null) {
        // Знаходимо всіх гравців з цим ID
        const players = document.querySelectorAll(`.player[data-player-id="${playerId}"]`);
        if (players.length === 0) return;
        
        // Знаходимо останнього активного гравця (в поточному раунді)
        let currentPlayer = null;
        players.forEach(p => {
            if (p.getAttribute('data-status') === 'active' || 
                p.getAttribute('data-status') === 'winner' || 
                p.getAttribute('data-status') === 'loser' ||
                !p.classList.contains('tbd')) {
                currentPlayer = p;
            }
        });
        
        if (!currentPlayer) currentPlayer = players[0];
        const matchElement = currentPlayer.closest('.match');
        if (!matchElement) return;
        
        // Встановлюємо атрибути гравця
        currentPlayer.setAttribute('data-status', status);
        currentPlayer.setAttribute('data-score', score);
        currentPlayer.setAttribute('data-next-round', nextRound);
        
        // Додаємо відповідний клас
        if (status === 'winner') {
            currentPlayer.classList.add('winner');
        } else if (status === 'loser') {
            currentPlayer.classList.add('loser');
        }
        
        // Отримуємо ID групи або матчу
        const groupId = matchElement.getAttribute('data-group-id');
        const matchId = matchElement.getAttribute('data-match-id');
        
        // 1. Обробка переміщення з першого раунду (з груп)
        if (groupId) {
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
                    targetSlot.textContent = currentPlayer.textContent;
                    targetSlot.setAttribute('data-player-id', playerId);
                    targetSlot.setAttribute('data-status', 'active');
                    targetSlot.classList.remove('tbd');
                }
            } 
            // Обробка тих, хто програв - переміщення в нижню сітку
            else if (status === 'loser' && nextRound === 'lower') {
                // Визначаємо, в який матч нижньої сітки переходить гравець
                // Ми маємо 9 груп, 3 матчі в нижній сітці першого раунду - кожен містить 3 групи
                const lowerBracketNumber = Math.ceil(groupNumber / 3);
                const lowerMatchId = `lower1-${lowerBracketNumber}`;
                
                // Визначаємо позицію в цьому матчі (1, 2 або 3 залежно від номера групи)
                const position = ((groupNumber - 1) % 3) + 1;
                
                // Знаходимо цільовий слот у нижній сітці
                const targetSlot = document.querySelector(`.match[data-match-id="${lowerMatchId}"] .player[data-player-id="lower1-${lowerBracketNumber}-${position}"]`);
                if (targetSlot) {
                    // Оновлюємо слот
                    targetSlot.textContent = currentPlayer.textContent;
                    targetSlot.setAttribute('data-player-id', playerId);
                    targetSlot.setAttribute('data-status', 'active');
                    targetSlot.classList.remove('tbd');
                }
            }
        }
        // 2. Обробка переміщення з верхньої сітки (2-й та 3-й раунди)
        else if (matchId && matchId.startsWith('upper')) {
            const upperRound = parseInt(matchId.substring(5));
            
            // Визначення позиції гравця в поточному матчі
            const playerPosition = Array.from(matchElement.querySelectorAll('.player')).findIndex(p => p === currentPlayer) + 1;
            
            if (status === 'winner' && nextRound === 'upper') {
                // Переможці йдуть у наступний раунд верхньої сітки
                let nextUpperMatchId, nextPosition;
                
                if (upperRound === 1) {
                    // З upper1 переможці йдуть в upper4
                    nextUpperMatchId = 'upper4';
                    // Позиція залишається такою ж (1, 2 або 3)
                    nextPosition = playerPosition;
                } else if (upperRound === 2) {
                    // З upper2 переможці також йдуть в upper4
                    nextUpperMatchId = 'upper4';
                    // Але позиція зміщується
                    nextPosition = playerPosition;
                } else if (upperRound === 3) {
                    // З upper3 переможці також йдуть в upper4
                    nextUpperMatchId = 'upper4';
                    // Позиція зміщується ще більше
                    nextPosition = playerPosition;
                }
                
                // Якщо вказано конкретний наступний матч, використовуємо його
                if (nextMatchId) {
                    nextUpperMatchId = nextMatchId;
                }
                
                if (nextUpperMatchId) {
                    // Знаходимо відповідний слот у наступному матчі верхньої сітки
                    const targetSlotSelector = `.match[data-match-id="${nextUpperMatchId}"] .player[data-player-id="upper${nextUpperMatchId.substring(5)}-${nextPosition}"]`;
                    const targetSlot = document.querySelector(targetSlotSelector);
                    if (targetSlot) {
                        // Оновлюємо слот
                        targetSlot.textContent = currentPlayer.textContent;
                        targetSlot.setAttribute('data-player-id', playerId);
                        targetSlot.setAttribute('data-status', 'active');
                        targetSlot.classList.remove('tbd');
                    }
                }
            } else if (status === 'loser' && nextRound === 'lower') {
                // Гравці, що програли у верхній сітці, переходять до нижньої
                let nextLowerMatchId, nextPosition;
                
                // Визначаємо, в який матч нижньої сітки переходить гравець
                if (upperRound === 1) {
                    // З upper1 гравці йдуть у другий раунд нижньої сітки
                    nextLowerMatchId = 'lower2-1';
                    nextPosition = playerPosition;
                } else if (upperRound === 2) {
                    // З upper2 гравці йдуть у другий раунд нижньої сітки
                    nextLowerMatchId = 'lower2-2';
                    nextPosition = playerPosition;
                } else if (upperRound === 3) {
                    // З upper3 гравці йдуть у другий раунд нижньої сітки
                    nextLowerMatchId = 'lower2-3';
                    nextPosition = playerPosition;
                } else if (upperRound === 4) {
                    // Програвші у фіналі верхньої сітки йдуть у фінал нижньої
                    nextLowerMatchId = 'lower4-1';
                    nextPosition = playerPosition;
                }
                
                // Якщо вказано конкретний наступний матч, використовуємо його
                if (nextMatchId) {
                    nextLowerMatchId = nextMatchId;
                }
                
                if (nextLowerMatchId) {
                    // Знаходимо відповідний слот у нижній сітці
                    const targetSlotSelector = `.match[data-match-id="${nextLowerMatchId}"] .player[data-player-id="${nextLowerMatchId}-${nextPosition}"]`;
                    const targetSlot = document.querySelector(targetSlotSelector);
                    if (targetSlot) {
                        // Оновлюємо слот
                        targetSlot.textContent = currentPlayer.textContent;
                        targetSlot.setAttribute('data-player-id', playerId);
                        targetSlot.setAttribute('data-status', 'active');
                        targetSlot.classList.remove('tbd');
                    }
                }
            }
        }
        // 3. Обробка переміщення з нижньої сітки
        else if (matchId && matchId.startsWith('lower')) {
            // Парсимо ID матчу, щоб отримати раунд та номер матчу
            const parts = matchId.split('-');
            const lowerRound = parseInt(parts[0].substring(5));
            const matchNumber = parseInt(parts[1]);
            
            // Визначення позиції гравця в поточному матчі
            const playerPosition = Array.from(matchElement.querySelectorAll('.player')).findIndex(p => p === currentPlayer) + 1;
            
            if (status === 'winner' && nextRound === 'lower') {
                // Переможці йдуть у наступний раунд нижньої сітки
                let nextLowerMatchId, nextPosition;
                
                // Логіка переходів між раундами нижньої сітки
                if (lowerRound === 1) {
                    // З раунду 1 до раунду 2
                    nextLowerMatchId = `lower2-${Math.ceil(matchNumber / 2)}`;
                    nextPosition = (matchNumber % 2 === 1) ? 1 : 2;
                } else if (lowerRound === 2) {
                    // З раунду 2 до раунду 3
                    nextLowerMatchId = `lower3-${Math.ceil(matchNumber / 2)}`;
                    nextPosition = (matchNumber % 2 === 1) ? 1 : 2;
                } else if (lowerRound === 3) {
                    // З раунду 3 до фіналу нижньої сітки
                    nextLowerMatchId = 'lower4-1';
                    nextPosition = matchNumber;
                } else if (lowerRound === 4) {
                    // З фіналу нижньої сітки до гранд-фіналу
                    const finalSlot = document.querySelector(`.match[data-match-id="final"] .player[data-player-id="final-2"]`);
                    if (finalSlot) {
                        finalSlot.textContent = currentPlayer.textContent;
                        finalSlot.setAttribute('data-player-id', playerId);
                        finalSlot.setAttribute('data-status', 'active');
                        finalSlot.classList.remove('tbd');
                    }
                    return;
                }
                
                // Якщо вказано конкретний наступний матч, використовуємо його
                if (nextMatchId) {
                    nextLowerMatchId = nextMatchId;
                }
                
                if (nextLowerMatchId) {
                    // Знаходимо відповідний слот у наступному матчі нижньої сітки
                    const targetSlotSelector = `.match[data-match-id="${nextLowerMatchId}"] .player[data-player-id="${nextLowerMatchId}-${nextPosition}"]`;
                    const targetSlot = document.querySelector(targetSlotSelector);
                    if (targetSlot) {
                        // Оновлюємо слот
                        targetSlot.textContent = currentPlayer.textContent;
                        targetSlot.setAttribute('data-player-id', playerId);
                        targetSlot.setAttribute('data-status', 'active');
                        targetSlot.classList.remove('tbd');
                    }
                }
            } else if (status === 'loser' && nextRound === 'lower2') {
                // Ті, хто програв у нижній сітці після 1-го раунду, можуть іти в нижню сітку 2
                let nextLowerMatchId, nextPosition;
                
                if (lowerRound === 1) {
                    nextLowerMatchId = `lower5-${matchNumber}`;
                    nextPosition = playerPosition;
                } else if (lowerRound === 2) {
                    // З 2-го раунду вибувають з турніру
                    return;
                }
                
                // Якщо вказано конкретний наступний матч, використовуємо його
                if (nextMatchId) {
                    nextLowerMatchId = nextMatchId;
                }
                
                if (nextLowerMatchId) {
                    // Знаходимо відповідний слот у наступній нижній сітці
                    const targetSlotSelector = `.match[data-match-id="${nextLowerMatchId}"] .player[data-player-id="${nextLowerMatchId}-${nextPosition}"]`;
                    const targetSlot = document.querySelector(targetSlotSelector);
                    if (targetSlot) {
                        // Оновлюємо слот
                        targetSlot.textContent = currentPlayer.textContent;
                        targetSlot.setAttribute('data-player-id', playerId);
                        targetSlot.setAttribute('data-status', 'active');
                        targetSlot.classList.remove('tbd');
                    }
                }
            }
        }
        
        // 4. Особлива обробка для фіналу верхньої сітки
        if (matchId === 'upper4' && status === 'winner' && nextRound === 'final') {
            // ВИПРАВЛЕННЯ: Додаємо клас winner до поточного гравця в upper4
            currentPlayer.classList.add('winner');
            
            // Переможець фіналу верхньої сітки йде до гранд-фіналу
            const finalSlot = document.querySelector(`.match[data-match-id="final"] .player[data-player-id="final-1"]`);
            if (finalSlot) {
                finalSlot.textContent = currentPlayer.textContent;
                finalSlot.setAttribute('data-player-id', playerId);
                finalSlot.setAttribute('data-status', 'active');
                finalSlot.classList.remove('tbd');
            }
        }
        
        // ДОДАНО: Обробка особливих статусів чемпіона та призера
        if (status === 'champion' || status === 'runner-up') {
            // Додаємо відповідні класи для чемпіона та призера
            if (status === 'champion') {
                currentPlayer.classList.add('champion');
            } else if (status === 'runner-up') {
                currentPlayer.classList.add('runner-up');
            }
        }
    }

    // Симуляція першого етапу турніру (вже є в поточному коді)
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
    
    // Симуляція 2-го раунду верхньої сітки
    // Переможці з першого раунду вже потрапили у верхню сітку 2-го раунду
    // Тепер визначаємо переможців та тих, хто програв
    
    // Upper1: p2, p4, p8
    updatePlayerStatus('p2', 'loser', '7', 'lower', 'lower2-1');
    updatePlayerStatus('p4', 'loser', '6', 'lower', 'lower2-1');
    updatePlayerStatus('p8', 'winner', '12', 'upper', 'upper4');
    
    // Upper2: p11, p14, p17
    updatePlayerStatus('p11', 'loser', '5', 'lower', 'lower2-2');
    updatePlayerStatus('p14', 'loser', '8', 'lower', 'lower2-2');
    updatePlayerStatus('p17', 'winner', '15', 'upper', 'upper4');
    
    // Upper3: p20, p23, p26
    updatePlayerStatus('p20', 'winner', '14', 'upper', 'upper4');
    updatePlayerStatus('p23', 'loser', '7', 'lower', 'lower2-3');
    updatePlayerStatus('p26', 'loser', '6', 'lower', 'lower2-3');
    
    // Симуляція 1-го раунду нижньої сітки
    // Нижня сітка 1-1: p1, p4, p7
    updatePlayerStatus('p1', 'winner', '9', 'lower', 'lower2-2');
    updatePlayerStatus('p3', 'loser', '5', 'lower2', 'lower5-1');
    updatePlayerStatus('p7', 'loser', '3', 'lower2', 'lower5-1');
    
    // Нижня сітка 1-2: p10, p13, p16
    updatePlayerStatus('p10', 'winner', '10', 'lower', 'lower2-3');
    updatePlayerStatus('p13', 'loser', '6', 'lower2', 'lower5-2');
    updatePlayerStatus('p16', 'loser', '4', 'lower2', 'lower5-2');
    
    // Нижня сітка 1-3: p19, p22, p25
    updatePlayerStatus('p19', 'winner', '11', 'lower', 'lower2-4');
    updatePlayerStatus('p22', 'loser', '7', 'lower2', 'lower5-3');
    updatePlayerStatus('p25', 'loser', '5', 'lower2', 'lower5-3');
    
    // Пропустили слоти 4-6 - заповнюємо їх
    // Нижня сітка 1-4: p5, p6, p9
    updatePlayerStatus('p5', 'winner', '8', 'lower', 'lower2-1');
    updatePlayerStatus('p6', 'loser', '5', 'lower2', 'lower5-1');
    updatePlayerStatus('p9', 'loser', '4', 'lower2', 'lower5-1');
    
    // Нижня сітка 1-5: p12, p15, p18
    updatePlayerStatus('p12', 'winner', '9', 'lower', 'lower2-3');
    updatePlayerStatus('p15', 'loser', '6', 'lower2', 'lower5-2');
    updatePlayerStatus('p18', 'loser', '4', 'lower2', 'lower5-2');
    
    // Нижня сітка 1-6: p21, p24, p27
    updatePlayerStatus('p21', 'winner', '10', 'lower', 'lower2-4');
    updatePlayerStatus('p24', 'loser', '7', 'lower2', 'lower5-3');
    updatePlayerStatus('p27', 'loser', '5', 'lower2', 'lower5-3');
    
    // Симуляція 2-го раунду нижньої сітки
    // Нижня сітка 2-1: p2, p4, p5
    updatePlayerStatus('p2', 'winner', '11', 'lower', 'lower3-1');
    updatePlayerStatus('p4', 'loser', '8', 'lower2', 'lower5-4');
    updatePlayerStatus('p5', 'loser', '7', 'lower2', 'lower5-4');
    
    // Нижня сітка 2-2: p11, p14, p1
    updatePlayerStatus('p11', 'winner', '12', 'lower', 'lower3-1');
    updatePlayerStatus('p14', 'loser', '9', 'lower2', 'lower5-4');
    updatePlayerStatus('p1', 'loser', '8', 'lower2', 'lower5-4');
    
    // Нижня сітка 2-3: p23, p26, p10, p12
    updatePlayerStatus('p23', 'winner', '13', 'lower', 'lower3-2');
    updatePlayerStatus('p26', 'loser', '10', 'lower2', 'lower5-4');
    updatePlayerStatus('p10', 'loser', '9', 'lower2', 'lower5-4');
    updatePlayerStatus('p12', 'winner', '14', 'lower', 'lower3-2');
    
    // Нижня сітка 2-4: p19, p21
    updatePlayerStatus('p19', 'winner', '13', 'lower', 'lower3-2');
    updatePlayerStatus('p21', 'loser', '10', 'lower2', 'lower5-4');
    
     // Симуляція 3-го раунду верхньої сітки
    // Upper4: p8, p17, p20
    updatePlayerStatus('p8', 'loser', '11', 'lower', 'lower4-1');
    updatePlayerStatus('p17', 'winner', '16', 'final', '');  // Переможець перейде до гранд-фіналу
    updatePlayerStatus('p20', 'loser', '10', 'lower', 'lower4-1');
    
      // Нижня сітка 3-1: p2, p11
    updatePlayerStatus('p2', 'winner', '14', 'lower', 'lower4-1');
    updatePlayerStatus('p11', 'loser', '10', 'lower2', 'lower5-4');
    
    // Нижня сітка 3-2: p23, p12, p19
    updatePlayerStatus('p23', 'winner', '13', 'lower', 'lower4-1');
    updatePlayerStatus('p12', 'loser', '9', 'lower2', 'lower5-4');
    updatePlayerStatus('p19', 'loser', '8', 'lower2', 'lower5-4');
    
    // Симуляція фіналу нижньої сітки
     updatePlayerStatus('p8', 'loser', '10', 'lower2', 'lower5-4');
    updatePlayerStatus('p20', 'loser', '12', 'lower2', 'lower5-4');
    updatePlayerStatus('p2', 'loser', '11', 'lower2', 'lower5-4');
    updatePlayerStatus('p23', 'winner', '15', 'lower', 'final');  // Переможець переходить до гранд-фіналу
    
    // Симуляція гранд-фіналу
    // Final: p17 (з верхньої сітки), p23 (з нижньої сітки)
    updatePlayerStatus('p17', 'champion', '18', '', '');  // Чемпіон турніру
    updatePlayerStatus('p23', 'runner-up', '13', '', '');  // Фіналіст
	});