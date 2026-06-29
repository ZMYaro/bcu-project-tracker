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
/** @constant {Array<String>} Boston neighborhoods */
const BOSTON_NEIGHBORHOODS = [
	'Allston',
	'Back Bay',
	'Bay Village',
	'Beacon Hill',
	'Brighton',
	'Charlestown',
	'Chinatown',
	'Dorchester',
	'Downtown',
	'East Boston',
	'Fenway-Kenmore',
	'Hyde Park',
	'Jamaica Plain',
	'Mattapan',
	'Mission Hill',
	'North End',
	'Roslindale',
	'Roxbury',
	'Seaport',
	'South Boston',
	'South End',
	'West End',
	'West Roxbury'
];

/**
 * Generate and insert the HTML for the list of projects.
 * @param {Array<Object>} projects
 * @param {String} locationFilter
 */
export function renderProjects(projects, locationFilter) {
	const sortedLocationFilteredProjects =
		projects.filter((project) => filterLocation(project, locationFilter))
		.sort((a, b) => a.title < b.title ? -1 : 1);
	
	const currentProjectsHTML = sortedLocationFilteredProjects
			.filter((project) => STATUS_NUMBER_MAP[project.status] >= 0 && STATUS_NUMBER_MAP[project.status] < STATUS_NUMBER_MAP['Complete'])
			.map(generateProjectHTML)
			.join(''),
		completedProjectsHTML = sortedLocationFilteredProjects
			.filter((project) => STATUS_NUMBER_MAP[project.status] === STATUS_NUMBER_MAP['Complete'])
			.map(generateProjectHTML)
			.join(''),
		futureProjectsHTML = sortedLocationFilteredProjects
			.filter((project) => STATUS_NUMBER_MAP[project.status] < 0)
			.map(generateProjectHTML)
			.join('');
	
	document.getElementById('projects').innerHTML = `
		<hr />
		<h2>Current Projects</h2>
		${currentProjectsHTML || 'None with current filter'}
		<hr />
		<h2>Completed Projects</h2>
		${completedProjectsHTML || 'None with current filter'}
		<hr />
		<h2>Future/Desired Projects</h2>
		${futureProjectsHTML || 'None with current filter'}
	`;
}

/**
 * Check whether a given project is in the specified location.
 * @param {Object} project
 * @param {String} location
 * @returns {Boolean}
 */
function filterLocation(project, location) {
	if (!location) {
		// Falsey location => show all.
		return true;
	}
	const projLocations = project.cityOrNeighborhood.split(/\s*,\s*/), // Split comma-separated list, removing whitespace around commas.
		locationMatch = (projLocations.includes(location) ||
			(location === 'Boston' &&
				// If filtering for Boston, check for any neighborhood matches.
				projLocations.filter((neighborhood) => BOSTON_NEIGHBORHOODS.includes(neighborhood)).length !== 0));
	return locationMatch;
}

/**
 * Generate the HTML for a specific project.
 * @param {Object} project
 * @returns {String}
 */
function generateProjectHTML(project) {
	let iconURL;
	if (STATUS_NUMBER_MAP[project.status] === 1) {
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
				<!--⮟-->
				<svg class="project-expand-button" aria-hidden="true" tabindex="-1" viewBox="0 0 16 16">
					<polyline points="2,3 8,6 14,3 8,13" />
				</svg>
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
					<span>${(project.announceDate || '').replace('Unannounced', '').replace('N/A', '').replace('?', '')}</span>
					<span>${project.status}</span>
					<span>${(project.completionDate || '').replace('Unannounced', '').replace('N/A', '').replace('?', '')}</span>
				</small>
			</div>
		</summary>
		<dl>
			<dt>City/Boston Neighborhood</dt>
			<dd>${project.cityOrNeighborhood}</dd>
			<dt>Owner<button popovertarget="owner-tooltip">?</button></dt>
			<dd>${project.owners.join('; ')}</dd>
			<dt>Construction Type</dt>
			<dd>${project.constructionType}</dd>
			<dt>Designer<button popovertarget="designer-tooltip">?</button></dt>
			<dd>${project.designer}</dd>
			<dt>Constructor<button popovertarget="constructor-tooltip">?</button></dt>
			<dd>${project.constructor}</dd>
			<dt>Project Announced</dt>
			<dd>${project.announceDate}</dd>
			<dt>Last Official Update</dt>
			<dd>${project.lastUpdateDate}</dd>
			<dt>Est. Construction Start</dt>
			<dd>${project.constructionStartDate}</dd>
			<dt>Est. Completion</dt>
			<dd>${project.completionDate}</dd>
			<dt>Point(s) Of Contact<button popovertarget="points-of-contact-tooltip">?</button></dt>
			<dd>${generateContactsHTML(project.contacts)}</dd>
		</dl>
	</details>`;
}

/**
 * Escape angle brackets and make email addresses clickable in point(s) of contact.
 * @param {String} contactsStr
 * @returns {String}
 */
function generateContactsHTML(contactsStr) {
	return contactsStr
		.replace(
			// Match email addresses in angle brackets.
			/<([a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)>/g,
			'&lt;<a href="mailto:$1" target="_blank">$1</a>&gt;'
		).replace(
			// Match hyphen-separated phone numbers in parentheses.
			/\((\d{3}-\d{3}-\d{4})\)/g,
			'(<a href="tel:$1" target="_blank">$1</a>)'
		);
}
