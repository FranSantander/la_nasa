const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "chileinfoclub@gmail.com",
        pass: "2022@infoclub",
    }
})

const enviar = async (email, nombre) => {
    let mailOptions = {
        from: "naturatiendacopiapo@gmail.com",
        to: [email],
        subject: `¡Saludos desde la NASA!`,
        html: `<h3> ¡Hola, ${nombre}! <br> La Nasa te da las gracias por subir tu foto a nuestro sistema y colaborar con las investigaciones extraterrestres. `
    }
    await transporter.sendMail(mailOptions)
}

module.exports = enviar;