const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    const Creator = require('./dist/app/models/creator.model').default;
    const creators = await Creator.find({}, 'displayName gender').lean();
    console.log("Creators:", creators);
    process.exit(0);
});
