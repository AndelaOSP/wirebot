const incidentLog = {};
const bot = {
    start(user) {
        incidentLog[user] = {};
        return Promise.resolve({
            text: 'Enter title of the incident',
            attachments: [
                {
                    color: '#5A352D',
                    callback_id: 'report:title',
                    text: '',
                }
            ]
        })
    }
}