const express = require('express');
const router = express.Router();
const { query } = require('../db');

router.get('/', async (req, res, next) => {
    try {
        const enrollments = await query(
            `SELECT e.EnrollmentID, s.FirstName + ' ' + s.LastName AS StudentName,
                    c.CourseCode, c.CourseName, sec.SectionNo,
                    sm.SemName + ' ' + sm.AcademicYear AS Semester,
                    e.EnrollDate, e.Status
             FROM Enrollment e
             JOIN Student  s   ON e.StudentID   = s.StudentID
             JOIN Section  sec ON e.SectionID   = sec.SectionID
             JOIN Course   c   ON sec.CourseID  = c.CourseID
             JOIN Semester sm  ON sec.SemesterID= sm.SemesterID
             ORDER BY e.EnrollDate DESC`
        );
        res.render('enrollments/index', { title: 'Enrollments', enrollments });
    } catch (err) {
        next(err);
    }
});

router.get('/add', async (req, res, next) => {
    try {
        const [students, sections] = await Promise.all([
            query("SELECT StudentID, FirstName + ' ' + LastName AS StudentName FROM Student WHERE Status = 'Active' ORDER BY StudentName"),
            query(`SELECT sec.SectionID,
                          c.CourseCode + ' - ' + c.CourseName + ' (Sec ' + sec.SectionNo + ') - ' + sm.SemName + ' ' + sm.AcademicYear AS SectionLabel
                   FROM Section sec
                   JOIN Course c ON sec.CourseID = c.CourseID
                   JOIN Semester sm ON sec.SemesterID = sm.SemesterID
                   WHERE sm.IsActive = 1
                   ORDER BY SectionLabel`),
        ]);
        res.render('enrollments/add', { title: 'Add Enrollment', students, sections, error: null, success: null });
    } catch (err) {
        next(err);
    }
});

router.post('/add', async (req, res, next) => {
    const { StudentID, SectionID } = req.body;
    try {
        await query('EXEC sp_EnrollStudent @sid, @secid', { sid: parseInt(StudentID), secid: parseInt(SectionID) });
        res.redirect('/enrollments');
    } catch (err) {
        const [students, sections] = await Promise.all([
            query("SELECT StudentID, FirstName + ' ' + LastName AS StudentName FROM Student WHERE Status = 'Active' ORDER BY StudentName"),
            query(`SELECT sec.SectionID,
                          c.CourseCode + ' - ' + c.CourseName + ' (Sec ' + sec.SectionNo + ') - ' + sm.SemName + ' ' + sm.AcademicYear AS SectionLabel
                   FROM Section sec
                   JOIN Course c ON sec.CourseID = c.CourseID
                   JOIN Semester sm ON sec.SemesterID = sm.SemesterID
                   WHERE sm.IsActive = 1
                   ORDER BY SectionLabel`),
        ]);
        res.render('enrollments/add', { title: 'Add Enrollment', students, sections, error: err.message, success: null });
    }
});

module.exports = router;
