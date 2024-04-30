/* eslint-disable no-undef */
const express = require("express");
const { Sequelize } = require("sequelize");
// eslint-disable-next-line no-unused-vars
const { Op } = Sequelize;
const app = express();
var cookieParser = require("cookie-parser");
var csrf = require("tiny-csrf");
const passport = require("passport");
const connectEnsureLogin = require("connect-ensure-login");
const session = require("express-session");
const LocalStrategy = require("passport-local");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const path = require("path");
app.use(express.json());
app.set("view engine", "ejs");
// eslint-disable-next-line no-undef
app.set("views", path.join(__dirname, "views"));
// eslint-disable-next-line no-undef
app.use(express.static(path.join(__dirname, "public")));
const {
  Course,
  Chapter,
  Page,
  User,
  UserCourse,
  UserPage,
} = require("./models");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser("mahi's secret string"));
app.use(csrf("this_should_be_32_character_long", ["POST", "PUT", "DELETE"]));
const flash = require("connect-flash");
app.use(flash());
app.use(passport.initialize());
app.use(
  session({
    resave: false,
    saveUninitialized: true,
    secret: "its-my-secret-key1010",
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
    },
  }),
);
app.use(passport.initialize());
app.use(passport.session());
app.use(function (request, response, next) {
  response.locals.messages = request.flash();
  next();
});
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    (username, password, done) => {
      User.findOne({ where: { email: username } })
        .then(async (user) => {
          if (!user) {
            return done(null, false, { message: "User not found" });
          }
          const result = await bcrypt.compare(password, user.password);
          if (result) return done(null, user);
          else return done(null, false, { message: "Invalid password" });
        })
        .catch((error) => {
          return done(error);
        });
    },
  ),
);
passport.serializeUser((user, done) => {
  console.log("Serializing user in session", user.id);
  done(null, user.id);
});
passport.deserializeUser((id, done) => {
  User.findByPk(id)
    .then((user) => {
      done(null, user);
    })
    .catch((error) => {
      done(error, null);
    });
});
app.get("/", async (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect("/home");
  }
  res.render("index", { csrfToken: req.csrfToken() });
  app.get("/signup", (request, response) => {
    response.render("signup", { csrfToken: request.csrfToken() });
  });
});
app.get("/login", (request, response) => {
  response.render("login", { csrfToken: request.csrfToken() });
});
app.post(
  "/session",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  function (request, response) {
    console.log(request.user);
    response.redirect("/home");
  },
);
app.get("/signout", (req, res) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/");
  });
});
app.get("/changepassword", (req, res) => {
  return res.render("change", { csrfToken: req.csrfToken() });
});

