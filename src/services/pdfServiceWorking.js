// En jsPDF v2/v3 el export correcto es nombrado
import { jsPDF } from 'jspdf';

class PDFServiceWorking {
  static downloadMedicalReport(infoMedica) {
    try {
      const pdf = new jsPDF();
      
      // Configuración inicial
      // jsPDF v3 expone getWidth/getHeight; mantener compat con v2
      const pageSize = pdf.internal.pageSize;
      const pageWidth = typeof pageSize.getWidth === 'function' ? pageSize.getWidth() : pageSize.width;
      const pageHeight = typeof pageSize.getHeight === 'function' ? pageSize.getHeight() : pageSize.height;
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
      const pacienteStr = String(infoMedica.paciente || 'Paciente').replace(/\s+/g, '_');
      const fileName = `Informe_Medico_${pacienteStr}_${fechaStr}.pdf`;
      
      // Descargar
      pdf.save(fileName);
      
    } catch (err) {
      // Mostrar en consola para diagnóstico y mantener alerta amigable
      console.error('[PDF] Error generando informe:', err);
      alert('Error al generar el PDF. Por favor, intenta nuevamente.');
    }
  }
}

export default PDFServiceWorking;