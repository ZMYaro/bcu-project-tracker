/** @constant {Object<String,Number>} Map of text project status to progress bar number */
const STATUS_NUMBER_MAP = {
	'?': -1,
	'Unannounced': -1,
	'Proposed': 0,
	'Announced': 0,
	'Pre-25% design': 1,
	'25% design': 2,
	'75% design': 3,
	'100% design': 4,
	'Under construction': 5,
	'Complete': 6,
	'Partially undone': 5,
	'Undone': 0
};

/**
 * 
 * @param {Array<Object>} projects
 */
export function renderProjects(projects) {
	const currentProjectsHTML = projects
			.filter((project) => STATUS_NUMBER_MAP[project.status] >= 0 && STATUS_NUMBER_MAP[project.status] < STATUS_NUMBER_MAP['Complete'])
			.map(generateProjectHTML)
			.join(''),
		completedProjectsHTML = projects
			.filter((project) => STATUS_NUMBER_MAP[project.status] === STATUS_NUMBER_MAP['Complete'])
			.map(generateProjectHTML)
			.join(''),
		futureProjectsHTML = projects
			.filter((project) => STATUS_NUMBER_MAP[project.status] < 0)
			.map(generateProjectHTML)
			.join('');
	
	document.getElementById('projects').innerHTML = `
		<hr />
		<h2>Current Projects</h2>
		${currentProjectsHTML}
		<hr />
		<h2>Completed Projects</h2>
		${completedProjectsHTML}
		<hr />
		<h2>Future/Desired Projects</h2>
		${futureProjectsHTML}
	`;
}

/**
 * 
 * @param {Object} project
 * @returns {String}
 */
function generateProjectHTML(project) {
	// TODO: Sanitize text from spreadsheet
	return `<details>
		<summary>
			<h3>${project.title}${project.section ? ` &ndash; ${project.section}` : ''}</h3>
			${project.website && project.website !== 'N/A' ? `<a href="${project.website}" target="_blank">🌐</a>`: ''}
			<progress min="0" max="7" value="${STATUS_NUMBER_MAP[project.status]}"></progress>
			<small class="project-status-text">${project.status}</small>
		</summary>
		<ul>
			<li>City/Boston Neighborhood: ${project.cityOrNeighborhood}</li>
			<li>Owner: ${project.owners}</li>
			<li>Designer: ${project.designer}</li>
			<li>Constructor: ${project.constructor}</li>
			<li>Est. Construction Start: ${project.constructionStartDate}</li>
			<li>Est. Completion: ${project.completionDate}</li>
			<li>Point(s) Of Contact: ${project.contacts}</li>
		</ul>
	</details>`;
}
