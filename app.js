const express = require("express");
const app = express();
const path = require("path");
app.use(express.json()); 
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
const {Course,Chapter,Page} = require("./models");
app.use(express.urlencoded({ extended: true })); 
app.get("/",(req,res)=>{
    res.render("home")
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
        console.log("the course is "+ course.id)
        response.render("course-chapter",{"CourseId":course.id});
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