const cards = document.querySelectorAll('.container .card')

for (const card of cards) {
    const lineField = card.querySelector('#line')
    const line = lineField.dataset.line
    const distField = card.querySelector('#distance')

    getClosestBus(line).then(({ ida, volta }) => {
        distField.innerText = `Distancia: ${Math.floor(ida.distance)} metros (ida) / ${Math.floor(volta.distance)} metros (volta)`
    })
}

async function getClosestBus(codLinha) {
    //** codLinha: numero do onibus */
    if(!codLinha) return

    const url = `https://rest-emtu.noxxonsat.com.br/rest/lineDetails?linha=${codLinha}`
    const resp = await fetch(url)
    const { linhas: [ { tarifa, veiculos } ] } = await resp.json()
    const d = veiculos.map(v => { return {...v, distance: distanceFromOrigin(v.latitude, v.longitude)}})
    const closestIda = d.filter(a => a.sentidoLinha === 'ida').sort((a, b) => a.distance - b.distance)[0]
    const closestVolta = d.filter(a => a.sentidoLinha === 'volta').sort((a, b) => a.distance - b.distance)[0]
    return { tarifa, ida: closestIda, volta: closestVolta }
}

function distanceFromOrigin(lat, long) {
    const origin = {
        lat: -23.69487187064938,
        long: -46.550309750339395
    }
    return calculateDistance(origin.lat, origin.long, lat, long)
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
