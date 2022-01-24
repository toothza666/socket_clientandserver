const net = require('net')

var players = []
var gameState = 0
var gameStatus = {
    p1HP: 10,
    p2HP: 10,
    monsterHP: random(15) + 7
}

net.createServer((socket) => {

    socket.on('data', (data) => {
        var msg = data.toString().toLowerCase()
        var player = findPlayer(socket.remoteAddress, socket.remotePort)
        switch (gameState) {
            case 0:
                if (msg == 'ping' && player == null && players.length == 0) {
                    players.push({
                        addr: socket.remoteAddress,
                        port: socket.remotePort,
                        name: 'player1',
                        state: 0,
                        client: socket
                    })
                    socket.write('ping received youre player1')
                    console.log('player1 joined.')
                } else if (msg == 'ping' && player == null && players.length == 1) {
                    players.push({
                        addr: socket.remoteAddress,
                        port: socket.remotePort,
                        name: 'player2',
                        state: 0,
                        client: socket
                    })
                    socket.write('ping received youre player2')
                    console.log('player2 joined.')
                    gameState = 1
                } else if (player != null) {
                    socket.write('waiting for another player to ping')
                }
                else socket.write('type ping if you re set')
                break
            case 1:
                if (player != null && msg == 'ready') {
                    player['ready'] = 'ready'
                    console.log(player.name + ' is ready.')
                    announce(player.name + ' ready')
                    if (checkReady() == 2) {
                        console.log('All players are ready.')
                        gameState = 2
                        gameStatus['turn'] = 1
                        announce('ready')
                        announce('start\n' + 'monster HP : ' + gameStatus.monsterHP + '\np1 HP : ' + gameStatus.p1HP + '\np2 HP : ' + gameStatus.p2HP + '\n' + gameTurnToPlayer() + ' turn \ntype info to check what you can do')
                        console.log('game status : \n monster HP : ' + gameStatus.monsterHP + '\n p1 HP :' + gameStatus.p1HP + ' \n p2 HP :' + gameStatus.p2HP + '\n' + gameTurnToPlayer() + ' turn')
                    }
                } else if (player != null && msg == 'disconnect') {
                    if (player.name == 'player1') {
                        players.splice(0, 2)
                        announce('someone left pls try ping again')
                        console.log('player1 left pls try ping again')
                        resetGame()
                        gameState = 0
                    } else {
                        players.splice(0, 2)
                        announce('someone left pls try ping again')
                        console.log('player2 left pls try ping again')
                        resetGame()
                        gameState = 0
                    }
                } else if (player != null && msg == 'unready'){
                    player['ready'] = 'unready'
                    announce(player.name + ' unready')
                    console.log(player.name + ' is not ready.')
                }
                else socket.write('type ready if you re set')
                break
            case 2:
                if (gameStatus.monsterHP > 0 && gameStatus.p1HP > 0 && gameStatus.p2HP > 0) {
                    if (player.name == gameTurnToPlayer()) {
                        if (msg == 0) {
                            gameStatus.monsterHP--
                            gameStatus['turn']++
                            announce(player.name + ' attacked the monster \n' + 'monster HP : ' + gameStatus.monsterHP + '\np1 HP : ' + gameStatus.p1HP + '\np2 HP : ' + gameStatus.p2HP + '\n' + gameTurnToPlayer() + ' turn \ntype info to check what you can do')
                            console.log(player.name + ' attacked the monster \n' + 'monster HP : ' + gameStatus.monsterHP + '\np1 HP : ' + gameStatus.p1HP + '\np2 HP : ' + gameStatus.p2HP + '\n' + gameTurnToPlayer() + ' turn')
                        }
                        else if (msg == 1) {
                            if (player.name == 'player1') {
                                if (gameStatus.p1HP < 10) {
                                    gameStatus.p1HP++
                                }
                            } else {
                                if (gameStatus.p2HP < 10) {
                                    gameStatus.p2HP++
                                }
                            }
                            gameStatus['turn']++
                            announce(player.name + ' healed himself \n' + 'monster HP : ' + gameStatus.monsterHP + '\np1 HP : ' + gameStatus.p1HP + '\np2 HP : ' + gameStatus.p2HP + '\n' + gameTurnToPlayer() + ' turn \ntype info to check what you can do')
                            console.log(player.name + ' healed himself \n' + 'monster HP : ' + gameStatus.monsterHP + '\np1 HP : ' + gameStatus.p1HP + '\np2 HP : ' + gameStatus.p2HP + '\n' + gameTurnToPlayer() + ' turn')
                        } else if (msg == 2) {
                            if (player.name == 'player1') {
                                if (gameStatus.p2HP < 10) {
                                    gameStatus.p2HP++
                                }
                            } else {
                                if (gameStatus.p1HP < 10) {
                                    gameStatus.p1HP++
                                }
                            }
                            gameStatus['turn']++
                            announce(player.name + ' healed an ally\n' + 'monster HP : ' + gameStatus.monsterHP + '\np1 HP : ' + gameStatus.p1HP + '\np2 HP : ' + gameStatus.p2HP + '\n' + gameTurnToPlayer() + ' turn \ntype info to check what you can do')
                            console.log(player.name + ' healed an ally\n' + 'monster HP : ' + gameStatus.monsterHP + '\np1 HP : ' + gameStatus.p1HP + '\np2 HP : ' + gameStatus.p2HP + '\n' + gameTurnToPlayer() + ' turn')
                        }
                        else socket.write('your turn : pls enter valid action \n=> \n0 : attack monster \n1 : heal yourself \n2 : heal an ally')
                    } else if (msg == 'info') {
                        announce('monster HP : ' + gameStatus.monsterHP + '\np1 HP : ' + gameStatus.p1HP + '\np2 HP : ' + gameStatus.p2HP + '\n' + gameTurnToPlayer() + ' turn')
                    }
                    if (gameStatus['turn'] % 3 == 0 && gameStatus['lastattack'] != gameStatus['turn']) {
                        var dmgOut = random(3)
                        if (dmgOut == 1) {
                            gameStatus.p1HP -= 2
                            gameStatus['lastattack'] = gameStatus['turn']
                            announce('monster attacked player1')
                            console.log('monster attacked player1')
                        } else if (dmgOut == 2) {
                            gameStatus.p2HP -= 2
                            gameStatus['lastattack'] = gameStatus['turn']
                            announce('monster attacked player2')
                            console.log('monster attacked player2')
                        } else {
                            gameStatus['lastattack'] = gameStatus['turn']
                            announce('monster attack missed')
                            console.log('monster attack missed')
                        }
                    }
                    else socket.write('not your turn : pls wait for another player to take action \ntype info to look at game status')
                } else {
                    gameState = 3
                }
                break
            case 3:
                if (gameStatus.monsterHP <= 0) {
                    console.log('VICTORY!!! resetting')
                    announce('VICTORY!!! resetting')
                    resetGame()
                } else {
                    console.log('DEFEAT... resetting')
                    announce('DEFEAT... resetting')
                    resetGame()
                }
                break
        }
    })

    socket.on('close', function () {
        var i = 0
        console.log('player disconnected')
        while(i < players.length)
        {
            if(players[i].client == socket || players[i].client.destroyed)
            {
                players.splice(i--, 1)
            }
            i++
        }
    })

    socket.on('error', function (err) {
        console.log('Error occurred');
    })

}).listen(5678, '127.0.0.1')
console.log('Server listening on 127.0.0.1:8080')

function findPlayer(addr, port) {
    for (var player of players) {
        if (player['addr'] == addr && player['port'] == port) return player
    }
    return null
}

function checkReady() {
    var num = 0
    for (var player of players) {
        if (player['ready'] == 'ready') num += 1
    }
    return num
}

function announce(msg) {
    for (var player of players) {
        player.client.write(msg)
    }
}

function random(max) {
    return Math.floor(Math.random() * max)
}

function gameTurnToPlayer() {
    if (gameStatus['turn'] % 2 == 0)
        return 'player2'
    if (gameStatus['turn'] % 2 == 1)
        return 'player1'
}

function resetGame() {
    gameStatus = {
        p1HP: 10,
        p2HP: 10,
        monsterHP: random(15) + 7
    }
    gameState = 1
    gameStatus['turn'] = 0
    gameStatus['lastattack'] = 0
    for (var player of players) {
        player['ready'] = 'unready'
    }
}