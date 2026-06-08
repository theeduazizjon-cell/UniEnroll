const express = require('express');
const router = express.Router();
const { query } = require('../db');

router.get('/', async (req, res, next) => {
    try {
        const sections = await query('SELECT * FROM vw_SectionDetails ORDER BY SemesterActive DESC, CourseCode');
        res.render('sections/index', { title: 'Sections', sections });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
