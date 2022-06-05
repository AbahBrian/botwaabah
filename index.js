const {default : makeWASocket,useSingleFileAuthState,DisconnectReason,BufferJSON,MessageType, MessageOptions,makeInMemoryStore, Mimetype, extractMessageContent} = require ('@adiwajshing/baileys');
const { Boom } = require ('@hapi/boom');
const { state, saveCreds } = useSingleFileAuthState('./abah.json');
const pino = require ('pino')
const PhoneNumber = require ('awesome-phonenumber')
const chalk = require ('chalk')
const figlet = require ('figlet')
var moment = require('moment-timezone');
var waktu = moment(new Date); 
waktu_com = waktu.tz('Asia/Bangkok').format('hh:mm:ss MMM Do YYYY ');

//membuat agar logger menghilang
const store = makeInMemoryStore({logger:pino({level:'silent',
stream:'store'})
})

console.log(chalk.red
    (figlet.textSync('Abah-BotZ', {
    font: '3D-ASCII',
    horizontalLayout: 'default',
    vertivalLayout: 'default',
    whitespaceBreak: false
    })))

//membuat socket whatsapp untuk memanggil event dan memunculkan QR Code
async function connectToWhatsApp () {
    const abah = makeWASocket({
        // can provide additional config here
        printQRInTerminal: true , 
        auth: state ,
        treatCiphertextMessagesAsReal:true,
        browser: ['AbahBotZ','Safari','1.0.0'],
        logger:pino({level:'silent'})
    })

    abah.ev.on('connection.update', (up) => {
        const { connection, lastDisconnect,receivedPendingNotifications } = up;
        if (connection === 'open'){
            console.log (chalk.yellowBright.bgBlackBright('Connection Status : Terhubung ke Jaringan Whatsapp'));
            
        }
        else if (connection === 'close') {
         let reason = new Boom (lastDisconnect ?.error)?.output?.statusCode;
          if (reason === DisconnectReason.badSession){console.log('abah.json bermasalah, delete abah.json and scan QR code kembali');abah.logout();}
         else if (reason === DisconnectReason.connectionClosed){console.log('Connection Closed , Reconnecting');connectToWhatsApp();}
         else if (reason === DisconnectReason.connectionLost){console.log('Connection Lost , Reconnecting') ;connectToWhatsApp();}
         else if (reason === DisconnectReason.timedOut){console.log('Connection Timed Out , Reconnecting') ;connectToWhatsApp();}
         else if (reason === DisconnectReason.restartRequired){console.log('Need Restart , Reconnecting');connectToWhatsApp();}
         else if (reason === DisconnectReason.loggedOut){console.log('Kamu Telah Logged Out, delete seasson dan scan QR code kembali');connectToWhatsApp()}
         else if (reason === DisconnectReason.statusCode === 408){console.log('Request Timed Out, Recconection');connectToWhatsApp()}
        }



    })
    abah.ev.on('messages.upsert', async m => {
		const msg = m.messages[0]
        const sender = msg.key.remoteJid
        const pesan  = msg.message.conversation
        const name   = msg.pushName
        const wakz   = msg.messageTimestamp
		if(!msg.key.fromMe && m.type === 'notify') {
			console.log
            (chalk.red('| Nomor HP :', chalk.greenBright(PhoneNumber('+' + sender.replace('@s.whatsapp.net', '')).getNumber('international')))+'\n'+ 
            chalk.red('| Nama     :'),chalk.yellow(name)+'\n'+
            chalk.red('| Pesan    :'),chalk.green(pesan)+'\n'+
            chalk.red('| Waktu    :',chalk.yellow(waktu_com))+'\n'+
            chalk.red('|_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _'))

            
            if(!msg.key.fromMe && m.type === 'notify') {
                await abah.sendReadReceipt(sender, msg.key.participant, [msg.key.id]),
                await abah.sendMessage( sender , {text: 'Assalamualaikum! Kak'+" "+name})}
            }   
    })
}
connectToWhatsApp()