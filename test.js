const nodemailer = require("nodemailer");

const puppeteer = require('puppeteer')

async function printPDF() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://nasgar.online', { waitUntil: 'networkidle0' });
  const pdf = await page.pdf({ format: 'A4' });

  await browser.close();
  return pdf
}



// async..await is not allowed in global scope, must use a wrapper
async function main() {
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  let testAccount = await nodemailer.createTestAccount();

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.zoho.eu",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: "shop@nasgar.online", // generated ethereal user
      pass: "oM?95G8aFyAftbmi", // generated ethereal password
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: 'shop@nasgar.online', // sender address
    to: "emanuel250gameryt@gmail.com", // list of receivers
    subject: "Thanks for your purchase", // Subject line,
    attachments: [
      {
        content: await printPDF(),
        filename: "invoice.pdf"
      }
    ]
  });
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}

main().catch(console.error);