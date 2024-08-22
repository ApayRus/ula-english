const fs = require('fs')
const path = require('path')

// Function to process txt files and separate timing
function processTxtFile(filePath, outputDir) {
	const fileContent = fs.readFileSync(filePath, 'utf-8')
	const lines = fileContent.split('\n')

	const timingContent = lines
		.map(line => {
			const [start, end, text] = line.split(/\s+/)
			return `${start}\t${end}`
		})
		.join('\n')

	const timingFilePath = path.join(
		outputDir,
		'time',
		path.relative(__dirname, filePath)
	)
	fs.mkdirSync(path.dirname(timingFilePath), { recursive: true })
	fs.writeFileSync(timingFilePath, timingContent)

	// Remove timing from the original txt file
	const textContent = lines
		.map(line => {
			const [, , ...text] = line.split(/\s+/)
			return text.join(' ')
		})
		.join('\n')

	fs.writeFileSync(filePath, textContent)
}

// Function to recursively traverse the file system and process files
function traverseAndProcessFiles(currentPath, outputDir) {
	const files = fs.readdirSync(currentPath)

	files.forEach(file => {
		const filePath = path.join(currentPath, file)

		if (fs.statSync(filePath).isDirectory()) {
			// If it's a directory, create the corresponding directory in the output directory
			fs.mkdirSync(
				path.join(outputDir, 'time', path.relative(__dirname, filePath)),
				{ recursive: true }
			)

			// Recursively traverse the subdirectory
			traverseAndProcessFiles(filePath, outputDir)
		} else {
			// If it's a txt file, process it; otherwise, copy html files to the output directory
			if (path.extname(filePath).toLowerCase() === '.txt') {
				processTxtFile(filePath, outputDir)
			} else if (path.extname(filePath).toLowerCase() === '.html') {
				const outputFilePath = path.join(
					outputDir,
					path.relative(__dirname, filePath)
				)
				fs.mkdirSync(path.dirname(outputFilePath), { recursive: true })
				fs.copyFileSync(filePath, outputFilePath)
			}
		}
	})
}

// Specify the input and output directories
const inputDir = 'en copy'
const outputDir = 'output'

// Create the output directory and time subdirectory if they don't exist
fs.mkdirSync(path.join(outputDir, 'time'), { recursive: true })

// Start the recursive traversal and processing
traverseAndProcessFiles(inputDir, outputDir)

console.log(
	'Files have been processed and separated. Timing files are in the "time" folder.'
)
