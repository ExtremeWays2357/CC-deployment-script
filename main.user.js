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

    $('#submit2').on('click', function(){
		populateTeams();
		/**
		Listener for the "send message" button. Creates an array out of the log dump for further handling, and prints the results.
		*/
        rawlog = document.getElementById('log').innerHTML;
        //log = rawlog.replace(/<br>/g, '\n');
        logarray = rawlog.split('<br>');
        handleLog(logarray);
        printIndividual();
        if (kindOfGame != 1)
            printTeam();
    });
    function handleLog(log){
		/**
		Log: the omplete game log, split into an array
		Reads every line of the log to see if it's about receiving troops. Listens to 'received', 'played a set' and 'troops added to'.
		*/
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
        /**
		log: the log entry
		Derives the amount of deploy received.
		*/
		logs = log.split('received');
        units = logs[1].split('troops')[0];
        addUnitsToPlayer(logs[0], units, 0);
    }
	function deriveSet(log){
		/**
		log: the log entry
		Derives the amount of deploy from a set received.
		*/
		logs = log.split('worth');
		units = logs[1].split('troops')[0];
        addUnitsToPlayer(logs[0], units, 0);
	}
    function deriveAutodeploy(log){
		/**
		log: the log entry
		Derives the amount of autodeploy received.
		*/
        logs = log.split('got bonus of');
        units = logs[1].split('troops')[0];
        addUnitsToPlayer(logs[0], units, 1);
    }
    function addUnitsToPlayer(player, units, deploy){
        /**
		player: Part of the log entry with the player number.
		inits: the amount of troops received
		deploy: 0 for deploy, 1 for autodeploy.
		*/
		player = player.split('"player').pop().split('">')[0];
        playerTotals[player-1][deploy] = parseInt(playerTotals[player-1][deploy]) + parseInt(units);

	}
    function printIndividual(){
		/**
		Prints the amount of troops deployed and autodeployed to console individually
		*/
        for (i = 0; i < playerTotals.length; i++){
            console.log(playerNames[i] +" has deployed " + playerTotals[i][0]+" troops.");
            if (playerTotals[i][1] > 0)
				console.log(playerNames[i] +" has received " + playerTotals[i][1]+" troops as autodeploys.");
		}
    }
    function printTeam(){
		/**
		Prints the amount of troops deployed and autodeployed to console per team.
		*/
        for (i = 0; i < nrPlayers; i = i+kindOfGame){
            deploys = 0;
			autodeploys = 0;
            for (j = i; j < i + kindOfGame; j++){
                deploys += parseInt(playerTotals[j][0]);
				autodeploys += parseInt(playerTotals[j][1]);
            }
            console.log("Team " +(j)/kindOfGame+" has deployed " + deploys + " troops.");
            if (autodeploys > 0)
				console.log("Team " +(j)/kindOfGame+" has received " + autodeploys + " troops as autodeploys.");
        }
    }

    window.onload = function(){
        info = document.getElementById('console_basic');
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
				if (kindOfGame.includes("Poly")){
					kindOfGame = parseInt(kindOfGame.split('(')[1]);
					nrTeams = 2;
					nrPlayers = 2 * kindOfGame;
				}
				else{
					nrTeams = nrPlayers;
					kindOfGame = 1;						
				}
                console.log(nrTeams);
                break;
        }
        
    }
    function populateTeams(){
		/**
		Initializes the playerNames array with the names of the players, and creates the playerTotals used for keeping track of units received array.
		*/
        info = document.getElementById('statsTable');
        var players = info.getElementsByClassName('player');
		playerTotals = [];
		offset = 1;
		if ($("span[title='Fog of War']").html() == "Fog")
			offset++;
        for (i=0; i < players.length - offset; i++){
            playerNames.push(players[i].innerHTML);
			playerTotals.push([]);
			playerTotals[i][0] = 0;
			playerTotals[i][1] = 0;
		}
        console.log(playerNames);
        console.log(playerTotals);
		
    }
})();
