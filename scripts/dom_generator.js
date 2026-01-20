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
			.sort((a, b) => a.title < b.title ? -1 : 1)
			.map(generateProjectHTML)
			.join(''),
		completedProjectsHTML = projects
			.filter((project) => STATUS_NUMBER_MAP[project.status] === STATUS_NUMBER_MAP['Complete'])
			.sort((a, b) => a.title < b.title ? -1 : 1)
			.map(generateProjectHTML)
			.join(''),
		futureProjectsHTML = projects
			.filter((project) => STATUS_NUMBER_MAP[project.status] < 0)
			.sort((a, b) => a.title < b.title ? -1 : 1)
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
	let iconURL;
	if (STATUS_NUMBER_MAP[project.status] >= 0 && STATUS_NUMBER_MAP[project.status] <= 1) {
		iconURL = 'blueprint_pencil.svg';
	} else if (STATUS_NUMBER_MAP[project.status] >= 2 && STATUS_NUMBER_MAP[project.status] <= 4) {
		iconURL = 'pencil.svg';
	} else if (STATUS_NUMBER_MAP[project.status] === 5) {
		iconURL = 'roller.svg';
	}

	// TODO: Sanitize text from spreadsheet
	return `<details>
		<summary>
			<h3>${project.title}${project.section ? ` &ndash; ${project.section}` : ''}</h3>
			<div class="project-actions">
				${project.website && project.website !== 'N/A' ? `<a href="${project.website}" target="_blank">🔗</a>`: ''}
				<div class="project-expand-button" aria-hidden="true" tabindex="-1">⮟</div>
			</div>
			<div class="progress-wrapper">
				${iconURL ?
					`<img
						src="images/${iconURL}"
						alt=""
						class="status-graphic"
						style="left: ${Math.round(STATUS_NUMBER_MAP[project.status] / STATUS_NUMBER_MAP['Complete'] * 100)}%" />` :
					''
				}
				<progress
					max="${STATUS_NUMBER_MAP['Complete']}"
					value="${STATUS_NUMBER_MAP[project.status]}"
					${['Partially undone', 'Undone'].includes(project.status) ? 'class="bad"' : ''}
					${['Under construction', 'Complete'].includes(project.status) ? 'class="good"' : ''}></progress>
				<small class="project-status-text">
					<span>${project.status}</span>
					<span>${(project.completionDate || '').replace('Unannounced', '').replace('N/A', '').replace('?', '')}</span>
				</small>
			</div>
		</summary>
		<dl>
			<dt>City/Boston Neighborhood</dt>
			<dd>${project.cityOrNeighborhood}</dd>
			<dt>Owner</dt>
			<dd>${project.owners.join('; ')}</dd>
			<dt>Designer</dt>
			<dd>${project.designer}</dd>
			<dt>Constructor</dt>
			<dd>${project.constructor}</dd>
			<dt>Est. Construction Start</dt>
			<dd>${project.constructionStartDate}</dd>
			<dt>Est. Completion</dt>
			<dd>${project.completionDate}</dd>
			<dt>Point(s) Of Contact</dt>
			<dd>${project.contacts}</dd>
		</dl>
	</details>`;
}
