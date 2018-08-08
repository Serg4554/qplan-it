import superagentPromise from 'superagent-promise';
import _superagent from 'superagent';
const agent = superagentPromise(_superagent, Promise);

const API_URL = 'http://192.168.1.33:3001/api';
let token = null;

const requests = {
  get: url =>
    agent.get(`${API_URL}${url}`).use(req => {if(token) req.set('authorization', token)}).then(res => res.body),
  post: (url, body) =>
    agent.post(`${API_URL}${url}`, body).use(req => {if(token) req.set('authorization', token)}).then(res => res.body),
  put: (url, body) =>
    agent.put(`${API_URL}${url}`, body).use(req => {if(token) req.set('authorization', token)}).then(res => res.body),
  del: url =>
    agent.del(`${API_URL}${url}`).use(req => {if(token) req.set('authorization', token)}).then(res => res.body)
};

const Auth = {
  login: (email, password) =>
    requests.post('/users/login', { email, password }),
  getUser: (id) =>
    requests.get(`/users/${id}`),
  logout: () =>
    requests.post('/users/logout', {}),
  resetPassword: (email) =>
    requests.post('/users/reset', { email })
};

const Event = {
  get: id =>
    requests.get(`/events/${id}`),
};

export default {
  Auth,
  Event,
  setToken: _token => { token = _token }
};
