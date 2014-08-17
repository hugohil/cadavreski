exports.config = {
    port: process.env.PORT || 3000
}
exports.auth = {
    host: 'protocol.domain.xx',
    port: 465, // for SSL
    secure: true,
    addr: 'mail@domain.xx',
    pass: 'XXXX'
}
