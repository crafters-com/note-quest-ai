import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';

/**
 * Parsea elementos de markdown en una línea de texto
 */
interface MarkdownElement {
  text: string;
  bold: boolean;
  italic: boolean;
  code: boolean;
}

const parseMarkdownLine = (line: string): MarkdownElement[] => {
  const elements: MarkdownElement[] = [];
  let currentText = '';
  let i = 0;
  
  while (i < line.length) {
    if (line[i] === '`') {
      if (currentText) {
        elements.push({ text: currentText, bold: false, italic: false, code: false });
        currentText = '';
      }
      
      i++;
      let codeText = '';
      while (i < line.length && line[i] !== '`') {
        codeText += line[i];
        i++;
      }
      if (i < line.length) i++;
      
      if (codeText) {
        elements.push({ text: codeText, bold: false, italic: false, code: true });
      }
    }
    else if (line[i] === '*' && line[i + 1] === '*') {
      if (currentText) {
        elements.push({ text: currentText, bold: false, italic: false, code: false });
        currentText = '';
      }
      
      i += 2;
      let boldText = '';
      while (i < line.length - 1 && !(line[i] === '*' && line[i + 1] === '*')) {
        boldText += line[i];
        i++;
      }
      if (i < line.length - 1) i += 2;
      
      if (boldText) {
        elements.push({ text: boldText, bold: true, italic: false, code: false });
      }
    }
    else if (line[i] === '*') {
      if (currentText) {
        elements.push({ text: currentText, bold: false, italic: false, code: false });
        currentText = '';
      }
      
      i++;
      let italicText = '';
      while (i < line.length && line[i] !== '*') {
        italicText += line[i];
        i++;
      }
      if (i < line.length) i++;
      
      if (italicText) {
        elements.push({ text: italicText, bold: false, italic: true, code: false });
      }
    }
    else {
      currentText += line[i];
      i++;
    }
  }
  
  if (currentText) {
    elements.push({ text: currentText, bold: false, italic: false, code: false });
  }
  
  return elements;
};

/**
 * Exporta una nota como archivo PDF con markdown renderizado
 */
