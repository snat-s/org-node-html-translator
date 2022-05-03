fs = require('fs')
// ADDME
/* const GlobalVariables = [
	title: '#+title:',
	author: '#+author:',
	date: '#+date:',
	begin_src: '#+begin_src',
	end_src: '#+end_src'
] */

try {
	const data = fs.readFileSync('./sample.org', 'utf8');
	const lines = data.split(/\r?\n/);
	let finalResult = "\<body\>\n";
	let headerMetadata = "\<header\>"
		+ "\n\<meta charset=\"utf-8\"\>\n" 
		+ "\<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\\/\>" 
		+ "\n\<link rel=\"stylesheet\"href=\"https://cdn.simplecss.org/simple.min.css\">\n";
	let footer = "\<footer\>\n";
	// adding content
	for(let i = 0; i < lines.length; i++) {
		// titles and subtitles
		if(lines[i] === '' || lines[i] === '\n') {
			continue;
		}
		if(lines[i][0] == '*') {
			let headerNumber = 0;
			while(lines[i][headerNumber] === '*') {
				headerNumber++; 
			}
			let title = "";
			for(let j = headerNumber+1; j < lines[i].length; j++) {
				title+=lines[i][j];
			}
			finalResult += '\<h' + headerNumber +'\>' + title +'\<\/h' + headerNumber + '\>\n';
		} 
		// bullet lists
		// TODO: embedded lists
		else if(lines[i][0] === '-' || lines[i][0] === '+') {
			finalResult += "\n\<ul\>\n";
			while(lines[i][0] === '-' || lines[i][0] === '+') {
				finalResult += "\<li\>";
				let line = "";
				for(let j = 2; j < lines[i].length; j++) {
					line+=lines[i][j];
				}
				finalResult += line;
				finalResult += "\<\/li\>\n";
				i++;
			}
			finalResult += "\<\/ul\>\n";
		}
		// TODO: numbered bullet lists
		else if(lines[i][0] >= '0' && lines[i][0] <= '9') {
			
			finalResult += "\n\<ul\>\n";
			while(lines[i][0] >= '0' && lines[i][0] <= '9' && i < lines.legth) {
				let j = 0;
				console.log(`Estoy aquí`,i);
				let currentLine = "\<ol\>";
				while(lines[i][j] >= '0' && lines[i][j] <= '9') j++;
				if(lines[i][j] !== '.') {
					console.log(lines[i][j]);
					break;
				}
				j++;
				for(; j < lines[i].length; j++) {
					currentLine += lines[i][j];
				}
				currentLine += "\<\/ol\>\n";
				console.log(currentLine);
				finalResult += currentLine;
				i++;
			}
			finalResult += "\<\/ul\>\n"
		}
		// header or comment
		else if(lines[i][0] === '#') {
			if(lines[i][1] === ' ') {
				// this is a comment
				continue;
			} else {
				let parsedValue = "", j = 0, content = "";
				while(lines[i][j] !== ':') {
					parsedValue += lines[i][j];
					j++;
				}
				j++;
				for(; j < lines[i].length; j++) {
					content += lines[i][j];
				}
				if(parsedValue === "#+title") {
					//console.log("soy un titulo");
					headerMetadata += "\<title\>"+ content +"\<\/title\>\n"				
				}
				else if(parsedValue === "#+author") {
					footer += content;
					headerMetadata += "\<meta name=\"author\" content=\"" + content + " \"\>"
					continue;
				}
				else if(parsedValue === "#+date") {
					footer += content;
				}
			}
		}
		// Texto normal
			// 	FIXME: que las líneas no sean solo de una sola frase larga y puedan ser múltiples líneas.
		else {
			finalResult += '\n\<\/p\>' + lines[i] +  "\<\/p\>\n";
		}
		if(i > lines.length) break;
	}
	footer += "\n\<\/footer\>";
	headerMetadata += "\n\<\/head\>\n\n";
	finalResult += "\n\<\/body\>\n\n";
	finalResult = headerMetadata + finalResult + footer;
	console.log(finalResult);
	fs.writeFileSync('sample.html', finalResult);
} catch (err) {
	console.log(err);
}