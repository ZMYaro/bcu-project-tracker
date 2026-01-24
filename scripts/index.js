import { loadSpreadsheet } from './loader.js';
import { parseProjects } from './parser.js';
import { renderProjects } from './dom_generator.js';

/** {Array<Object>} The list of all micromobility projects, converted to usable JSON */
let projects;
/** {HTMLFormElement} The container for the filter buttons */
let filterForm;

window.addEventListener('DOMContentLoaded', async function () {
	filterForm = document.getElementById('filters');
	
	try {
		const spreadsheetData = await loadSpreadsheet();
		projects = parseProjects(spreadsheetData);
		renderProjects(projects, filterForm.location.value);
		filterForm.addEventListener('change', () => renderProjects(projects, filterForm.location.value));
	} catch (err) {
		console.error(err);
		document.getElementById('error-message').textContent = err;
		if (document.getElementById('projects').innerHTML === 'Loading...') {
			document.getElementById('projects').innerHTML = '';
		}
	}
});
