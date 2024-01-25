const express = require("express");
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
app.set("views", path.join(__dirname, "views"));
const {Course,Chapter,Page ,User,UserCourse} = require("./models");
app.use(express.urlencoded({ extended: true })); 
app.use(cookieParser("ssh! some secret string"));
app.use(csrf("this_should_be_32_character_long", ["POST", "PUT", "DELETE"]));
app.use(passport.initialize());
app.use(session({
    secret: "its-my-secret-key1010",
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, //24hrs
    },
  }),);
  app.use(passport.initialize());
app.use(passport.session());
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    (username, password, done) => {
      User.findOne({ where: { email: username } })
        .then(async (user) => {
          const result = await bcrypt.compare(password, user.password);
          return done(null, user);
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
app.get("/",async(req,res)=>{
    if (req.isAuthenticated()) {
        return res.redirect("/home");
      }
    res.render("index",{csrfToken: req.csrfToken(),
})
app.get("/signup", (request, response) => {
    response.render("signup", { csrfToken: request.csrfToken() });
  });
});
  app.get("/login", (request, response) => {
    response.render("login", { csrfToken: request.csrfToken() });
  });
  app.get("/signout", (req, res) => {
    req.logout((err) => {
      if (err) return next(err);
      res.redirect("/");
    });
  });
app.post("/users", async (request, response) => {
    const hashedPwd = await bcrypt.hash(request.body.password, saltRounds);
    var isAdminChecked =false;
    if( request.body.isAdmin === 'on'){
        isAdminChecked= true;
    }
    console.log("admin"+request.body.isAdmin)
    console.log("admin"+isAdminChecked)
    try {
      const user = await User.create({
        firstName: request.body.firstName,
        lastName: request.body.lastName,
        password: hashedPwd,
        email: request.body.email,
        isAdmin : isAdminChecked
      });
      request.login(user, (err) => {
        if (err) console.log(err);
        response.redirect("/home");
      });
    } catch (error) {
      console.log(error);
    }
  });
  app.post("/session",
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    (request, response) => {
      console.log(request.user);
      response.redirect("/home");
    },
  );
app.post("/enroll/:id", connectEnsureLogin.ensureLoggedIn(),
async (req,res) => {
    console.log("courseid"+req.params.id);
    console.log("enrol"+req.body.enroll);

    try {
        if(req.body.enroll){
            const usercourse=await UserCourse.create({
                UserId: req.body.userid,
                CourseId : req.params.id,
                enroll : req.body.enroll
            });
            return res.json({usercourse});
        }
        else{
            const usercourse=await UserCourse.destroy({
                where:{
                UserId: req.body.userid,
                CourseId : req.params.id,
                }
            });
            return res.json({usercourse});
        }
    } catch (err) {
        console.log(err);
        return res.status(422).json(err);
    }
});
app.get("/fullpage/:id",connectEnsureLogin.ensureLoggedIn(),
async (req,res)=>{
    try{
        const pageContent= await Page.findByPk(req.params.id);
        const ChapterName= await Chapter.findOne({
            where:{id:pageContent.ChapterId}});
        if(req.accepts("html")){
            res.render("pagecontent",{pageContent,ChapterName,csrfToken: req.csrfToken()});
            }
            else{
                return res.json(PageContent)
            }
    }catch(err){
        console.log(err);
        return res.status(422).json(err)
    }
})
app.get("/mycourse",connectEnsureLogin.ensureLoggedIn(),
async (req,res)=>{
    try{
        const allChapter =await Chapter.getChapter(); 
        const allMyCourse = await UserCourse.getMyCourse(req.user.id);
        const allCourse = await Course.getCourse();
        if(req.accepts("html")){
        return res.render("mycourse",{allCourse,allMyCourse,user: req.user,allChapter});
        }
        else{
            return res.json(allCourse)
        }
    }catch(err){
        console.log(err);
        return res.status(422).json(err)
    }
})
app.get("/progress",connectEnsureLogin.ensureLoggedIn(),
async (req,res)=>{
    try{
        const allCourse = await Course.getCourse(); 
        const allMyCourse = await UserCourse.getMyCourse(req.user.id);
        const allChapter = await Chapter.getChapter(); 
        const allPage = await Page.getPage(); 
        if(req.accepts("html")){
        return res.render("progress",{allCourse,allMyCourse,allChapter,allPage});
        }
        else{
            return res.json(allCourse)
        }
    }catch(err){
        console.log(err);
        return res.status(422).json(err)
    }
})


app.put("/markAsComplete/:id", connectEnsureLogin.ensureLoggedIn(),
async (req,res) => {
    try {
        const pageMarkAsComplete = await Page.findByPk(req.params.id);
        console.log("boolean value of page "+ pageMarkAsComplete.completed)
        console.log("id value of page "+ req.params.id)
        if (!pageMarkAsComplete) {
            return res.status(404).json({ error: "page not found" });
        }
        
        const PageMarkAsComplete = await Page.update(
            { completed: !pageMarkAsComplete.completed },
            { where: { id: req.params.id } }
            );
            
            console.log("After boolean value of page "+ PageMarkAsComplete.completed)
        return res.json(PageMarkAsComplete);
    } catch (err) {
        console.log(err);
        return res.status(422).json(err);
    }
});

app.get("/home", connectEnsureLogin.ensureLoggedIn(),
async (req,res)=>{
    try{
        const allCourse = await Course.getCourse();
        const allChapter = await Chapter.getChapter();
        const allMyCourse = await UserCourse.getMyCourse(req.user.id);

        if(req.accepts("html")){
            res.render("home",{allCourse,allMyCourse,allChapter,user: req.user, csrfToken: req.csrfToken()});
        }
        else{
            res.json({allCourse})
        }
    }catch(err){
        console.log(err);
        res.status(422).json(err);
    }
})
app.post("/chapter", connectEnsureLogin.ensureLoggedIn(),async (request,response)=>{
    console.log( "the title is " + request.query.CourseId)
    console.log("CSRF Token received:", request.csrfToken());

    try{
        if (!request.csrfToken()) {
            return response.status(403).send("Invalid CSRF token");
        }
        const chapter = await Chapter.addChapter(
            {
                title : request.body.title,
                description : request.body.description,
                CourseId : request.query.CourseId
            }
            )
            console.log( "chapter" + chapter)
            const allPage=await Page.getPage();
            response.render("chapter-page",{"ChapterId":chapter,allPage,user: req.user,csrfToken: request.csrfToken()});
        }
        catch(error){
            console.log(error)
            return response.status(422).json(error)
        }
    })
    
app.get("/chapter-page",connectEnsureLogin.ensureLoggedIn(),
async (req,res)=>{
        try{
            console.log( "the chapter-page id for /chapter-page " + req.query.ChapterId)
            const allPage=await Page.getPage();
            const chapter=await Chapter.findByPk(req.query.ChapterId);
            res.render("chapter-page",{"ChapterId":chapter,allPage,csrfToken: req.csrfToken(),user: req.user});
    }catch(err){
        console.log(err)
        return res.status(422).json(err)
    }
})

app.get("/course/new",(req,res)=>{
    res.render("course",{csrfToken: req.csrfToken()})
})
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

app.get("/viewcourse/:courseId",  connectEnsureLogin.ensureLoggedIn(),fetchCourseDetails, async( req,res) => {
    const allChapter = await Chapter.findAll({
        where:{
            CourseId:req.params.courseId
        }
    });
    const allMyCourse = await UserCourse.findOne({
        where:{
            CourseId:req.params.courseId
        }
    });
    console.log("allmycourse"+allMyCourse);
    const allCourse = await Course.findByPk(req.params.courseId); 

    res.render("course-chapter", { "Course":allCourse, allMyCourse,"allChapter":allChapter,csrfToken: req.csrfToken(),user: req.user });
});


app.get("/page/new",(req,res)=>{
    console.log( "the chapter for /page/new " + req.query.ChapterId)
    res.render("page",{"ChapterId":req.query.ChapterId,csrfToken: req.csrfToken()})
})
app.get("/chapter/new",(req,res)=>{
    console.log( "the title is " + req.query.CourseId)
    res.render("chapter",{"CourseId":req.query.CourseId, csrfToken: req.csrfToken()})
})
app.post("/course", connectEnsureLogin.ensureLoggedIn(),async (request,response)=>{
    try{
        const course=await Course.addCourse(
            {
                title : request.body.title
            }
        )
        response.redirect(`/viewcourse/${course.id}`);
    }
    catch(error){
        console.log(error)
        return response.status(422).json(error)
    }
})
app.post("/page", connectEnsureLogin.ensureLoggedIn(),async (request,response)=>{
    console.log( "the chapterId is " + request.query.ChapterId)
    try{
        const pageContent=await  Page.addPage(
            {
                content : request.body.content,
                completed : request.body.completed,
                ChapterId : request.query.ChapterId,
            }
        )
        console.log("pagecontent" + pageContent.id)
        if(request.accepts("html")){
            response.redirect(`/fullpage/${pageContent.id}`)
            }
            else{
                return response.json(pageContent)
            }
    }
    catch(error){
        console.log(error)
        return response.status(422).json(error)
    }
})

module.exports = app;