app.post("/change", connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
  const originalPassword = req.body.original;
  const newPassword = req.body.change;
  const userId = req.user.id;

  try {
    const user = await User.findByPk(userId);

    if (!user) {
      req.flash("error", "User not found");
      return res.status(404).json({ error: "User not found" });
    }

    const isPasswordMatch = await bcrypt.compare(
      originalPassword,
      user.password,
    );

    if (!isPasswordMatch) {
      req.flash("error", "Original password is incorrect");
      return res.redirect("/changepassword");
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    await User.update(
      { password: hashedNewPassword },
      { where: { id: userId } },
    );

    req.flash("success", "Password updated successfully");
    res.redirect("/changepassword");
  } catch (error) {
    console.error("Error updating password:", error);
    req.flash("error", "Internal server error");
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/users", async (request, response) => {
  const hashedPwd = await bcrypt.hash(request.body.password, saltRounds);
  var isAdminChecked = false;
  if (request.body.isAdmin === "on") {
    isAdminChecked = true;
  }
  console.log("admin" + request.body.isAdmin);
  console.log("admin" + isAdminChecked);
  try {
    const existingUser = await User.findOne({ email: request.body.email });
    console.log("existing" + existingUser);
    console.log("existing" + existingUser.email);
    if (existingUser && existingUser.email == request.body.email) {
      request.flash("error", "User with this email already exists.");
      return response.redirect("/signup");
    }
    const user = await User.create({
      firstName: request.body.firstName,
      lastName: request.body.lastName,
      password: hashedPwd,
      email: request.body.email,
      isAdmin: isAdminChecked,
    });
    request.login(user, (err) => {
      if (err) console.log(err);
      response.redirect("/home");
    });
  } catch (error) {
    console.log(error);
  }
});

app.post(
  "/enroll/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    console.log("courseid" + req.params.id);
    console.log("enrol" + req.body.enroll);

    try {
      if (req.body.enroll) {
        const usercourse = await UserCourse.create({
          UserId: req.body.userid,
          CourseId: req.params.id,
          enroll: req.body.enroll,
        });
        return res.json({ usercourse });
      } else {
        const usercourse = await UserCourse.destroy({
          where: {
            UserId: req.body.userid,
            CourseId: req.params.id,
          },
        });
        const userpage = await UserPage.destroy({
          where: {
            UserId: req.user.id,
            CourseId: req.params.id,
          },
        });
        return res.json({ usercourse, userpage });
      }
    } catch (err) {
      console.log(err);
      return res.status(422).json(err);
    }
  },
);
app.get(
  "/viewcourse/:CourseId/chapter/:ChapterId/fullpage/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    try {
      const pageContent = await Page.findByPk(req.params.id);
      const pageContentCompleted = await UserPage.findOne({
        where: { PageId: req.params.id, UserId: req.user.id },
      });
      var b = true;
      if (pageContentCompleted === null) {
        b = false;
      }
      const ChapterName = await Chapter.findOne({
        where: { id: pageContent.ChapterId },
      });
      if (req.accepts("html")) {
        res.render("pagecontent", {
          CourseId: req.params.CourseId,
          ChapterId: req.params.ChapterId,
          pageContent,
          b,
          ChapterName,
          user: req.user,
          csrfToken: req.csrfToken(),
        });
      } else {
        return res.json(pageContent);
      }
    } catch (err) {
      console.log(err);
      return res.status(422).json(err);
    }
  },
);
app.get("/mycourse", connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
  try {
    const allChapter = await Chapter.getChapter();
    const course = await Course.findAll({
      where: {
        UserId: req.user.id,
      },
    });
    var coursevalue = true;
    if (course === null) {
      coursevalue = false;
    }
    const allMyCourse = await UserCourse.getMyCourse(req.user.id);
    const allCourse = await Course.getCourse();
    if (req.accepts("html")) {
      return res.render("mycourse", {
        allCourse,
        course,
        coursevalue,
        allMyCourse,
        user: req.user,
        allChapter,
      });
    } else {
      return res.json(allCourse);
    }
  } catch (err) {
    console.log(err);
    return res.status(422).json(err);
  }
});
app.get("/progress", connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
  try {
    const allCourse = await Course.getCourse();
    const allMyCourse = await UserCourse.getMyCourse(req.user.id);
    const allMyPage = await UserPage.findAll({
      where: { UserId: req.user.id },
    });
    const allChapter = await Chapter.getChapter();
    const allPage = await Page.getPage();
    console.log("allmypage", allMyPage.PageId);
    if (req.accepts("html")) {
      return res.render("progress", {
        allCourse,
        allMyCourse,
        allMyPage,
        allChapter,
        allPage,
      });
    } else {
      return res.json(allCourse);
    }
  } catch (err) {
    console.log(err);
    return res.status(422).json(err);
  }
});

app.post(
  "/markAsComplete/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    console.log("pageid" + req.params.id);
    console.log("completer" + req.body.completed);
    try {
      if (req.body.completed) {
        const userpage = await UserPage.create({
          UserId: req.user.id,
          PageId: req.params.id,
          completed: req.body.completed,
          CourseId: req.body.CourseId,
        });
        return res.json({ userpage });
      } else {
        const userpage = await UserPage.destroy({
          where: {
            UserId: req.user.id,
            PageId: req.params.id,
          },
        });
        return res.json({ userpage });
      }
    } catch (err) {
      console.log(err);
      return res.status(422).json(err);
    }
  },
);

app.get("/home", connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
  try {
    const allCourse = await Course.getCourse();
    const allChapter = await Chapter.getChapter();
    const allMyCourse = await UserCourse.getMyCourse(req.user.id);

    if (req.accepts("html")) {
      res.render("home", {
        allCourse,
        allMyCourse,
        allChapter,
        user: req.user,
        csrfToken: req.csrfToken(),
      });
    } else {
      res.json({ allCourse });
    }
  } catch (err) {
    console.log(err);
    res.status(422).json(err);
  }
});
app.post(
  "/viewcourse/:CourseId/chapter",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    console.log("the courseid is " + request.params.CourseId);
    console.log("CSRF Token received:", request.csrfToken());

    try {
      if (!request.csrfToken()) {
        return response.status(403).send("Invalid CSRF token");
      }
      const chapter = await Chapter.addChapter({
        title: request.body.title,
        description: request.body.description,
        CourseId: request.params.CourseId,
      });
      console.log("chapter" + chapter);
      const allPage = await Page.getPage();
      const allMyPage = await UserPage.findAll({
        where: {
          UserId: request.user.id,
        },
      });
      response.render("chapter-page", {
        ChapterId: chapter,
        allPage,
        allMyPage,
        user: request.user,
        csrfToken: request.csrfToken(),
      });
    } catch (error) {
      console.log(error);
      return response.status(422).json(error);
    }
  },
);

