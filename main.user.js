// ==UserScript==
// @name         Deployment counter
// @namespace    http://tampermonkey.net/
// @version      0.9
// @description  Deployment counter
// @author       Extreme Ways
// @updateURL    https://github.com/NoodleSkadoodle/CC-deployment-script/raw/master/main.js
// @include      https://*.conquerclub.com/*game.php?game=*
// @require      http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js
// ==/UserScript==


(function() {
    var nrPlayers;
    var kindOfGame;
    var nrTeams;
    var playerNames = [];
    var playerTotals = [];

    $('#submit2').one('click', function(){

        rawlog = document.getElementById('log').innerHTML;
        log = rawlog.replace(/<br/g, '\n');
        logarray = log.split('\n');
        handleLog(logarray);
        printIndividual();
        if (kindOfGame != 1)
            printTeam();
    });
    function handleLog(log){
        for (i=0; i < log.length; i++){
            log[i] = log[i].split(':').pop();
            if (log[i].includes('received')){
                deriveDeployment(log[i]);
            }
            else if (log[i].includes('troops added to'))
                deriveAutodeploy(log[i]);
            else{
                log.splice(i,1);
                i--;
            }
        }
    }
    function deriveDeployment(log){
        logs = log.split('received');
        units = logs[1].split('troops')[0];
        addUnitsToPlayer(logs[0], units);
    }
    function deriveAutodeploy(log){
        logs = log.split('got bonus of');
        units = logs[1].split('troops')[0];
        addUnitsToPlayer(logs[0], units);
    }
    function addUnitsToPlayer(player, units){
        player = player.split('"player').pop().split('">')[0];
        playerTotals[player-1] = Number(playerTotals[player-1]) + Number(units);
    }
    function printIndividual(){
        for (i = 0; i < playerTotals.length; i++){
            console.log(playerNames[i] +" has deployed " + playerTotals[i]+" troops.");
        }
    }
    function printTeam(){
        for (i = 0; i < nrPlayers; i = i+kindOfGame){
            units = 0;
            for (j = i; j < i + kindOfGame; j++){
                units += playerTotals[j];
            }
            console.log("Team " +(j)/kindOfGame+" has deployed " + units + " troops.");
        }
    }

    window.onload = function(){
        info = document.getElementById('console_basic');
        nrPlayers = $("span[title='Players']").html().replace(/[^0-9]/g, '');
        kindOfGame =  $("span[title='Game Type']").html();
        initializeTeams();
    };

    function initializeTeams () {
        switch(kindOfGame){
            case "Doubles":
                nrTeams = nrPlayers/2;
                kindOfGame = 2;
                break;
            case "Triples":
                nrTeams = nrPlayers/3;
                kindOfGame = 3;
                break;
            case "Quadruples":
                nrTeams = nrPlayers/4;
                kindOfGame = 4;
                break;
            default:
                nrTeams = nrPlayers;
                kindOfGame = 1;
                break;
        }
        populateTeams();
    }
    function populateTeams(){
        info = document.getElementById('statsTable');
        var players = info.getElementsByClassName('player');
        for (i=0; i < players.length; i++){
            playerNames.push(players[i].innerHTML);
            playerTotals.push(0);
        }
    }
})();
