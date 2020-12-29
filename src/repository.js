const fetch = require('node-fetch');

const {env} = process;
const PAGE_SIZE = Number(env.GH_PAGE_SIZE);

const fetchAllRepositories = async username => {
    const url = `${env.GH_API_URL}/users/${username}/repos?per_page=${PAGE_SIZE}`;
    const repos = [];

    for (let i = 1; ; i++) {
        const page = await fetch(`${url}&page=${i}`).then(res => res.json());
        repos.push(...page);

        if (page.length < PAGE_SIZE) {
            break;
        }
    }

    return repos;
};

const createRepository = async name => {
    return fetch(`${env.GH_API_URL}/user/repos`, {
        method: 'POST',
        headers: {
            'Accept': 'application/vnd.github.v3+json',
            'Authorization': `token ${env.GH_BACKUP_ACCOUNT_TOKEN}`
        },
        body: JSON.stringify({name})
    }).then(res => {
        if (res.ok) {
            return res.json();
        } else {
            throw res;
        }
    });
};

module.exports = {fetchAllRepositories, createRepository};
