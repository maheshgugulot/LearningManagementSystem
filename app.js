const express = require("express");
const app = express();
const path = require("path");
app.use(express.json()); 
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
const {Course,Chapter,Page} = require("./models");
app.use(express.urlencoded({ extended: true })); 
app.get("/fullpage/:id",async(req,res)=>{
    try{
        const pageContent= await Page.findByPk(req.params.id);
        const ChapterName= await Chapter.findOne({
            where:{id:pageContent.ChapterId}});
        if(req.accepts("html")){
            res.render("pagecontent",{pageContent,ChapterName});
            }
            else{
                return res.json(PageContent)
            }
    }catch(err){
        console.log(err);
        return res.status(422).json(err)
    }
})
app.get("/mycourse",async(req,res)=>{
    try{
        const allCourse = await Course.getMyCourse();
        const allChapter =await Chapter.getChapter(); 
        if(req.accepts("html")){
        return res.render("mycourse",{allCourse,allChapter});
        }
        else{
            return res.json(allCourse)
        }
    }catch(err){
        console.log(err);
        return res.status(422).json(err)
    }
})
app.get("/progress",async(req,res)=>{
    try{
        const allCourse = await Course.getMyCourse(); 
        const allChapter = await Chapter.getChapter(); 
        const allPage = await Page.getPage(); 
        if(req.accepts("html")){
        return res.render("progress",{allCourse,allChapter,allPage});
        }
        else{
            return res.json(allCourse)
        }
    }catch(err){
        console.log(err);
        return res.status(422).json(err)
    }
})
app.put("/enroll/:id", async (req, res) => {
    try {
        const course = await Course.findByPk(req.params.id);
        if (!course) {
            return res.status(404).json({ error: "Course not found" });
        }

        course.enroll = !course.enroll;

        await course.save();

        return res.json({ enroll: course.enroll });
    } catch (err) {
        console.log(err);
        return res.status(422).json(err);
    }
});
app.put("/markAsComplete/:id", async (req, res) => {
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
        const chapter = await Chapter.addChapter(
            {
                title : request.body.title,
                description : request.body.description,
                CourseId : request.query.CourseId
            }
            )
            console.log( "chapter" + chapter)
            // const ChapterId 
            const allPage=await Page.getPage();
            response.render("chapter-page",{"ChapterId":chapter,allPage});
        }
        catch(error){
            console.log(error)
            return response.status(422).json(error)
        }
    })
    
app.get("/chapter-page",async(req,res)=>{
        try{
            console.log( "the chapter-page id for /chapter-page " + req.query.ChapterId)
            const allPage=await Page.getPage();
            const chapter=await Chapter.findByPk(req.query.ChapterId);
            res.render("chapter-page",{"ChapterId":chapter,allPage});
    }catch(err){
        console.log(err)
        return res.status(422).json(err)
    }
})

app.get("/course/new",(req,res)=>{
    res.render("course")
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

app.get("/viewcourse/:courseId", fetchCourseDetails, async(req, res) => {
    const course = req.course;
    const allChapter = await Chapter.getChapter();
    res.render("course-chapter", { "Course": course,"allChapter":allChapter });
});


app.get("/page/new",(req,res)=>{
    console.log( "the chapter for /page/new " + req.query.ChapterId)
    res.render("page",{"ChapterId":req.query.ChapterId})
})
app.get("/chapter/new",(req,res)=>{
    console.log( "the title is " + req.query.CourseId)
    res.render("chapter",{"CourseId":req.query.CourseId})
})
app.post("/course",async (request,response)=>{
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
app.post("/page",async (request,response)=>{
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