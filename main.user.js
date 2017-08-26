// ==UserScript==
// @name         Deployment counter
// @namespace    http://tampermonkey.net/
// @version      1.0.2
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
        //log = rawlog.replace(/<br>/g, '\n');
        logarray = rawlog.split('<br>');
        handleLog(logarray);
        printIndividual();
        if (kindOfGame != 1)
            printTeam();
    });
    function handleLog(log){
        console.log(log);
        for (i=0; i < log.length; i++){
            log[i] = log[i].split(':').pop();
            if (log[i].includes('received')){
                deriveDeployment(log[i]);
            }
			if (log[i].includes('played a set'))
				deriveSet(log[i]);
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
        addUnitsToPlayer(logs[0], units, 0);
    }
	function deriveSet(log){
		logs = log.split('worth');
		units = logs[1].split('troops')[0];
        addUnitsToPlayer(logs[0], units, 1);
	}
    function deriveAutodeploy(log){
        logs = log.split('got bonus of');
        units = logs[1].split('troops')[0];
        addUnitsToPlayer(logs[0], units, 1);
    }
    function addUnitsToPlayer(player, units, deploy){
        player = player.split('"player').pop().split('">')[0];
		console.log(units);
		console.log(deploy);
		console.log(parseInt(units));
		console.log(playerTotals);
        playerTotals[player-1][deploy] = parseInt(playerTotals[player-1][deploy]) + parseInt(units);
		console.log(playerTotals);
	}
    function printIndividual(){
        for (i = 0; i < playerTotals.length; i++){
            console.log(playerNames[i] +" has deployed " + playerTotals[i][0]+" troops.");
            console.log(playerNames[i] +" has received " + playerTotals[i][1]+" troops as autodeploys.");
			}
    }
    function printTeam(){
        for (i = 0; i < nrPlayers; i = i+kindOfGame){
            deploys = 0;
			autodeploys = 0;
            for (j = i; j < i + kindOfGame; j++){
                deploys += parseInt(playerTotals[j][0]);
				autodeploys += parseInt(playerTotals[j][1]);
            }
            console.log("Team " +(j)/kindOfGame+" has deployed " + deploys + " troops.");
            console.log("Team " +(j)/kindOfGame+" has received " + autodeploys + " troops as autodeploys.");
        }
    }

    window.onload = function(){
        info = document.getElementById('console_basic');
        console.log(info);
        //info.getElementsByTagName(title);
        nrPlayers = $("span[title='Players']").html().replace(/[^0-9]/g, '');
        kindOfGame =  $("span[title='Game Type']").html();
        initializeTeams();
    };

    function initializeTeams () {
        switch(kindOfGame){
            case "Doubles":
                nrTeams = nrPlayers/2;
                console.log(nrTeams);
                kindOfGame = 2;
                break;
            case "Triples":
                nrTeams = nrPlayers/3;
                console.log(nrTeams);
                kindOfGame = 3;
                break;
            case "Quadruples":
                nrTeams = nrPlayers/4;
                console.log(nrTeams);
                kindOfGame = 4;
                break;
            default:
                nrTeams = nrPlayers;
                console.log(nrTeams);
                kindOfGame = 1;
                break;
        }
        populateTeams();
    }
    function populateTeams(){
        info = document.getElementById('statsTable');
        var players = info.getElementsByClassName('player');
		playerTotals = [];
        for (i=0; i < players.length; i++){
            playerNames.push(players[i].innerHTML);
			playerTotals.push([]);
			playerTotals[i].push(0).push(0);
        }
        console.log(playerNames);
        console.log(playerTotals);
    }
})();
