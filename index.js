const express = require('express')
const cors = require('cors')
const db = require('./firebase.config')



const port = 4000


const app = express()


const corsConfig = {origin: "http://localhost:5173"}
app.use(cors(corsConfig))


app.use(express.json())



app.get("/", async (req,res) => { try {
    const {comunidad} = req.query
    const pantanosRef= db.collection("pantanos")
    let pantanoSnapShot
    if (!comunidad){
        pantanoSnapShot= await pantanosRef.get()
    }else {
        pantanoSnapShot= await pantanosRef.where('comunidad','==',comunidad).get()
    }

    if (pantanoSnapShot.empty) {
        console.error("No hemos encontrado la referencia")
        return res.status(404).json({ message: "No hemos encontrado la referencia" });
        
    }
    const pantanos = pantanoSnapShot.docs.map(doc => (doc.data()
    ));
    res.status(200).json(pantanos)
} catch (error) {
    console.error("Error al obtener pantanos:", error)
    res.sendStatus(500)
} }) 






app.get("/:id", async (req,res) => { try {
    const {id} = req.params
    const docRef= db.collection("pantanos").doc(id)
    const docSnapShot= await docRef.get()
    if (!docSnapShot.exists) {
        console.error("No hemos encontrado la referencia")
        res.status(404).json({message:"El pantano no se ha encotrado"})
    }
    const pantano = docSnapShot.data()

    res.status(200).json(pantano)
} catch (error) {
    console.error("Error al obtener pantano:", error)
    res.sendStatus(500)
} }) 


app.listen(port, () => {console.log(`Server is running at http://localhost:${port}`)})
