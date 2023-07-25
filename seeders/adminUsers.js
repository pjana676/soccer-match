const path = require('path');

const appPath = path.resolve(process.cwd());

let envFilePath = process.env.envFilePath || path.resolve(appPath, '.env');
if (envFilePath.startsWith('/') === false) {
    // if it is relative path then resolve it to absolute path
    envFilePath = path.resolve(process.cwd(), envFilePath);
}

require('dotenv').config({ path: envFilePath });

// eslint-disable-next-line no-unused-vars
const db = require('../config/db');
const user = require('../models/user');

const { DEFAULT_ADMIN_USERNAME, DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD } = process.env;
const data = [
  {
    username: DEFAULT_ADMIN_USERNAME,
    email: DEFAULT_ADMIN_EMAIL,
    password: DEFAULT_ADMIN_PASSWORD,
    roles: ['admin'],
  },
];

(async () => {
    // clean previous entries
    await user.deleteMany({roles: { $in: ['admin'] }});

    // create admin-user
    const promises = data.map(async (d) => {
        const newAdminUser = new user(d)
        return await newAdminUser.save();
    });
    await Promise.all(promises);
    console.log(`Collection: User, Successfully added.`)
    setTimeout(process.exit(0));
})();