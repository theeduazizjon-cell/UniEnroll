const express = require('express');
const router = express.Router();
const { query } = require('../db');

router.get('/', async (req, res, next) => {
    try {
        const students = await query("SELECT StudentID, FirstName + ' ' + LastName AS StudentName FROM Student ORDER BY StudentName");
        res.render('transcript/index', { title: 'Transcript Lookup', students, transcript: null, selectedStudent: null });
    } catch (err) {
        next(err);
    }
});

router.get('/:studentId', async (req, res, next) => {
    const { studentId } = req.params;
    try {
        const [students, transcript, studentInfo] = await Promise.all([
            query("SELECT StudentID, FirstName + ' ' + LastName AS StudentName FROM Student ORDER BY StudentName"),
            query('SELECT * FROM vw_Transcript WHERE StudentID = @sid ORDER BY Semester, CourseCode', { sid: parseInt(studentId) }),
            query('SELECT * FROM vw_StudentProfile WHERE StudentID = @sid', { sid: parseInt(studentId) }),
        ]);
        res.render('transcript/index', {
            title: 'Transcript',
            students,
            transcript,
            selectedStudent: studentInfo[0] || null,
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
