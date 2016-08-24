'use strict';
module.exports = function(title, body) {
	return `<!DOCTYPE html>
	<html>
		<head>
			<title>${title}</title>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width">
		</head>
		<body>
			<div>${body}</div>
		</body>
	</html>`;
};
