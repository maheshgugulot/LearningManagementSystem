# Learning Management System [Live](https://lms-ya53.onrender.com)

The Learning Management System (LMS) is a web application built using Express.js and Sequelize , providing functionalities for educators to create courses, chapters, and pages, and for students to enroll in courses, view content, and track progress.

## Introduction

The Learning Management System (LMS) is designed to facilitate online learning by allowing educators to create courses, chapters, and pages, and students to enroll in courses, access course content, mark chapters as complete, and track their progress.

## Features

Educator Features:

Create courses with descriptions.
Add chapters and pages to courses.
View and manage own courses.
Student Features:

Enroll in courses.
View enrolled and available courses.
View chapters and pages of enrolled courses.
Mark chapters as complete.

## Installation

To run the LMS locally, follow these steps:

Clone the repository: git clone `https://github.com/maheshgugulot/LearningManagementSystem`
Navigate to the project directory: cd lms
Install dependencies: npm install
Start the application: npm start

## Usage

Once the application is running, access it in your web browser at `http://localhost:3000.`

## Routes

- `/` - Home page displaying available courses for all users.
- `/home` - Dashboard for educators to manage courses.
- `/home` - Dashboard for students to view enrolled and available courses.
- `/signup` - Register as a new user (educator or student).
- `/login` - Log in as an existing user.
- `/signout` - Log out from the system.
- `/enroll/:courseId` - Enroll in a specific course.
- `/viewcourse/:CourseId` - View chapters of an enrolled course.
- `/viewcourse/:CourseId/chapter/:ChapterId/` - View pages of a chapter in an enrolled course.
- `/markAsComplete/:Pageid` - Mark Pages as complete.
