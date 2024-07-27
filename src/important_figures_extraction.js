const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const fetch = require("node-fetch");
const pdf = require('pdf-parse');
const fs = require('fs');

function evaluateImportance(caption) {
    const keywords = ["Conclusion", "Key Result", "Main Finding", "Significant"];
    let importance = 0;
    keywords.forEach(keyword => {
        if (caption.includes(keyword)) {
            importance += 1;
        }
    });
    return importance;
}

fetch('https://arxiv.org/pdf/2404.16130.pdf')
    .then(res => res.buffer())
    .then(buffer => {
        fs.writeFileSync('document.pdf', buffer);

        const dataBuffer = fs.readFileSync('document.pdf');

        pdf(dataBuffer).then(function(data) {
            const text = data.text;

            const figureRegex = /Figure \d+:.*/g;
            const figures = text.match(figureRegex) || [];

            const imageRegex = /Image \d+:.*/g;
            const images = text.match(imageRegex) || [];

            console.log('Figures:', figures);
            console.log('Images:', images);

            const figureData = figures.map(caption => ({
                caption,
                importance: evaluateImportance(caption)
            }));

            const imageData = images.map(caption => ({
                caption,
                importance: evaluateImportance(caption)
            }));

            figureData.sort((a, b) => b.importance - a.importance);
            imageData.sort((a, b) => b.importance - a.importance);

            if (figureData.length > 0) {
                const mostImportantFigure = figureData[0].caption;
                console.log("Most important figure:");
                console.log(mostImportantFigure);
            }
        }).catch(err => console.error(err));
    });
