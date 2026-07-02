const { Document, Packer, Paragraph, TextRun } = require('docx');
const fs = require('fs');

const doc = new Document({
    background: {
        color: "E2F6F6"
    },
    sections: [{
        properties: {},
        children: [
            new Paragraph({
                children: [
                    new TextRun({
                        text: "Test Background Color",
                        color: "44989C",
                        size: 48, // 24pt
                        bold: true
                    }),
                ],
            }),
        ],
    }],
});

Packer.toBuffer(doc).then((buffer) => {
    fs.writeFileSync("test.docx", buffer);
    console.log("Done");
}).catch(err => console.error(err));
