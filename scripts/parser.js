/** @constant {Object<String,String>} Map of spreadsheet column headings to project object field names */
const COLUMN_FIELD_MAP = {
	'Title': 'title',
	'Section': 'section',
	'Status': 'status',
	'Construction type': 'constructionType',
	'Est. Construction Start': 'constructionStartDate',
	'Est. Completion': 'completionDate',
	'City/Bos. Neighborhood': 'cityOrNeighborhood',
	'Owner': 'owners',
	'Designer': 'designer',
	'Constructor': 'constructor',
	'Point(s) Of Contact': 'contacts',
	'Website': 'website'
};

/**
 * Convert each spreadsheet row to a project object.
 * @param {Array<Object>} spreadsheetRows
 * @returns {Array<Object>}
 */
export function parseProjects(spreadsheetRows) {
	const columnLetters = identifyColumnFields(spreadsheetRows[0]);
	
	let projects = [];
	
	spreadsheetRows.forEach((row, i) => {
		// If this is the heading row or there is no project status, skip the row.
		if (i === 0 || !row[columnLetters.status]) { return; }
		
		let project = parseProject(row, columnLetters);
		if (!project.title && project.section) {
			// If fields are blank, but this project has multiple sections, assume it is a section of the last project.
			const lastProject = projects.at(-1);
			for (const field of ['title', 'cityOrNeighborhood', 'owners', 'contacts', 'website']) {
				project[field] = project[field] || lastProject[field];
			}
		}
		// If there is still no title, skip the row.
		if (!project.title) { return; }
		
		// If there are multiple websites, take the first.
		project.website = project.website?.split('\n')[0];
		
		// Convert owner(s) list to array.
		project.owners = splitOwnersString(project.owners || '');
		
		projects.push(project);
	});
	
	return projects;
}

/**
 * Identify which spreadsheet column carries which field.
 * @param {Object} firstRow
 * @returns {Object<String,String>} A map of project object field name to column letter
 */
function identifyColumnFields(firstRow) {
	let columnLetters = {};
	for (let [columnLetter, columnHeading] of Object.entries(firstRow)) {
		const columnField = COLUMN_FIELD_MAP[columnHeading];
		columnLetters[columnField] = columnLetter;
	}
	return columnLetters;
}

/**
 *
 * @param {Object} spreadsheetRow
 * @param {Object<String,String>} columnLetters
 * @returns {Object} Project object
 */
function parseProject(spreadsheetRow, columnLetters) {
	let project = {};
	for (let field of Object.values(COLUMN_FIELD_MAP)) {
		project[field] = spreadsheetRow[columnLetters[field]];
	}
	return project;
}

/**
 * Convert owner(s) list to array and un-reverse "X, City of" entries.
 * @param {String} ownersString
 * @returns {Array<String>}
 */
function splitOwnersString(ownersString) {
	// If this was already parsed to an array (copied from a previous row), skip.
	if (Array.isArray(ownersString)) { return ownersString }
	
	return ownersString
		// First, extract and un-reverse entries in quotes.
		.replaceAll(/"(.+?)"/g, (match, captGroup) => captGroup.split(', ').reverse().join(' '))
		// Then, any other comma should be separating entries.
		.split(', ');
}
