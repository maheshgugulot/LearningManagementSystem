const express = require("express");
const app = express();
const path = require("path");
app.use(express.json()); 
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
const {Course,Chapter,Page} = require("./models");
app.use(express.urlencoded({ extended: true })); 
app.get("/",async(req,res)=>{
    try{
        const allCourse = await Course.getCourse();
        const allChapter = await Chapter.getChapter();
        if(req.accepts("html")){
            res.render("home",{allCourse,allChapter});
        }
        else{
            res.json({allCourse})
        }
    }catch(err){
        console.log(err);
        res.status(422).json(err);
    }
})
app.post("/chapter",async (request,response)=>{
    console.log( "the title is " + request.query.CourseId)
    try{
        const chapter=await Chapter.addChapter(
            {
                title : request.body.title,
                description : request.body.description,
                CourseId : request.query.CourseId
            }
        )
        response.render("chapter-page",{"ChapterId":chapter.id});
    }
    catch(error){
        console.log(error)
        return response.status(422).json(error)
    }
})
app.get("/course/new",(req,res)=>{
    res.render("course")
})
// Middleware to fetch course details based on ID
const fetchCourseDetails = async (req, res, next) => {
    const courseId = req.params.courseId; // Assuming the course ID is in the URL parameter
    try {
        const course = await Course.findById(courseId); // Replace with your data retrieval logic
        if (course) {
            req.course = course; // Attach course details to the request object
            next();
        } else {
            res.status(404).send("Course not found");
        }
    } catch (error) {
        console.error("Error fetching course details:", error);
        res.status(500).send("Internal Server Error");
    }
};

// Use the middleware in your route
app.get("/viewcourse/:courseId", fetchCourseDetails, async(req, res) => {
    const course = req.course;
    const allChapter = await Chapter.getChapter();
    res.render("course-chapter", { "Course": course,"allChapter":allChapter });
});


app.get("/page/new",(req,res)=>{
    console.log( "the title is " + req.query.ChapterId)
    res.render("page",{"ChapterId":req.query.ChapterId})
})
app.get("/chapter/new",(req,res)=>{
    console.log( "the title is " + req.query.CourseId)
    res.render("chapter",{"CourseId":req.query.CourseId})
})
app.post("/course",async (request,response)=>{
    console.log( "the title is " + request.body)
    try{
        const course=await Course.addCourse(
            {
                title : request.body.title
            }
        )
        console.log("the course is "+ course)
        response.render("course-chapter",{"Course":course});
    }
    catch(error){
        console.log(error)
        return response.status(422).json(error)
    }
})
app.post("/page",async (request,response)=>{
    console.log( "the chapterId is " + request.query.ChapterId)
    try{
        const page=await  Page.addPage(
            {
                content : request.body.content,
                description : request.body.description,
                ChapterId : request.query.ChapterId,

            }
        )
        response.json(page)
    }
    catch(error){
        console.log(error)
        return response.status(422).json(error)
    }
})

module.exports = app;