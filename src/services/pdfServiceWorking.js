import jsPDF from 'jspdf';

class PDFServiceWorking {
  static downloadMedicalReport(infoMedica) {
    try {
      const pdf = new jsPDF();
      
      // Configuración inicial
      const pageWidth = pdf.internal.pageSize.width;
      const pageHeight = pdf.internal.pageSize.height;
      const margin = 20;
      let yPosition = margin;
      
      // Función para verificar espacio en página
      const checkPageSpace = (requiredSpace) => {
        if (yPosition + requiredSpace > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
      };
      
      // Función para crear tabla simple sin autoTable
      const createTable = (title, headers, data) => {
        if (!data || data.length === 0) return;
        
        checkPageSpace(50);
        
        // Configuración de columnas
        const colWidths = [15, 35, 105]; // Las medidas que querías
        const rowHeight = 15;
        let startX = margin;
        const tableWidth = colWidths[0] + colWidths[1] + colWidths[2];
        
        // Título con fondo azul - MISMO ANCHO QUE LA TABLA
        pdf.setFillColor(70, 130, 180); // Azul
        pdf.rect(startX, yPosition - 5, tableWidth, 15, 'F');
        
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(12);
        pdf.setTextColor(255, 255, 255); // Texto blanco
        pdf.text(title, startX + 5, yPosition + 5);
        yPosition += 10; // Posición para la tabla
        
        // Dibujar encabezados PEGADOS al título
        pdf.setFillColor(70, 130, 180);
        pdf.rect(startX, yPosition, tableWidth, rowHeight, 'F');
        
        // Texto de encabezados
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        
        // Headers
        pdf.text(headers[0], startX + colWidths[0]/2, yPosition + 10, { align: 'center' });
        pdf.text(headers[1], startX + colWidths[0] + colWidths[1]/2, yPosition + 10, { align: 'center' });
        pdf.text(headers[2], startX + colWidths[0] + colWidths[1] + colWidths[2]/2, yPosition + 10, { align: 'center' });
        
        yPosition += rowHeight;
        
        // Datos
        pdf.setTextColor(0, 0, 0);
        pdf.setFont('helvetica', 'normal');
        
        data.forEach((row, index) => {
          checkPageSpace(rowHeight);
          
          // Fondo alternado
          if (index % 2 === 1) {
            pdf.setFillColor(248, 249, 250);
            pdf.rect(startX, yPosition, colWidths[0] + colWidths[1] + colWidths[2], rowHeight, 'F');
          }
          
          // Texto de las celdas
          pdf.text(String(row[0]), startX + colWidths[0]/2, yPosition + 10, { align: 'center' });
          pdf.text(String(row[1]), startX + colWidths[0] + colWidths[1]/2, yPosition + 10, { align: 'center' });
          
          // Para la descripción, verificar si es muy larga y dividirla
          const description = String(row[2]);
          const maxWidth = colWidths[2] - 4;
          const lines = pdf.splitTextToSize(description, maxWidth);
          
          if (lines.length > 1) {
            // Si es muy larga, ajustar la altura
            const lineHeight = 6;
            const totalHeight = lines.length * lineHeight + 4;
            
            if (totalHeight > rowHeight) {
              checkPageSpace(totalHeight);
              
              // Redibujar fondo si es necesario
              if (index % 2 === 1) {
                pdf.setFillColor(248, 249, 250);
                pdf.rect(startX, yPosition, colWidths[0] + colWidths[1] + colWidths[2], totalHeight, 'F');
              }
              
              // Dibujar las líneas de texto
              lines.forEach((line, lineIndex) => {
                pdf.text(line, startX + colWidths[0] + colWidths[1] + 2, yPosition + 8 + (lineIndex * lineHeight));
              });
              
              yPosition += totalHeight;
            } else {
              pdf.text(lines[0], startX + colWidths[0] + colWidths[1] + 2, yPosition + 10);
              yPosition += rowHeight;
            }
          } else {
            pdf.text(description, startX + colWidths[0] + colWidths[1] + 2, yPosition + 10);
            yPosition += rowHeight;
          }
        });
        
        yPosition += 10; // Espacio después de la tabla
      };
      
      // Encabezado del documento
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('INFORME MÉDICO', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 20;
      
      // Línea separadora
      pdf.setDrawColor(0, 102, 204);
      pdf.setLineWidth(1);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 15;
      
      // Información del paciente
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('DATOS DEL PACIENTE', margin, yPosition);
      yPosition += 10;
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.text(`Paciente: ${infoMedica.paciente || 'No especificado'}`, margin, yPosition);
      yPosition += 8;
      pdf.text(`Documento: ${infoMedica.documento || 'No especificado'}`, margin, yPosition);
      yPosition += 8;
      pdf.text(`Fecha de atención: ${new Date(infoMedica.fechaAtencion || new Date()).toLocaleDateString('es-ES')}`, margin, yPosition);
      yPosition += 8;
      pdf.text(`Fecha de cita: ${new Date(infoMedica.fechaCita || new Date()).toLocaleDateString('es-ES')}`, margin, yPosition);
      yPosition += 8;
      pdf.text(`Hora de cita: ${infoMedica.horaCita || 'No especificada'}`, margin, yPosition);
      yPosition += 20;
      
      // Motivo de consulta
      if (infoMedica.motivoConsulta) {
        checkPageSpace(50);
        
        // Fondo azul para el título
        pdf.setFillColor(70, 130, 180); // Azul
        pdf.rect(margin, yPosition - 5, pageWidth - 2 * margin, 15, 'F');
        
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(12);
        pdf.setTextColor(255, 255, 255); // Texto blanco
        pdf.text('Motivo de consulta', margin + 5, yPosition + 5);
        yPosition += 20;
        
        // Contenido
        pdf.setTextColor(0, 0, 0); // Texto negro
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        const motivoLines = pdf.splitTextToSize(infoMedica.motivoConsulta, pageWidth - 2 * margin);
        motivoLines.forEach(line => {
          checkPageSpace(8);
          pdf.text(line, margin + 5, yPosition);
          yPosition += 8;
        });
        yPosition += 15;
      }
      
      // Historia clínica / Antecedentes
      if (infoMedica.historiaClinica) {
        checkPageSpace(50);
        
        // Fondo azul para el título
        pdf.setFillColor(70, 130, 180); // Azul
        pdf.rect(margin, yPosition - 5, pageWidth - 2 * margin, 15, 'F');
        
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(12);
        pdf.setTextColor(255, 255, 255); // Texto blanco
        pdf.text('Historia clínica', margin + 5, yPosition + 5);
        yPosition += 20;
        
        // Contenido
        pdf.setTextColor(0, 0, 0); // Texto negro
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        const historiaLines = pdf.splitTextToSize(infoMedica.historiaClinica, pageWidth - 2 * margin);
        historiaLines.forEach(line => {
          checkPageSpace(8);
          pdf.text(line, margin + 5, yPosition);
          yPosition += 8;
        });
        yPosition += 15;
      }
      
      // Diagnóstico
      if (infoMedica.diagnostico) {
        checkPageSpace(50);
        
        // Fondo azul para el título
        pdf.setFillColor(70, 130, 180); // Azul
        pdf.rect(margin, yPosition - 5, pageWidth - 2 * margin, 15, 'F');
        
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(12);
        pdf.setTextColor(255, 255, 255); // Texto blanco
        pdf.text('Diagnóstico', margin + 5, yPosition + 5);
        yPosition += 20;
        
        // Contenido
        pdf.setTextColor(0, 0, 0); // Texto negro
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        const diagnosticoLines = pdf.splitTextToSize(infoMedica.diagnostico, pageWidth - 2 * margin);
        diagnosticoLines.forEach(line => {
          checkPageSpace(8);
          pdf.text(line, margin + 5, yPosition);
          yPosition += 8;
        });
        yPosition += 15;
      }
      
      // Tablas de órdenes médicas
      if (infoMedica.ordenesClinicas?.laboratorios?.length > 0) {
        const laboratoriosData = infoMedica.ordenesClinicas.laboratorios.map((lab, index) => [
          index + 1,
          lab.codigo || '',
          lab.descripcion || ''
        ]);
        createTable('ÓRDENES DE LABORATORIO', ['N°', 'Código CUPS', 'Descripción'], laboratoriosData);
      }
      
      if (infoMedica.ordenesClinicas?.imagenesDiagnosticas?.length > 0) {
        const imagenesData = infoMedica.ordenesClinicas.imagenesDiagnosticas.map((img, index) => [
          index + 1,
          img.codigo || '',
          img.descripcion || ''
        ]);
        createTable('IMÁGENES DIAGNÓSTICAS', ['N°', 'Código CUPS', 'Descripción'], imagenesData);
      }
      
      // Fórmula médica
      if (infoMedica.medicamentos?.length > 0) {
        checkPageSpace(50);
        
        // Configuración de columnas para medicamentos
        const colWidthsMed = [8, 50, 15, 25, 10, 47]; // N°, Medicamento, Dosis, Forma, Cant, Indicaciones
        const rowHeight = 15;
        let startX = margin;
        const tableMedWidth = colWidthsMed.reduce((a, b) => a + b);
        
        // Título con fondo azul - MISMO ANCHO QUE LA TABLA
        pdf.setFillColor(70, 130, 180); // Azul
        pdf.rect(startX, yPosition - 5, tableMedWidth, 15, 'F');
        
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(12);
        pdf.setTextColor(255, 255, 255); // Texto blanco
        pdf.text('FÓRMULA MÉDICA', startX + 5, yPosition + 5);
        yPosition += 10; // Posición para la tabla
        
        // Dibujar encabezados PEGADOS al título
        pdf.setFillColor(70, 130, 180);
        pdf.rect(startX, yPosition, tableMedWidth, rowHeight, 'F');
        
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        
        pdf.text('N°', startX + colWidthsMed[0]/2, yPosition + 10, { align: 'center' });
        pdf.text('Medicamento', startX + colWidthsMed[0] + colWidthsMed[1]/2, yPosition + 10, { align: 'center' });
        pdf.text('Dosis', startX + colWidthsMed[0] + colWidthsMed[1] + colWidthsMed[2]/2, yPosition + 10, { align: 'center' });
        pdf.text('Forma', startX + colWidthsMed[0] + colWidthsMed[1] + colWidthsMed[2] + colWidthsMed[3]/2, yPosition + 10, { align: 'center' });
        pdf.text('Cant', startX + colWidthsMed[0] + colWidthsMed[1] + colWidthsMed[2] + colWidthsMed[3] + colWidthsMed[4]/2, yPosition + 10, { align: 'center' });
        pdf.text('Indicaciones', startX + colWidthsMed[0] + colWidthsMed[1] + colWidthsMed[2] + colWidthsMed[3] + colWidthsMed[4] + colWidthsMed[5]/2, yPosition + 10, { align: 'center' });
        
        yPosition += rowHeight;
        
        // Datos de medicamentos
        pdf.setTextColor(0, 0, 0);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        
        infoMedica.medicamentos.forEach((med, index) => {
          checkPageSpace(rowHeight);
          
          // Fondo alternado
          if (index % 2 === 1) {
            pdf.setFillColor(248, 249, 250);
            pdf.rect(startX, yPosition, colWidthsMed.reduce((a, b) => a + b), rowHeight, 'F');
          }
          
          // Datos del medicamento
          pdf.text(String(index + 1), startX + colWidthsMed[0]/2, yPosition + 10, { align: 'center' });
          
          // Medicamento (con wrap si es necesario)
          const medName = pdf.splitTextToSize(med.nombre || '', colWidthsMed[1] - 2);
          pdf.text(medName[0], startX + colWidthsMed[0] + 2, yPosition + 10);
          
          pdf.text(med.dosis || '', startX + colWidthsMed[0] + colWidthsMed[1] + colWidthsMed[2]/2, yPosition + 10, { align: 'center' });
          pdf.text(med.via || med.frecuencia || '', startX + colWidthsMed[0] + colWidthsMed[1] + colWidthsMed[2] + colWidthsMed[3]/2, yPosition + 10, { align: 'center' });
          pdf.text('1', startX + colWidthsMed[0] + colWidthsMed[1] + colWidthsMed[2] + colWidthsMed[3] + colWidthsMed[4]/2, yPosition + 10, { align: 'center' });
          
          // Indicaciones (con wrap si es necesario)
          const indicaciones = pdf.splitTextToSize(med.duracion || 'Según indicación médica', colWidthsMed[5] - 2);
          pdf.text(indicaciones[0], startX + colWidthsMed[0] + colWidthsMed[1] + colWidthsMed[2] + colWidthsMed[3] + colWidthsMed[4] + 2, yPosition + 10);
          
          yPosition += rowHeight;
        });
        
        yPosition += 10;
      }
      
      if (infoMedica.ordenesClinicas?.interconsultas?.length > 0) {
        const interconsultasData = infoMedica.ordenesClinicas.interconsultas.map((inter, index) => [
          index + 1,
          inter.codigo || '',
          inter.descripcion || inter.especialidad || ''
        ]);
        createTable('INTERCONSULTAS', ['N°', 'Código CUPS', 'Descripción'], interconsultasData);
      }
      
      // Incapacidad médica
      if (infoMedica.incapacidadMedica && (infoMedica.incapacidadMedica.tieneIncapacidad || typeof infoMedica.incapacidadMedica === 'string')) {
        checkPageSpace(80);
        
        // Fondo azul para el título
        pdf.setFillColor(70, 130, 180); // Azul
        pdf.rect(margin, yPosition - 5, pageWidth - 2 * margin, 15, 'F');
        
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(12);
        pdf.setTextColor(255, 255, 255); // Texto blanco
        pdf.text('Incapacidad médica', margin + 5, yPosition + 5);
        yPosition += 20;
        
        // Resetear color del texto
        pdf.setTextColor(0, 0, 0);
        
        let dias = '1';
        let motivo = 'Incapacidad médica';
        let fechaInicio = new Date().toISOString().split('T')[0];
        let fechaFin = new Date().toISOString().split('T')[0];
        
        if (typeof infoMedica.incapacidadMedica === 'string') {
          const match = infoMedica.incapacidadMedica.match(/^(\d+)\s*días\s*-\s*(.*?)\s*\((.+?)\s*a\s*(.+?)\)$/);
          if (match) {
            dias = match[1].trim();
            motivo = match[2].trim() || 'Incapacidad médica';
            fechaInicio = match[3].trim();
            fechaFin = match[4].trim();
          } else {
            motivo = infoMedica.incapacidadMedica;
          }
        } else if (typeof infoMedica.incapacidadMedica === 'object') {
          dias = infoMedica.incapacidadMedica.dias || dias;
          motivo = infoMedica.incapacidadMedica.motivo || motivo;
          fechaInicio = infoMedica.incapacidadMedica.fechaInicio || fechaInicio;
          fechaFin = infoMedica.incapacidadMedica.fechaFin || fechaFin;
        }
        
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.text(`Duración: ${dias} días`, margin, yPosition);
        yPosition += 8;
        pdf.text(`Fecha de inicio: ${new Date(fechaInicio).toLocaleDateString('es-ES')}`, margin, yPosition);
        yPosition += 8;
        pdf.text(`Fecha de fin: ${new Date(fechaFin).toLocaleDateString('es-ES')}`, margin, yPosition);
        yPosition += 8;
        pdf.text(`Motivo: ${motivo}`, margin, yPosition);
        yPosition += 15;
      }
      
      // Recomendaciones
      if (infoMedica.recomendaciones) {
        checkPageSpace(50);
        
        // Fondo azul para el título
        pdf.setFillColor(70, 130, 180); // Azul
        pdf.rect(margin, yPosition - 5, pageWidth - 2 * margin, 15, 'F');
        
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(12);
        pdf.setTextColor(255, 255, 255); // Texto blanco
        pdf.text('RECOMENDACIONES', margin + 5, yPosition + 5);
        yPosition += 20;
        
        // Contenido
        pdf.setTextColor(0, 0, 0); // Texto negro
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        const lines = pdf.splitTextToSize(infoMedica.recomendaciones, pageWidth - 2 * margin);
        lines.forEach(line => {
          checkPageSpace(8);
          pdf.text(line, margin + 5, yPosition);
          yPosition += 8;
        });
        yPosition += 15;
      }
      
      // Observaciones
      if (infoMedica.observaciones) {
        checkPageSpace(50);
        
        // Fondo azul para el título
        pdf.setFillColor(70, 130, 180); // Azul
        pdf.rect(margin, yPosition - 5, pageWidth - 2 * margin, 15, 'F');
        
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(12);
        pdf.setTextColor(255, 255, 255); // Texto blanco
        pdf.text('OBSERVACIONES', margin + 5, yPosition + 5);
        yPosition += 20;
        
        // Contenido
        pdf.setTextColor(0, 0, 0); // Texto negro
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        const obsLines = pdf.splitTextToSize(infoMedica.observaciones, pageWidth - 2 * margin);
        obsLines.forEach(line => {
          checkPageSpace(8);
          pdf.text(line, margin + 5, yPosition);
          yPosition += 8;
        });
        yPosition += 15;
      }
      
      // Firma del médico (si hay información)
      if (infoMedica.medico && infoMedica.medico.nombre !== 'No disponible') {
        checkPageSpace(60);
        
        // Línea para firma
        pdf.setDrawColor(0, 0, 0);
        pdf.setLineWidth(0.5);
        pdf.line(pageWidth - 200, yPosition, pageWidth - 50, yPosition);
        yPosition += 8;
        
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.text(`Dr(a). ${infoMedica.medico.nombre} ${infoMedica.medico.apellido || ''}`, pageWidth - 200, yPosition);
        yPosition += 6;
        pdf.text(`${infoMedica.medico.especialidad}`, pageWidth - 200, yPosition);
        yPosition += 6;
        pdf.text(`Reg. ${infoMedica.medico.identificacion}`, pageWidth - 200, yPosition);
        yPosition += 6;
        pdf.text(`Sede: ${infoMedica.medico.sede}`, pageWidth - 200, yPosition);
      }
      
      // Generar nombre del archivo
      const fechaStr = new Date(infoMedica.fechaAtencion || new Date()).toISOString().split('T')[0];
      const pacienteStr = (infoMedica.paciente || 'Paciente').replace(/\s+/g, '_');
      const fileName = `Informe_Medico_${pacienteStr}_${fechaStr}.pdf`;
      
      // Descargar
      pdf.save(fileName);
      
    } catch {
      alert('Error al generar el PDF. Por favor, intenta nuevamente.');
    }
  }

  static generarPDFCita(datosCita) {
    try {
      const pdf = new jsPDF();
      
      // Configuración inicial
      const pageWidth = pdf.internal.pageSize.width;
      const margin = 20;
      let yPosition = margin;
      
      // Encabezado con logo (simulado)
      pdf.setFillColor(13, 110, 253); // Azul Bootstrap
      pdf.rect(0, 0, pageWidth, 40, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('🏥 Hospital Digital', pageWidth / 2, 20, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Comprobante de Cita Médica', pageWidth / 2, 32, { align: 'center' });
      
      yPosition = 55;
      
      // Título del documento
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text(datosCita.titulo, margin, yPosition);
      yPosition += 15;
      
      // Línea separadora
      pdf.setDrawColor(13, 110, 253);
      pdf.setLineWidth(0.5);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;
      
      // Información del Paciente
      pdf.setFillColor(240, 248, 255);
      pdf.rect(margin, yPosition, pageWidth - 2 * margin, 50, 'F');
      
      yPosition += 10;
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(13, 110, 253);
      pdf.text('👤 Información del Paciente', margin + 5, yPosition);
      
      yPosition += 10;
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      
      pdf.text(`Nombre: ${datosCita.paciente.nombreCompleto}`, margin + 10, yPosition);
      yPosition += 7;
      pdf.text(`Identificación: ${datosCita.paciente.identificacion}`, margin + 10, yPosition);
      yPosition += 7;
      pdf.text(`Teléfono: ${datosCita.paciente.telefono}`, margin + 10, yPosition);
      yPosition += 7;
      pdf.text(`Email: ${datosCita.paciente.email}`, margin + 10, yPosition);
      yPosition += 15;
      
      // Información de la Cita
      pdf.setFillColor(255, 243, 224);
      pdf.rect(margin, yPosition, pageWidth - 2 * margin, 60, 'F');
      
      yPosition += 10;
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(255, 140, 0);
      pdf.text('📅 Detalles de la Cita', margin + 5, yPosition);
      
      yPosition += 10;
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      
      pdf.text(`Fecha: ${datosCita.cita.fecha}`, margin + 10, yPosition);
      yPosition += 7;
      pdf.text(`Hora: ${datosCita.cita.hora}`, margin + 10, yPosition);
      yPosition += 7;
      pdf.text(`Médico: ${datosCita.cita.medico}`, margin + 10, yPosition);
      yPosition += 7;
      pdf.text(`Especialidad: ${datosCita.cita.especialidad}`, margin + 10, yPosition);
      yPosition += 7;
      pdf.text(`Sede: ${datosCita.cita.sede}`, margin + 10, yPosition);
      yPosition += 7;
      
      // Estado de la cita
      const estadoColor = datosCita.cita.estado === 'confirmada' ? [40, 167, 69] : 
                         datosCita.cita.estado === 'cancelada' ? [220, 53, 69] : [255, 193, 7];
      pdf.setTextColor(...estadoColor);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Estado: ${datosCita.cita.estado.toUpperCase()}`, margin + 10, yPosition);
      yPosition += 15;
      
      // Instrucciones
      pdf.setFillColor(240, 255, 240);
      pdf.rect(margin, yPosition, pageWidth - 2 * margin, 35, 'F');
      
      yPosition += 10;
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(40, 167, 69);
      pdf.text('📋 Instrucciones', margin + 5, yPosition);
      
      yPosition += 10;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      pdf.text('• Por favor, llegue 15 minutos antes de su cita.', margin + 10, yPosition);
      yPosition += 6;
      pdf.text('• Traiga su documento de identidad y este comprobante.', margin + 10, yPosition);
      yPosition += 6;
      pdf.text('• Si necesita cancelar, hágalo con al menos 24 horas de anticipación.', margin + 10, yPosition);
      yPosition += 15;
      
      // Pie de página
      pdf.setFontSize(9);
      pdf.setTextColor(128, 128, 128);
      pdf.text('Documento generado automáticamente por Hospital Digital', pageWidth / 2, 280, { align: 'center' });
      pdf.text(`Fecha de emisión: ${new Date().toLocaleDateString('es-ES')} - ${new Date().toLocaleTimeString('es-ES')}`, pageWidth / 2, 285, { align: 'center' });
      
      // Generar nombre del archivo
      const fechaArchivo = new Date().toISOString().split('T')[0];
      const nombrePaciente = datosCita.paciente.nombreCompleto.replace(/\s+/g, '_');
      const fileName = `Cita_Medica_${nombrePaciente}_${fechaArchivo}.pdf`;
      
      // Descargar
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Error generando PDF de cita:', error);
      alert('Error al generar el PDF. Por favor, intenta nuevamente.');
    }
  }

  // Generar PDF de Historia Clínica
  static async downloadHistoriaClinica(historiaData, pacienteData) {
    try {
      const pdf = new jsPDF();
      
      // Configuración inicial
      const pageWidth = pdf.internal.pageSize.width;
      const pageHeight = pdf.internal.pageSize.height;
      const margin = 20;
      let yPosition = margin;
      
      // Función auxiliar para verificar espacio
      const checkPageSpace = (requiredSpace) => {
        if (yPosition + requiredSpace > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
          return true;
        }
        return false;
      };
      
      // Función para convertir null/undefined a "N/A"
      const formatValue = (value) => {
        if (value === null || value === undefined || value === '' || value === 'null') {
          return 'N/A';
        }
        return value;
      };

      // === ENCABEZADO CON LOGO ===
      // Degradado de fondo (simulado con rectángulos)
      pdf.setFillColor(111, 66, 193); // Color morado principal
      pdf.rect(0, 0, pageWidth, 50, 'F');
      
      // Logo del hospital (círculo con cruz)
      pdf.setFillColor(255, 255, 255);
      pdf.circle(30, 25, 12, 'F');
      pdf.setFillColor(111, 66, 193);
      pdf.rect(26, 18, 8, 14, 'F'); // Vertical
      pdf.rect(22, 22, 16, 6, 'F'); // Horizontal
      
      // Título del hospital
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(22);
      pdf.setTextColor(255, 255, 255);
      pdf.text('HOSPITAL DIGITAL', 50, 22);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(11);
      pdf.text('Sistema de Gestion Medica', 50, 30);
      pdf.setFontSize(9);
      pdf.text('Direccion: Sede Principal | Tel: +57 300 123 4567 | Email: info@hospitaldigital.com', 50, 37);
      
      // Línea decorativa
      pdf.setDrawColor(255, 255, 255);
      pdf.setLineWidth(0.5);
      pdf.line(margin, 45, pageWidth - margin, 45);
      
      yPosition = 60;

      // === TÍTULO DEL DOCUMENTO ===
      pdf.setFillColor(90, 50, 163);
      pdf.rect(margin, yPosition, pageWidth - 2 * margin, 12, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.setTextColor(255, 255, 255);
      pdf.text('HISTORIA CLÍNICA', pageWidth / 2, yPosition + 8, { align: 'center' });
      yPosition += 20;

      // === INFORMACIÓN DEL PACIENTE ===
      pdf.setFillColor(240, 240, 255);
      pdf.rect(margin, yPosition, pageWidth - 2 * margin, 35, 'F');
      
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.setTextColor(111, 66, 193);
      pdf.text('DATOS DEL PACIENTE', margin + 5, yPosition + 7);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      
      const col1X = margin + 5;
      const col2X = pageWidth / 2 + 5;
      
      pdf.text(`Nombre: ${formatValue(pacienteData.firstName)} ${formatValue(pacienteData.lastName)}`, col1X, yPosition + 15);
      pdf.text(`Identificación: ${formatValue(pacienteData.id)}`, col1X, yPosition + 22);
      pdf.text(`Email: ${formatValue(pacienteData.email)}`, col1X, yPosition + 29);
      
      // Usar fecha_cita/hora_cita o fecha/hora según lo que esté disponible
      const fechaCita = historiaData.fecha || historiaData.fecha_cita || 'N/A'
      const horaCita = historiaData.hora || historiaData.hora_cita || 'N/A'
      
      pdf.text(`Teléfono: ${formatValue(pacienteData.phone)}`, col2X, yPosition + 15);
      pdf.text(`Fecha de Cita: ${formatValue(fechaCita)}`, col2X, yPosition + 22);
      pdf.text(`Hora: ${formatValue(horaCita)}`, col2X, yPosition + 29);
      
      yPosition += 42;

      // === INFORMACIÓN DEL MÉDICO ===
      pdf.setFillColor(240, 255, 240);
      pdf.rect(margin, yPosition, pageWidth - 2 * margin, 20, 'F');
      
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.setTextColor(40, 167, 69);
      pdf.text('MÉDICO TRATANTE', margin + 5, yPosition + 7);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Dr(a). ${formatValue(historiaData.medico_nombre)} ${formatValue(historiaData.medico_apellido)}`, col1X, yPosition + 15);
      pdf.text(`Especialidad: ${formatValue(historiaData.medico_especialidad)}`, col2X, yPosition + 15);
      
      yPosition += 27;

      // === MOTIVO DE CONSULTA ===
      checkPageSpace(30);
      pdf.setFillColor(255, 248, 225);
      pdf.rect(margin, yPosition, pageWidth - 2 * margin, 10, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.setTextColor(255, 193, 7);
      pdf.text('MOTIVO DE CONSULTA', margin + 5, yPosition + 7);
      yPosition += 12;
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      const motivoLines = pdf.splitTextToSize(formatValue(historiaData.motivo_consulta), pageWidth - 2 * margin - 10);
      pdf.text(motivoLines, margin + 5, yPosition + 5);
      yPosition += motivoLines.length * 5 + 10;

      // === HISTORIA CLÍNICA ===
      checkPageSpace(30);
      pdf.setFillColor(255, 240, 245);
      pdf.rect(margin, yPosition, pageWidth - 2 * margin, 10, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.setTextColor(220, 53, 69);
      pdf.text('ANTECEDENTES / HISTORIA CLÍNICA', margin + 5, yPosition + 7);
      yPosition += 12;
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      const historiaLines = pdf.splitTextToSize(formatValue(historiaData.historia_clinica), pageWidth - 2 * margin - 10);
      pdf.text(historiaLines, margin + 5, yPosition + 5);
      yPosition += historiaLines.length * 5 + 10;

      // === DIAGNÓSTICO ===
      checkPageSpace(30);
      pdf.setFillColor(240, 248, 255);
      pdf.rect(margin, yPosition, pageWidth - 2 * margin, 10, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.setTextColor(0, 123, 255);
      pdf.text('DIAGNÓSTICO', margin + 5, yPosition + 7);
      yPosition += 12;
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      const diagnosticoLines = pdf.splitTextToSize(formatValue(historiaData.diagnostico), pageWidth - 2 * margin - 10);
      pdf.text(diagnosticoLines, margin + 5, yPosition + 5);
      yPosition += diagnosticoLines.length * 5 + 10;

      // === MEDICAMENTOS ===
      checkPageSpace(40);
      pdf.setFillColor(230, 255, 230);
      pdf.rect(margin, yPosition, pageWidth - 2 * margin, 10, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.setTextColor(40, 167, 69);
      pdf.text('MEDICAMENTOS PRESCRITOS', margin + 5, yPosition + 7);
      yPosition += 15;
      
      let medicamentos = [];
      try {
        medicamentos = JSON.parse(historiaData.medicamentos || '[]');
      } catch (e) {
        medicamentos = [];
      }
      
      if (medicamentos.length > 0) {
        medicamentos.forEach((med, index) => {
          checkPageSpace(25);
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(10);
          pdf.text(`${index + 1}. ${formatValue(med.nombre)}`, margin + 5, yPosition);
          yPosition += 5;
          
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(9);
          pdf.text(`   Dosis: ${formatValue(med.dosis)} | Frecuencia: ${formatValue(med.frecuencia)} | Vía: ${formatValue(med.via)}`, margin + 5, yPosition);
          yPosition += 5;
          pdf.text(`   Duración: ${formatValue(med.duracion)}`, margin + 5, yPosition);
          yPosition += 8;
        });
      } else {
        pdf.setFont('helvetica', 'italic');
        pdf.setFontSize(10);
        pdf.setTextColor(128, 128, 128);
        pdf.text('No se prescribieron medicamentos', margin + 5, yPosition);
        yPosition += 10;
      }

      // === ÓRDENES MÉDICAS ===
      checkPageSpace(40);
      pdf.setFillColor(255, 245, 230);
      pdf.rect(margin, yPosition, pageWidth - 2 * margin, 10, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.setTextColor(255, 140, 0);
      pdf.text('ÓRDENES MÉDICAS', margin + 5, yPosition + 7);
      yPosition += 15;
      
      let ordenes = { laboratorios: [], imagenesDiagnosticas: [], interconsultas: [] };
      try {
        ordenes = JSON.parse(historiaData.ordenes_medicas || '{}');
      } catch (e) {
        ordenes = { laboratorios: [], imagenesDiagnosticas: [], interconsultas: [] };
      }
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      
      // Laboratorios
      if (ordenes.laboratorios && ordenes.laboratorios.length > 0) {
        pdf.setFont('helvetica', 'bold');
        pdf.text('Laboratorios:', margin + 5, yPosition);
        yPosition += 5;
        pdf.setFont('helvetica', 'normal');
        ordenes.laboratorios.forEach((lab) => {
          checkPageSpace(10);
          pdf.text(`• ${lab.codigo} - ${lab.descripcion}`, margin + 10, yPosition);
          yPosition += 5;
        });
      }
      
      // Imágenes diagnósticas
      if (ordenes.imagenesDiagnosticas && ordenes.imagenesDiagnosticas.length > 0) {
        checkPageSpace(10);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Imágenes Diagnósticas:', margin + 5, yPosition);
        yPosition += 5;
        pdf.setFont('helvetica', 'normal');
        ordenes.imagenesDiagnosticas.forEach((img) => {
          checkPageSpace(10);
          pdf.text(`• ${img.codigo} - ${img.descripcion}`, margin + 10, yPosition);
          yPosition += 5;
        });
      }
      
      // Interconsultas
      if (ordenes.interconsultas && ordenes.interconsultas.length > 0) {
        checkPageSpace(10);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Interconsultas:', margin + 5, yPosition);
        yPosition += 5;
        pdf.setFont('helvetica', 'normal');
        ordenes.interconsultas.forEach((inter) => {
          checkPageSpace(10);
          pdf.text(`• ${inter.codigo} - ${inter.descripcion}`, margin + 10, yPosition);
          yPosition += 5;
        });
      }
      
      if ((!ordenes.laboratorios || ordenes.laboratorios.length === 0) &&
          (!ordenes.imagenesDiagnosticas || ordenes.imagenesDiagnosticas.length === 0) &&
          (!ordenes.interconsultas || ordenes.interconsultas.length === 0)) {
        pdf.setFont('helvetica', 'italic');
        pdf.setTextColor(128, 128, 128);
        pdf.text('No se ordenaron exámenes', margin + 5, yPosition);
        yPosition += 10;
      }
      yPosition += 5;

      // === INCAPACIDAD MÉDICA ===
      checkPageSpace(30);
      let incapacidad = { tieneIncapacidad: false };
      try {
        incapacidad = JSON.parse(historiaData.incapacidad_medica || '{}');
      } catch (e) {
        incapacidad = { tieneIncapacidad: false };
      }
      
      pdf.setFillColor(255, 235, 235);
      pdf.rect(margin, yPosition, pageWidth - 2 * margin, 10, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.setTextColor(220, 53, 69);
      pdf.text('INCAPACIDAD MÉDICA', margin + 5, yPosition + 7);
      yPosition += 15;
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      
      if (incapacidad.tieneIncapacidad) {
        pdf.text(`Días de incapacidad: ${formatValue(incapacidad.dias)}`, margin + 5, yPosition);
        yPosition += 6;
        pdf.text(`Motivo: ${formatValue(incapacidad.motivo)}`, margin + 5, yPosition);
        yPosition += 6;
        pdf.text(`Fecha inicio: ${formatValue(incapacidad.fechaInicio)}`, margin + 5, yPosition);
        yPosition += 6;
        pdf.text(`Fecha fin: ${formatValue(incapacidad.fechaFin)}`, margin + 5, yPosition);
        yPosition += 10;
      } else {
        pdf.setFont('helvetica', 'italic');
        pdf.setTextColor(128, 128, 128);
        pdf.text('No se otorgó incapacidad médica', margin + 5, yPosition);
        yPosition += 10;
      }

      // === RECOMENDACIONES ===
      checkPageSpace(30);
      pdf.setFillColor(240, 255, 240);
      pdf.rect(margin, yPosition, pageWidth - 2 * margin, 10, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.setTextColor(40, 167, 69);
      pdf.text('RECOMENDACIONES', margin + 5, yPosition + 7);
      yPosition += 12;
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      const recomendacionesLines = pdf.splitTextToSize(formatValue(historiaData.recomendaciones), pageWidth - 2 * margin - 10);
      pdf.text(recomendacionesLines, margin + 5, yPosition + 5);
      yPosition += recomendacionesLines.length * 5 + 10;

      // === OBSERVACIONES ===
      checkPageSpace(30);
      pdf.setFillColor(255, 250, 240);
      pdf.rect(margin, yPosition, pageWidth - 2 * margin, 10, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.setTextColor(255, 140, 0);
      pdf.text('OBSERVACIONES', margin + 5, yPosition + 7);
      yPosition += 12;
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      const observacionesLines = pdf.splitTextToSize(formatValue(historiaData.observaciones), pageWidth - 2 * margin - 10);
      pdf.text(observacionesLines, margin + 5, yPosition + 5);
      yPosition += observacionesLines.length * 5 + 15;

      // === PIE DE PÁGINA ===
      const footerY = pageHeight - 20;
      pdf.setDrawColor(111, 66, 193);
      pdf.setLineWidth(0.5);
      pdf.line(margin, footerY, pageWidth - margin, footerY);
      
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.setFont('helvetica', 'italic');
      pdf.text('Este documento es un registro médico oficial del Hospital Digital', pageWidth / 2, footerY + 5, { align: 'center' });
      pdf.text(`Generado el: ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}`, pageWidth / 2, footerY + 10, { align: 'center' });
      
      // Descargar PDF
      const fechaArchivo = new Date().toISOString().split('T')[0];
      const nombrePaciente = `${pacienteData.firstName}_${pacienteData.lastName}`.replace(/\s+/g, '_');
      const fileName = `Historia_Clinica_${nombrePaciente}_${fechaArchivo}.pdf`;
      
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Error generando PDF de historia clínica:', error);
      alert('Error al generar el PDF de historia clínica. Por favor, intenta nuevamente.');
    }
  }
}

export default PDFServiceWorking;