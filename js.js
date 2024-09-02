const lineSearch = document.querySelector('.form-container #search')
const stopSelection = document.querySelector('.form-container #stop')
const selectButton = document.querySelector('.form-container #select')

lineSearch.addEventListener('click', async () => {
    let line = document.querySelector('.form-container #linha').value
    let sentido = document.querySelector('.form-container #sentido').value
    if(!line) return

    const [ { sentido: sentidoParada, pontos: ida, destino: destino1 }, { pontos: volta, destino: destino2 } ] = await getLineStops(line)
    document.querySelector('.form-container #sentido [value="ida"]').dataset.destino = (sentidoParada === 'ida') ? destino1 : destino2
    document.querySelector('.form-container #sentido [value="volta"]').dataset.destino = (sentidoParada === 'volta') ? destino1 : destino2

    stopSelection.innerHTML = ''
    for (const { latitude, longitude, endereco } of (sentido === sentidoParada ? ida : volta)) {
        const option = document.createElement('option')
        option.value = `${latitude};${longitude}`
        option.innerText = endereco
        stopSelection.append(option)
    }
})

selectButton.addEventListener('click', async () => {
    const sentido = document.querySelector('.form-container #sentido').value
    if(!sentido || !stopSelection.value) return

    const [ originLat, originLong ] = stopSelection.value.split(';')
    const line = document.querySelector('.form-container #linha').value
    const bus = await getClosestBus(line, { latitude: originLat, longitude: originLong })
    const { ida, volta } = bus
    let destiny = document.querySelector('.form-container #sentido [value="ida"]').dataset.destino
    if(sentido === 'volta') {
        destiny = document.querySelector('.form-container #sentido [value="volta"]').dataset.destino
    }

    const card = document.querySelector('.container .card')
    card.innerHTML = ''

    const cardTitle = document.createElement('div')
    cardTitle.classList.add('card-title')
    cardTitle.id = 'line'
    cardTitle.dataset.line = line
    cardTitle.dataset.sentido = 'volta'
    cardTitle.innerText = `${line} - ${destiny}`
    card.append(cardTitle)

    const cardBody = document.createElement('div')
    cardBody.classList.add('card-body')
    cardBody.id = 'distance'
    cardBody.innerText = `Distância: ${Math.floor(sentido === 'ida' ? ida.distance : volta.distance)} metros`
    card.append(cardBody)
})


async function getLineStops(line) {
    const url = `https://rest-emtu.noxxonsat.com.br/rest/lineDetails?linha=${line}`
    const resp = await fetch(url)
    const json = await resp.json()
    const { linhas: [ { rotas } ] } = json

    return rotas
}

async function getClosestBus(codLinha, origin) {
    //** codLinha: numero do onibus */
    if(!codLinha || !origin?.latitude || !origin?.longitude) return

    const url = `https://rest-emtu.noxxonsat.com.br/rest/lineDetails?linha=${codLinha}`
    const resp = await fetch(url)
    const { linhas: [ { tarifa, veiculos, tp, ts } ] } = await resp.json()
    const d = veiculos.map(v => { return {...v, distance: calculateDistance(origin.latitude, origin.longitude, v.latitude, v.longitude)}})
    const closestIda = d.filter(a => a.sentidoLinha === 'ida').sort((a, b) => a.distance - b.distance)[0]
    const closestVolta = d.filter(a => a.sentidoLinha === 'volta').sort((a, b) => a.distance - b.distance)[0]
    return { tarifa, ida: closestIda, volta: closestVolta, tp, ts }
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  // Convert degrees to radians
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

  // Distance in meters
  const distance = R * c;
  return distance;
}
