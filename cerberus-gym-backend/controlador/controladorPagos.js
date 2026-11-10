const Pagos = require('../modelo/modeloPagos');
const Socios = require('../modelo/modeloSocios');
const Mensualidad = require('../modelo/modeloMensualidad');
const { fechaVencimientoSiguienteCiclo } = require('../utils/fechas');

async function listarPagos(req, res) {
  try {
    const pagos = await Pagos.obtenerTodos();
    res.json(pagos);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function obtenerPagoPorId(req, res) {
  try {
    const { id } = req.params;
    const pago = await Pagos.obtenerPorId(id);
    res.json(pago);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function crearPago(req, res) {
  try {
    const { id_socio, monto, fecha_vencimiento } = req.body;

    const socio = await Socios.obtenerPorId(id_socio);

    if (!socio.activo) {
      return res.status(400).json({
        error: 'No se pueden registrar pagos para un socio dado de baja.'
      });
    }

    const pago = await Pagos.crear({
      id_socio,
      monto,
      fecha_vencimiento
    });

    res.status(201).json(pago);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function borrarPago(req, res) {
  try {
    const { id } = req.params;
    const pago = await Pagos.eliminar(id);
    res.json(pago);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function actualizarPago(req, res) {
  try {
    const { id } = req.params;
    const { pagado, metodo, fecha_pago, partes } = req.body;

    const anterior = await Pagos.obtenerPorId(id);

    let monto_efectivo = 0;
    let monto_transferencia = 0;

    if (pagado) {
      if (metodo === 1) {
        monto_efectivo = Number(anterior.monto);
      } else if (metodo === 2) {
        monto_transferencia = Number(anterior.monto);
      } else if (metodo === 3) {
        monto_efectivo = Number(
          partes?.find(p => p.metodo === 1)?.monto || 0
        );

        monto_transferencia = Number(
          partes?.find(p => p.metodo === 2)?.monto || 0
        );

        if (
          monto_efectivo <= 0 ||
          monto_transferencia <= 0 ||
          monto_efectivo + monto_transferencia !== Number(anterior.monto)
        ) {
          return res.status(400).json({
            error: 'Los importes del pago mixto no son válidos.'
          });
        }
      } else {
        return res.status(400).json({
          error: 'Método de pago inválido.'
        });
      }
    }

    const pago = await Pagos.actualizar(id, {
      pagado,
      metodo,
      fecha_pago,
      monto_efectivo,
      monto_transferencia
    });

    if (pagado === true && !anterior.pagado) {
      await generarSiguienteCuota(pago);
    }

    res.json(pago);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function generarSiguienteCuota(pago) {
  const socio = await Socios.obtenerPorId(pago.id_socio);

  if (!socio.activo) return;

  const fecha = fechaVencimientoSiguienteCiclo(
    pago.fecha_vencimiento,
    socio.dia_pago
  );

  const existente = await Pagos.buscarPorSocioYFecha(
    socio.id,
    fecha
  );

  if (existente) return;

  const mensualidad = await Mensualidad.getMensualidad();

  await Pagos.crear({
    id_socio: socio.id,
    monto: mensualidad,
    fecha_vencimiento: fecha
  });
}

async function eliminarSiguienteCuotaPendiente(pago) {
  const siguiente = await Pagos.buscarSiguiente(pago.id_socio, pago.fecha_vencimiento);
  if (siguiente && !siguiente.pagado) await Pagos.eliminar(siguiente.id);
}



module.exports = { listarPagos, obtenerPagoPorId, crearPago, borrarPago, actualizarPago, generarSiguienteCuota, eliminarSiguienteCuotaPendiente };