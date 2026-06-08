const express = require('express');
const router = express.Router();
const { query } = require('../db');

router.get('/', async (req, res, next) => {
    try {
        const [students, courses, sections, enrollments] = await Promise.all([
            query('SELECT COUNT(*) AS cnt FROM Student'),
            query('SELECT COUNT(*) AS cnt FROM Course WHERE IsActive = 1'),
            query('SELECT COUNT(*) AS cnt FROM Section sec JOIN Semester sem ON sec.SemesterID = sem.SemesterID WHERE sem.IsActive = 1'),
            query("SELECT COUNT(*) AS cnt FROM Enrollment WHERE Status = 'Enrolled'"),
        ]);
        res.render('dashboard', {
            title: 'UniEnroll Dashboard',
            stats: {
                students:    students[0].cnt,
                courses:     courses[0].cnt,
                sections:    sections[0].cnt,
                enrollments: enrollments[0].cnt,
            }
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
