const express = require('express');
const router = express.Router();
const { query } = require('../db');

// List all students
router.get('/', async (req, res, next) => {
    try {
        const students = await query('SELECT * FROM vw_StudentProfile ORDER BY StudentName');
        res.render('students/index', { title: 'Students', students });
    } catch (err) {
        next(err);
    }
});

// Add student form
router.get('/add', async (req, res, next) => {
    try {
        const [programs, advisors] = await Promise.all([
            query('SELECT ProgramID, ProgramName FROM Program ORDER BY ProgramName'),
            query("SELECT AdvisorID, FirstName + ' ' + LastName AS AdvisorName FROM Advisor ORDER BY AdvisorName"),
        ]);
        res.render('students/add', { title: 'Add Student', programs, advisors, error: null });
    } catch (err) {
        next(err);
    }
});

// Submit add student
router.post('/add', async (req, res, next) => {
    const { FirstName, LastName, Email, Phone, BirthDate, Gender, Address, ProgramID, AdvisorID, EnrollYear } = req.body;
    try {
        await query(
            `INSERT INTO Student (FirstName, LastName, Email, Phone, BirthDate, Gender, Address, ProgramID, AdvisorID, EnrollYear)
             VALUES (@fn, @ln, @em, @ph, @bd, @gd, @ad, @pid, @aid, @ey)`,
            { fn: FirstName, ln: LastName, em: Email, ph: Phone, bd: BirthDate || null,
              gd: Gender, ad: Address, pid: parseInt(ProgramID), aid: parseInt(AdvisorID), ey: parseInt(EnrollYear) }
        );
        res.redirect('/students');
    } catch (err) {
        const [programs, advisors] = await Promise.all([
            query('SELECT ProgramID, ProgramName FROM Program ORDER BY ProgramName'),
            query("SELECT AdvisorID, FirstName + ' ' + LastName AS AdvisorName FROM Advisor ORDER BY AdvisorName"),
        ]);
        res.render('students/add', { title: 'Add Student', programs, advisors, error: err.message });
    }
});

module.exports = router;
