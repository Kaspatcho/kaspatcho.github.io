const address = 'Parada Metropolitana ETEC/FATEC/SENAI'
const lineContainers = document.querySelectorAll('.line-container')
const sentido = 'volta'
const routeIndex = sentido === 'ida' ? 0 : 1

updateLines()
setInterval(updateLines, 60000)

function updateLines() {
    for (const line of lineContainers) {
        const lineName = line.querySelector('#line').dataset.line
        getClosestBus(address, lineName).then(bus => {
            console.log(bus)
            let timeRemaining = bus.distance / bus.speed
            let timeMesurement = timeRemaining >= 1 ? 'minutos' : 'segundos'
            if(timeRemaining < 1) timeRemaining *= 60
            line.querySelector('#line').textContent = lineName + ' - ' + bus.destiny
            line.querySelector('#details').textContent = parseInt(timeRemaining) + ' ' + timeMesurement
        })
    }
}

async function getClosestBus(stopAdress, line) {
    const resp = await fetchLine(line)
    const lineData = await resp.json()
    const { linhas: [linhas] } = lineData
    const stop = linhas.rotas[routeIndex].pontos.find(v => v.endereco === stopAdress)
    const destiny = linhas.rotas[routeIndex].destino
    const veiculos = linhas.veiculos.filter(v => v.sentidoLinha === sentido)

    const time = linhas.rotas[routeIndex].tempo
    const firstPoint = linhas.rotas[routeIndex].pontos[0]
    const lastPoint = linhas.rotas[routeIndex].pontos[linhas.rotas[routeIndex].pontos.length - 1]
    const totalDistance = calculateDistance(firstPoint.latitude, firstPoint.longitude, lastPoint.latitude, lastPoint.longitude)
    const speed = totalDistance / time

    const closest = veiculos.reduce((acc, veiculo) => {
        const distance = calculateDistance(veiculo.latitude, veiculo.longitude, stop.latitude, stop.longitude)
        return distance < acc.distance ? { ...veiculo, distance } : acc
    }, { distance: Infinity })

    const distance = calculateDistance(closest.latitude, closest.longitude, stop.latitude, stop.longitude)
    return { ...closest, distance, destiny, speed }
}

function fetchLine(line) {
    return fetch('/api/line?line=' + line)
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    lat1 = (Math.PI / 180) * lat1;
    lon1 = (Math.PI / 180) * lon1;
    lat2 = (Math.PI / 180) * lat2;
    lon2 = (Math.PI / 180) * lon2;

    // Haversine formula
    const dlat = lat2 - lat1;
    const dlon = lon2 - lon1;
    const a = Math.pow(Math.sin(dlat / 2), 2) +
        Math.cos(lat1) * Math.cos(lat2) *
        Math.pow(Math.sin(dlon / 2), 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    // Earth's radius in meters
    const R = 6371000;
    const distance = R * c;
    return distance;
}
