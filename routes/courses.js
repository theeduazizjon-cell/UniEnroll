const express = require('express');
const router = express.Router();
const { query } = require('../db');

router.get('/', async (req, res, next) => {
    try {
        const courses = await query(
            `SELECT c.CourseID, c.CourseCode, c.CourseName, c.Credits, c.Level,
                    d.DeptName, c.IsActive, c.Description
             FROM Course c JOIN Department d ON c.DeptID = d.DeptID
             ORDER BY c.CourseCode`
        );
        res.render('courses/index', { title: 'Courses', courses });
    } catch (err) {
        next(err);
    }
});

router.get('/add', async (req, res, next) => {
    try {
        const departments = await query('SELECT DeptID, DeptName FROM Department ORDER BY DeptName');
        res.render('courses/add', { title: 'Add Course', departments, error: null });
    } catch (err) {
        next(err);
    }
});

router.post('/add', async (req, res, next) => {
    const { CourseCode, CourseName, Credits, DeptID, Level, Description } = req.body;
    try {
        await query(
            `INSERT INTO Course (CourseCode, CourseName, Credits, DeptID, Level, Description)
             VALUES (@cc, @cn, @cr, @did, @lv, @desc)`,
            { cc: CourseCode, cn: CourseName, cr: parseInt(Credits),
              did: parseInt(DeptID), lv: parseInt(Level), desc: Description }
        );
        res.redirect('/courses');
    } catch (err) {
        const departments = await query('SELECT DeptID, DeptName FROM Department ORDER BY DeptName');
        res.render('courses/add', { title: 'Add Course', departments, error: err.message });
    }
});

module.exports = router;
