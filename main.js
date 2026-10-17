const TERMINAL = document.getElementById("terminal");
let dir = "";
let command = "";
let history = "CMD Emulator [Version 0.3.0]\n(c) Presley Poon. All rights reserved.\nIf this is an old version, ctrl + f5 (or cmd + shift + r) it\n\nC:\\";

window.addEventListener('keydown', key_list);
function key_list(e) {
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
				history += `${err.stack}\ndir: ${dir}`
				TERMINAL.value = history;
				window.removeEventListener('keydown', key_list);
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
		if (this.content.get(name) !== undefined) throw new Error(`mk don't allow rewriting and ${name} already exist`);
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
		if (name === "") return self;
		return this.content.get(name);
	}
	
	get_dir(this_dir) {
		if (this_dir === "") return contents;
		let files = this_dir.split("\\");
		let local = contents;
		for (let i = 0; i < files.length; i++) {
			let file = files[i];
			if (file === "") continue;
			local = local.get(file);
			if (local === undefined) return undefined;
		}
		return local;
	}
}
let contents = new File(new Map());

function main() {
	update();
}

function find_parent_dir(this_dir) {
	if (this_dir === "") return "";
	
	let folders = this_dir.split("\\");
	folders.pop();
	folders.pop();
	folders.push("");
	return folders.join("\\");
}

function find_parent(this_dir) {
	return contents.get_dir(find_parent_dir(this_dir));
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
		case "cd":
		case "chdir":
		{
			chdir(this_command, op);
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

function chdir(command, op) {
	let args = get_cd_args(command, op);
	if (args.trimStart().startsWith("/?")) {
		history += "Displays the name of or changes the current directory.\n\nCHDIR [/D] [drive:][path]\nCHDIR [..]\nCD [/D] [drive:][path]\nCD [..]\n\n\t..\tSpecifies that you want to change to the parent directory.\n\nType CD drive: to display the current directory in the specified drive.\nType CD without parameters to display the current drive and directory.\n\nUse the /D switch to change current drive in addition to changing current directory for a drive.\n\nIf Command Extensions are enabled CHDIR changes as follows:\n\nThe current directory string is converted to use the same case as the on disk names.\tSo CD C:\\TEMP would actually set the current directory to C:\\Temp if that is the case on disk.\n\nCHDIR command does not treat spaces as delimiters, so it is possible to CD into a subdirectory name that contains a space without surrounding the name with quotes.\tFor example:\n\n\tcd \\winnt\\profiles\\username\\programs\\start menu\n\nis the same as:\n\n\tcd \"\\winnt\\profiles\\username\\programs\\start menu\"\n\nwhich is what you would have to type if extensions were disabled.";
		return;
	}
	if (args.trim() === "") {
		history += `C:\\${dir}\n`;
		return;
	}
	let cd_dir = parse_cd_args(args);
	run_cd(cd_dir);
}

function get_cd_args(command, op) {
	// trimmed_command
	let tmd_cmd = command.trimStart();
	
	if (op === "cd" && tmd_cmd.startsWith("cd")) return tmd_cmd.slice(2).trimStart();
	else if (op === "chdir" && tmd_cmd.startsWith("chdir")) return tmd_cmd.slice(5).trimStart();
	else throw new Error("Unreachable, only have 2 inputs and both are covered");
}

function parse_cd_args(args) {
	let ret = "";
	let str_t = undefined;
	let str_count = 0;
	
	for (let i = 0; i < args.length; i++) {
		let char = args[i];
		switch (char) {
			case '"': {
				switch (str_t) {
					case undefined: {
						str_t = '"';
						str_count++;
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
						str_count++;
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
			default: {
				ret += char;
				break;
			}
		}
	}
	
	if (str_count > 1) throw new Error(`There's too many param: ${args}`);
	
	return ret;
}

function run_cd(cd_dir) {
	let split_dir = cd_dir.split("\\");
	let local = contents.get_dir(dir);
	let local_dir = dir;
	for (let i = 0; i < split_dir.length; i++) {
		let this_dir = split_dir[i];
		if (this_dir === "" && i === 0) {
			local = contents
			local_dir = "";
		} else if (this_dir === "..") {
			local = find_parent(local_dir);
			local_dir = find_parent_dir(local_dir);
		} else {
			if (typeof local.content === "string") {
				history += "This directory name is invalid."
				return;
			}
			local = local.get(this_dir);
			local_dir += `${this_dir}\\`;
		}
		if (local === undefined) {
			history += "The system cannot find the path specified";
			return;
		}
	}
	dir = local_dir;
}

function mkdir(command, op) {
	let args = get_md_args(command, op);
	let new_dir = parse_md_args(args);
	if (new_dir[0] === "/?") {
		history += "Creates a directory.\n\nMKDIR [drive:]path\nMD [drive:]path\n\nIf Command Extensions are enabled MKDIR changes as follows:\n\nMKDIR creates any intermediate directories in the path, if needed.\nFor example, assume \\a does not exist then:\n\n\tmkdir \\a\\b\\c\\d\n\nis the same as:\n\n\tmkdir \\a\n\tchdir \\a\n\tmkdir b\n\tchdir b\n\tmkdir c\n\tchdir c\n\tmkdir d\n\tchdir ..\\..\\..\n\nwhich is what you would have to type if extensions were disabled.";
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
	
	for (let i = 0; i < args.length; i++) {
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

function mk_md_folders(new_folders) {
	let local = contents.get_dir(dir);
	let path = dir;
	for (let i = 0; i < new_folders.length; i++) {
		let bs_local = local;
		if (new_folders[i].includes("\\")) {
			let files = new_folders[i].split("\\");
			for (let j = 0; j < files.length; j++) {
				let file = files[j];
				let this_local = bs_local.get(file);
				path += file;
				if (j === 0 && file === "") {
					this_local = contents;
					path = "";
				}
				if (this_local === undefined) bs_local.mk(file, new File(new Map()));
				if (file === "..") {
					bs_local = find_parent(path);
					path = find_parent_dir(path);
				} else bs_local = bs_local.get(file);
			}
		} else local.mk(new_folders[i], new File(new Map()));
	}
}

function update() {
	TERMINAL.value = `${history}>${command}`;
}

main();
