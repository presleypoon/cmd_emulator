const TERMINAL = document.getElementById("terminal");
let dir = "";
let command = "";
let history = "CMD Emulator [Version 0.2pr2]\n(c) Presley Poon. All rights reserved.\nIf this is an old version, ctrl + f5 (or cmd + shift + r) it\n\nC:\\";

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
		// content: string | Map<string, File>
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
	
	get_dir(dir) {
		let files = dir.split("\\");
		let local = contents;
		for (let i = 0; i < files.length; i++) {
			let file = files[i];
			let local = local.get(file);
			if (local === undefined) return undefined;
		}
		return local;
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
		history += "This command only has 0 or 1 arguments)";
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
	if (new_dir[0] === "/?") {
		history += "Creates a directory.\n\nMKDIR [drive:]path\nMD [drive:]path\n\nIf Command Extensions are enabled MKDIR changes as follows:\n\nMKDIR creates any intermediate directories in the path, if needed.\nFor example, assume \\a does not exist then:\n\n\tmkdir \\a\\b\\c\\d\n\nis the same as:\n\n\tmkdir \\a\n\tchdir\\a\n\tmkdir b\n\tchdir b\n\tmkdir c\n\tchdir c\n\tmkdir d\n\tchdir ..\\..\\..\n\nwhich is what you would have to type if extensions were disabled.";
		return;
	}
	mk_md_folders(new_dir);
	console.log(contents);
}

function get_md_args(command, op) {
	// trimmed_command
	let tmd_cmd = command.trimStart();
	
	if (op === "md" && tmd_cmd.startsWith("md")) return tmd_cmd.slice(2).trimStart();
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

function mk_md_folders(new_dir) {
	let local = contents.get_dir(dir);
	for (let i = 0; i < new_dir.length; i++) {
		let bs_local = local;
		if (new_dir[i].includes("\\")) {
			let files = new_dir[i].split("\\");
			for (let j = 0; j < files.length; j++) {
				let file = files[j];
				let this_local = bs_local.get(file);
				if (this_local === undefined) bs_local.set(file, new File(new Map()));
				bs_local = bs_local.get(file);
			}
		} else local.mk(new_dir[i], new File(new Map()));
	}
}

function update() {
	TERMINAL.value = `${history}>${command}`;
}

main();
