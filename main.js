const TERMINAL = document.getElementById('terminal');
let dir = "";
let command = "";
let history = "C:\\";

window.addEventListener('keydown', e => {
	switch (e.key) {
		case "Backspace": {
			e.preventDefault();
			console.log(command);
			console.log(command.slice(0, -1));
			console.log(command.length);
			if (command.length > 0) command = command.slice(0, -1);
			break;
		}
		case "Enter": {
			e.preventDefault();
			run_command();
			break;
		}
		case "a":
		case "b":
		case "c":
		case "d":
		case "e":
		case "f":
		case "g":
		case "h":
		case "i":
		case "j":
		case "k":
		case "l":
		case "m":
		case "n":
		case "o":
		case "p":
		case "q":
		case "r":
		case "s":
		case "t":
		case "u":
		case "v":
		case "w":
		case "x":
		case "y":
		case "z":
		case "A":
		case "B":
		case "C":
		case "D":
		case "E":
		case "F":
		case "G":
		case "H":
		case "I":
		case "J":
		case "K":
		case "L":
		case "M":
		case "N":
		case "O":
		case "P":
		case "Q":
		case "R":
		case "S":
		case "T":
		case "U":
		case "V":
		case "W":
		case "X":
		case "Y":
		case "Z":
		{
			command += e.key;
		}
	}
	
	console.log(e.key);
	
	update();
});

function main() {
	update();
}
function run_command() {
	let this_command = command;
	history += '>' + command + '\n' + "C:\\" + dir;
	command = "";
}
function update() {
	TERMINAL.value = history + '>' + command;
}

main();
