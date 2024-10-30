export default async function handler(req, res) {
    try {
        res.json(await getData(req.query.line))
    } catch (error) {
        res.status(500).send(error)
    }
}
