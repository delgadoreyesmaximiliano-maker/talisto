fetch('http://localhost:3000/api/whatsapp/webhook', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        typeWebhook: "incomingMessageReceived",
        instanceData: { idInstance: "7103533844" },
        senderData: { sender: "56912345678@c.us" },
        messageData: {
            typeMessage: "textMessage",
            textMessageData: { textMessage: "si" }
        }
    })
}).then(res => res.json()).then(console.log).catch(console.error);
