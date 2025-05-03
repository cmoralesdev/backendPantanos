const express = require('express')
const cors = require('cors')
const db = require('./firebase.config')



const port = 4000


const app = express()


const corsConfig = { origin: "http://localhost:5173" }
app.use(cors(corsConfig))


app.use(express.json())



app.get("/", async (req, res) => {
    try {
        const { comunidad } = req.query
        const pantanosRef = db.collection("pantanos")
        let pantanoSnapShot
        if (!comunidad) {
            pantanoSnapShot = await pantanosRef.get()
        } else {
            pantanoSnapShot = await pantanosRef.where('comunidad', '==', comunidad).get()
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
    }
})

app.get("/guias", async (req, res) => {
    try {
        const { pantanoId } = req.query;

        if (!pantanoId) {
            return res.status(400).json({ message: "Falta el ID del pantano." });
        }

        const guiasRef = db.collection("guias");
        const snapshot = await guiasRef.where("pantanos", "array-contains", pantanoId).get();

        if (snapshot.empty) {
            return res.status(200).json([]); // No hay guías, pero no es error
        }

        const guias = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.status(200).json(guias);
    } catch (error) {
        console.error("Error al obtener guías:", error);
        res.status(500).json({ message: "Error al obtener guías." });
    }
});

//crear app.post que recoja el formulario del modal y /reserva y que cree reserva en firebase
/*
app.post("/reservas", async (req, res) => {
    try {
        const {
            nombre,
            fecha,
            pantanoId,
            guiaId,
        } = req.body;

        if (!nombre || !fecha || !pantanoId || !guiaId) {
            return res.status(400).json({ message: "Faltan datos obligatorios." });
        }

        const reservaRef = db.collection("reservas").doc();
        const nuevaReserva = {
            id: reservaRef.id,
            nombre,
            fecha,
            pantanoId,
            guiaId,
            status: "Pendiente",
            creadaEn: new Date().toISOString(),
        };

        await reservaRef.set(nuevaReserva);

        res.status(201).json({ message: "Reserva guardada correctamente." });
    } catch (error) {
        console.error("Error al guardar reserva:", error);
        res.status(500).json({ message: "Error interno del servidor." });
    }
});
*/

// Obtener reservas con filtro opcional por usuarioId
app.get("/reservas", async (req, res) => {
    try {
        const { usuarioId } = req.query;

        let query = db.collection("reservas");
        if (usuarioId) {
            query = query.where("usuarioId", "==", usuarioId);
        }

        const snapshot = await query.get();
        const reservas = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.status(200).json(reservas);
    } catch (error) {
        console.error("Error al obtener reservas", error);
        res.status(500).json({ message: "Error al obtener reservas" });
    }
});


// Crear nueva reserva
app.post("/reservas", async (req, res) => {
    try {
        const {
            nombre,
            fecha,
            pantanoId,
            pantanoNombre,
            pantanoImagen,
            guiaId,
            guiaNombre,
            usuarioId // ← se espera también este campo ahora
        } = req.body;

        if (!nombre || !fecha || !pantanoId || !pantanoNombre || !pantanoImagen || !guiaId || !guiaNombre || !usuarioId) {
            return res.status(400).json({ message: "Faltan datos obligatorios." });
        }

        const reservaRef = db.collection("reservas").doc();
        const nuevaReserva = {
            id: reservaRef.id,
            nombre,
            fecha,
            pantanoId,
            pantanoNombre,
            pantanoImagen,
            guiaId,
            guiaNombre,
            usuarioId,
            status: "Pendiente",
            creadaEn: new Date().toISOString(),
        };

        await reservaRef.set(nuevaReserva);

        res.status(201).json({ message: "Reserva guardada correctamente." });
    } catch (error) {
        console.error("Error al guardar reserva:", error);
        res.status(500).json({ message: "Error interno del servidor." });
    }
});




app.get("/:id", async (req, res) => {
    try {
        const { id } = req.params
        const docRef = db.collection("pantanos").doc(id)
        const docSnapShot = await docRef.get()
        if (!docSnapShot.exists) {
            console.error("No hemos encontrado la referencia")
            res.status(404).json({ message: "El pantano no se ha encotrado" })
        }
        const pantano = docSnapShot.data()

        res.status(200).json(pantano)
    } catch (error) {
        console.error("Error al obtener pantano:", error)
        res.sendStatus(500)
    }
})


app.listen(port, () => { console.log(`Server is running at http://localhost:${port}`) })
