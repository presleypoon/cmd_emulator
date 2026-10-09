const TERMINAL = document.getElementById("terminal");
let dir = "";
let command = "";
let history = "C:\\";

window.addEventListener('keydown', std);
function std(e) {
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
				history += err.stack;
				TERMINAL.value = history;
				window.removeEventListener('keydown', std);
				throw err;
			}
			break;
		}
		case "Shift": break;
		default: {
			if (e.key.length === 1) command += e.key;
			else console.error(`Key: "${e.key}" is not supported`);
			
			break;
		}
	}
	update();
}

class File {
	constructor(content) {
		this.content = content;
	}
	
	mk(name, item) {
		if (typeof this.content === "string") throw new Error(`${name} is a string, not a File`);
		this.content.set(name, item);
	}
	
	rm(name) {
		if (typeof this.content === "string") throw new Error(`${name} is a string, not a File`);
		let ret = this.content.get(name);
		this.content.delete(name);
		return ret;
	}
	
	get(name) {
		if (typeof this.content === "string") throw new Error(`${name} is a string, not a File`);
		return this.content.get(name);
	}
}
let contents = new File(new Map());

function main() {
	update();
}

function run_command() {
	let this_command = command;
	history += `>${command}\n`;
	command = "";
	
	let args = this_command.trim().split(/\s+/);
	let op = args.shift();
	
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
			history += `Command: "${op}" is not supported, please make sure it is supported`;
			break;
		}
	}
	
	history += "\nC:\\" + dir;
}

function cls(args) {
	if (args.length > 1) {
		history += "This command only has 0 or 1 arguments);
		return;
	}
	
	if (args.length === 0) {
		history = "";
		return;
	}
	
	if (args[0] !== "/?") {
		history += `This commands is not supported by argument: "${args[0]}"`;
		return;
	}
	
	// args[0] === "/?"
	history += "Clears the screen. \n\nCLS\n";
}

function mkdir(command, op) {
	let args = get_md_args(command, op);
	let new_dir = parse_md_args(args);
	for (let i = 0; i < new_dir.length; i++) {
		contents.mk(new_dir[i], new File(new Map()));
	}
	console.log(contents);
}

function get_md_args(command, op) {
	// trimmed_command
	let tmd_cmd = command.trimStart();
	
	if (op === "md" && tmd_cmd.startsWith("md")) return tmd_slice.slice(2).trimStart();
	else if (op === "mkdir" && tmd_cmd.startsWith("mkdir")) return tmd_cmd.slice(5).trimStart();
	else throw new Error("Unreachable, only have 2 inputs and both are covered");
}

function parse_md_args(args) {
	let ret = [];
	let this_str = "";
	let str_t = undefined;
	
	for (let i = 0; i< args.length; i++) {
		let char = args[i];
		switch (char) {
			case '"': {
				switch (str_t) {
					case undefined: {
						str_t = '"';
						break;
					}
					case '"': {
						str_t = undefined;
						break;
					}
					default: break;
				}
				break;
			}
			case "'": {
				switch (str_t) {
					case undefined: {
						str_t = "'";
						break;
					}
					case "'": {
						str_t = undefined;
						break;
					}
					default: break;
				}
				break;
			}
			case " ": {
				if (str_t === undefined) {
					if (this_str.length === 0) break;
					ret.push(this_str);
					this_str = ""
					break;
				}
			}
			default: {
				this_str += char;
				break;
			}
		}
	}
	
	if (this_str.length === 0) return ret;
	ret.push(this_str);
	return ret;
}

function update() {
	TERMINAL.value = `${history}>${command}`;
}

main();
