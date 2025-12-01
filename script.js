document.addEventListener("DOMContentLoaded", () => {
  // --- Simula la base de datos de disponibilidad ---
  const disponibilidad = {
    "2025-12-03": ["10:00","10:45", "11:30", "13:30", "15:00"],
    "2025-12-04": [], // Sin disponibilidad
    "2025-12-07": ["08:00", "08:30", "09:00", "10:45"],
    "2025-12-11": ["08:00", "10:00", "14:30"]
  };

  const fechaInput    = document.getElementById("fecha");
  const horasSelect   = document.getElementById("horas");
  const mensaje       = document.getElementById("mensaje");
  const form          = document.getElementById("form-cita");
  const profesionalEl = document.getElementById("profesional");

  // Dejar el select bloqueado al inicio
  horasSelect.disabled = true;
  horasSelect.innerHTML = "<option value=''>Seleccione una fecha primero</option>";

  // --- Mostrar horas disponibles según la fecha seleccionada ---
  fechaInput.addEventListener("change", () => {
    const fechaFormateada = fechaInput.value; // ej: "2025-12-03"
    horasSelect.innerHTML = "";

    if (!fechaFormateada) {
      horasSelect.disabled = true;
      horasSelect.innerHTML = "<option value=''>Seleccione una fecha primero</option>";
      return;
    }

    const horasDeEseDia = disponibilidad[fechaFormateada];

    // Si no existe esa fecha en el objeto o no tiene horas
    if (!horasDeEseDia || horasDeEseDia.length === 0) {
      // limpiar fecha y mostrar mensaje
      fechaInput.value = "";
      horasSelect.disabled = true;
      horasSelect.innerHTML = "<option value=''>Seleccione una fecha primero</option>";
      mensaje.textContent = "⚠️ En esa fecha no hay horas disponibles. Elija otro día.";
      mensaje.style.color = "orange";
      return;
    }

    // Si hay horas, las cargamos
    mensaje.textContent = "";
    horasSelect.disabled = false;
    const optInicial = document.createElement("option");
    optInicial.value = "";
    optInicial.textContent = "Seleccione una hora";
    horasSelect.appendChild(optInicial);

    horasDeEseDia.forEach(hora => {
      const opt = document.createElement("option");
      opt.value = hora;
      opt.textContent = hora;
      horasSelect.appendChild(opt);
    });
  });

  // --- Guardar cita localmente y enviar correo con EmailJS ---
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!horasSelect.value) {
      mensaje.textContent = "⚠️ Por favor seleccione una hora disponible.";
      mensaje.style.color = "orange";
      return;
    }

    if (!profesionalEl.value) {
      mensaje.textContent = "⚠️ Por favor seleccione el profesional que lo atenderá.";
      mensaje.style.color = "orange";
      return;
    }

    const datos = {
      nombres:     document.getElementById("nombres").value,
      apellidos:   document.getElementById("apellidos").value,
      rut:         document.getElementById("rut").value,
      celular:     document.getElementById("celular").value,
      correo:      document.getElementById("correo").value,
      fecha:       document.getElementById("fecha").value,
      hora:        document.getElementById("horas").value,
      profesional: profesionalEl.value      // 👈 aquí guardamos el profesional elegido
    };

    // Guardar localmente
    const citasGuardadas = JSON.parse(localStorage.getItem("citas")) || [];
    citasGuardadas.push(datos);
    localStorage.setItem("citas", JSON.stringify(citasGuardadas));

    // --- Enviar correo de confirmación con EmailJS ---
    emailjs.send("service_o4m4tsm", "template_wqze3h8", datos)
      .then(() => {
        mensaje.textContent = "✅ Su teleconsulta psicológica ha sido agendada correctamente. Revise su correo para más información.";
        mensaje.style.color = "green";
        form.reset();
        horasSelect.innerHTML = "<option value=''>Seleccione una fecha primero</option>";
        horasSelect.disabled = true;
      })
      .catch((error) => {
        console.error("Error al enviar el correo:", error);
        mensaje.textContent = "⚠️ Error al enviar el correo: " + (error.text || error.message || "revise la configuración en EmailJS (Service ID, Template ID y clave pública).");
        mensaje.style.color = "orange";
      });
  });
});
