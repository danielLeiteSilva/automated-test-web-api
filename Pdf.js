const PdfKit = require('pdfkit');
const fs = require('fs');

class Pdf {
    constructor(name_file, content) {
        this.name_file = name_file
        this.content = content
        this.pdf = new PdfKit()
    }

    createPdf() {
        this.pdf.pipe(fs.createWriteStream(`${this.name_file}.pdf`));

        this.pdf.image(`./${this.name_file}.png`, 0, 0,
            { fit: [600, 500], align: 'center', valign: 'center' })
            .text("Request headers \n\n\n" + this.content, 10, 1000);

        this.pdf.end();
    }
}

module.exports = Pdf