export const exportNoteToPdf = (title: string, content: string): void => {
  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const margin = 20;
    const normalLineHeight = 6;
    const codeLineHeight = 5;
    let yPosition = margin;

    // Función para verificar si necesitamos nueva página
    const checkNewPage = (requiredSpace: number = normalLineHeight) => {
      if (yPosition + requiredSpace > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }
    };

    // Título principal
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(18);
    pdf.setTextColor(0, 0, 0);
    
    const titleLines = pdf.splitTextToSize(title || 'Nota sin título', pageWidth - 2 * margin);
    checkNewPage(titleLines.length * 8 + 15);
    pdf.text(titleLines, margin, yPosition);
    yPosition += titleLines.length * 8 + 5;

    // Línea separadora elegante
    pdf.setLineWidth(0.8);
    pdf.setDrawColor(100, 100, 100);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    // Procesar contenido
    if (content) {
      const lines = content.split('\n');
      
      for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
        const line = lines[lineIndex];
        
        // Líneas vacías
        if (line.trim() === '') {
          yPosition += normalLineHeight;
          continue;
        }
        
        // Bloques de código con ```
        if (line.trim().startsWith('```')) {
          checkNewPage(20);
          
          // Fondo gris para el bloque de código
          pdf.setFillColor(245, 245, 245);
          let codeBlockHeight = 0;
          let codeLines = [];
          
          // Recopilar todas las líneas del bloque de código
          lineIndex++; // saltar la línea ```
          while (lineIndex < lines.length && !lines[lineIndex].trim().startsWith('```')) {
            codeLines.push(lines[lineIndex]);
            lineIndex++;
          }
          
          codeBlockHeight = codeLines.length * codeLineHeight + 8;
          checkNewPage(codeBlockHeight);
          
          // Dibujar fondo
          pdf.rect(margin - 2, yPosition - 2, pageWidth - 2 * margin + 4, codeBlockHeight, 'F');
          
          // Texto del código
          pdf.setFont('courier', 'normal');
          pdf.setFontSize(10);
          pdf.setTextColor(50, 50, 50);
          
          yPosition += 4;
          for (const codeLine of codeLines) {
            checkNewPage(codeLineHeight);
            pdf.text(codeLine, margin + 2, yPosition);
            yPosition += codeLineHeight;
          }
          yPosition += 4;
          
          // Restaurar formato normal
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(12);
          pdf.setTextColor(0, 0, 0);
          continue;
        }
        
        // Encabezados
        if (line.startsWith('# ')) {
          checkNewPage(25);
          yPosition += 8; // espacio antes del encabezado
          
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(16);
          pdf.setTextColor(20, 20, 20);
          
          const headerText = line.substring(2);
          const headerLines = pdf.splitTextToSize(headerText, pageWidth - 2 * margin);
          pdf.text(headerLines, margin, yPosition);
          yPosition += headerLines.length * 8 + 6;
          
          // Línea debajo del encabezado H1
          pdf.setLineWidth(0.5);
          pdf.setDrawColor(150, 150, 150);
          pdf.line(margin, yPosition - 3, pageWidth - margin, yPosition - 3);
          yPosition += 3;
          
        } else if (line.startsWith('## ')) {
          checkNewPage(20);
          yPosition += 6;
          
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(14);
          pdf.setTextColor(40, 40, 40);
          
          const headerText = line.substring(3);
          const headerLines = pdf.splitTextToSize(headerText, pageWidth - 2 * margin);
          pdf.text(headerLines, margin, yPosition);
          yPosition += headerLines.length * 7 + 4;
          
        } else if (line.startsWith('### ')) {
          checkNewPage(15);
          yPosition += 4;
          
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(12);
          pdf.setTextColor(60, 60, 60);
          
          const headerText = line.substring(4);
          const headerLines = pdf.splitTextToSize(headerText, pageWidth - 2 * margin);
          pdf.text(headerLines, margin, yPosition);
          yPosition += headerLines.length * 6 + 3;
          
        } else if (line.startsWith('#### ')) {
          checkNewPage(12);
          yPosition += 3;
          
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(11);
          pdf.setTextColor(80, 80, 80);
          
          const headerText = line.substring(5);
          const headerLines = pdf.splitTextToSize(headerText, pageWidth - 2 * margin);
          pdf.text(headerLines, margin, yPosition);
          yPosition += headerLines.length * 5 + 2;
          
        }
        else if (line.includes('|')) {
          const tableLines = [];
          let currentLineIndex = lineIndex;
          
          while (currentLineIndex < lines.length && lines[currentLineIndex].includes('|')) {
            const tableLine = lines[currentLineIndex].trim();
            if (tableLine && !tableLine.match(/^[\|\s\-:]+$/)) {
              tableLines.push(tableLine);
            }
            currentLineIndex++;
          }
          
          if (tableLines.length > 0) {
            const table = tableLines.map(row => 
              row.split('|').map(cell => cell.trim()).filter(cell => cell !== '')
            );
            
            if (table.length > 0 && table[0].length > 0) {
              const colWidths = new Array(table[0].length).fill(0);
              const cellPadding = 3;
              const rowHeight = 8;
              
              const availableWidth = pageWidth - 2 * margin;
              const baseColWidth = availableWidth / table[0].length;
              
              for (let col = 0; col < table[0].length; col++) {
                let maxWidth = 0;
                for (let row = 0; row < table.length; row++) {
                  if (table[row][col]) {
                    const cellWidth = pdf.getTextWidth(table[row][col]) + cellPadding * 2;
                    maxWidth = Math.max(maxWidth, cellWidth);
                  }
                }
                colWidths[col] = Math.min(maxWidth, baseColWidth * 1.5);
              }
              
              const totalWidth = colWidths.reduce((sum, width) => sum + width, 0);
              if (totalWidth > availableWidth) {
                const scale = availableWidth / totalWidth;
                for (let i = 0; i < colWidths.length; i++) {
                  colWidths[i] *= scale;
                }
              }
              
              const tableHeight = table.length * rowHeight + 4;
              checkNewPage(tableHeight);
              
              yPosition += 4;
              let currentY = yPosition;
              
              for (let row = 0; row < table.length; row++) {
                let currentX = margin;
                
                if (row === 0) {
                  pdf.setFillColor(230, 230, 230);
                } else if (row % 2 === 0) {
                  pdf.setFillColor(248, 248, 248);
                } else {
                  pdf.setFillColor(255, 255, 255);
                }
                
                pdf.rect(margin, currentY, totalWidth > availableWidth ? availableWidth : colWidths.reduce((sum, width) => sum + width, 0), rowHeight, 'F');
                
                // Dibujar bordes y contenido
                for (let col = 0; col < table[row].length && col < colWidths.length; col++) {
                  const cellWidth = colWidths[col];
                  const cellText = table[row][col] || '';
                  
                  // Borde de celda
                  pdf.setDrawColor(200, 200, 200);
                  pdf.setLineWidth(0.3);
                  pdf.rect(currentX, currentY, cellWidth, rowHeight);
                  
                  // Contenido de celda
                  if (cellText) {
                    // Configurar fuente para encabezado o contenido
                    if (row === 0) {
                      pdf.setFont('helvetica', 'bold');
                      pdf.setFontSize(10);
                      pdf.setTextColor(50, 50, 50);
                    } else {
                      pdf.setFont('helvetica', 'normal');
                      pdf.setFontSize(9);
                      pdf.setTextColor(0, 0, 0);
                    }
                    
                    // Truncar texto si es muy largo
                    const maxTextWidth = cellWidth - cellPadding * 2;
                    let displayText = cellText;
                    
                    if (pdf.getTextWidth(displayText) > maxTextWidth) {
                      while (pdf.getTextWidth(displayText + '...') > maxTextWidth && displayText.length > 0) {
                        displayText = displayText.slice(0, -1);
                      }
                      displayText += '...';
                    }
                    
                    // Centrar texto verticalmente en la celda
                    const textY = currentY + rowHeight / 2 + 1.5;
                    pdf.text(displayText, currentX + cellPadding, textY);
                  }
                  
                  currentX += cellWidth;
                }
                
                currentY += rowHeight;
              }
              
              yPosition = currentY + 4;
              
              // Actualizar índice de línea para saltar las líneas procesadas
              lineIndex = currentLineIndex - 1;
            }
          }
        }
        // Listas con viñetas
        else if (line.startsWith('- ') || line.startsWith('* ')) {
          checkNewPage(10);
          
          const listText = line.substring(2);
          const elements = parseMarkdownLine(listText);
          
          // Dibujar viñeta
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(12);
          pdf.setTextColor(0, 0, 0);
          pdf.text('•', margin + 2, yPosition);
          
          // Procesar elementos de la lista
          let xPosition = margin + 8;
          for (const element of elements) {
            if (element.code) {
              pdf.setFont('courier', 'normal');
              pdf.setFontSize(10);
              pdf.setTextColor(100, 100, 100);
            } else {
              const fontStyle = element.bold ? 'bold' : (element.italic ? 'italic' : 'normal');
              pdf.setFont('helvetica', fontStyle);
              pdf.setFontSize(12);
              pdf.setTextColor(0, 0, 0);
            }
            
            const textWidth = pdf.getTextWidth(element.text);
            if (xPosition + textWidth > pageWidth - margin) {
              yPosition += normalLineHeight;
              xPosition = margin + 8;
              checkNewPage();
            }
            
            pdf.text(element.text, xPosition, yPosition);
            xPosition += textWidth;
          }
          yPosition += normalLineHeight + 1;
          
        }
        // Listas numeradas
        else if (/^\d+\.\s/.test(line)) {
          checkNewPage(10);
          
          const match = line.match(/^(\d+)\.\s(.*)$/);
          if (match) {
            const number = match[1];
            const listText = match[2];
            const elements = parseMarkdownLine(listText);
            
            // Dibujar número
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(12);
            pdf.setTextColor(0, 0, 0);
            pdf.text(`${number}.`, margin + 2, yPosition);
            
            // Procesar elementos de la lista
            let xPosition = margin + 12;
            for (const element of elements) {
              if (element.code) {
                pdf.setFont('courier', 'normal');
                pdf.setFontSize(10);
                pdf.setTextColor(100, 100, 100);
              } else {
                const fontStyle = element.bold ? 'bold' : (element.italic ? 'italic' : 'normal');
                pdf.setFont('helvetica', fontStyle);
                pdf.setFontSize(12);
                pdf.setTextColor(0, 0, 0);
              }
              
              const textWidth = pdf.getTextWidth(element.text);
              if (xPosition + textWidth > pageWidth - margin) {
                yPosition += normalLineHeight;
                xPosition = margin + 12;
                checkNewPage();
              }
              
              pdf.text(element.text, xPosition, yPosition);
              xPosition += textWidth;
            }
            yPosition += normalLineHeight + 1;
          }
        }
        // Texto normal con formato markdown
        else {
          checkNewPage(10);
          
          const elements = parseMarkdownLine(line);
          let xPosition = margin;
          
          for (const element of elements) {
            if (element.code) {
              // Código inline con fondo
              pdf.setFont('courier', 'normal');
              pdf.setFontSize(10);
              pdf.setTextColor(80, 80, 80);
              
              const textWidth = pdf.getTextWidth(element.text);
              const textHeight = 4;
              
              // Fondo gris claro para código inline
              pdf.setFillColor(240, 240, 240);
              pdf.rect(xPosition - 1, yPosition - textHeight + 1, textWidth + 2, textHeight + 1, 'F');
              
              pdf.text(element.text, xPosition, yPosition);
              xPosition += textWidth + 2;
            } else {
              // Texto normal, negrita o cursiva
              const fontStyle = element.bold ? 'bold' : (element.italic ? 'italic' : 'normal');
              pdf.setFont('helvetica', fontStyle);
              pdf.setFontSize(12);
              pdf.setTextColor(0, 0, 0);
              
              const textWidth = pdf.getTextWidth(element.text);
              
              // Salto de línea si es necesario
              if (xPosition + textWidth > pageWidth - margin && xPosition > margin) {
                yPosition += normalLineHeight;
                xPosition = margin;
                checkNewPage();
              }
              
              pdf.text(element.text, xPosition, yPosition);
              xPosition += textWidth;
            }
          }
          yPosition += normalLineHeight + 1;
        }
        
        // Restaurar formato por defecto
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(12);
        pdf.setTextColor(0, 0, 0);
      }
    } else {
      pdf.text('Sin contenido', margin, yPosition);
    }

    // Limpiar el nombre del archivo
    const fileName = title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'nota';
    
    // Descargar el PDF
    pdf.save(`${fileName}.pdf`);
    
  } catch (error) {
    console.error('Error al exportar PDF:', error);
    throw new Error('Error al generar el archivo PDF');
  }
};
export const exportNoteToMarkdown = (title: string, content: string): void => {
  try {
    const markdownContent = `# ${title}\n\n${content}`;
    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
    saveAs(blob, `${title}.md`);
  } catch (error) {
    console.error('Error al exportar Markdown:', error);
    throw new Error('Error al generar el archivo Markdown');
  }
};

