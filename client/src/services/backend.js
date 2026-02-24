import axios from 'axios';

const API = axios.create({ baseURL: `http://${window.location.hostname}:3001/api` });

export const getFileTree = (root) => API.get(`/files/tree?root=${encodeURIComponent(root)}`).then(r => r.data);
export const readFile = (path) => API.get(`/files/read?path=${encodeURIComponent(path)}`).then(r => r.data);
export const writeFile = (path, content) => API.post('/files/write', { path, content }).then(r => r.data);
export const renameFile = (oldPath, newPath) => API.post('/files/rename', { oldPath, newPath }).then(r => r.data);
export const deleteFile = (path) => API.delete(`/files/delete?path=${encodeURIComponent(path)}`).then(r => r.data);
export const mkdir = (path) => API.post('/files/mkdir', { path }).then(r => r.data);

export const executeCode = (language, code, socketId) => API.post('/execute', { language, code, socketId }).then(r => r.data);
export const getGitStatus = (cwd) => API.get(`/git/status?cwd=${encodeURIComponent(cwd)}`).then(r => r.data);
export const getGitDiff = (path, cwd) => API.get(`/git/diff?path=${encodeURIComponent(path)}&cwd=${encodeURIComponent(cwd)}`).then(r => r.data);
