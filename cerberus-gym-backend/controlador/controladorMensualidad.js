const Mensualidad= require("../modelo/modeloMensualidad");

async function obtenerMensualidad(req, res) {
    try {
        const mensualidad = await Mensualidad.getMensualidad();
        res.json(mensualidad);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

async function modificarMensualidad(req, res) {
    try {
        const { mensualidad } = req.body;
        await Mensualidad.modificarMensualidad(mensualidad);
        res.json({ message: 'Mensualidad modificada correctamente' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

module.exports = { obtenerMensualidad, modificarMensualidad};