/**
 * Lee un archivo Markdown subido por el usuario
 */
export const readMarkdownFile = (file: File): Promise<{ title: string; content: string }> => {
  return new Promise((resolve, reject) => {
    if (!file.name.endsWith('.md') && !file.name.endsWith('.markdown')) {
      reject(new Error('El archivo debe tener extensión .md o .markdown'));
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        
        // Extraer título del nombre del archivo (sin extensión)
        const title = file.name.replace(/\.(md|markdown)$/i, '');
        
        // También intentar extraer título del contenido si empieza con #
        const lines = content.split('\n');
        let extractedTitle = title;
        let contentWithoutTitle = content;
        
        if (lines[0]?.startsWith('# ')) {
          extractedTitle = lines[0].substring(2).trim();
          contentWithoutTitle = lines.slice(1).join('\n').trim();
        }
        
        resolve({
          title: extractedTitle,
          content: contentWithoutTitle
        });
      } catch (error) {
        reject(new Error('Error al leer el archivo'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error al leer el archivo'));
    };
    
    reader.readAsText(file);
  });
};

/**
 * Valida si un archivo es válido para importar
 */
export const validateMarkdownFile = (file: File): { valid: boolean; error?: string } => {
  // Validar extensión
  if (!file.name.endsWith('.md') && !file.name.endsWith('.markdown')) {
    return { valid: false, error: 'El archivo debe tener extensión .md o .markdown' };
  }
  
  // Validar tamaño (máximo 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return { valid: false, error: 'El archivo no puede ser mayor a 5MB' };
  }
  
  // Validar tipo MIME
  if (file.type && !file.type.includes('text') && !file.type.includes('markdown')) {
    return { valid: false, error: 'Tipo de archivo no válido' };
  }
  
  return { valid: true };
};