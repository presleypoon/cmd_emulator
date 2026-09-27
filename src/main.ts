import "./style.css"

const TERMINAL = document.getElementById("terminal")! as HTMLTextAreaElement;
let dir: string = "";
let command: string = "";
let history: string = "C:\\";

window.addEventListener('keydown', std);
function std(e: KeyboardEvent): void {
	switch (e.key) {
		case "Backspace": {
			e.preventDefault();
			if (command.length > 0) command = command.slice(0, -1);
			break;
		}
		case "Enter": {
			try {
				e.preventDefault();
				run_command();
			} catch (err) {
				if (err instanceof Error) {
					history += err.stack;
					TERMINAL.value = history;
					window.removeEventListener('keydown', std);
					throw err;
				}
			}
			break;
		}
		case "Shift": {
			break;
		}
		default: {
			if (e.key.length === 1) {
				command += e.key;
				break;
			}
			
			console.error(`Key: "${e.key}" is not supported`);
			break;
		}
	}
	update();
}

function main(): void {
	update();
}

function run_command(): void {
	let this_command: string = command;
	history += `>${command}\n`;
	command = "";
	
	let args: string[] = this_command.trim().split(/\s+/);
	let op: string = args.shift()!;
	
	switch (op) {
		case "cls": {
			cls(args);
			break;
		}
		case "md":
		case "mkdir":
		{
			mkdir(this_command, op);
			break;
		}
		default: {
			history += `Command: "${op}" is not supported, please make sure it is supported`
			break;
		}
	}
	
	history += "\nC:\\" + dir;
}

function cls(args: string[]): void {
	if (args.length > 1) {
		history += "This command only has 0 or 1 arguments";
		return;
	}
	
	if (args.length === 0) {
		history = "";
		return;
	}
	
	if (args[0] !== "/?") {
		history += `This command is not supported by argument: "${args[0]}"`;
		return;
	}
	
	// args[0] === "/?"
	history += "Clears the screen.\n\nCLS\n";
}

function mkdir(command: string, op: string): void {
	let arg: string = get_md_args(command, op);
	let args: string[] = parse_md_args(arg);
}

function get_md_args(command: string, op: string): string {
	// trimmed_command
	let tmd_cmd: string = command.trimStart();
	
	if (op === "md" && tmd_cmd.startsWith("md")) return tmd_cmd.slice(2).trimStart();
	else if (op === "mkdir" && tmd_cmd.startsWith("mkdir")) return tmd_cmd.slice(5).trimStart();
	else throw new Error("Unreachable, only have 2 input but both are covered");
}

function parse_md_args(arg: string): string[] {
	throw new Error("To do");
}

function update(): void {
	TERMINAL.value = `${history}>${command}`;
}

main();
