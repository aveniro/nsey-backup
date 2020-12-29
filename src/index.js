require('dotenv').config();
const {fetchAllRepositories, createRepository} = require('./repository');
const rimraf = require('rimraf');
const shell = require('shelljs');
const path = require('path');
const fs = require('fs');
const {env} = process;

if (!shell.which('git')) {
    shell.echo('Sorry, this script requires git');
    shell.exit(1);
}

(async () => {
    const targetDirectory = path.resolve(__dirname, '../', env.BACKUP_DIR);
    const repos = (await fetchAllRepositories(env.GH_SOURCE_ACCOUNT))
        .filter(v => !v.fork);

    if (fs.existsSync(targetDirectory)) {
        console.log('[i] remove dangling repo directory');
        rimraf.sync(targetDirectory);
    }

    console.log(`[i] found ${repos.length} repositories for ${env.GH_SOURCE_ACCOUNT}.`);
    fs.mkdirSync(targetDirectory, {recursive: true});
    for (const repo of repos) {
        console.log(`[i] clone ${repo.name} (${repo.description})`);

        await createRepository(repo.name)
            .then(() => console.log('[i] repo created.'))
            .catch(() => console.log('[i] repo already exists.'));

        // cd into repos folder and clone repo
        shell.cd(targetDirectory);
        shell.exec(`git clone ${repo.git_url}`);

        // cd into repo, change remote url and force push
        shell.cd(path.join(targetDirectory, repo.name));
        shell.exec(`git remote set-url origin git@github.com:${env.GH_BACKUP_ACCOUNT}/${repo.name}.git`);
        shell.exec(`git push -f`)
    }
})();
