const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType, HeadingLevel } = require('docx');

// Export to Excel
const exportToExcel = async (res, data, columns, filename) => {
    try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Data');

        // Add headers
        worksheet.columns = columns.map(col => ({
            header: col.header,
            key: col.key,
            width: col.width || 15,
        }));

        // Style header row
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4F46E5' },
        };
        worksheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };

        // Add data
        data.forEach(item => {
            worksheet.addRow(columns.map(col => item[col.key] || ''));
        });

        // Auto-filter
        worksheet.autoFilter = worksheet.getRow(1).address;

        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="${filename}.xlsx"`
        );

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Export to PDF
const exportToPDF = async (res, data, columns, filename, title = 'Report') => {
    try {
        const doc = new PDFDocument({ margin: 50, size: 'A4', orientation: 'landscape' });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.pdf"`);

        doc.pipe(res);

        // Title
        doc.fontSize(20).text(title, { align: 'center' });
        doc.moveDown();

        // Table headers
        const startY = doc.y;
        const columnWidths = columns.map(col => col.width || 100);
        
        // Header background
        doc.fillColor('#4F46E5').rect(50, startY, columnWidths.reduce((a, b) => a + b, 0), 25).fill();
        
        // Header text
        doc.fillColor('#FFFFFF').fontSize(12);
        let x = 50;
        columns.forEach((col, index) => {
            doc.text(col.header, x, startY + 8, {
                width: columnWidths[index],
                align: 'left',
            });
            x += columnWidths[index];
        });

        // Data rows
        doc.fillColor('#000000').fontSize(10);
        let yPos = startY + 35;
        
        data.forEach((item, rowIndex) => {
            if (yPos > 750) { // New page if needed
                doc.addPage();
                yPos = 50;
            }

            x = 50;
            columns.forEach((col, index) => {
                doc.text(String(item[col.key] || ''), x, yPos, {
                    width: columnWidths[index],
                    align: 'left',
                });
                x += columnWidths[index];
            });
            
            yPos += 20;
            
            // Alternating row colors
            if (rowIndex % 2 === 0) {
                doc.fillColor('#F3F4F6').rect(50, yPos - 20, columnWidths.reduce((a, b) => a + b, 0), 1).fill();
            }
        });

        doc.end();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Export to Word
const exportToWord = async (res, data, columns, filename, title = 'Report') => {
    try {
        const tableRows = [
            new TableRow({
                children: columns.map(col => 
                    new TableCell({
                        children: [new Paragraph({
                            text: col.header,
                            heading: HeadingLevel.HEADING_6,
                        })],
                        shading: { fill: '4F46E5' },
                        verticalAlign: 'center',
                    })
                ),
            }),
        ];

        data.forEach(item => {
            tableRows.push(
                new TableRow({
                    children: columns.map(col =>
                        new TableCell({
                            children: [new Paragraph(String(item[col.key] || ''))],
                        })
                    ),
                })
            );
        });

        const doc = new Document({
            sections: [{
                properties: {},
                children: [
                    new Paragraph({
                        text: title,
                        heading: HeadingLevel.HEADING_1,
                        alignment: 'center',
                    }),
                    new Paragraph({ text: '' }), // Spacer
                    new Table({
                        rows: tableRows,
                        width: { size: 100, type: WidthType.PERCENTAGE },
                    }),
                ],
            }],
        });

        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        );
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="${filename}.docx"`
        );

        await Packer.write(doc, res);
        res.end();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    exportToExcel,
    exportToPDF,
    exportToWord,
};
