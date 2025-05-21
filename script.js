   const players = document.querySelectorAll('.player');
        players.forEach(player => {
            player.addEventListener('mouseover', () => {
                const playerId = player.getAttribute('data-player-id');
                const groupId = player.getAttribute('data-group-id');
                const status = player.getAttribute('data-status');
                const nextRound = player.getAttribute('data-next-round');

                document.querySelectorAll(`.player[data-player-id="${playerId}"]`).forEach(p => {
                    if (!p.classList.contains('tbd')) {
                        p.classList.add('highlighted');
                    }
                });

                if (groupId && status) {
                    const groupPlayers = document.querySelectorAll(`.match[data-group-id="${groupId}"] .player`);
                    let winner = null;
                    groupPlayers.forEach(p => {
                        if (p.getAttribute('data-status') === 'winner') {
                            winner = p.getAttribute('data-player-id');
                        }
                    });
                    if (status === 'loser' && nextRound === 'lower') {
                        document.querySelectorAll(`.player[data-player-id="${playerId}"][data-next-round="lower"]`).forEach(p => {
                            if (!p.classList.contains('tbd')) {
                                p.classList.add('highlighted');
                            }
                        });
                    } else if (status === 'winner' && nextRound === 'upper') {
                        document.querySelectorAll(`.player[data-player-id="${playerId}"][data-next-round="upper"]`).forEach(p => {
                            if (!p.classList.contains('tbd')) {
                                p.classList.add('highlighted');
                            }
                        });
                    }
                    if (winner && winner !== playerId) {
                        document.querySelectorAll(`.player[data-player-id="${winner}"]`).forEach(p => {
                            if (!p.classList.contains('tbd')) {
                                p.classList.add('highlighted');
                            }
                        });
                    }
                }
            });

            player.addEventListener('mouseout', () => {
                const playerId = player.getAttribute('data-player-id');
                const groupId = player.getAttribute('data-group-id');

                document.querySelectorAll(`.player[data-player-id="${playerId}"]`).forEach(p => {
                    p.classList.remove('highlighted');
                });

                if (groupId) {
                    const groupPlayers = document.querySelectorAll(`.match[data-group-id="${groupId}"] .player`);
                    let winner = null;
                    groupPlayers.forEach(p => {
                        if (p.getAttribute('data-status') === 'winner') {
                            winner = p.getAttribute('data-player-id');
                        }
                    });
                    if (winner) {
                        document.querySelectorAll(`.player[data-player-id="${winner}"]`).forEach(p => {
                            p.classList.remove('highlighted');
                        });
                    }
                }
            });
        });

        function updatePlayerStatus(playerId, status, score, nextRound, place) {
            const player = document.querySelector(`.player[data-player-id="${playerId}"]`);
            if (!player) return;

            player.setAttribute('data-status', status);
            player.setAttribute('data-score', score);
            player.setAttribute('data-next-round', nextRound);
            if (place) player.setAttribute('data-place', place);
            player.classList.add(status === 'winner' ? 'winner' : 'loser');

            const groupId = player.closest('.match').getAttribute('data-group-id');
            const groupNumber = parseInt(groupId.replace('group', ''));

            if (status === 'winner' && nextRound === 'upper') {
                let upperMatchId, slot;
                if (groupNumber <= 3) {
                    upperMatchId = 'upper1';
                    slot = groupNumber;
                } else if (groupNumber <= 6) {
                    upperMatchId = 'upper2';
                    slot = groupNumber - 3;
                } else {
                    upperMatchId = 'upper3';
                    slot = groupNumber - 6;
                }
                const targetSlot = document.querySelector(`.match[data-match-id="${upperMatchId}"] .player[data-player-id="upper${slot}-${slot}"]`);
                if (targetSlot) {
                    targetSlot.textContent = player.textContent;
                    targetSlot.setAttribute('data-player-id', playerId);
                    targetSlot.setAttribute('data-next-round', 'upper');
                    targetSlot.classList.remove('tbd');
                    targetSlot.classList.add(status === 'winner' ? 'winner' : 'loser');
                }
            } else if (status === 'loser' && nextRound === 'lower') {
                const lowerMatchId = `lower1-${groupNumber}`;
                const groupPlayers = document.querySelectorAll(`.match[data-group-id="${groupId}"] .player`);
                let slotIndex = 1;
                groupPlayers.forEach(p => {
                    if (p.getAttribute('data-status') === 'loser' && p.getAttribute('data-player-id') !== playerId) {
                        slotIndex++;
                    }
                });
                const targetSlot = document.querySelector(`.match[data-match-id="${lowerMatchId}"] .player[data-player-id="lower1-${groupNumber}-${slotIndex}"]`);
                if (targetSlot) {
                    targetSlot.textContent = player.textContent;
                    targetSlot.setAttribute('data-player-id', playerId);
                    targetSlot.setAttribute('data-next-round', 'lower');
                    targetSlot.classList.remove('tbd');
                    targetSlot.classList.add(status === 'winner' ? 'winner' : 'loser');
                }
            }
        }

        updatePlayerStatus('p1', 'loser', '5', 'lower', '');
        updatePlayerStatus('p2', 'winner', '10', 'upper', 'upper4');
        updatePlayerStatus('p3', 'loser', '4', 'lower', '');
		updatePlayerStatus('p4', 'winner', '11', 'upper2', '');
		updatePlayerStatus('p5', 'loser', '4', 'lower', '');
		updatePlayerStatus('p6', 'loser', '4', 'lower', '');
		updatePlayerStatus('p7', 'loser', '4', 'lower', '');
		updatePlayerStatus('p8', 'winner', '4', 'lower', '');
		updatePlayerStatus('p9', 'loser', '4', 'lower', '');
		updatePlayerStatus('p10', 'loser', '4', 'lower', '');
		updatePlayerStatus('p11', 'winner', '4', 'lower', '');
		updatePlayerStatus('p12', 'loser', '4', 'lower', '');
		updatePlayerStatus('p13', 'loser', '4', 'lower', '');
		updatePlayerStatus('p14', 'loser', '4', 'lower', '');
		updatePlayerStatus('p15', 'loser', '4', 'lower', '');
		updatePlayerStatus('p16', 'loser', '4', 'lower', '');
		updatePlayerStatus('p17', 'loser', '4', 'lower', '');
		updatePlayerStatus('p18', 'loser', '4', 'lower', '');
		updatePlayerStatus('p19', 'loser', '4', 'lower', '');
		updatePlayerStatus('p20', 'loser', '4', 'lower', '');
		updatePlayerStatus('p21', 'loser', '4', 'lower', '');
		updatePlayerStatus('p22', 'loser', '4', 'lower', '');
		updatePlayerStatus('p23', 'loser', '4', 'lower', '');
		updatePlayerStatus('p24', 'loser', '4', 'lower', '');
		updatePlayerStatus('p25', 'loser', '4', 'lower', '');
		updatePlayerStatus('p26', 'loser', '4', 'lower', '');
		updatePlayerStatus('p27', 'loser', '4', 'lower', '');
