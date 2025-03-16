

let apiRoot = ''

if (process.env.BUILD_MODE === 'DEV') {
  apiRoot = 'http://localhost:8017'
}
if (process.env.BUILD_MODE === 'production') {
  apiRoot = 'https://personal-trello-api.onrender.com'
}
export const API_ROOT = apiRoot