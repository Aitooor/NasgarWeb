const nodemailer = require("nodemailer");
const puppeteer = require('puppeteer')


async function sendMail(order, to, lang) {

  const transporter = nodemailer.createTransport({
    host: process.env.SMTPHOST,
    port: process.env.SMTPHOSTPORT,
    secure: true,
    auth: {
      user: process.env.SMTPUSERNAME,
      pass: process.env.SMTPHOSTPASSWORD,
    },
  });

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('http://localhost/public/orders/' + order, { waitUntil: "domcontentloaded" });
  const pdf = await page.pdf({ format: "TABLOID" });

  await browser.close();



  transporter.sendMail({
    from: 'shop@nasgar.online',
    to: to,
    subject: lang == 'en' ? "Nasgar thanks you for your purchase!" : "Nasgar te agradece por tu compra!",
    text: lang == 'en' ?
      `Dear Nasgar Customer,\n\nThank you very much for making your purchase with us! We are so grateful that you chose to shop with Nasgar. We hope you enjoyed your shopping experience with us and are satisfied with your product. If you have any questions, comments, or suggestions, please do not hesitate to contact us.\n\nThank you again for your purchase.\n\nSincerely,\n\nThe Nasgar Team` :
      `Estimado cliente de Nasgar,\n\n¡Muchas gracias por hacer tu compra con nosotros! Estamos muy agradecidos de que hayas elegido comprar con Nasgar. Esperamos que hayas disfrutado de tu experiencia de compra con nosotros y que estés satisfecho con tu producto. Si tienes alguna pregunta, comentario o sugerencia, no dudes en ponerte en contacto con nosotros.\n\nGracias de nuevo por tu compra.\n\nAtentamente,\n\nEl equipo de Nasgar`,
    attachments: [
      {
        content: pdf,
        filename: "invoice.pdf"
      }
    ]
  });



}


module.exports = {
  sendMail
}