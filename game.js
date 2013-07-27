// Clay.io API
var Clay = Clay || {};
Clay.gameKey = "holdthecloud";
Clay.readyFunctions = [];
Clay.ready = function( fn ) {
    Clay.readyFunctions.push( fn );
};
( function() {
    var clay = document.createElement("script");
    clay.src = ( "https:" == document.location.protocol ? "https://" : "http://" ) + "clay.io/api/api.js"; 
    var tag = document.getElementsByTagName("script")[0]; tag.parentNode.insertBefore(clay, tag);
} )();

	var achievements = [
	    {
		"id":278, 
		"points":10000
	    },
	    {
		"id":279, 
		"points":15000
	    },
	    {
		"id":280, 
		"points":20000
	    },
	    {
		"id":281, 
		"points":27000
	    }
	];
	// Game configuration variables
	var maxLevels = 13;
	var playTimePerLevel = 13;
	var waitTimePerLevel = 3;
	var toHoldKeycode = 13;

	// Canvas Object (Cloud image)
	var canvasWidth = 132;
	var canvasHeight = 300;
	var canvasInitHeight = 300;
	var canvas = $('cloud');
	var context = canvas.getContext('2d');

	// Cloid Image
	var cloudImage = new Image();
	cloudImage.onload = function() {
	    context.drawImage(cloudImage, 0, ($("sky").clientHeight / 2) - (cloudHeight / 2));
	};
	cloudImage.src = "images/cloud.png";
	var cloudHeight = 78;

	// Cloud height ranks and their points
	var votes = [
	    {
		"min":0, 
		"max":35,
		"points":0
	    },
	    {
		"min":36,
		"max":44,
		"points":1
	    },
	    {
		"min":45,
		"max":55,
		"points":5
	    },
	    {
		"min":56,
		"max":84,
		"points":1
	    },
	    {
		"min":85,
		"max":100,
		"points":0
	    }
	];

	// Other runtime variables
	var cloud;              // cloud object variable
	var timerId;            // Used by intervals
	var playLevel = false;  // Flag for playing and break time

	// Cloud Object Constructor
	function Cloud(level) {
	    this.image = cloudImage;
	    this.x = 0;
	    this.y = ($("sky").clientHeight / 2) - (cloudHeight / 2);
	    this.hold = false;  // Events flag
	    this.level = level; // Current game level
	}

	// Start Javascript shortcut functions
	function $(idElement) {
	    return document.getElementById(idElement);
	}

	function getHTML(idElement) {
	    return $(idElement).innerHTML;
	}

	function setHTML(idElement, content) {
	    $(idElement).innerHTML = content;
	}

	function display(idElement, type) {
	    $(idElement).style.display = type;
	}

	function hide(idElement) {
	    display(idElement, "none");
	}
	// End Javascript shortcut functions
	// Start Game shortcut functions
	// Keypress or touch events
	function keyEventHandler(event, touchMode, isHolding) {
	    var code;
	    if (!event) event = window.event;
	    if (event.keyCode) code = event.keyCode;
	    else if (event.which) code = event.which;
	    // If the key is the correct or it is tapping in a tablet or smartphone
	    if (code == toHoldKeycode || touchMode) 
	    {
		// Let's flag to rise the cloud
		cloud.hold = isHolding;
	    }
	}

	// Get the top limit for the cloud
	function getMaxY(level) {
	    return -1;
	}
	// Get the bottom limit for the cloud
	function getMinY(level) {
	    return $("sky").clientHeight - cloudHeight;
	}

	// Return the new calculated height for the bottom limit (decreasing)
	function getSkyLevelHeight(level) {
	    return canvasHeight = canvasHeight - (level / 250);
	}

	// Establish the calculated height above
	function setSkyHeight(px) {
	    $("sky").style.height = px + "px";
	}

	// Random generator. Used by the vibration of the cloud on rising
	function randomFromInterval(from,to) {
	    return Math.floor(Math.random()*(to-from+1)+from);
	}

	// Sum the new points and update the total
	function addPoints(newPoints) {
	    setHTML("points", parseInt(getHTML("points")) + newPoints);
	}

	// Get the points in integer format
	function getPoints() {
	    return parseInt($("points").innerHTML);
	}

	// Print the points gained
	function showPoints(value) {
	    if (getHTML("points-report") == '')
	    {
		display("points-report", "inline");
		setHTML("points-report", value);
		setTimeout("setHTML('points-report', '')", 600);
		setTimeout("hide('points-report')", 600);
	    }
	}
	// End Game shortcut functions

	// The Game starts!
	function initialize() {   
	    hide("levels");
	    setHTML("points", 0);
	    display("points", "inline");
	    display("points-label", "inline");
	    canvasHeight = canvasInitHeight;
	    setSkyHeight(canvasInitHeight);
	    startLevel(1);
	}

	function startLevel(level) {
	    // Turn on the play flag
	    playLevel = true;
	    // Respawn the object
	    cloud = new Cloud(level);
	    // Show the new level
	    setHTML("level-number", level);
	    // Create the game interval
	    var counter = playTimePerLevel;
	    timerId = setInterval(function() {
		counter--;
		// If countdown play ends, the level ends too!
		if (counter < 1) {
		    clearInterval(timerId);
		    endLevel();
		} else {
		    // Gameplay information
		    setHTML("level-timer", "Hold on during " + counter.toString() + " seconds!");
		}
	    }, 1000);
	    // Render
	    updateGame();
	    // Clay.io Achievement #282 - Pass level 1 (start 2)
            if (level == 2) {
	    	Clay.ready( function() {
			( new Clay.Achievement( { id: 282 } ) ).award();
	    	} );
	    }
	}

	function endLevel() {
	    // Turn off the game flag
	    playLevel = false;
	    // The level finish
	    setHTML("level-timer", "Well done!");
	    // If there is no more levels, you win
	    if (cloud.level == maxLevels)
	    {
		// End of the game!		
		finishGame();
		// Final
		setHTML("level-timer", "Congratulations! You win this time");
	    }
	    else
	    {
		// Is there more levels? OK, let's go on'
		var nextLevel = cloud.level + 1;
		// Create the wait for next level interval
		var counter = waitTimePerLevel;
		timerId = setInterval(function() {
		    counter--;
		    // If countdown wait ends, the next level starts!
		    if (counter < 1) {
		        clearInterval(timerId);
		        startLevel(nextLevel);
		    } else {
		        // If not, take a short break
		        setHTML("level-timer", "Get ready! Level " + nextLevel + " starts in " + counter.toString() + " seconds.");
		        // Restart cloud position for next level (center the cloud)
		        cloud = new Cloud(nextLevel);
		        // and refresh it
		        render();
		    }
		}, 1000); 
	    }
	}

	// Game engine
	function updateGame() {
	    // Handle the user controls
	    processUserInput();
	    // Simply to refresh the objetcs
	    render();
	    // Each 24 ms, game runs 
	    if (playLevel)
		setTimeout(updateGame, 24);
	}

	// User control handler
	function processUserInput() {
	    // If the cloud touch the top or bottom limit, game over
	    if (cloud.y < getMaxY(cloud.level) || cloud.y > getMinY(cloud.level))
	    {
		gameOver();
	    }
	    else
	    {
		// Else update the cloud position
		// Did the user press the key or tap the sky?
		if (cloud.hold)
		{
		    // Yes, rise the cloud
		    cloud.y = cloud.y - 1 + (cloud.level / 1000);
		    // and a bit vibration (horizontal movements)
		    cloud.x = randomFromInterval(-3, 3);
		}
		else
		{
		    // No, so let fall it
		    cloud.y = cloud.y + 3;
		    // and no vibration while falls
		    cloud.x = 0;
		}
		// Calculate the points
		var points = getPointsFromAccuraty((cloud.y + (cloudHeight/2))/2, canvasHeight/2);
		// And handle the points
		addPoints(points);
		// Check points for achievements
		unlockAchievements(points);
	    }
	}

	// Calculate the points from the cloud position
	function getPointsFromAccuraty(number, target)
	{
	    // Calculates the percent of accuraty
	    var percent = Math.round(number * 100 / target);
	    // Search the percent rank in the votes variable (please, check it at start)
	    for (rank in votes)
	    {
		// Found it!
		if (percent >= votes[rank].min && percent <= votes[rank].max)
		{
		    // Get his points
		    var points = votes[rank].points;
		    // Only if the cloud is in the best rank, show "PERFECT!" label
		    if (points == 5)
		        showPoints("PERFECT!");
		    // Anyway, return the points from his position
		    return points;
		}
	    }
	}

	// Update the visualization
	function render() {
	    // Make shorter the sky
	    setSkyHeight(getSkyLevelHeight(cloud.level));
	    // Refresh the cloud position (after events)
	    context.clearRect(0, 0, canvasWidth, canvasHeight);  
	    context.drawImage(cloud.image, cloud.x, cloud.y);
	}

	// The game ends!
	function gameOver() {
	    // End of the game!
	    finishGame();
	    // Display the gameover message
	    setHTML("level-timer", "FAIL! Play one more time and try again ;-)");
	    display("levels","block");

	}

	function finishGame() {
	    // Turn off the game flag
	    playLevel = false;
	    // Delete the game interval
	    clearInterval(timerId);
	    // Clay.io Leaderboard
	    Clay.ready( function() {
		    // First, push the player's points
		    postScore();
		    // Then show the game leaderboard
		    showLeaderboard();
		    // Show the achievements
		    Clay.Achievement.showAll();
	    } );
	}

	// Clay.io functions
	function postScore() {
		var leaderboard = new Clay.Leaderboard( { id: 304 } );
	    leaderboard.post( { score: $("points").innerHTML }, function( response ) {
		console.log( response );
	    } );
	}

	function showLeaderboard() {
		var leaderboard = new Clay.Leaderboard( { id: 304 } );
		var options = { // all of these are optional
			    recent: 7200, // Optional, to limit scores to ones posted in last x seconds
			    sort: 'asc', // Optional, sorting by "asc" will show the lowest scores first (ex. for fastest times)
			    filter: ['day', 'month'], // Optional, Array of filters to narrow down high scores
			    cumulative: false, // Optional, if set to true grabs the sum of all scores for each player
			    limit: 10, // Optional, how many scores to show (0 for all). Default is 10
			    self: false, // Optional, Boolean if set to true shows just the scores of the player viewing
			    friends: false, // Optional, Boolean if set to true shows just the scores of the player viewing AND their Clay.io friends
			    showPersonal: true // Optional, Boolean on if the player's stats (rank & high score) should show below the name. Default is false
			};
			var callback = function( response ) { // Optional
			    console.log( response );
			};
			leaderboard.show( options, callback );
	}

	function unlockAchievements() {
		Clay.ready( function() {
		    // Comparing the current points with achievements' points
		    var points = getPoints();
		    for (value in achievements)
		    {
			// Found it!
			if (points >= achievements[value].points-5 && points <= achievements[value].points+5)
			{
			    // Unlock the achievement
			    ( new Clay.Achievement( { id: achievements[value].id } ) ).award();
			    return true;
			}
		    }    
		} );
	}
