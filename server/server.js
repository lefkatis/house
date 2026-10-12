import http from 'node:http';
import { 
  getAllProjects, 
  getProjectDetails, 
  saveQuestionnaireAnswers, 
  updateProvisionStatus, 
  addCustomProvision, 
  deleteCustomProvision, 
  updateProcurementStatus 
} from './db.js';

const PORT = process.env.PORT || 3001;

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
  res.end(JSON.stringify(data));
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  try {
    // 1. Health check
    if (req.method === 'GET' && pathname === '/api/health') {
      return sendJson(res, 200, {
        status: 'ok',
        database: 'sqlite',
        databaseEngine: 'node:sqlite (built-in)',
        file: 'pronies_app.sqlite',
        time: new Date().toISOString()
      });
    }

    // 2. List projects
    if (req.method === 'GET' && pathname === '/api/projects') {
      const projects = getAllProjects();
      return sendJson(res, 200, { projects });
    }

    // 3. Get project details: /api/projects/:id
    const projectMatch = pathname.match(/^\/api\/projects\/([^/]+)$/);
    if (req.method === 'GET' && projectMatch) {
      const projectId = projectMatch[1];
      const data = getProjectDetails(projectId);
      if (!data) {
        return sendJson(res, 404, { error: 'Project not found' });
      }
      return sendJson(res, 200, data);
    }

    // 4. Update Questionnaire & Regenerate: PUT /api/projects/:id/questionnaire
    const questionnaireMatch = pathname.match(/^\/api\/projects\/([^/]+)\/questionnaire$/);
    if ((req.method === 'PUT' || req.method === 'POST') && questionnaireMatch) {
      const projectId = questionnaireMatch[1];
      const body = await parseJsonBody(req);
      const updated = saveQuestionnaireAnswers(projectId, body);
      return sendJson(res, 200, {
        success: true,
        message: 'Questionnaire saved and provisions regenerated successfully',
        data: updated
      });
    }

    // 5. Update Provision: PATCH /api/projects/:id/provisions/:provisionId
    const provisionPatchMatch = pathname.match(/^\/api\/projects\/([^/]+)\/provisions\/([^/]+)$/);
    if (req.method === 'PATCH' && provisionPatchMatch) {
      const projectId = provisionPatchMatch[1];
      const provisionId = provisionPatchMatch[2];
      const body = await parseJsonBody(req);
      updateProvisionStatus(projectId, provisionId, body);
      return sendJson(res, 200, { success: true });
    }

    // 6. Delete Provision: DELETE /api/projects/:id/provisions/:provisionId
    if (req.method === 'DELETE' && provisionPatchMatch) {
      const projectId = provisionPatchMatch[1];
      const provisionId = provisionPatchMatch[2];
      deleteCustomProvision(projectId, provisionId);
      return sendJson(res, 200, { success: true });
    }

    // 7. Add Custom Provision: POST /api/projects/:id/provisions
    const provisionPostMatch = pathname.match(/^\/api\/projects\/([^/]+)\/provisions$/);
    if (req.method === 'POST' && provisionPostMatch) {
      const projectId = provisionPostMatch[1];
      const body = await parseJsonBody(req);
      const created = addCustomProvision(projectId, body);
      return sendJson(res, 201, { success: true, provision: created });
    }

    // 8. Update Procurement item: PATCH /api/projects/:id/procurement/:itemId
    const procPatchMatch = pathname.match(/^\/api\/projects\/([^/]+)\/procurement\/([^/]+)$/);
    if (req.method === 'PATCH' && procPatchMatch) {
      const projectId = procPatchMatch[1];
      const itemId = procPatchMatch[2];
      const body = await parseJsonBody(req);
      updateProcurementStatus(projectId, itemId, body);
      return sendJson(res, 200, { success: true });
    }

    // 404 for other endpoints
    sendJson(res, 404, { error: 'Not found', path: pathname });
  } catch (err) {
    console.error('API Error:', err);
    sendJson(res, 500, { error: err.message });
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Pronies SQLite API Server running on http://localhost:${PORT}`);
});