app.get(
  "/viewcourse/:CourseId/chapter-page/:ChapterId",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    try {
      console.log(
        "the chapter-page id for /chapter-page " + req.params.ChapterId,
      );
      const allPage = await Page.getPage();
      const chapter = await Chapter.findByPk(req.params.ChapterId);
      const allMyPage = await UserPage.findAll({
        where: {
          UserId: req.user.id,
        },
      });
      console.log("allmypages", allMyPage);
      res.render("chapter-page", {
        ChapterId: chapter,
        allPage,
        allMyPage,
        csrfToken: req.csrfToken(),
        user: req.user,
      });
    } catch (err) {
      console.log(err);
      return res.status(422).json(err);
    }
  },
);

app.get("/course/new", (req, res) => {
  res.render("course", { csrfToken: req.csrfToken() });
});
const fetchCourseDetails = async (req, res, next) => {
  const courseId = req.params.courseId;
  try {
    const course = await Course.findById(courseId);
    if (course) {
      req.course = course;
      next();
    } else {
      res.status(404).send("Course not found");
    }
  } catch (error) {
    console.error("Error fetching course details:", error);
    res.status(500).send("Internal Server Error");
  }
};

app.get(
  "/viewcourse/:courseId",
  connectEnsureLogin.ensureLoggedIn(),
  fetchCourseDetails,
  async (req, res) => {
    const allChapter = await Chapter.findAll({
      where: {
        CourseId: req.params.courseId,
      },
    });
    var allMyCourse = await UserCourse.findOne({
      where: {
        UserId: req.user.id,
        CourseId: req.params.courseId,
      },
    });
    if (allMyCourse === null) {
      allMyCourse = false;
    }
    const allCourse = await Course.findByPk(req.params.courseId);

    res.render("course-chapter", {
      Course: allCourse,
      allMyCourse,
      allChapter: allChapter,
      csrfToken: req.csrfToken(),
      user: req.user,
    });
  },
);

app.get(
  "/viewcourse/:CourseId/chapter/:ChapterId/page/new/",
  async (req, res) => {
    console.log("the chapter for /page/new " + req.params.ChapterId);
    const chapter = await Chapter.findByPk(req.params.ChapterId);
    res.render("page", { ChapterId: chapter, csrfToken: req.csrfToken() });
  },
);
app.get("/viewcourse/:CourseId/chapter/new", (req, res) => {
  console.log("the title is " + req.params.CourseId);
  res.render("chapter", {
    CourseId: req.params.CourseId,
    csrfToken: req.csrfToken(),
  });
});
app.post(
  "/course",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    try {
      const course = await Course.addCourse({
        title: request.body.title,
        UserId: request.user.id,
      });
      response.redirect(`/viewcourse/${course.id}`);
    } catch (error) {
      console.log(error);
      return response.status(422).json(error);
    }
  },
);
app.post(
  "/viewcourse/:CourseId/chapter/:ChapterId/page",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    console.log("the chapterId is " + request.params.ChapterId);
    try {
      const pageContent = await Page.addPage({
        content: request.body.content,
        completed: request.body.completed,
        ChapterId: request.params.ChapterId,
      });
      const chapter = await Chapter.findByPk(request.params.ChapterId);
      console.log("pagecontent" + pageContent.id);
      if (request.accepts("html")) {
        response.redirect(
          `/viewcourse/${chapter.CourseId}/chapter/${request.params.ChapterId}/fullpage/${pageContent.id}`,
        );
      } else {
        return response.json(pageContent);
      }
    } catch (error) {
      console.log(error);
      return response.status(422).json(error);
    }
  },
);
app.get("/reports", async (req, res) => {
  try {
    const course = await Course.findAll({
      where: {
        UserId: req.user.id,
      },
    });
    const courseidArray = course.map((course) => course.id);
    const usercourseCounts = await Promise.all(
      courseidArray.map(async (courseId) => {
        const count = await UserCourse.count({
          where: {
            CourseId: courseId,
          },
        });
        return {
          courseId,
          count,
        };
      }),
    );
    course.sort((a, b) => {
      const countA =
        usercourseCounts.find((item) => item.courseId === a.id)?.count || 0;
      const countB =
        usercourseCounts.find((item) => item.courseId === b.id)?.count || 0;
      return countB - countA;
    });
    return res.render("report", { course, usercourseCounts });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});
module.exports = app;
