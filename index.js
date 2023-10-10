const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const cors = require('cors');
const path = require("path");
const app = express();
app.use(express.json());
app.use(cors());

const dbPath = path.join(__dirname, "demodatabase.db");
let db = null;
const initializeDbAndServer = async () => {
    try {
        db = await open({
            filename : dbPath,
            driver : sqlite3.Database,   
        }) 
        await createTable();

        app.listen(3000, () => {
            console.log("Server Running at http://localhost:3000/");
          }); 
    } catch (e) {
        console.log(DB Error: ${e.message});
    process.exit(1);
    }  
}

const createTable = async()=>{
    try {
       await db.exec(`
        CREATE TABLE IF NOT EXISTS mytable(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            friend_name (VARCHAR 250),
            blog TEXT,
            comment TEXT
        )`
    )
    console.log("mytable table created successfully")
    } catch (error) {
        console.log(Error creating mytable table: ${error.message});
        process.exit(1);
    }
}


initializeDbAndServer();


app.post("/postblog", async (request, response)=>{
    const blogDetails = request.body;
    const {friendname, blog,comment} = blogDetails;
    const postquery = `
            INSERT INTO mytable (friendName, blog, comment)
            VALUES (?, ?, ?)`;
    const result = await db.run(postquery, [friendname, blog, comment]);
    const blogid = result.lastID
    response.send({ message: "Blog posted successfully" , blogid : blogid});
})

app.get("/blogs", async (request, response)=>{
    const getallblogs = `
    SELECT * 
    FROM mytable
    ORDER BY
    blogid ASC`;
    const dbresponse = await db.all(getallblogs)
    response.send(dbresponse)
})


app.get("/blogs/:blogid",async (request,response)=>{
    const {blogid} = request.params;
    const getsingleblog = `SELECT *
    FROM mytable
    WHERE id = ?`
    const dbresponse = await db.get(getsingleblog, [blogid])
    response.send(dbresponse)
})