try {
    const mongoose = require('mongoose');
    console.log('Mongoose version:', mongoose.version);
} catch (e) {
    console.error('Mongoose load failed:', e.message);
}
