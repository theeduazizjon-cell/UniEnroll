const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routes
const indexRouter      = require('./routes/index');
const studentsRouter   = require('./routes/students');
const coursesRouter    = require('./routes/courses');
const sectionsRouter   = require('./routes/sections');
const enrollRouter     = require('./routes/enrollments');
const transcriptRouter = require('./routes/transcript');

app.use('/',            indexRouter);
app.use('/students',    studentsRouter);
app.use('/courses',     coursesRouter);
app.use('/sections',    sectionsRouter);
app.use('/enrollments', enrollRouter);
app.use('/transcript',  transcriptRouter);

// 404 handler
app.use((req, res) => {
    res.status(404).render('error', { title: 'Not Found', message: 'Page not found.' });
});

// Global error handler — catches DB connection errors and anything else
app.use((err, req, res, next) => {
    console.error(err);

    const isDbError =
        err.code === 'ECONNREFUSED' ||
        err.code === 'ESOCKET' ||
        err.message?.includes('Failed to connect') ||
        err.message?.includes('Could not connect') ||
        err.message?.includes('sequence');

    const message = isDbError
        ? `Cannot connect to SQL Server on ${process.env.DB_SERVER || 'localhost'}:${process.env.DB_PORT || 1433}.\n\nMake sure your Docker container is running:\n\ndocker start sqlserver`
        : err.message;

    res.status(500).render('error', { title: 'Error', message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`UniEnroll running at http://localhost:${PORT}`);
    console.log(`Connecting to SQL Server: ${process.env.DB_SERVER || 'localhost'}:${process.env.DB_PORT || 1433} / ${process.env.DB_DATABASE || 'UniEnroll'}`);
});
