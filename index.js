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
        const { comunidad, valoracion } = req.query;
        let query = db.collection("pantanos");

        if (comunidad) {
            query = query.where("comunidad", "==", comunidad);
        }

        if (valoracion) {
            query = query.where("valoracion", "==", Number(valoracion));
        }

        const snapshot = await query.get();

        if (snapshot.empty) {
            return res.status(200).json([]);
        }

        const pantanos = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.status(200).json(pantanos);
    } catch (error) {
        console.error("Error al obtener pantanos:", error);
        res.sendStatus(500);
    }
});

app.get("/guias", async (req, res) => {
    try {
        const { pantanoId } = req.query;

        if (!pantanoId) {
            return res.status(400).json({ message: "Falta el ID del pantano." });
        }

        const guiasRef = db.collection("guias");
        const snapshot = await guiasRef.where("pantanos", "array-contains", pantanoId).get();

        if (snapshot.empty) {
            return res.status(200).json([]);
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


app.get("/reservas", async (req, res) => {
    try {
        const { usuarioId } = req.query;

        let query = db.collection("reservas");
        if (usuarioId) {
            query = query.where("usuarioId", "==", usuarioId);
        }
        const reservasSnapshot = await query.get();


        const reservas = await Promise.all (reservasSnapshot.docs.map( async doc => {
            const reserva = doc.data()
            const pantanoRef = db.collection("pantanos").doc(reserva.pantanoId)
            const guiaRef = db.collection("guias").doc(reserva.guiaId)
            
            const pantanoSnapshot = await pantanoRef.get();
            const guiaSnapshot = await guiaRef.get();

            const pantano = pantanoSnapshot.data();
            const guia = guiaSnapshot.data();
            
            return {reserva:reserva, pantano:pantano, guia:guia}
        }));
        res.status(200).json(reservas);
    } catch (error) {
        console.error("Error al obtener reservas", error);
        res.status(500).json({ message: "Error al obtener reservas" });
    }
});



app.post("/reservas", async (req, res) => {
    try {
        const {
            fecha,
            pantanoId,
            guiaId,
            usuarioId
        } = req.body;

        if ( !fecha || !pantanoId || !guiaId || !usuarioId) {
            return res.status(400).json({ message: "Faltan datos obligatorios." });
        }

        const reservaRef = db.collection("reservas").doc();
        const nuevaReserva = {
            id: reservaRef.id,
            
            fecha,
            pantanoId,
            guiaId,
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

app.delete("/reservas/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await db.collection("reservas").doc(id).delete();
        res.status(200).json({ message: "Reserva eliminada correctamente." });
    } catch (error) {
        console.error("Error al eliminar reserva:", error);
        res.status(500).json({ message: "Error al eliminar reserva." });
    }
});

app.put("/reservas/:id", async (req, res) => {
    try {
    
        const { id } = req.params;
        const nuevaData = req.body;
        await db.collection("reservas").doc(id).update(nuevaData);
        res.status(200).json({ message: "Reserva actualizada correctamente." });
    } catch (error) {
        console.error("Error al actualizar reserva:", error);
        res.status(500).json({ message: "Error al actualizar reserva." });
    }
});
app.listen(port, () => { console.log(`Server is running at http://localhost:${port}`) })
