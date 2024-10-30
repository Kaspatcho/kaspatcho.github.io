const express = require('express')
const cors = require('cors')
const { exec } = require('child_process');

const getData = async line => {
    return new Promise((resolve, reject) => {
        exec(`curl 'https://rest-emtu.noxxonsat.com.br/rest/lineDetails?linha=${line}' \
            -H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7' \
            -H 'Accept-Language: en-US,en;q=0.9,pt-BR;q=0.8,pt;q=0.7' \
            -H 'Cache-Control: max-age=0' \
            -H 'Connection: keep-alive' \
            -H 'Sec-Fetch-Dest: document' \
            -H 'Sec-Fetch-Mode: navigate' \
            -H 'Sec-Fetch-Site: none' \
            -H 'Sec-Fetch-User: ?1' \
            -H 'Upgrade-Insecure-Requests: 1' \
            -H 'User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36' \
            -H 'sec-ch-ua: "Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"' \
            -H 'sec-ch-ua-mobile: ?0' \
            -H 'sec-ch-ua-platform: "Linux"' \
            --insecure`, (err, stdout, stderr) => {
                if (err) reject(stderr)
                resolve(JSON.parse(stdout))
            }
        )

    })
}

const app = express()
const port = 3000
app.use(cors())

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/' + 'index.html')
})

app.get('/:file', (req, res) => {
    res.sendFile(__dirname + '/' + req.params.file)
})

app.get('/line/:line', async (req, res) => {
    try {
        res.json(await getData(req.params.line))
    } catch (error) {
        res.status(500).send(error)
    }
})

app.listen(port, () => console.log('listening on port ' + port))
