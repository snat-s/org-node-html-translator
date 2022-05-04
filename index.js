fs = require('fs')
const args = process.argv.slice(2);
//console.log(args);
const file = args[0] || './sample';

function parseNormalLine(line) {

	let parsedLine = "";
	for (let i = 0; i < line.length; i++) {
		switch (line.charAt(i)) {
			case '*': {
				i++;
				parsedLine += "\<b\>";
				//console.log(parsedLine);
				while (line[i] != '*') {
					parsedLine += line[i]
					i++;
				}

				parsedLine += "\<\/b\> ";
				//console.log(parsedLine);
			} break;
			case '/': {
				i++;
				parsedLine += "\<em\>";
				while (line[i] != '/') {
					parsedLine += line[i]
					i++;
				}
				i++;
				parsedLine += "\<\/em\> "
			} break;
			case '=': {
				i++;
				parsedLine += "\<code\>";
				while (line[i] != '=') {
					parsedLine += line[i]
					i++;
				}
				i++;
				parsedLine += "\<\/code\> "
			} break;
			case '\[': {
				if (line[i + 1] == '[') {
					let currentParsing = "";
					for (let j = i + 2; j < line.length - 1; j++) {
						//console.log(j);
						 if (line[j] == ']' && line[j + 1] != ']') {
							// we have a hyperlink
							let k = j + 1;
							while (line[k] != '[' && k < line.length) k++;
							k++;
							let description = "";
							while (line[k] != ']' && k < line.length) {
								description += line[k];
								k++;
							}
							 k++;
							i = j = k;
							
							parsedLine = parsedLine + '\<a href=\"' + currentParsing + '\"> ' + description + '<\/a>';
							 break;
						}
						currentParsing += line[j];
					}
				}
			} break;
			default: {
				parsedLine += line[i];
			}
		}
		//console.log(line[i]);
	}
	//console.log(`Esta es la línea parseada: \n${parsedLine}\nLínea normal:\n ${line}`);
	return parsedLine;
}

function parseForLinks(line) {
	let parsedLine = "";
	//console.log(line);
	for (let i = 0; i < line.length - 1; i++) {

		if (line[i] == '[' && line[i + 1] == '[') {

			for (let j = i + 2; j < line.length - 1; j++) {
				if (line[j] == ']' && line[j + 1] == ']') {
					// we have a picture
					return '\<img src=\"' + parsedLine + '\" alt=\"' + parsedLine + '\"\>';
				} else if (line[j] == ']' && line[j + 1] != ']') {
					// we have a hyperlink

					let k = j + 1;
					while (line[k] != '[')
						k++;
					k++;
					let description = "";
					while (line[k] != ']') {
						description += line[k];
						k++;
					}
					return '\<a href=\"' + parsedLine + '\"> ' + description + '<\/a>';
				}
				parsedLine += line[j];
				i = j;
			}

		}
	}
	return line;
}

try {
	const data = fs.readFileSync(file + '.org', 'utf8');
	const lines = data.split(/\r?\n/);
	let body = "\<body\>\n \<div id=\"content\"\>\n";
	let headerMetadata = "\<head\>"
		+ "\n\<meta charset=\"utf-8\"\>\n"
		+ "\<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"\/\>"
		+ "\n\<link rel=\"stylesheet\"href=\"https://cdn.simplecss.org/simple.min.css\">\n";
	let footer = "\<footer\>\n";
	// adding content
	for (let i = 0; i < lines.length; i++) {
		// titles and subtitles
		//console.log(i);
		if (lines[i] === '' || lines[i] === '\n') {
			continue;
		}
		if (lines[i][0] == '*') {
			let headerNumber = 0;
			while (lines[i][headerNumber] === '*') {
				headerNumber++;
			}
			//FIXME: finish this case for a normal line.
			/*if(lines[i][headerNumber+1] !== ' ') {
				body += parseNormalLine(lines[i]);
				continue;
			}*/
			let title = "";
			for (let j = headerNumber + 1; j < lines[i].length; j++) {
				title += lines[i][j];
			}
			body += '\<h' + headerNumber + '\>' + title + '\<\/h' + headerNumber + '\>\n';
		}
		// bullet lists
		// TODO: embedded lists
		else if (lines[i][0] === '-' || lines[i][0] === '+') {
			body += "\n\<ul\>\n";
			while (lines[i][0] === '-' || lines[i][0] === '+' && i < lines.length) {
				body += "\<li\>";
				let line = "";
				for (let j = 2; j < lines[i].length; j++) {
					line += lines[i][j];
				}
				body += line;
				body += "\<\/li\>\n";
				i++;
			}
			body += "\<\/ul\>\n";
		}
		// DONE: numbered bullet lists
		else if (lines[i][0] >= '0' && lines[i][0] <= '9') {
			let j = 0;
			while (lines[i][j] >= '0' && lines[i][j] <= '9') j++;
			if (lines[i][j] != '.') {
				//console.log(lines[i][j]);
				body += '\n<p>'+ parseNormalLine(lines[i]) + '<\/p>\n';
				continue;
			}
			body += "\n\<ol\>\n";
			//console.log("Mi mama me quiere");
			while (lines[i][0] >= '0' && lines[i][0] <= '9' && i < lines.length) {
				let j = 0;
				//console.log('HOLA' + i);
				let currentLine = "\<li\>";
				while (lines[i][j] >= '0' && lines[i][j] <= '9') j++;
				if (lines[i][j] != '.') {
					//console.log(lines[i][j]);
					body += '\n<p>'+ parseNormalLine(lines[i])+'<\/p>\n';
					continue;
				}
				j++;
				for (; j < lines[i].length; j++) {
					currentLine += lines[i][j];
				}
				currentLine += "\<\/li\>\n";
				//console.log(currentLine);
				body += currentLine;
				i++;
			}
			body += "\<\/ol\>\n"
		}
		// header or comment
		else if (lines[i][0] === '#') {
			if (lines[i][1] === ' ') {
				// this is a comment
				continue;
			} else {
				let parsedValue = "", j = 0, content = "";
				while (lines[i][j] !== ':') {
					parsedValue += lines[i][j];
					j++;
				}
				j++;
				for (; j < lines[i].length; j++) {
					content += lines[i][j];
				}
				if (parsedValue === "#+title") {
					//console.log("soy un titulo");
					headerMetadata += "\<title\>" + content + "\<\/title\>\n"
				}
				else if (parsedValue === "#+author") {
					footer += content;
					headerMetadata += "\<meta name=\"author\" content=\"" + content + " \"\>"
					continue;
				}
				else if (parsedValue === "#+date") {
					footer += content;
				}
			}
		}
		// tables
		else if (lines[i][0] == '|') {
			/*body += "\<table\>";
			
			while() {
				
			}
			body += "\<\/table\>";*/
		}
		// images
		else if (lines[i][0] == '\[') {
			body += '\n' + parseForLinks(lines[i]) + '\n';
		}
		// Texto normal
		// 	FIXME: que las líneas no sean solo de una sola frase larga y puedan ser múltiples líneas.
		else {

			//currentLine = parseForLinks(lines[i]);
			body += '\n\<\/p\>' + parseNormalLine(lines[i]) + "\<\/p\>\n";
		}
		//if (i > lines.length) break;
	}
	footer += "\n\<\/footer\>";
	headerMetadata += "\n\<\/head\>\n\n";
	body += "\n\<\/div>\n\<\/body\>\n\n";
	body = headerMetadata + body + footer;
	//console.log(body);
	fs.writeFileSync(file + '.html', body);
} catch (err) {
	console.log(err);
}