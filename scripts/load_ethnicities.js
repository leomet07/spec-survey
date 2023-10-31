import fs from "fs/promises";

const lines = String(await fs.readFile("ethnicities.txt")).split("\n");

console.log("Lines: ", lines.length);

for (const line of lines) {
	const options = {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ name: line }),
	};

	const req = await fetch(
		"http://127.0.0.1:8090/api/collections/ethnicities/records",
		options
	);
}
